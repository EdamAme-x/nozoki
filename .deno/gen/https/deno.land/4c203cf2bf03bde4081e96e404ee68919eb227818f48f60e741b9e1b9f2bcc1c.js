import { HonoRequest } from './request.ts';
import { FetchEventLike } from './types.ts';
import { serialize } from './utils/cookie.ts';
export class Context {
    env = {};
    finalized = false;
    error = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _req;
    _status = 200;
    _exCtx;
    _pre = false // _pretty
    ;
    _preS = 2 // _prettySpace
    ;
    _map;
    _h = undefined //  _headers
    ;
    _pH = undefined // _preparedHeaders
    ;
    _res;
    _path = '/';
    _params;
    rawRequest;
    notFoundHandler = ()=>new Response();
    constructor(req, options){
        this.rawRequest = req;
        if (options) {
            this._exCtx = options.executionCtx;
            this._path = options.path ?? '/';
            this._params = options.params;
            this.env = options.env;
            if (options.notFoundHandler) {
                this.notFoundHandler = options.notFoundHandler;
            }
        }
    }
    get req() {
        if (this._req) {
            return this._req;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this._req = new HonoRequest(this.rawRequest, this._path, this._params);
            this.rawRequest = undefined;
            this._params = undefined;
            return this._req;
        }
    }
    get event() {
        if (this._exCtx instanceof FetchEventLike) {
            return this._exCtx;
        } else {
            throw Error('This context has no FetchEvent');
        }
    }
    get executionCtx() {
        if (this._exCtx) {
            return this._exCtx;
        } else {
            throw Error('This context has no ExecutionContext');
        }
    }
    get res() {
        return this._res ||= new Response('404 Not Found', {
            status: 404
        });
    }
    set res(_res) {
        if (this._res && _res) {
            this._res.headers.delete('content-type');
            this._res.headers.forEach((v, k)=>{
                _res.headers.set(k, v);
            });
        }
        this._res = _res;
        this.finalized = true;
    }
    header = (name, value, options)=>{
        // Clear the header
        if (value === undefined) {
            if (this._h) {
                this._h.delete(name);
            } else if (this._pH) {
                delete this._pH[name.toLocaleLowerCase()];
            }
            if (this.finalized) {
                this.res.headers.delete(name);
            }
            return;
        }
        if (options?.append) {
            if (!this._h) {
                this._h = new Headers(this._pH);
                this._pH = {};
            }
            this._h.append(name, value);
        } else {
            if (this._h) {
                this._h.set(name, value);
            } else {
                this._pH ??= {};
                this._pH[name.toLowerCase()] = value;
            }
        }
        if (this.finalized) {
            if (options?.append) {
                this.res.headers.append(name, value);
            } else {
                this.res.headers.set(name, value);
            }
        }
    };
    status = (status)=>{
        this._status = status;
    };
    set = (key, value)=>{
        this._map ||= {};
        this._map[key] = value;
    };
    get = (key)=>{
        return this._map ? this._map[key] : undefined;
    };
    pretty = (prettyJSON, space = 2)=>{
        this._pre = prettyJSON;
        this._preS = space;
    };
    newResponse = (data, arg, headers)=>{
        // Optimized
        if (!headers && !this._h && !this._res && !arg && this._status === 200) {
            return new Response(data, {
                headers: this._pH
            });
        }
        // Return Response immediately if arg is RequestInit.
        if (arg && typeof arg !== 'number') {
            const res = new Response(data, arg);
            const contentType = this._pH?.['content-type'];
            if (contentType) {
                res.headers.set('content-type', contentType);
            }
            return res;
        }
        const status = arg ?? this._status;
        this._pH ??= {};
        this._h ??= new Headers();
        for (const [k, v] of Object.entries(this._pH)){
            this._h.set(k, v);
        }
        if (this._res) {
            this._res.headers.forEach((v, k)=>{
                this._h?.set(k, v);
            });
            for (const [k, v] of Object.entries(this._pH)){
                this._h.set(k, v);
            }
        }
        headers ??= {};
        for (const [k, v] of Object.entries(headers)){
            if (typeof v === 'string') {
                this._h.set(k, v);
            } else {
                this._h.delete(k);
                for (const v2 of v){
                    this._h.append(k, v2);
                }
            }
        }
        return new Response(data, {
            status,
            headers: this._h
        });
    };
    body = (data, arg, headers)=>{
        return typeof arg === 'number' ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    };
    text = (text, arg, headers)=>{
        // If the header is empty, return Response immediately.
        // Content-Type will be added automatically as `text/plain`.
        if (!this._pH) {
            if (!headers && !this._res && !this._h && !arg) {
                return new Response(text);
            }
            this._pH = {};
        }
        // If Content-Type is not set, we don't have to set `text/plain`.
        // Fewer the header values, it will be faster.
        if (this._pH['content-type']) {
            this._pH['content-type'] = 'text/plain; charset=UTF-8';
        }
        return typeof arg === 'number' ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    };
    json = (object, arg, headers)=>{
        const body = this._pre ? JSON.stringify(object, null, this._preS) : JSON.stringify(object);
        this._pH ??= {};
        this._pH['content-type'] = 'application/json; charset=UTF-8';
        return typeof arg === 'number' ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    };
    jsonT = (object, arg, headers)=>{
        return {
            response: typeof arg === 'number' ? this.json(object, arg, headers) : this.json(object, arg),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: object,
            format: 'json'
        };
    };
    html = (html, arg, headers)=>{
        this._pH ??= {};
        this._pH['content-type'] = 'text/html; charset=UTF-8';
        return typeof arg === 'number' ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    };
    redirect = (location, status = 302)=>{
        this._h ??= new Headers();
        this._h.set('Location', location);
        return this.newResponse(null, status);
    };
    /** @deprecated
   * Use Cookie Middleware instead of `c.cookie()`. The `c.cookie()` will be removed in v4.
   *
   * @example
   *
   * import { setCookie } from 'hono/cookie'
   * // ...
   * app.get('/', (c) => {
   *   setCookie(c, 'key', 'value')
   *   //...
   * })
   */ cookie = (name, value, opt)=>{
        const cookie = serialize(name, value, opt);
        this.header('set-cookie', cookie, {
            append: true
        });
    };
    notFound = ()=>{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.notFoundHandler(this);
    };
    get runtime() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const global = globalThis;
        if (global?.Deno !== undefined) {
            return 'deno';
        }
        if (global?.Bun !== undefined) {
            return 'bun';
        }
        if (typeof global?.WebSocketPair === 'function') {
            return 'workerd';
        }
        if (typeof global?.EdgeRuntime === 'string') {
            return 'edge-light';
        }
        if (global?.fastly !== undefined) {
            return 'fastly';
        }
        if (global?.__lagon__ !== undefined) {
            return 'lagon';
        }
        if (global?.process?.release?.name === 'node') {
            return 'node';
        }
        return 'other';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvY29udGV4dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIb25vUmVxdWVzdCB9IGZyb20gJy4vcmVxdWVzdC50cydcbmltcG9ydCB7IEZldGNoRXZlbnRMaWtlIH0gZnJvbSAnLi90eXBlcy50cydcbmltcG9ydCB0eXBlIHsgRW52LCBOb3RGb3VuZEhhbmRsZXIsIElucHV0LCBUeXBlZFJlc3BvbnNlIH0gZnJvbSAnLi90eXBlcy50cydcbmltcG9ydCB0eXBlIHsgQ29va2llT3B0aW9ucyB9IGZyb20gJy4vdXRpbHMvY29va2llLnRzJ1xuaW1wb3J0IHsgc2VyaWFsaXplIH0gZnJvbSAnLi91dGlscy9jb29raWUudHMnXG5pbXBvcnQgdHlwZSB7IFN0YXR1c0NvZGUgfSBmcm9tICcuL3V0aWxzL2h0dHAtc3RhdHVzLnRzJ1xuaW1wb3J0IHR5cGUgeyBKU09OVmFsdWUsIEludGVyZmFjZVRvVHlwZSB9IGZyb20gJy4vdXRpbHMvdHlwZXMudHMnXG5cbnR5cGUgUnVudGltZSA9ICdub2RlJyB8ICdkZW5vJyB8ICdidW4nIHwgJ3dvcmtlcmQnIHwgJ2Zhc3RseScgfCAnZWRnZS1saWdodCcgfCAnbGFnb24nIHwgJ290aGVyJ1xudHlwZSBIZWFkZXJSZWNvcmQgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBzdHJpbmdbXT5cbnR5cGUgRGF0YSA9IHN0cmluZyB8IEFycmF5QnVmZmVyIHwgUmVhZGFibGVTdHJlYW1cblxuZXhwb3J0IGludGVyZmFjZSBFeGVjdXRpb25Db250ZXh0IHtcbiAgd2FpdFVudGlsKHByb21pc2U6IFByb21pc2U8dW5rbm93bj4pOiB2b2lkXG4gIHBhc3NUaHJvdWdoT25FeGNlcHRpb24oKTogdm9pZFxufVxuZXhwb3J0IGludGVyZmFjZSBDb250ZXh0VmFyaWFibGVNYXAge31cblxuaW50ZXJmYWNlIEdldDxFIGV4dGVuZHMgRW52PiB7XG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBDb250ZXh0VmFyaWFibGVNYXA+KGtleTogS2V5KTogQ29udGV4dFZhcmlhYmxlTWFwW0tleV1cbiAgPEtleSBleHRlbmRzIGtleW9mIEVbJ1ZhcmlhYmxlcyddPihrZXk6IEtleSk6IEVbJ1ZhcmlhYmxlcyddW0tleV1cbn1cblxuaW50ZXJmYWNlIFNldDxFIGV4dGVuZHMgRW52PiB7XG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBDb250ZXh0VmFyaWFibGVNYXA+KGtleTogS2V5LCB2YWx1ZTogQ29udGV4dFZhcmlhYmxlTWFwW0tleV0pOiB2b2lkXG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBFWydWYXJpYWJsZXMnXT4oa2V5OiBLZXksIHZhbHVlOiBFWydWYXJpYWJsZXMnXVtLZXldKTogdm9pZFxufVxuXG5pbnRlcmZhY2UgTmV3UmVzcG9uc2Uge1xuICAoZGF0YTogRGF0YSB8IG51bGwsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICAoZGF0YTogRGF0YSB8IG51bGwsIGluaXQ/OiBSZXNwb25zZUluaXQpOiBSZXNwb25zZVxufVxuXG5pbnRlcmZhY2UgQm9keVJlc3BvbmQgZXh0ZW5kcyBOZXdSZXNwb25zZSB7fVxuXG5pbnRlcmZhY2UgVGV4dFJlc3BvbmQge1xuICAodGV4dDogc3RyaW5nLCBzdGF0dXM/OiBTdGF0dXNDb2RlLCBoZWFkZXJzPzogSGVhZGVyUmVjb3JkKTogUmVzcG9uc2VcbiAgKHRleHQ6IHN0cmluZywgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlXG59XG5cbmludGVyZmFjZSBKU09OUmVzcG9uZCB7XG4gIDxUID0gSlNPTlZhbHVlPihvYmplY3Q6IFQsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICA8VCA9IEpTT05WYWx1ZT4ob2JqZWN0OiBULCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Vcbn1cblxuaW50ZXJmYWNlIEpTT05UUmVzcG9uZCB7XG4gIDxUPihcbiAgICBvYmplY3Q6IEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZSA/IFQgOiBKU09OVmFsdWUsXG4gICAgc3RhdHVzPzogU3RhdHVzQ29kZSxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFR5cGVkUmVzcG9uc2U8XG4gICAgSW50ZXJmYWNlVG9UeXBlPFQ+IGV4dGVuZHMgSlNPTlZhbHVlXG4gICAgICA/IEpTT05WYWx1ZSBleHRlbmRzIEludGVyZmFjZVRvVHlwZTxUPlxuICAgICAgICA/IG5ldmVyXG4gICAgICAgIDogVFxuICAgICAgOiBuZXZlclxuICA+XG4gIDxUPihcbiAgICBvYmplY3Q6IEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZSA/IFQgOiBKU09OVmFsdWUsXG4gICAgaW5pdD86IFJlc3BvbnNlSW5pdFxuICApOiBUeXBlZFJlc3BvbnNlPFxuICAgIEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZVxuICAgICAgPyBKU09OVmFsdWUgZXh0ZW5kcyBJbnRlcmZhY2VUb1R5cGU8VD5cbiAgICAgICAgPyBuZXZlclxuICAgICAgICA6IFRcbiAgICAgIDogbmV2ZXJcbiAgPlxufVxuXG5pbnRlcmZhY2UgSFRNTFJlc3BvbmQge1xuICAoaHRtbDogc3RyaW5nLCBzdGF0dXM/OiBTdGF0dXNDb2RlLCBoZWFkZXJzPzogSGVhZGVyUmVjb3JkKTogUmVzcG9uc2VcbiAgKGh0bWw6IHN0cmluZywgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlXG59XG5cbnR5cGUgQ29udGV4dE9wdGlvbnM8RSBleHRlbmRzIEVudj4gPSB7XG4gIGVudjogRVsnQmluZGluZ3MnXVxuICBleGVjdXRpb25DdHg/OiBGZXRjaEV2ZW50TGlrZSB8IEV4ZWN1dGlvbkNvbnRleHQgfCB1bmRlZmluZWRcbiAgbm90Rm91bmRIYW5kbGVyPzogTm90Rm91bmRIYW5kbGVyPEU+XG4gIHBhdGg/OiBzdHJpbmdcbiAgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPlxufVxuXG5leHBvcnQgY2xhc3MgQ29udGV4dDxcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgRSBleHRlbmRzIEVudiA9IGFueSxcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgUCBleHRlbmRzIHN0cmluZyA9IGFueSxcbiAgSSBleHRlbmRzIElucHV0ID0ge31cbj4ge1xuICBlbnY6IEVbJ0JpbmRpbmdzJ10gPSB7fVxuICBmaW5hbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICBlcnJvcjogRXJyb3IgfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBwcml2YXRlIF9yZXE/OiBIb25vUmVxdWVzdDxhbnksIGFueT5cbiAgcHJpdmF0ZSBfc3RhdHVzOiBTdGF0dXNDb2RlID0gMjAwXG4gIHByaXZhdGUgX2V4Q3R4OiBGZXRjaEV2ZW50TGlrZSB8IEV4ZWN1dGlvbkNvbnRleHQgfCB1bmRlZmluZWQgLy8gX2V4ZWN1dGlvbkN0eFxuICBwcml2YXRlIF9wcmU6IGJvb2xlYW4gPSBmYWxzZSAvLyBfcHJldHR5XG4gIHByaXZhdGUgX3ByZVM6IG51bWJlciA9IDIgLy8gX3ByZXR0eVNwYWNlXG4gIHByaXZhdGUgX21hcDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWRcbiAgcHJpdmF0ZSBfaDogSGVhZGVycyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCAvLyAgX2hlYWRlcnNcbiAgcHJpdmF0ZSBfcEg6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQgLy8gX3ByZXBhcmVkSGVhZGVyc1xuICBwcml2YXRlIF9yZXM6IFJlc3BvbnNlIHwgdW5kZWZpbmVkXG4gIHByaXZhdGUgX3BhdGg6IHN0cmluZyA9ICcvJ1xuICBwcml2YXRlIF9wYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHwgbnVsbFxuICBwcml2YXRlIHJhd1JlcXVlc3Q/OiBSZXF1ZXN0IHwgbnVsbFxuICBwcml2YXRlIG5vdEZvdW5kSGFuZGxlcjogTm90Rm91bmRIYW5kbGVyPEU+ID0gKCkgPT4gbmV3IFJlc3BvbnNlKClcblxuICBjb25zdHJ1Y3RvcihyZXE6IFJlcXVlc3QsIG9wdGlvbnM/OiBDb250ZXh0T3B0aW9uczxFPikge1xuICAgIHRoaXMucmF3UmVxdWVzdCA9IHJlcVxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICB0aGlzLl9leEN0eCA9IG9wdGlvbnMuZXhlY3V0aW9uQ3R4XG4gICAgICB0aGlzLl9wYXRoID0gb3B0aW9ucy5wYXRoID8/ICcvJ1xuICAgICAgdGhpcy5fcGFyYW1zID0gb3B0aW9ucy5wYXJhbXNcbiAgICAgIHRoaXMuZW52ID0gb3B0aW9ucy5lbnZcbiAgICAgIGlmIChvcHRpb25zLm5vdEZvdW5kSGFuZGxlcikge1xuICAgICAgICB0aGlzLm5vdEZvdW5kSGFuZGxlciA9IG9wdGlvbnMubm90Rm91bmRIYW5kbGVyXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0IHJlcSgpOiBIb25vUmVxdWVzdDxQLCBJWydvdXQnXT4ge1xuICAgIGlmICh0aGlzLl9yZXEpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXFcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICAgIHRoaXMuX3JlcSA9IG5ldyBIb25vUmVxdWVzdCh0aGlzLnJhd1JlcXVlc3QhLCB0aGlzLl9wYXRoLCB0aGlzLl9wYXJhbXMhKVxuICAgICAgdGhpcy5yYXdSZXF1ZXN0ID0gdW5kZWZpbmVkXG4gICAgICB0aGlzLl9wYXJhbXMgPSB1bmRlZmluZWRcbiAgICAgIHJldHVybiB0aGlzLl9yZXFcbiAgICB9XG4gIH1cblxuICBnZXQgZXZlbnQoKTogRmV0Y2hFdmVudExpa2Uge1xuICAgIGlmICh0aGlzLl9leEN0eCBpbnN0YW5jZW9mIEZldGNoRXZlbnRMaWtlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZXhDdHhcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoJ1RoaXMgY29udGV4dCBoYXMgbm8gRmV0Y2hFdmVudCcpXG4gICAgfVxuICB9XG5cbiAgZ2V0IGV4ZWN1dGlvbkN0eCgpOiBFeGVjdXRpb25Db250ZXh0IHtcbiAgICBpZiAodGhpcy5fZXhDdHgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9leEN0eCBhcyBFeGVjdXRpb25Db250ZXh0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKCdUaGlzIGNvbnRleHQgaGFzIG5vIEV4ZWN1dGlvbkNvbnRleHQnKVxuICAgIH1cbiAgfVxuXG4gIGdldCByZXMoKTogUmVzcG9uc2Uge1xuICAgIHJldHVybiAodGhpcy5fcmVzIHx8PSBuZXcgUmVzcG9uc2UoJzQwNCBOb3QgRm91bmQnLCB7IHN0YXR1czogNDA0IH0pKVxuICB9XG5cbiAgc2V0IHJlcyhfcmVzOiBSZXNwb25zZSB8IHVuZGVmaW5lZCkge1xuICAgIGlmICh0aGlzLl9yZXMgJiYgX3Jlcykge1xuICAgICAgdGhpcy5fcmVzLmhlYWRlcnMuZGVsZXRlKCdjb250ZW50LXR5cGUnKVxuICAgICAgdGhpcy5fcmVzLmhlYWRlcnMuZm9yRWFjaCgodiwgaykgPT4ge1xuICAgICAgICBfcmVzLmhlYWRlcnMuc2V0KGssIHYpXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLl9yZXMgPSBfcmVzXG4gICAgdGhpcy5maW5hbGl6ZWQgPSB0cnVlXG4gIH1cblxuICBoZWFkZXIgPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBvcHRpb25zPzogeyBhcHBlbmQ/OiBib29sZWFuIH0pOiB2b2lkID0+IHtcbiAgICAvLyBDbGVhciB0aGUgaGVhZGVyXG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLl9oKSB7XG4gICAgICAgIHRoaXMuX2guZGVsZXRlKG5hbWUpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BIKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9wSFtuYW1lLnRvTG9jYWxlTG93ZXJDYXNlKCldXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5maW5hbGl6ZWQpIHtcbiAgICAgICAgdGhpcy5yZXMuaGVhZGVycy5kZWxldGUobmFtZSlcbiAgICAgIH1cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy5hcHBlbmQpIHtcbiAgICAgIGlmICghdGhpcy5faCkge1xuICAgICAgICB0aGlzLl9oID0gbmV3IEhlYWRlcnModGhpcy5fcEgpXG4gICAgICAgIHRoaXMuX3BIID0ge31cbiAgICAgIH1cbiAgICAgIHRoaXMuX2guYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5faCkge1xuICAgICAgICB0aGlzLl9oLnNldChuYW1lLCB2YWx1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3BIID8/PSB7fVxuICAgICAgICB0aGlzLl9wSFtuYW1lLnRvTG93ZXJDYXNlKCldID0gdmFsdWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5maW5hbGl6ZWQpIHtcbiAgICAgIGlmIChvcHRpb25zPy5hcHBlbmQpIHtcbiAgICAgICAgdGhpcy5yZXMuaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlcy5oZWFkZXJzLnNldChuYW1lLCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGF0dXMgPSAoc3RhdHVzOiBTdGF0dXNDb2RlKTogdm9pZCA9PiB7XG4gICAgdGhpcy5fc3RhdHVzID0gc3RhdHVzXG4gIH1cblxuICBzZXQ6IFNldDxFPiA9IChrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24pID0+IHtcbiAgICB0aGlzLl9tYXAgfHw9IHt9XG4gICAgdGhpcy5fbWFwW2tleSBhcyBzdHJpbmddID0gdmFsdWVcbiAgfVxuXG4gIGdldDogR2V0PEU+ID0gKGtleTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuX21hcCA/IHRoaXMuX21hcFtrZXldIDogdW5kZWZpbmVkXG4gIH1cblxuICBwcmV0dHkgPSAocHJldHR5SlNPTjogYm9vbGVhbiwgc3BhY2U6IG51bWJlciA9IDIpOiB2b2lkID0+IHtcbiAgICB0aGlzLl9wcmUgPSBwcmV0dHlKU09OXG4gICAgdGhpcy5fcHJlUyA9IHNwYWNlXG4gIH1cblxuICBuZXdSZXNwb25zZTogTmV3UmVzcG9uc2UgPSAoXG4gICAgZGF0YTogRGF0YSB8IG51bGwsXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlc3BvbnNlSW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFJlc3BvbnNlID0+IHtcbiAgICAvLyBPcHRpbWl6ZWRcbiAgICBpZiAoIWhlYWRlcnMgJiYgIXRoaXMuX2ggJiYgIXRoaXMuX3JlcyAmJiAhYXJnICYmIHRoaXMuX3N0YXR1cyA9PT0gMjAwKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGRhdGEsIHtcbiAgICAgICAgaGVhZGVyczogdGhpcy5fcEgsXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIFJldHVybiBSZXNwb25zZSBpbW1lZGlhdGVseSBpZiBhcmcgaXMgUmVxdWVzdEluaXQuXG4gICAgaWYgKGFyZyAmJiB0eXBlb2YgYXJnICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKGRhdGEsIGFyZylcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gdGhpcy5fcEg/LlsnY29udGVudC10eXBlJ11cbiAgICAgIGlmIChjb250ZW50VHlwZSkge1xuICAgICAgICByZXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIGNvbnRlbnRUeXBlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXR1cyA9IGFyZyA/PyB0aGlzLl9zdGF0dXNcbiAgICB0aGlzLl9wSCA/Pz0ge31cblxuICAgIHRoaXMuX2ggPz89IG5ldyBIZWFkZXJzKClcbiAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyh0aGlzLl9wSCkpIHtcbiAgICAgIHRoaXMuX2guc2V0KGssIHYpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3Jlcykge1xuICAgICAgdGhpcy5fcmVzLmhlYWRlcnMuZm9yRWFjaCgodiwgaykgPT4ge1xuICAgICAgICB0aGlzLl9oPy5zZXQoaywgdilcbiAgICAgIH0pXG4gICAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyh0aGlzLl9wSCkpIHtcbiAgICAgICAgdGhpcy5faC5zZXQoaywgdilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBoZWFkZXJzID8/PSB7fVxuICAgIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKGhlYWRlcnMpKSB7XG4gICAgICBpZiAodHlwZW9mIHYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2guc2V0KGssIHYpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9oLmRlbGV0ZShrKVxuICAgICAgICBmb3IgKGNvbnN0IHYyIG9mIHYpIHtcbiAgICAgICAgICB0aGlzLl9oLmFwcGVuZChrLCB2MilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoZGF0YSwge1xuICAgICAgc3RhdHVzLFxuICAgICAgaGVhZGVyczogdGhpcy5faCxcbiAgICB9KVxuICB9XG5cbiAgYm9keTogQm9keVJlc3BvbmQgPSAoXG4gICAgZGF0YTogRGF0YSB8IG51bGwsXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlcXVlc3RJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogUmVzcG9uc2UgPT4ge1xuICAgIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJ1xuICAgICAgPyB0aGlzLm5ld1Jlc3BvbnNlKGRhdGEsIGFyZywgaGVhZGVycylcbiAgICAgIDogdGhpcy5uZXdSZXNwb25zZShkYXRhLCBhcmcpXG4gIH1cblxuICB0ZXh0OiBUZXh0UmVzcG9uZCA9IChcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlcXVlc3RJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogUmVzcG9uc2UgPT4ge1xuICAgIC8vIElmIHRoZSBoZWFkZXIgaXMgZW1wdHksIHJldHVybiBSZXNwb25zZSBpbW1lZGlhdGVseS5cbiAgICAvLyBDb250ZW50LVR5cGUgd2lsbCBiZSBhZGRlZCBhdXRvbWF0aWNhbGx5IGFzIGB0ZXh0L3BsYWluYC5cbiAgICBpZiAoIXRoaXMuX3BIKSB7XG4gICAgICBpZiAoIWhlYWRlcnMgJiYgIXRoaXMuX3JlcyAmJiAhdGhpcy5faCAmJiAhYXJnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGV4dClcbiAgICAgIH1cbiAgICAgIHRoaXMuX3BIID0ge31cbiAgICB9XG4gICAgLy8gSWYgQ29udGVudC1UeXBlIGlzIG5vdCBzZXQsIHdlIGRvbid0IGhhdmUgdG8gc2V0IGB0ZXh0L3BsYWluYC5cbiAgICAvLyBGZXdlciB0aGUgaGVhZGVyIHZhbHVlcywgaXQgd2lsbCBiZSBmYXN0ZXIuXG4gICAgaWYgKHRoaXMuX3BIWydjb250ZW50LXR5cGUnXSkge1xuICAgICAgdGhpcy5fcEhbJ2NvbnRlbnQtdHlwZSddID0gJ3RleHQvcGxhaW47IGNoYXJzZXQ9VVRGLTgnXG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJ1xuICAgICAgPyB0aGlzLm5ld1Jlc3BvbnNlKHRleHQsIGFyZywgaGVhZGVycylcbiAgICAgIDogdGhpcy5uZXdSZXNwb25zZSh0ZXh0LCBhcmcpXG4gIH1cblxuICBqc29uOiBKU09OUmVzcG9uZCA9IDxUID0ge30+KFxuICAgIG9iamVjdDogVCxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVxdWVzdEluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApID0+IHtcbiAgICBjb25zdCBib2R5ID0gdGhpcy5fcHJlID8gSlNPTi5zdHJpbmdpZnkob2JqZWN0LCBudWxsLCB0aGlzLl9wcmVTKSA6IEpTT04uc3RyaW5naWZ5KG9iamVjdClcbiAgICB0aGlzLl9wSCA/Pz0ge31cbiAgICB0aGlzLl9wSFsnY29udGVudC10eXBlJ10gPSAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOCdcbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZShib2R5LCBhcmcsIGhlYWRlcnMpXG4gICAgICA6IHRoaXMubmV3UmVzcG9uc2UoYm9keSwgYXJnKVxuICB9XG5cbiAganNvblQ6IEpTT05UUmVzcG9uZCA9IDxUPihcbiAgICBvYmplY3Q6IEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZSA/IFQgOiBKU09OVmFsdWUsXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlcXVlc3RJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogVHlwZWRSZXNwb25zZTxcbiAgICBJbnRlcmZhY2VUb1R5cGU8VD4gZXh0ZW5kcyBKU09OVmFsdWVcbiAgICAgID8gSlNPTlZhbHVlIGV4dGVuZHMgSW50ZXJmYWNlVG9UeXBlPFQ+XG4gICAgICAgID8gbmV2ZXJcbiAgICAgICAgOiBUXG4gICAgICA6IG5ldmVyXG4gID4gPT4ge1xuICAgIHJldHVybiB7XG4gICAgICByZXNwb25zZTogdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgPyB0aGlzLmpzb24ob2JqZWN0LCBhcmcsIGhlYWRlcnMpIDogdGhpcy5qc29uKG9iamVjdCwgYXJnKSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICBkYXRhOiBvYmplY3QgYXMgYW55LFxuICAgICAgZm9ybWF0OiAnanNvbicsXG4gICAgfVxuICB9XG5cbiAgaHRtbDogSFRNTFJlc3BvbmQgPSAoXG4gICAgaHRtbDogc3RyaW5nLFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXF1ZXN0SW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFJlc3BvbnNlID0+IHtcbiAgICB0aGlzLl9wSCA/Pz0ge31cbiAgICB0aGlzLl9wSFsnY29udGVudC10eXBlJ10gPSAndGV4dC9odG1sOyBjaGFyc2V0PVVURi04J1xuICAgIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJ1xuICAgICAgPyB0aGlzLm5ld1Jlc3BvbnNlKGh0bWwsIGFyZywgaGVhZGVycylcbiAgICAgIDogdGhpcy5uZXdSZXNwb25zZShodG1sLCBhcmcpXG4gIH1cblxuICByZWRpcmVjdCA9IChsb2NhdGlvbjogc3RyaW5nLCBzdGF0dXM6IFN0YXR1c0NvZGUgPSAzMDIpOiBSZXNwb25zZSA9PiB7XG4gICAgdGhpcy5faCA/Pz0gbmV3IEhlYWRlcnMoKVxuICAgIHRoaXMuX2guc2V0KCdMb2NhdGlvbicsIGxvY2F0aW9uKVxuICAgIHJldHVybiB0aGlzLm5ld1Jlc3BvbnNlKG51bGwsIHN0YXR1cylcbiAgfVxuXG4gIC8qKiBAZGVwcmVjYXRlZFxuICAgKiBVc2UgQ29va2llIE1pZGRsZXdhcmUgaW5zdGVhZCBvZiBgYy5jb29raWUoKWAuIFRoZSBgYy5jb29raWUoKWAgd2lsbCBiZSByZW1vdmVkIGluIHY0LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiBpbXBvcnQgeyBzZXRDb29raWUgfSBmcm9tICdob25vL2Nvb2tpZSdcbiAgICogLy8gLi4uXG4gICAqIGFwcC5nZXQoJy8nLCAoYykgPT4ge1xuICAgKiAgIHNldENvb2tpZShjLCAna2V5JywgJ3ZhbHVlJylcbiAgICogICAvLy4uLlxuICAgKiB9KVxuICAgKi9cbiAgY29va2llID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0PzogQ29va2llT3B0aW9ucyk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGNvb2tpZSA9IHNlcmlhbGl6ZShuYW1lLCB2YWx1ZSwgb3B0KVxuICAgIHRoaXMuaGVhZGVyKCdzZXQtY29va2llJywgY29va2llLCB7IGFwcGVuZDogdHJ1ZSB9KVxuICB9XG5cbiAgbm90Rm91bmQgPSAoKTogUmVzcG9uc2UgfCBQcm9taXNlPFJlc3BvbnNlPiA9PiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICByZXR1cm4gdGhpcy5ub3RGb3VuZEhhbmRsZXIodGhpcylcbiAgfVxuXG4gIGdldCBydW50aW1lKCk6IFJ1bnRpbWUge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgY29uc3QgZ2xvYmFsID0gZ2xvYmFsVGhpcyBhcyBhbnlcblxuICAgIGlmIChnbG9iYWw/LkRlbm8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICdkZW5vJ1xuICAgIH1cblxuICAgIGlmIChnbG9iYWw/LkJ1biAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJ2J1bidcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGdsb2JhbD8uV2ViU29ja2V0UGFpciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuICd3b3JrZXJkJ1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZ2xvYmFsPy5FZGdlUnVudGltZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiAnZWRnZS1saWdodCdcbiAgICB9XG5cbiAgICBpZiAoZ2xvYmFsPy5mYXN0bHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICdmYXN0bHknXG4gICAgfVxuXG4gICAgaWYgKGdsb2JhbD8uX19sYWdvbl9fICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAnbGFnb24nXG4gICAgfVxuXG4gICAgaWYgKGdsb2JhbD8ucHJvY2Vzcz8ucmVsZWFzZT8ubmFtZSA9PT0gJ25vZGUnKSB7XG4gICAgICByZXR1cm4gJ25vZGUnXG4gICAgfVxuXG4gICAgcmV0dXJuICdvdGhlcidcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsV0FBVyxRQUFRLGVBQWM7QUFDMUMsU0FBUyxjQUFjLFFBQVEsYUFBWTtBQUczQyxTQUFTLFNBQVMsUUFBUSxvQkFBbUI7QUE4RTdDLE9BQU8sTUFBTTtJQU9YLE1BQXFCLENBQUMsRUFBQztJQUN2QixZQUFxQixLQUFLLENBQUE7SUFDMUIsUUFBMkIsVUFBUztJQUVwQyw4REFBOEQ7SUFDdEQsS0FBNEI7SUFDNUIsVUFBc0IsSUFBRztJQUN6QixPQUFxRDtJQUNyRCxPQUFnQixLQUFLLENBQUMsVUFBVTtLQUFYO0lBQ3JCLFFBQWdCLEVBQUUsZUFBZTtLQUFoQjtJQUNqQixLQUF5QztJQUN6QyxLQUEwQixVQUFVLFlBQVk7S0FBYjtJQUNuQyxNQUEwQyxVQUFVLG1CQUFtQjtLQUFwQjtJQUNuRCxLQUEwQjtJQUMxQixRQUFnQixJQUFHO0lBQ25CLFFBQXVDO0lBQ3ZDLFdBQTJCO0lBQzNCLGtCQUFzQyxJQUFNLElBQUksV0FBVTtJQUVsRSxZQUFZLEdBQVksRUFBRSxPQUEyQixDQUFFO1FBQ3JELElBQUksQ0FBQyxVQUFVLEdBQUc7UUFDbEIsSUFBSSxTQUFTO1lBQ1gsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLFlBQVk7WUFDbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLElBQUksSUFBSTtZQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsTUFBTTtZQUM3QixJQUFJ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