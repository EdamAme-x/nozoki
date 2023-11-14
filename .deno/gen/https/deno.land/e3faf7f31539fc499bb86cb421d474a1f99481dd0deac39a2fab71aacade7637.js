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
    _map;
    _h = undefined //  _headers
    ;
    _pH = undefined // _preparedHeaders
    ;
    _res;
    _path = '/';
    _params;
    _init = true;
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
        this._init = false;
        return this._res ||= new Response('404 Not Found', {
            status: 404
        });
    }
    set res(_res) {
        this._init = false;
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
                this._init = false;
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
    newResponse = (data, arg, headers)=>{
        // Optimized
        if (this._init && !headers && !arg && this._status === 200) {
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
            if (this._init && !headers && !arg) {
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
        const body = JSON.stringify(object);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvY29udGV4dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIb25vUmVxdWVzdCB9IGZyb20gJy4vcmVxdWVzdC50cydcbmltcG9ydCB7IEZldGNoRXZlbnRMaWtlIH0gZnJvbSAnLi90eXBlcy50cydcbmltcG9ydCB0eXBlIHsgRW52LCBOb3RGb3VuZEhhbmRsZXIsIElucHV0LCBUeXBlZFJlc3BvbnNlIH0gZnJvbSAnLi90eXBlcy50cydcbmltcG9ydCB0eXBlIHsgQ29va2llT3B0aW9ucyB9IGZyb20gJy4vdXRpbHMvY29va2llLnRzJ1xuaW1wb3J0IHsgc2VyaWFsaXplIH0gZnJvbSAnLi91dGlscy9jb29raWUudHMnXG5pbXBvcnQgdHlwZSB7IFN0YXR1c0NvZGUgfSBmcm9tICcuL3V0aWxzL2h0dHAtc3RhdHVzLnRzJ1xuaW1wb3J0IHR5cGUgeyBKU09OVmFsdWUsIEludGVyZmFjZVRvVHlwZSB9IGZyb20gJy4vdXRpbHMvdHlwZXMudHMnXG5cbnR5cGUgUnVudGltZSA9ICdub2RlJyB8ICdkZW5vJyB8ICdidW4nIHwgJ3dvcmtlcmQnIHwgJ2Zhc3RseScgfCAnZWRnZS1saWdodCcgfCAnbGFnb24nIHwgJ290aGVyJ1xudHlwZSBIZWFkZXJSZWNvcmQgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBzdHJpbmdbXT5cbnR5cGUgRGF0YSA9IHN0cmluZyB8IEFycmF5QnVmZmVyIHwgUmVhZGFibGVTdHJlYW1cblxuZXhwb3J0IGludGVyZmFjZSBFeGVjdXRpb25Db250ZXh0IHtcbiAgd2FpdFVudGlsKHByb21pc2U6IFByb21pc2U8dW5rbm93bj4pOiB2b2lkXG4gIHBhc3NUaHJvdWdoT25FeGNlcHRpb24oKTogdm9pZFxufVxuZXhwb3J0IGludGVyZmFjZSBDb250ZXh0VmFyaWFibGVNYXAge31cblxuaW50ZXJmYWNlIEdldDxFIGV4dGVuZHMgRW52PiB7XG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBDb250ZXh0VmFyaWFibGVNYXA+KGtleTogS2V5KTogQ29udGV4dFZhcmlhYmxlTWFwW0tleV1cbiAgPEtleSBleHRlbmRzIGtleW9mIEVbJ1ZhcmlhYmxlcyddPihrZXk6IEtleSk6IEVbJ1ZhcmlhYmxlcyddW0tleV1cbn1cblxuaW50ZXJmYWNlIFNldDxFIGV4dGVuZHMgRW52PiB7XG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBDb250ZXh0VmFyaWFibGVNYXA+KGtleTogS2V5LCB2YWx1ZTogQ29udGV4dFZhcmlhYmxlTWFwW0tleV0pOiB2b2lkXG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBFWydWYXJpYWJsZXMnXT4oa2V5OiBLZXksIHZhbHVlOiBFWydWYXJpYWJsZXMnXVtLZXldKTogdm9pZFxufVxuXG5pbnRlcmZhY2UgTmV3UmVzcG9uc2Uge1xuICAoZGF0YTogRGF0YSB8IG51bGwsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICAoZGF0YTogRGF0YSB8IG51bGwsIGluaXQ/OiBSZXNwb25zZUluaXQpOiBSZXNwb25zZVxufVxuXG5pbnRlcmZhY2UgQm9keVJlc3BvbmQgZXh0ZW5kcyBOZXdSZXNwb25zZSB7fVxuXG5pbnRlcmZhY2UgVGV4dFJlc3BvbmQge1xuICAodGV4dDogc3RyaW5nLCBzdGF0dXM/OiBTdGF0dXNDb2RlLCBoZWFkZXJzPzogSGVhZGVyUmVjb3JkKTogUmVzcG9uc2VcbiAgKHRleHQ6IHN0cmluZywgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlXG59XG5cbmludGVyZmFjZSBKU09OUmVzcG9uZCB7XG4gIDxUID0gSlNPTlZhbHVlPihvYmplY3Q6IFQsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICA8VCA9IEpTT05WYWx1ZT4ob2JqZWN0OiBULCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Vcbn1cblxuaW50ZXJmYWNlIEpTT05UUmVzcG9uZCB7XG4gIDxUPihcbiAgICBvYmplY3Q6IEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZSA/IFQgOiBKU09OVmFsdWUsXG4gICAgc3RhdHVzPzogU3RhdHVzQ29kZSxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFR5cGVkUmVzcG9uc2U8XG4gICAgSW50ZXJmYWNlVG9UeXBlPFQ+IGV4dGVuZHMgSlNPTlZhbHVlXG4gICAgICA/IEpTT05WYWx1ZSBleHRlbmRzIEludGVyZmFjZVRvVHlwZTxUPlxuICAgICAgICA/IG5ldmVyXG4gICAgICAgIDogVFxuICAgICAgOiBuZXZlclxuICA+XG4gIDxUPihcbiAgICBvYmplY3Q6IEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZSA/IFQgOiBKU09OVmFsdWUsXG4gICAgaW5pdD86IFJlc3BvbnNlSW5pdFxuICApOiBUeXBlZFJlc3BvbnNlPFxuICAgIEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZVxuICAgICAgPyBKU09OVmFsdWUgZXh0ZW5kcyBJbnRlcmZhY2VUb1R5cGU8VD5cbiAgICAgICAgPyBuZXZlclxuICAgICAgICA6IFRcbiAgICAgIDogbmV2ZXJcbiAgPlxufVxuXG5pbnRlcmZhY2UgSFRNTFJlc3BvbmQge1xuICAoaHRtbDogc3RyaW5nLCBzdGF0dXM/OiBTdGF0dXNDb2RlLCBoZWFkZXJzPzogSGVhZGVyUmVjb3JkKTogUmVzcG9uc2VcbiAgKGh0bWw6IHN0cmluZywgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlXG59XG5cbnR5cGUgQ29udGV4dE9wdGlvbnM8RSBleHRlbmRzIEVudj4gPSB7XG4gIGVudjogRVsnQmluZGluZ3MnXVxuICBleGVjdXRpb25DdHg/OiBGZXRjaEV2ZW50TGlrZSB8IEV4ZWN1dGlvbkNvbnRleHQgfCB1bmRlZmluZWRcbiAgbm90Rm91bmRIYW5kbGVyPzogTm90Rm91bmRIYW5kbGVyPEU+XG4gIHBhdGg/OiBzdHJpbmdcbiAgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPlxufVxuXG5leHBvcnQgY2xhc3MgQ29udGV4dDxcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgRSBleHRlbmRzIEVudiA9IGFueSxcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgUCBleHRlbmRzIHN0cmluZyA9IGFueSxcbiAgSSBleHRlbmRzIElucHV0ID0ge31cbj4ge1xuICBlbnY6IEVbJ0JpbmRpbmdzJ10gPSB7fVxuICBmaW5hbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICBlcnJvcjogRXJyb3IgfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBwcml2YXRlIF9yZXE/OiBIb25vUmVxdWVzdDxhbnksIGFueT5cbiAgcHJpdmF0ZSBfc3RhdHVzOiBTdGF0dXNDb2RlID0gMjAwXG4gIHByaXZhdGUgX2V4Q3R4OiBGZXRjaEV2ZW50TGlrZSB8IEV4ZWN1dGlvbkNvbnRleHQgfCB1bmRlZmluZWQgLy8gX2V4ZWN1dGlvbkN0eFxuICBwcml2YXRlIF9tYXA6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkXG4gIHByaXZhdGUgX2g6IEhlYWRlcnMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQgLy8gIF9oZWFkZXJzXG4gIHByaXZhdGUgX3BIOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkIC8vIF9wcmVwYXJlZEhlYWRlcnNcbiAgcHJpdmF0ZSBfcmVzOiBSZXNwb25zZSB8IHVuZGVmaW5lZFxuICBwcml2YXRlIF9wYXRoOiBzdHJpbmcgPSAnLydcbiAgcHJpdmF0ZSBfcGFyYW1zPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IG51bGxcbiAgcHJpdmF0ZSBfaW5pdCA9IHRydWVcbiAgcHJpdmF0ZSByYXdSZXF1ZXN0PzogUmVxdWVzdCB8IG51bGxcbiAgcHJpdmF0ZSBub3RGb3VuZEhhbmRsZXI6IE5vdEZvdW5kSGFuZGxlcjxFPiA9ICgpID0+IG5ldyBSZXNwb25zZSgpXG5cbiAgY29uc3RydWN0b3IocmVxOiBSZXF1ZXN0LCBvcHRpb25zPzogQ29udGV4dE9wdGlvbnM8RT4pIHtcbiAgICB0aGlzLnJhd1JlcXVlc3QgPSByZXFcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgdGhpcy5fZXhDdHggPSBvcHRpb25zLmV4ZWN1dGlvbkN0eFxuICAgICAgdGhpcy5fcGF0aCA9IG9wdGlvbnMucGF0aCA/PyAnLydcbiAgICAgIHRoaXMuX3BhcmFtcyA9IG9wdGlvbnMucGFyYW1zXG4gICAgICB0aGlzLmVudiA9IG9wdGlvbnMuZW52XG4gICAgICBpZiAob3B0aW9ucy5ub3RGb3VuZEhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5ub3RGb3VuZEhhbmRsZXIgPSBvcHRpb25zLm5vdEZvdW5kSGFuZGxlclxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldCByZXEoKTogSG9ub1JlcXVlc3Q8UCwgSVsnb3V0J10+IHtcbiAgICBpZiAodGhpcy5fcmVxKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICB0aGlzLl9yZXEgPSBuZXcgSG9ub1JlcXVlc3QodGhpcy5yYXdSZXF1ZXN0ISwgdGhpcy5fcGF0aCwgdGhpcy5fcGFyYW1zISlcbiAgICAgIHRoaXMucmF3UmVxdWVzdCA9IHVuZGVmaW5lZFxuICAgICAgdGhpcy5fcGFyYW1zID0gdW5kZWZpbmVkXG4gICAgICByZXR1cm4gdGhpcy5fcmVxXG4gICAgfVxuICB9XG5cbiAgZ2V0IGV2ZW50KCk6IEZldGNoRXZlbnRMaWtlIHtcbiAgICBpZiAodGhpcy5fZXhDdHggaW5zdGFuY2VvZiBGZXRjaEV2ZW50TGlrZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2V4Q3R4XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKCdUaGlzIGNvbnRleHQgaGFzIG5vIEZldGNoRXZlbnQnKVxuICAgIH1cbiAgfVxuXG4gIGdldCBleGVjdXRpb25DdHgoKTogRXhlY3V0aW9uQ29udGV4dCB7XG4gICAgaWYgKHRoaXMuX2V4Q3R4KSB7XG4gICAgICByZXR1cm4gdGhpcy5fZXhDdHggYXMgRXhlY3V0aW9uQ29udGV4dFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcignVGhpcyBjb250ZXh0IGhhcyBubyBFeGVjdXRpb25Db250ZXh0JylcbiAgICB9XG4gIH1cblxuICBnZXQgcmVzKCk6IFJlc3BvbnNlIHtcbiAgICB0aGlzLl9pbml0ID0gZmFsc2VcbiAgICByZXR1cm4gKHRoaXMuX3JlcyB8fD0gbmV3IFJlc3BvbnNlKCc0MDQgTm90IEZvdW5kJywgeyBzdGF0dXM6IDQwNCB9KSlcbiAgfVxuXG4gIHNldCByZXMoX3JlczogUmVzcG9uc2UgfCB1bmRlZmluZWQpIHtcbiAgICB0aGlzLl9pbml0ID0gZmFsc2VcbiAgICBpZiAodGhpcy5fcmVzICYmIF9yZXMpIHtcbiAgICAgIHRoaXMuX3Jlcy5oZWFkZXJzLmRlbGV0ZSgnY29udGVudC10eXBlJylcbiAgICAgIHRoaXMuX3Jlcy5oZWFkZXJzLmZvckVhY2goKHYsIGspID0+IHtcbiAgICAgICAgX3Jlcy5oZWFkZXJzLnNldChrLCB2KVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5fcmVzID0gX3Jlc1xuICAgIHRoaXMuZmluYWxpemVkID0gdHJ1ZVxuICB9XG5cbiAgaGVhZGVyID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCwgb3B0aW9ucz86IHsgYXBwZW5kPzogYm9vbGVhbiB9KTogdm9pZCA9PiB7XG4gICAgLy8gQ2xlYXIgdGhlIGhlYWRlclxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodGhpcy5faCkge1xuICAgICAgICB0aGlzLl9oLmRlbGV0ZShuYW1lKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9wSCkge1xuICAgICAgICBkZWxldGUgdGhpcy5fcEhbbmFtZS50b0xvY2FsZUxvd2VyQ2FzZSgpXVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZmluYWxpemVkKSB7XG4gICAgICAgIHRoaXMucmVzLmhlYWRlcnMuZGVsZXRlKG5hbWUpXG4gICAgICB9XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8uYXBwZW5kKSB7XG4gICAgICBpZiAoIXRoaXMuX2gpIHtcbiAgICAgICAgdGhpcy5faW5pdCA9IGZhbHNlXG4gICAgICAgIHRoaXMuX2ggPSBuZXcgSGVhZGVycyh0aGlzLl9wSClcbiAgICAgICAgdGhpcy5fcEggPSB7fVxuICAgICAgfVxuICAgICAgdGhpcy5faC5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9oKSB7XG4gICAgICAgIHRoaXMuX2guc2V0KG5hbWUsIHZhbHVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcEggPz89IHt9XG4gICAgICAgIHRoaXMuX3BIW25hbWUudG9Mb3dlckNhc2UoKV0gPSB2YWx1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmZpbmFsaXplZCkge1xuICAgICAgaWYgKG9wdGlvbnM/LmFwcGVuZCkge1xuICAgICAgICB0aGlzLnJlcy5oZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVzLmhlYWRlcnMuc2V0KG5hbWUsIHZhbHVlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXR1cyA9IChzdGF0dXM6IFN0YXR1c0NvZGUpOiB2b2lkID0+IHtcbiAgICB0aGlzLl9zdGF0dXMgPSBzdGF0dXNcbiAgfVxuXG4gIHNldDogU2V0PEU+ID0gKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikgPT4ge1xuICAgIHRoaXMuX21hcCB8fD0ge31cbiAgICB0aGlzLl9tYXBba2V5IGFzIHN0cmluZ10gPSB2YWx1ZVxuICB9XG5cbiAgZ2V0OiBHZXQ8RT4gPSAoa2V5OiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gdGhpcy5fbWFwID8gdGhpcy5fbWFwW2tleV0gOiB1bmRlZmluZWRcbiAgfVxuXG4gIG5ld1Jlc3BvbnNlOiBOZXdSZXNwb25zZSA9IChcbiAgICBkYXRhOiBEYXRhIHwgbnVsbCxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVzcG9uc2VJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogUmVzcG9uc2UgPT4ge1xuICAgIC8vIE9wdGltaXplZFxuICAgIGlmICh0aGlzLl9pbml0ICYmICFoZWFkZXJzICYmICFhcmcgJiYgdGhpcy5fc3RhdHVzID09PSAyMDApIHtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoZGF0YSwge1xuICAgICAgICBoZWFkZXJzOiB0aGlzLl9wSCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIFJlc3BvbnNlIGltbWVkaWF0ZWx5IGlmIGFyZyBpcyBSZXF1ZXN0SW5pdC5cbiAgICBpZiAoYXJnICYmIHR5cGVvZiBhcmcgIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zdCByZXMgPSBuZXcgUmVzcG9uc2UoZGF0YSwgYXJnKVxuICAgICAgY29uc3QgY29udGVudFR5cGUgPSB0aGlzLl9wSD8uWydjb250ZW50LXR5cGUnXVxuICAgICAgaWYgKGNvbnRlbnRUeXBlKSB7XG4gICAgICAgIHJlcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgY29udGVudFR5cGUpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzID0gYXJnID8/IHRoaXMuX3N0YXR1c1xuICAgIHRoaXMuX3BIID8/PSB7fVxuXG4gICAgdGhpcy5faCA/Pz0gbmV3IEhlYWRlcnMoKVxuICAgIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuX3BIKSkge1xuICAgICAgdGhpcy5faC5zZXQoaywgdilcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcmVzKSB7XG4gICAgICB0aGlzLl9yZXMuaGVhZGVycy5mb3JFYWNoKCh2LCBrKSA9PiB7XG4gICAgICAgIHRoaXMuX2g/LnNldChrLCB2KVxuICAgICAgfSlcbiAgICAgIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuX3BIKSkge1xuICAgICAgICB0aGlzLl9oLnNldChrLCB2KVxuICAgICAgfVxuICAgIH1cblxuICAgIGhlYWRlcnMgPz89IHt9XG4gICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoaGVhZGVycykpIHtcbiAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5faC5zZXQoaywgdilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2guZGVsZXRlKGspXG4gICAgICAgIGZvciAoY29uc3QgdjIgb2Ygdikge1xuICAgICAgICAgIHRoaXMuX2guYXBwZW5kKGssIHYyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShkYXRhLCB7XG4gICAgICBzdGF0dXMsXG4gICAgICBoZWFkZXJzOiB0aGlzLl9oLFxuICAgIH0pXG4gIH1cblxuICBib2R5OiBCb2R5UmVzcG9uZCA9IChcbiAgICBkYXRhOiBEYXRhIHwgbnVsbCxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVxdWVzdEluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApOiBSZXNwb25zZSA9PiB7XG4gICAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInXG4gICAgICA/IHRoaXMubmV3UmVzcG9uc2UoZGF0YSwgYXJnLCBoZWFkZXJzKVxuICAgICAgOiB0aGlzLm5ld1Jlc3BvbnNlKGRhdGEsIGFyZylcbiAgfVxuXG4gIHRleHQ6IFRleHRSZXNwb25kID0gKFxuICAgIHRleHQ6IHN0cmluZyxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVxdWVzdEluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApOiBSZXNwb25zZSA9PiB7XG4gICAgLy8gSWYgdGhlIGhlYWRlciBpcyBlbXB0eSwgcmV0dXJuIFJlc3BvbnNlIGltbWVkaWF0ZWx5LlxuICAgIC8vIENvbnRlbnQtVHlwZSB3aWxsIGJlIGFkZGVkIGF1dG9tYXRpY2FsbHkgYXMgYHRleHQvcGxhaW5gLlxuICAgIGlmICghdGhpcy5fcEgpIHtcbiAgICAgIGlmICh0aGlzLl9pbml0ICYmICFoZWFkZXJzICYmICFhcmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0ZXh0KVxuICAgICAgfVxuICAgICAgdGhpcy5fcEggPSB7fVxuICAgIH1cbiAgICAvLyBJZiBDb250ZW50LVR5cGUgaXMgbm90IHNldCwgd2UgZG9uJ3QgaGF2ZSB0byBzZXQgYHRleHQvcGxhaW5gLlxuICAgIC8vIEZld2VyIHRoZSBoZWFkZXIgdmFsdWVzLCBpdCB3aWxsIGJlIGZhc3Rlci5cbiAgICBpZiAodGhpcy5fcEhbJ2NvbnRlbnQtdHlwZSddKSB7XG4gICAgICB0aGlzLl9wSFsnY29udGVudC10eXBlJ10gPSAndGV4dC9wbGFpbjsgY2hhcnNldD1VVEYtOCdcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInXG4gICAgICA/IHRoaXMubmV3UmVzcG9uc2UodGV4dCwgYXJnLCBoZWFkZXJzKVxuICAgICAgOiB0aGlzLm5ld1Jlc3BvbnNlKHRleHQsIGFyZylcbiAgfVxuXG4gIGpzb246IEpTT05SZXNwb25kID0gPFQgPSB7fT4oXG4gICAgb2JqZWN0OiBULFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXF1ZXN0SW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICkgPT4ge1xuICAgIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeShvYmplY3QpXG4gICAgdGhpcy5fcEggPz89IHt9XG4gICAgdGhpcy5fcEhbJ2NvbnRlbnQtdHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLTgnXG4gICAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInXG4gICAgICA/IHRoaXMubmV3UmVzcG9uc2UoYm9keSwgYXJnLCBoZWFkZXJzKVxuICAgICAgOiB0aGlzLm5ld1Jlc3BvbnNlKGJvZHksIGFyZylcbiAgfVxuXG4gIGpzb25UOiBKU09OVFJlc3BvbmQgPSA8VD4oXG4gICAgb2JqZWN0OiBJbnRlcmZhY2VUb1R5cGU8VD4gZXh0ZW5kcyBKU09OVmFsdWUgPyBUIDogSlNPTlZhbHVlLFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXF1ZXN0SW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFR5cGVkUmVzcG9uc2U8XG4gICAgSW50ZXJmYWNlVG9UeXBlPFQ+IGV4dGVuZHMgSlNPTlZhbHVlXG4gICAgICA/IEpTT05WYWx1ZSBleHRlbmRzIEludGVyZmFjZVRvVHlwZTxUPlxuICAgICAgICA/IG5ldmVyXG4gICAgICAgIDogVFxuICAgICAgOiBuZXZlclxuICA+ID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzcG9uc2U6IHR5cGVvZiBhcmcgPT09ICdudW1iZXInID8gdGhpcy5qc29uKG9iamVjdCwgYXJnLCBoZWFkZXJzKSA6IHRoaXMuanNvbihvYmplY3QsIGFyZyksXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgZGF0YTogb2JqZWN0IGFzIGFueSxcbiAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgIH1cbiAgfVxuXG4gIGh0bWw6IEhUTUxSZXNwb25kID0gKFxuICAgIGh0bWw6IHN0cmluZyxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVxdWVzdEluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApOiBSZXNwb25zZSA9PiB7XG4gICAgdGhpcy5fcEggPz89IHt9XG4gICAgdGhpcy5fcEhbJ2NvbnRlbnQtdHlwZSddID0gJ3RleHQvaHRtbDsgY2hhcnNldD1VVEYtOCdcbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZShodG1sLCBhcmcsIGhlYWRlcnMpXG4gICAgICA6IHRoaXMubmV3UmVzcG9uc2UoaHRtbCwgYXJnKVxuICB9XG5cbiAgcmVkaXJlY3QgPSAobG9jYXRpb246IHN0cmluZywgc3RhdHVzOiBTdGF0dXNDb2RlID0gMzAyKTogUmVzcG9uc2UgPT4ge1xuICAgIHRoaXMuX2ggPz89IG5ldyBIZWFkZXJzKClcbiAgICB0aGlzLl9oLnNldCgnTG9jYXRpb24nLCBsb2NhdGlvbilcbiAgICByZXR1cm4gdGhpcy5uZXdSZXNwb25zZShudWxsLCBzdGF0dXMpXG4gIH1cblxuICAvKiogQGRlcHJlY2F0ZWRcbiAgICogVXNlIENvb2tpZSBNaWRkbGV3YXJlIGluc3RlYWQgb2YgYGMuY29va2llKClgLiBUaGUgYGMuY29va2llKClgIHdpbGwgYmUgcmVtb3ZlZCBpbiB2NC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogaW1wb3J0IHsgc2V0Q29va2llIH0gZnJvbSAnaG9uby9jb29raWUnXG4gICAqIC8vIC4uLlxuICAgKiBhcHAuZ2V0KCcvJywgKGMpID0+IHtcbiAgICogICBzZXRDb29raWUoYywgJ2tleScsICd2YWx1ZScpXG4gICAqICAgLy8uLi5cbiAgICogfSlcbiAgICovXG4gIGNvb2tpZSA9IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG9wdD86IENvb2tpZU9wdGlvbnMpOiB2b2lkID0+IHtcbiAgICBjb25zdCBjb29raWUgPSBzZXJpYWxpemUobmFtZSwgdmFsdWUsIG9wdClcbiAgICB0aGlzLmhlYWRlcignc2V0LWNvb2tpZScsIGNvb2tpZSwgeyBhcHBlbmQ6IHRydWUgfSlcbiAgfVxuXG4gIG5vdEZvdW5kID0gKCk6IFJlc3BvbnNlIHwgUHJvbWlzZTxSZXNwb25zZT4gPT4ge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIHRoaXMubm90Rm91bmRIYW5kbGVyKHRoaXMpXG4gIH1cblxuICBnZXQgcnVudGltZSgpOiBSdW50aW1lIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGNvbnN0IGdsb2JhbCA9IGdsb2JhbFRoaXMgYXMgYW55XG5cbiAgICBpZiAoZ2xvYmFsPy5EZW5vICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAnZGVubydcbiAgICB9XG5cbiAgICBpZiAoZ2xvYmFsPy5CdW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICdidW4nXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBnbG9iYWw/LldlYlNvY2tldFBhaXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAnd29ya2VyZCdcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGdsb2JhbD8uRWRnZVJ1bnRpbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gJ2VkZ2UtbGlnaHQnXG4gICAgfVxuXG4gICAgaWYgKGdsb2JhbD8uZmFzdGx5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAnZmFzdGx5J1xuICAgIH1cblxuICAgIGlmIChnbG9iYWw/Ll9fbGFnb25fXyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJ2xhZ29uJ1xuICAgIH1cblxuICAgIGlmIChnbG9iYWw/LnByb2Nlc3M/LnJlbGVhc2U/Lm5hbWUgPT09ICdub2RlJykge1xuICAgICAgcmV0dXJuICdub2RlJ1xuICAgIH1cblxuICAgIHJldHVybiAnb3RoZXInXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFdBQVcsUUFBUSxlQUFjO0FBQzFDLFNBQVMsY0FBYyxRQUFRLGFBQVk7QUFHM0MsU0FBUyxTQUFTLFFBQVEsb0JBQW1CO0FBOEU3QyxPQUFPLE1BQU07SUFPWCxNQUFxQixDQUFDLEVBQUM7SUFDdkIsWUFBcUIsS0FBSyxDQUFBO0lBQzFCLFFBQTJCLFVBQVM7SUFFcEMsOERBQThEO0lBQ3RELEtBQTRCO0lBQzVCLFVBQXNCLElBQUc7SUFDekIsT0FBcUQ7SUFDckQsS0FBeUM7SUFDekMsS0FBMEIsVUFBVSxZQUFZO0tBQWI7SUFDbkMsTUFBMEMsVUFBVSxtQkFBbUI7S0FBcEI7SUFDbkQsS0FBMEI7SUFDMUIsUUFBZ0IsSUFBRztJQUNuQixRQUF1QztJQUN2QyxRQUFRLElBQUksQ0FBQTtJQUNaLFdBQTJCO0lBQzNCLGtCQUFzQyxJQUFNLElBQUksV0FBVTtJQUVsRSxZQUFZLEdBQVksRUFBRSxPQUEyQixDQUFFO1FBQ3JELElBQUksQ0FBQyxVQUFVLEdBQUc7UUFDbEIsSUFBSSxTQUFTO1lBQ1gsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLFlBQVk7WUFDbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLElBQUksSUFBSTtZQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsTUFBTTtZQUM3QixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsR0FBRztZQUN0QixJQUFJLFFBQVEsZUFBZSxFQUFFO2dCQUMzQixJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsZUFBZTtZQUNoRCxDQUFDO1FBQ0gsQ0FBQztJQUNIO0lBRUEsSUFBSSxNQUFnQztRQUNsQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDYixPQUFPLElBQUksQ0FBQyxJQUFJO1FBQ2xCLE9BQU87WUFDTCxvRUFBb0U7WUFDcEUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFlBQVksSUFBSSxDQUFDLFVBQVUsRUFBRyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ3RFLElBQUksQ0FBQyxVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRztZQUNmLE9BQU8sSUFBSSxDQUFDLElBQUk7UUFDbEIsQ0FBQztJQUNIO0lBRUEsSUFBSSxRQUF3QjtRQUMxQixJQUFJLElBQUksQ0FBQyxNQUFNLFlBQVksZ0JBQWdCO1lBQ3pDLE9BQU8sSUFBSSxDQUFDLE1BQU07UUFDcEIsT0FBTztZQUNMLE1BQU0sTUFBTSxrQ0FBaUM7UUFDL0MsQ0FBQztJQUNIO0lBRUEsSUFBSSxlQUFpQztRQUNuQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixPQUFPLElBQUksQ0FBQyxNQUFNO1FBQ3BCLE9BQU87WUFDTCxNQUFNLE1BQU0sd0NBQXVDO1FBQ3JELENBQUM7SUFDSDtJQUVBLElBQUksTUFBZ0I7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLO1FBQ2xCLE9BQVEsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLFNBQVMsaUJBQWlCO1lBQUUsUUFBUTtRQUFJO0lBQ3BFO0lBRUEsSUFBSSxJQUFJLElBQTBCLEVBQUU7UUFDbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLO1FBQ2xCLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQU07Z0JBQ2xDLEtBQUssT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHO1lBQ3RCO1FBQ0YsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLEdBQUc7UUFDWixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUk7SUFDdkI7SUFFQSxTQUFTLENBQUMsTUFBYyxPQUEyQixVQUF5QztRQUMxRixtQkFBbUI7UUFDbkIsSUFBSSxVQUFVLFdBQVc7WUFDdkIsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUNYLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2pCLE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNuQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxpQkFBaUIsR0FBRztZQUMzQyxDQUFDO1lBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDMUIsQ0FBQztZQUNEO1FBQ0YsQ0FBQztRQUVELElBQUksU0FBUyxRQUFRO1lBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUNaLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSztnQkFDbEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLFFBQVEsSUFBSSxDQUFDLEdBQUc7Z0JBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNkLENBQUM7WUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1FBQ3ZCLE9BQU87WUFDTCxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTTtZQUNwQixPQUFPO2dCQUNMLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssV0FBVyxHQUFHLEdBQUc7WUFDakMsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEIsSUFBSSxTQUFTLFFBQVE7Z0JBQ25CLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQ2hDLE9BQU87Z0JBQ0wsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU07WUFDN0IsQ0FBQztRQUNILENBQUM7SUFDSCxFQUFDO0lBRUQsU0FBUyxDQUFDLFNBQTZCO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUc7SUFDakIsRUFBQztJQUVELE1BQWMsQ0FBQyxLQUFhLFFBQW1CO1FBQzdDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBYyxHQUFHO0lBQzdCLEVBQUM7SUFFRCxNQUFjLENBQUMsTUFBZ0I7UUFDN0IsT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVM7SUFDL0MsRUFBQztJQUVELGNBQTJCLENBQ3pCLE1BQ0EsS0FDQSxVQUNhO1FBQ2IsWUFBWTtRQUNaLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssS0FBSztZQUMxRCxPQUFPLElBQUksU0FBUyxNQUFNO2dCQUN4QixTQUFTLElBQUksQ0FBQyxHQUFHO1lBQ25CO1FBQ0YsQ0FBQztRQUVELHFEQUFxRDtRQUNyRCxJQUFJLE9BQU8sT0FBTyxRQUFRLFVBQVU7WUFDbEMsTUFBTSxNQUFNLElBQUksU0FBUyxNQUFNO1lBQy9CLE1BQU0sY0FBYyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBZTtZQUM5QyxJQUFJLGFBQWE7Z0JBQ2YsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtZQUNsQyxDQUFDO1lBQ0QsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLFNBQVMsT0FBTyxJQUFJLENBQUMsT0FBTztRQUNsQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7UUFFZCxJQUFJLENBQUMsRUFBRSxLQUFLLElBQUk7UUFDaEIsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRztZQUM3QyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHO1FBQ2pCO1FBRUEsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFNO2dCQUNsQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksR0FBRztZQUNsQjtZQUNBLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUc7Z0JBQzdDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUc7WUFDakI7UUFDRixDQUFDO1FBRUQsWUFBWSxDQUFDO1FBQ2IsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksT0FBTyxPQUFPLENBQUMsU0FBVTtZQUM1QyxJQUFJLE9BQU8sTUFBTSxVQUFVO2dCQUN6QixJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHO1lBQ2pCLE9BQU87Z0JBQ0wsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ2YsS0FBSyxNQUFNLE1BQU0sRUFBRztvQkFDbEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRztnQkFDcEI7WUFDRixDQUFDO1FBQ0g7UUFFQSxPQUFPLElBQUksU0FBUyxNQUFNO1lBQ3hCO1lBQ0EsU0FBUyxJQUFJLENBQUMsRUFBRTtRQUNsQjtJQUNGLEVBQUM7SUFFRCxPQUFvQixDQUNsQixNQUNBLEtBQ0EsVUFDYTtRQUNiLE9BQU8sT0FBTyxRQUFRLFdBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLFdBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJO0lBQ2pDLEVBQUM7SUFFRCxPQUFvQixDQUNsQixNQUNBLEtBQ0EsVUFDYTtRQUNiLHVEQUF1RDtRQUN2RCw0REFBNEQ7UUFDNUQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDYixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSztnQkFDbEMsT0FBTyxJQUFJLFNBQVM7WUFDdEIsQ0FBQztZQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUNkLENBQUM7UUFDRCxpRUFBaUU7UUFDakUsOENBQThDO1FBQzlDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUU7WUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUc7UUFDN0IsQ0FBQztRQUNELE9BQU8sT0FBTyxRQUFRLFdBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLFdBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJO0lBQ2pDLEVBQUM7SUFFRCxPQUFvQixDQUNsQixRQUNBLEtBQ0EsVUFDRztRQUNILE1BQU0sT0FBTyxLQUFLLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRztRQUMzQixPQUFPLE9BQU8sUUFBUSxXQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxXQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSTtJQUNqQyxFQUFDO0lBRUQsUUFBc0IsQ0FDcEIsUUFDQSxLQUNBLFVBT0c7UUFDSCxPQUFPO1lBQ0wsVUFBVSxPQUFPLFFBQVEsV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJO1lBQzVGLDhEQUE4RDtZQUM5RCxNQUFNO1lBQ04sUUFBUTtRQUNWO0lBQ0YsRUFBQztJQUVELE9BQW9CLENBQ2xCLE1BQ0EsS0FDQSxVQUNhO1FBQ2IsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUc7UUFDM0IsT0FBTyxPQUFPLFFBQVEsV0FDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssV0FDNUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLElBQUk7SUFDakMsRUFBQztJQUVELFdBQVcsQ0FBQyxVQUFrQixTQUFxQixHQUFHLEdBQWU7UUFDbkUsSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJO1FBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVk7UUFDeEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtJQUNoQyxFQUFDO0lBRUQ7Ozs7Ozs7Ozs7O0dBV0MsR0FDRCxTQUFTLENBQUMsTUFBYyxPQUFlLE1BQThCO1FBQ25FLE1BQU0sU0FBUyxVQUFVLE1BQU0sT0FBTztRQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsUUFBUTtZQUFFLFFBQVEsSUFBSTtRQUFDO0lBQ25ELEVBQUM7SUFFRCxXQUFXLElBQW9DO1FBQzdDLDZEQUE2RDtRQUM3RCxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUk7SUFDbEMsRUFBQztJQUVELElBQUksVUFBbUI7UUFDckIsOERBQThEO1FBQzlELE1BQU0sU0FBUztRQUVmLElBQUksUUFBUSxTQUFTLFdBQVc7WUFDOUIsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLFFBQVEsUUFBUSxXQUFXO1lBQzdCLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxPQUFPLFFBQVEsa0JBQWtCLFlBQVk7WUFDL0MsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLE9BQU8sUUFBUSxnQkFBZ0IsVUFBVTtZQUMzQyxPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksUUFBUSxXQUFXLFdBQVc7WUFDaEMsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLFFBQVEsY0FBYyxXQUFXO1lBQ25DLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxRQUFRLFNBQVMsU0FBUyxTQUFTLFFBQVE7WUFDN0MsT0FBTztRQUNULENBQUM7UUFFRCxPQUFPO0lBQ1Q7QUFDRixDQUFDIn0=