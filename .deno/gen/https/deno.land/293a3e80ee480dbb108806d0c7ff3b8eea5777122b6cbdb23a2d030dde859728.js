import { serialize } from './utils/cookie.ts';
import { StreamingApi } from './utils/stream.ts';
const TEXT_PLAIN = 'text/plain; charset=UTF-8';
export class Context {
    req;
    env = {};
    _var = {};
    finalized = false;
    error = undefined;
    _status = 200;
    _exCtx;
    _h = undefined //  _headers
    ;
    _pH = undefined // _preparedHeaders
    ;
    _res;
    _init = true;
    _renderer = (content)=>this.html(content);
    notFoundHandler = ()=>new Response();
    constructor(req, options){
        this.req = req;
        if (options) {
            this._exCtx = options.executionCtx;
            this.env = options.env;
            if (options.notFoundHandler) {
                this.notFoundHandler = options.notFoundHandler;
            }
        }
    }
    get event() {
        if (this._exCtx && 'respondWith' in this._exCtx) {
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
    /**
   * @experimental
   * `c.render()` is an experimental feature.
   * The API might be changed.
   */ // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render = (...args)=>this._renderer(...args);
    /**
   * @experimental
   * `c.setRenderer()` is an experimental feature.
   * The API might be changed.
   */ setRenderer = (renderer)=>{
        this._renderer = renderer;
    };
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
        this._var ??= {};
        this._var[key] = value;
    };
    get = (key)=>{
        return this._var ? this._var[key] : undefined;
    };
    // c.var.propName is a read-only
    get var() {
        return {
            ...this._var
        };
    }
    newResponse = (data, arg, headers)=>{
        // Optimized
        if (this._init && !headers && !arg && this._status === 200) {
            return new Response(data, {
                headers: this._pH
            });
        }
        // Return Response immediately if arg is ResponseInit.
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
            this._pH['content-type'] = TEXT_PLAIN;
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
        const response = typeof arg === 'number' ? this.json(object, arg, headers) : this.json(object, arg);
        return {
            response,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: object,
            format: 'json',
            status: response.status
        };
    };
    html = (html, arg, headers)=>{
        this._pH ??= {};
        this._pH['content-type'] = 'text/html; charset=UTF-8';
        if (typeof html === 'object') {
            if (!(html instanceof Promise)) {
                html = html.toString() // HtmlEscapedString object to string
                ;
            }
            if (html instanceof Promise) {
                return html.then((html)=>{
                    return typeof arg === 'number' ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
                });
            }
        }
        return typeof arg === 'number' ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    };
    redirect = (location, status = 302)=>{
        this._h ??= new Headers();
        this._h.set('Location', location);
        return this.newResponse(null, status);
    };
    streamText = (cb, arg, headers)=>{
        headers ??= {};
        this.header('content-type', TEXT_PLAIN);
        this.header('x-content-type-options', 'nosniff');
        this.header('transfer-encoding', 'chunked');
        return this.stream(cb, arg, headers);
    };
    stream = (cb, arg, headers)=>{
        const { readable , writable  } = new TransformStream();
        const stream = new StreamingApi(writable);
        cb(stream).finally(()=>stream.close());
        return typeof arg === 'number' ? this.newResponse(readable, arg, headers) : this.newResponse(readable, arg);
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
    /** @deprecated
   * Use `getRuntimeKey()` exported from `hono/adapter` instead of `c.runtime()`. The `c.runtime()` will be removed in v4.
   *
   * @example
   *
   * import { getRuntimeKey } from 'hono/adapter'
   * // ...
   * app.get('/', (c) => {
   *   const key = getRuntimeKey()
   *   //...
   * })
   */ get runtime() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL2NvbnRleHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBSdW50aW1lIH0gZnJvbSAnLi9oZWxwZXIvYWRhcHRlci9pbmRleC50cydcbmltcG9ydCB0eXBlIHsgSG9ub1JlcXVlc3QgfSBmcm9tICcuL3JlcXVlc3QudHMnXG5pbXBvcnQgdHlwZSB7IEVudiwgRmV0Y2hFdmVudExpa2UsIE5vdEZvdW5kSGFuZGxlciwgSW5wdXQsIFR5cGVkUmVzcG9uc2UgfSBmcm9tICcuL3R5cGVzLnRzJ1xuaW1wb3J0IHR5cGUgeyBDb29raWVPcHRpb25zIH0gZnJvbSAnLi91dGlscy9jb29raWUudHMnXG5pbXBvcnQgeyBzZXJpYWxpemUgfSBmcm9tICcuL3V0aWxzL2Nvb2tpZS50cydcbmltcG9ydCB0eXBlIHsgU3RhdHVzQ29kZSB9IGZyb20gJy4vdXRpbHMvaHR0cC1zdGF0dXMudHMnXG5pbXBvcnQgeyBTdHJlYW1pbmdBcGkgfSBmcm9tICcuL3V0aWxzL3N0cmVhbS50cydcbmltcG9ydCB0eXBlIHsgSlNPTlZhbHVlLCBJbnRlcmZhY2VUb1R5cGUgfSBmcm9tICcuL3V0aWxzL3R5cGVzLnRzJ1xuXG50eXBlIEhlYWRlclJlY29yZCA9IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHN0cmluZ1tdPlxudHlwZSBEYXRhID0gc3RyaW5nIHwgQXJyYXlCdWZmZXIgfCBSZWFkYWJsZVN0cmVhbVxuXG5leHBvcnQgaW50ZXJmYWNlIEV4ZWN1dGlvbkNvbnRleHQge1xuICB3YWl0VW50aWwocHJvbWlzZTogUHJvbWlzZTx1bmtub3duPik6IHZvaWRcbiAgcGFzc1Rocm91Z2hPbkV4Y2VwdGlvbigpOiB2b2lkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGV4dFZhcmlhYmxlTWFwIHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGV4dFJlbmRlcmVyIHt9XG5pbnRlcmZhY2UgRGVmYXVsdFJlbmRlcmVyIHtcbiAgKGNvbnRlbnQ6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPik6IFJlc3BvbnNlIHwgUHJvbWlzZTxSZXNwb25zZT5cbn1cbmV4cG9ydCB0eXBlIFJlbmRlcmVyID0gQ29udGV4dFJlbmRlcmVyIGV4dGVuZHMgRnVuY3Rpb24gPyBDb250ZXh0UmVuZGVyZXIgOiBEZWZhdWx0UmVuZGVyZXJcblxuaW50ZXJmYWNlIEdldDxFIGV4dGVuZHMgRW52PiB7XG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBDb250ZXh0VmFyaWFibGVNYXA+KGtleTogS2V5KTogQ29udGV4dFZhcmlhYmxlTWFwW0tleV1cbiAgPEtleSBleHRlbmRzIGtleW9mIEVbJ1ZhcmlhYmxlcyddPihrZXk6IEtleSk6IEVbJ1ZhcmlhYmxlcyddW0tleV1cbn1cblxuaW50ZXJmYWNlIFNldDxFIGV4dGVuZHMgRW52PiB7XG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBDb250ZXh0VmFyaWFibGVNYXA+KGtleTogS2V5LCB2YWx1ZTogQ29udGV4dFZhcmlhYmxlTWFwW0tleV0pOiB2b2lkXG4gIDxLZXkgZXh0ZW5kcyBrZXlvZiBFWydWYXJpYWJsZXMnXT4oa2V5OiBLZXksIHZhbHVlOiBFWydWYXJpYWJsZXMnXVtLZXldKTogdm9pZFxufVxuXG5pbnRlcmZhY2UgTmV3UmVzcG9uc2Uge1xuICAoZGF0YTogRGF0YSB8IG51bGwsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICAoZGF0YTogRGF0YSB8IG51bGwsIGluaXQ/OiBSZXNwb25zZUluaXQpOiBSZXNwb25zZVxufVxuXG5pbnRlcmZhY2UgQm9keVJlc3BvbmQgZXh0ZW5kcyBOZXdSZXNwb25zZSB7fVxuXG5pbnRlcmZhY2UgVGV4dFJlc3BvbmQge1xuICAodGV4dDogc3RyaW5nLCBzdGF0dXM/OiBTdGF0dXNDb2RlLCBoZWFkZXJzPzogSGVhZGVyUmVjb3JkKTogUmVzcG9uc2VcbiAgKHRleHQ6IHN0cmluZywgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlXG59XG5cbmludGVyZmFjZSBKU09OUmVzcG9uZCB7XG4gIDxUID0gSlNPTlZhbHVlPihvYmplY3Q6IFQsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICA8VCA9IEpTT05WYWx1ZT4ob2JqZWN0OiBULCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Vcbn1cblxuaW50ZXJmYWNlIEpTT05UUmVzcG9uZCB7XG4gIDxUPihcbiAgICBvYmplY3Q6IEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZSA/IFQgOiBKU09OVmFsdWUsXG4gICAgc3RhdHVzPzogU3RhdHVzQ29kZSxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFR5cGVkUmVzcG9uc2U8XG4gICAgSW50ZXJmYWNlVG9UeXBlPFQ+IGV4dGVuZHMgSlNPTlZhbHVlXG4gICAgICA/IEpTT05WYWx1ZSBleHRlbmRzIEludGVyZmFjZVRvVHlwZTxUPlxuICAgICAgICA/IG5ldmVyXG4gICAgICAgIDogVFxuICAgICAgOiBuZXZlclxuICA+XG4gIDxUPihcbiAgICBvYmplY3Q6IEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZSA/IFQgOiBKU09OVmFsdWUsXG4gICAgaW5pdD86IFJlc3BvbnNlSW5pdFxuICApOiBUeXBlZFJlc3BvbnNlPFxuICAgIEludGVyZmFjZVRvVHlwZTxUPiBleHRlbmRzIEpTT05WYWx1ZVxuICAgICAgPyBKU09OVmFsdWUgZXh0ZW5kcyBJbnRlcmZhY2VUb1R5cGU8VD5cbiAgICAgICAgPyBuZXZlclxuICAgICAgICA6IFRcbiAgICAgIDogbmV2ZXJcbiAgPlxufVxuXG5pbnRlcmZhY2UgSFRNTFJlc3BvbmQge1xuICAoaHRtbDogc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+LCBzdGF0dXM/OiBTdGF0dXNDb2RlLCBoZWFkZXJzPzogSGVhZGVyUmVjb3JkKTpcbiAgICB8IFJlc3BvbnNlXG4gICAgfCBQcm9taXNlPFJlc3BvbnNlPlxuICAoaHRtbDogc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+LCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2UgfCBQcm9taXNlPFJlc3BvbnNlPlxufVxuXG50eXBlIENvbnRleHRPcHRpb25zPEUgZXh0ZW5kcyBFbnY+ID0ge1xuICBlbnY6IEVbJ0JpbmRpbmdzJ11cbiAgZXhlY3V0aW9uQ3R4PzogRmV0Y2hFdmVudExpa2UgfCBFeGVjdXRpb25Db250ZXh0IHwgdW5kZWZpbmVkXG4gIG5vdEZvdW5kSGFuZGxlcj86IE5vdEZvdW5kSGFuZGxlcjxFPlxufVxuXG5jb25zdCBURVhUX1BMQUlOID0gJ3RleHQvcGxhaW47IGNoYXJzZXQ9VVRGLTgnXG5cbmV4cG9ydCBjbGFzcyBDb250ZXh0PFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBFIGV4dGVuZHMgRW52ID0gYW55LFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBQIGV4dGVuZHMgc3RyaW5nID0gYW55LFxuICBJIGV4dGVuZHMgSW5wdXQgPSB7fVxuPiB7XG4gIHJlcTogSG9ub1JlcXVlc3Q8UCwgSVsnb3V0J10+XG4gIGVudjogRVsnQmluZGluZ3MnXSA9IHt9XG4gIHByaXZhdGUgX3ZhcjogRVsnVmFyaWFibGVzJ10gPSB7fVxuICBmaW5hbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICBlcnJvcjogRXJyb3IgfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcblxuICBwcml2YXRlIF9zdGF0dXM6IFN0YXR1c0NvZGUgPSAyMDBcbiAgcHJpdmF0ZSBfZXhDdHg6IEZldGNoRXZlbnRMaWtlIHwgRXhlY3V0aW9uQ29udGV4dCB8IHVuZGVmaW5lZCAvLyBfZXhlY3V0aW9uQ3R4XG4gIHByaXZhdGUgX2g6IEhlYWRlcnMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQgLy8gIF9oZWFkZXJzXG4gIHByaXZhdGUgX3BIOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkIC8vIF9wcmVwYXJlZEhlYWRlcnNcbiAgcHJpdmF0ZSBfcmVzOiBSZXNwb25zZSB8IHVuZGVmaW5lZFxuICBwcml2YXRlIF9pbml0ID0gdHJ1ZVxuICBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIgPSAoY29udGVudDogc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+KSA9PiB0aGlzLmh0bWwoY29udGVudClcbiAgcHJpdmF0ZSBub3RGb3VuZEhhbmRsZXI6IE5vdEZvdW5kSGFuZGxlcjxFPiA9ICgpID0+IG5ldyBSZXNwb25zZSgpXG5cbiAgY29uc3RydWN0b3IocmVxOiBIb25vUmVxdWVzdDxQLCBJWydvdXQnXT4sIG9wdGlvbnM/OiBDb250ZXh0T3B0aW9uczxFPikge1xuICAgIHRoaXMucmVxID0gcmVxXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuX2V4Q3R4ID0gb3B0aW9ucy5leGVjdXRpb25DdHhcbiAgICAgIHRoaXMuZW52ID0gb3B0aW9ucy5lbnZcbiAgICAgIGlmIChvcHRpb25zLm5vdEZvdW5kSGFuZGxlcikge1xuICAgICAgICB0aGlzLm5vdEZvdW5kSGFuZGxlciA9IG9wdGlvbnMubm90Rm91bmRIYW5kbGVyXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0IGV2ZW50KCk6IEZldGNoRXZlbnRMaWtlIHtcbiAgICBpZiAodGhpcy5fZXhDdHggJiYgJ3Jlc3BvbmRXaXRoJyBpbiB0aGlzLl9leEN0eCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2V4Q3R4XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKCdUaGlzIGNvbnRleHQgaGFzIG5vIEZldGNoRXZlbnQnKVxuICAgIH1cbiAgfVxuXG4gIGdldCBleGVjdXRpb25DdHgoKTogRXhlY3V0aW9uQ29udGV4dCB7XG4gICAgaWYgKHRoaXMuX2V4Q3R4KSB7XG4gICAgICByZXR1cm4gdGhpcy5fZXhDdHggYXMgRXhlY3V0aW9uQ29udGV4dFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcignVGhpcyBjb250ZXh0IGhhcyBubyBFeGVjdXRpb25Db250ZXh0JylcbiAgICB9XG4gIH1cblxuICBnZXQgcmVzKCk6IFJlc3BvbnNlIHtcbiAgICB0aGlzLl9pbml0ID0gZmFsc2VcbiAgICByZXR1cm4gKHRoaXMuX3JlcyB8fD0gbmV3IFJlc3BvbnNlKCc0MDQgTm90IEZvdW5kJywgeyBzdGF0dXM6IDQwNCB9KSlcbiAgfVxuXG4gIHNldCByZXMoX3JlczogUmVzcG9uc2UgfCB1bmRlZmluZWQpIHtcbiAgICB0aGlzLl9pbml0ID0gZmFsc2VcbiAgICBpZiAodGhpcy5fcmVzICYmIF9yZXMpIHtcbiAgICAgIHRoaXMuX3Jlcy5oZWFkZXJzLmRlbGV0ZSgnY29udGVudC10eXBlJylcbiAgICAgIHRoaXMuX3Jlcy5oZWFkZXJzLmZvckVhY2goKHYsIGspID0+IHtcbiAgICAgICAgX3Jlcy5oZWFkZXJzLnNldChrLCB2KVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5fcmVzID0gX3Jlc1xuICAgIHRoaXMuZmluYWxpemVkID0gdHJ1ZVxuICB9XG5cbiAgLyoqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICogYGMucmVuZGVyKClgIGlzIGFuIGV4cGVyaW1lbnRhbCBmZWF0dXJlLlxuICAgKiBUaGUgQVBJIG1pZ2h0IGJlIGNoYW5nZWQuXG4gICAqL1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gIC8vIEB0cy1pZ25vcmVcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgcmVuZGVyOiBSZW5kZXJlciA9ICguLi5hcmdzOiBhbnlbXSkgPT4gdGhpcy5fcmVuZGVyZXIoLi4uYXJncylcblxuICAvKipcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKiBgYy5zZXRSZW5kZXJlcigpYCBpcyBhbiBleHBlcmltZW50YWwgZmVhdHVyZS5cbiAgICogVGhlIEFQSSBtaWdodCBiZSBjaGFuZ2VkLlxuICAgKi9cbiAgc2V0UmVuZGVyZXIgPSAocmVuZGVyZXI6IFJlbmRlcmVyKSA9PiB7XG4gICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlclxuICB9XG5cbiAgaGVhZGVyID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCwgb3B0aW9ucz86IHsgYXBwZW5kPzogYm9vbGVhbiB9KTogdm9pZCA9PiB7XG4gICAgLy8gQ2xlYXIgdGhlIGhlYWRlclxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodGhpcy5faCkge1xuICAgICAgICB0aGlzLl9oLmRlbGV0ZShuYW1lKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9wSCkge1xuICAgICAgICBkZWxldGUgdGhpcy5fcEhbbmFtZS50b0xvY2FsZUxvd2VyQ2FzZSgpXVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZmluYWxpemVkKSB7XG4gICAgICAgIHRoaXMucmVzLmhlYWRlcnMuZGVsZXRlKG5hbWUpXG4gICAgICB9XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8uYXBwZW5kKSB7XG4gICAgICBpZiAoIXRoaXMuX2gpIHtcbiAgICAgICAgdGhpcy5faW5pdCA9IGZhbHNlXG4gICAgICAgIHRoaXMuX2ggPSBuZXcgSGVhZGVycyh0aGlzLl9wSClcbiAgICAgICAgdGhpcy5fcEggPSB7fVxuICAgICAgfVxuICAgICAgdGhpcy5faC5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9oKSB7XG4gICAgICAgIHRoaXMuX2guc2V0KG5hbWUsIHZhbHVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcEggPz89IHt9XG4gICAgICAgIHRoaXMuX3BIW25hbWUudG9Mb3dlckNhc2UoKV0gPSB2YWx1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmZpbmFsaXplZCkge1xuICAgICAgaWYgKG9wdGlvbnM/LmFwcGVuZCkge1xuICAgICAgICB0aGlzLnJlcy5oZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVzLmhlYWRlcnMuc2V0KG5hbWUsIHZhbHVlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXR1cyA9IChzdGF0dXM6IFN0YXR1c0NvZGUpOiB2b2lkID0+IHtcbiAgICB0aGlzLl9zdGF0dXMgPSBzdGF0dXNcbiAgfVxuXG4gIHNldDogU2V0PEU+ID0gKGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikgPT4ge1xuICAgIHRoaXMuX3ZhciA/Pz0ge31cbiAgICB0aGlzLl92YXJba2V5IGFzIHN0cmluZ10gPSB2YWx1ZVxuICB9XG5cbiAgZ2V0OiBHZXQ8RT4gPSAoa2V5OiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gdGhpcy5fdmFyID8gdGhpcy5fdmFyW2tleV0gOiB1bmRlZmluZWRcbiAgfVxuXG4gIC8vIGMudmFyLnByb3BOYW1lIGlzIGEgcmVhZC1vbmx5XG4gIGdldCB2YXIoKTogUmVhZG9ubHk8RVsnVmFyaWFibGVzJ10gJiBDb250ZXh0VmFyaWFibGVNYXA+IHtcbiAgICByZXR1cm4geyAuLi50aGlzLl92YXIgfSBhcyBuZXZlclxuICB9XG5cbiAgbmV3UmVzcG9uc2U6IE5ld1Jlc3BvbnNlID0gKFxuICAgIGRhdGE6IERhdGEgfCBudWxsLFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXNwb25zZUluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApOiBSZXNwb25zZSA9PiB7XG4gICAgLy8gT3B0aW1pemVkXG4gICAgaWYgKHRoaXMuX2luaXQgJiYgIWhlYWRlcnMgJiYgIWFyZyAmJiB0aGlzLl9zdGF0dXMgPT09IDIwMCkge1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShkYXRhLCB7XG4gICAgICAgIGhlYWRlcnM6IHRoaXMuX3BILFxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gUmVzcG9uc2UgaW1tZWRpYXRlbHkgaWYgYXJnIGlzIFJlc3BvbnNlSW5pdC5cbiAgICBpZiAoYXJnICYmIHR5cGVvZiBhcmcgIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zdCByZXMgPSBuZXcgUmVzcG9uc2UoZGF0YSwgYXJnKVxuICAgICAgY29uc3QgY29udGVudFR5cGUgPSB0aGlzLl9wSD8uWydjb250ZW50LXR5cGUnXVxuICAgICAgaWYgKGNvbnRlbnRUeXBlKSB7XG4gICAgICAgIHJlcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgY29udGVudFR5cGUpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzID0gYXJnID8/IHRoaXMuX3N0YXR1c1xuICAgIHRoaXMuX3BIID8/PSB7fVxuXG4gICAgdGhpcy5faCA/Pz0gbmV3IEhlYWRlcnMoKVxuICAgIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuX3BIKSkge1xuICAgICAgdGhpcy5faC5zZXQoaywgdilcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcmVzKSB7XG4gICAgICB0aGlzLl9yZXMuaGVhZGVycy5mb3JFYWNoKCh2LCBrKSA9PiB7XG4gICAgICAgIHRoaXMuX2g/LnNldChrLCB2KVxuICAgICAgfSlcbiAgICAgIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuX3BIKSkge1xuICAgICAgICB0aGlzLl9oLnNldChrLCB2KVxuICAgICAgfVxuICAgIH1cblxuICAgIGhlYWRlcnMgPz89IHt9XG4gICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoaGVhZGVycykpIHtcbiAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5faC5zZXQoaywgdilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2guZGVsZXRlKGspXG4gICAgICAgIGZvciAoY29uc3QgdjIgb2Ygdikge1xuICAgICAgICAgIHRoaXMuX2guYXBwZW5kKGssIHYyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShkYXRhLCB7XG4gICAgICBzdGF0dXMsXG4gICAgICBoZWFkZXJzOiB0aGlzLl9oLFxuICAgIH0pXG4gIH1cblxuICBib2R5OiBCb2R5UmVzcG9uZCA9IChcbiAgICBkYXRhOiBEYXRhIHwgbnVsbCxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVzcG9uc2VJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogUmVzcG9uc2UgPT4ge1xuICAgIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJ1xuICAgICAgPyB0aGlzLm5ld1Jlc3BvbnNlKGRhdGEsIGFyZywgaGVhZGVycylcbiAgICAgIDogdGhpcy5uZXdSZXNwb25zZShkYXRhLCBhcmcpXG4gIH1cblxuICB0ZXh0OiBUZXh0UmVzcG9uZCA9IChcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlc3BvbnNlSW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFJlc3BvbnNlID0+IHtcbiAgICAvLyBJZiB0aGUgaGVhZGVyIGlzIGVtcHR5LCByZXR1cm4gUmVzcG9uc2UgaW1tZWRpYXRlbHkuXG4gICAgLy8gQ29udGVudC1UeXBlIHdpbGwgYmUgYWRkZWQgYXV0b21hdGljYWxseSBhcyBgdGV4dC9wbGFpbmAuXG4gICAgaWYgKCF0aGlzLl9wSCkge1xuICAgICAgaWYgKHRoaXMuX2luaXQgJiYgIWhlYWRlcnMgJiYgIWFyZykge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRleHQpXG4gICAgICB9XG4gICAgICB0aGlzLl9wSCA9IHt9XG4gICAgfVxuICAgIC8vIElmIENvbnRlbnQtVHlwZSBpcyBub3Qgc2V0LCB3ZSBkb24ndCBoYXZlIHRvIHNldCBgdGV4dC9wbGFpbmAuXG4gICAgLy8gRmV3ZXIgdGhlIGhlYWRlciB2YWx1ZXMsIGl0IHdpbGwgYmUgZmFzdGVyLlxuICAgIGlmICh0aGlzLl9wSFsnY29udGVudC10eXBlJ10pIHtcbiAgICAgIHRoaXMuX3BIWydjb250ZW50LXR5cGUnXSA9IFRFWFRfUExBSU5cbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInXG4gICAgICA/IHRoaXMubmV3UmVzcG9uc2UodGV4dCwgYXJnLCBoZWFkZXJzKVxuICAgICAgOiB0aGlzLm5ld1Jlc3BvbnNlKHRleHQsIGFyZylcbiAgfVxuXG4gIGpzb246IEpTT05SZXNwb25kID0gPFQgPSB7fT4oXG4gICAgb2JqZWN0OiBULFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXNwb25zZUluaXQsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApID0+IHtcbiAgICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkob2JqZWN0KVxuICAgIHRoaXMuX3BIID8/PSB7fVxuICAgIHRoaXMuX3BIWydjb250ZW50LXR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04J1xuICAgIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJ1xuICAgICAgPyB0aGlzLm5ld1Jlc3BvbnNlKGJvZHksIGFyZywgaGVhZGVycylcbiAgICAgIDogdGhpcy5uZXdSZXNwb25zZShib2R5LCBhcmcpXG4gIH1cblxuICBqc29uVDogSlNPTlRSZXNwb25kID0gPFQ+KFxuICAgIG9iamVjdDogSW50ZXJmYWNlVG9UeXBlPFQ+IGV4dGVuZHMgSlNPTlZhbHVlID8gVCA6IEpTT05WYWx1ZSxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVzcG9uc2VJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogVHlwZWRSZXNwb25zZTxcbiAgICBJbnRlcmZhY2VUb1R5cGU8VD4gZXh0ZW5kcyBKU09OVmFsdWVcbiAgICAgID8gSlNPTlZhbHVlIGV4dGVuZHMgSW50ZXJmYWNlVG9UeXBlPFQ+XG4gICAgICAgID8gbmV2ZXJcbiAgICAgICAgOiBUXG4gICAgICA6IG5ldmVyXG4gID4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID1cbiAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInID8gdGhpcy5qc29uKG9iamVjdCwgYXJnLCBoZWFkZXJzKSA6IHRoaXMuanNvbihvYmplY3QsIGFyZylcblxuICAgIHJldHVybiB7XG4gICAgICByZXNwb25zZSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICBkYXRhOiBvYmplY3QgYXMgYW55LFxuICAgICAgZm9ybWF0OiAnanNvbicsXG4gICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICB9XG4gIH1cblxuICBodG1sOiBIVE1MUmVzcG9uZCA9IChcbiAgICBodG1sOiBzdHJpbmcgfCBQcm9taXNlPHN0cmluZz4sXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlc3BvbnNlSW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFJlc3BvbnNlIHwgUHJvbWlzZTxSZXNwb25zZT4gPT4ge1xuICAgIHRoaXMuX3BIID8/PSB7fVxuICAgIHRoaXMuX3BIWydjb250ZW50LXR5cGUnXSA9ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9VVRGLTgnXG5cbiAgICBpZiAodHlwZW9mIGh0bWwgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoIShodG1sIGluc3RhbmNlb2YgUHJvbWlzZSkpIHtcbiAgICAgICAgaHRtbCA9IChodG1sIGFzIHN0cmluZykudG9TdHJpbmcoKSAvLyBIdG1sRXNjYXBlZFN0cmluZyBvYmplY3QgdG8gc3RyaW5nXG4gICAgICB9XG4gICAgICBpZiAoKGh0bWwgYXMgc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+KSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIChodG1sIGFzIHVua25vd24gYXMgUHJvbWlzZTxzdHJpbmc+KS50aGVuKChodG1sKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInXG4gICAgICAgICAgICA/IHRoaXMubmV3UmVzcG9uc2UoaHRtbCwgYXJnLCBoZWFkZXJzKVxuICAgICAgICAgICAgOiB0aGlzLm5ld1Jlc3BvbnNlKGh0bWwsIGFyZylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZShodG1sIGFzIHN0cmluZywgYXJnLCBoZWFkZXJzKVxuICAgICAgOiB0aGlzLm5ld1Jlc3BvbnNlKGh0bWwgYXMgc3RyaW5nLCBhcmcpXG4gIH1cblxuICByZWRpcmVjdCA9IChsb2NhdGlvbjogc3RyaW5nLCBzdGF0dXM6IFN0YXR1c0NvZGUgPSAzMDIpOiBSZXNwb25zZSA9PiB7XG4gICAgdGhpcy5faCA/Pz0gbmV3IEhlYWRlcnMoKVxuICAgIHRoaXMuX2guc2V0KCdMb2NhdGlvbicsIGxvY2F0aW9uKVxuICAgIHJldHVybiB0aGlzLm5ld1Jlc3BvbnNlKG51bGwsIHN0YXR1cylcbiAgfVxuXG4gIHN0cmVhbVRleHQgPSAoXG4gICAgY2I6IChzdHJlYW06IFN0cmVhbWluZ0FwaSkgPT4gUHJvbWlzZTx2b2lkPixcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVzcG9uc2VJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogUmVzcG9uc2UgPT4ge1xuICAgIGhlYWRlcnMgPz89IHt9XG4gICAgdGhpcy5oZWFkZXIoJ2NvbnRlbnQtdHlwZScsIFRFWFRfUExBSU4pXG4gICAgdGhpcy5oZWFkZXIoJ3gtY29udGVudC10eXBlLW9wdGlvbnMnLCAnbm9zbmlmZicpXG4gICAgdGhpcy5oZWFkZXIoJ3RyYW5zZmVyLWVuY29kaW5nJywgJ2NodW5rZWQnKVxuICAgIHJldHVybiB0aGlzLnN0cmVhbShjYiwgYXJnLCBoZWFkZXJzKVxuICB9XG5cbiAgc3RyZWFtID0gKFxuICAgIGNiOiAoc3RyZWFtOiBTdHJlYW1pbmdBcGkpID0+IFByb21pc2U8dm9pZD4sXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlc3BvbnNlSW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFJlc3BvbnNlID0+IHtcbiAgICBjb25zdCB7IHJlYWRhYmxlLCB3cml0YWJsZSB9ID0gbmV3IFRyYW5zZm9ybVN0cmVhbSgpXG4gICAgY29uc3Qgc3RyZWFtID0gbmV3IFN0cmVhbWluZ0FwaSh3cml0YWJsZSlcbiAgICBjYihzdHJlYW0pLmZpbmFsbHkoKCkgPT4gc3RyZWFtLmNsb3NlKCkpXG5cbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZShyZWFkYWJsZSwgYXJnLCBoZWFkZXJzKVxuICAgICAgOiB0aGlzLm5ld1Jlc3BvbnNlKHJlYWRhYmxlLCBhcmcpXG4gIH1cblxuICAvKiogQGRlcHJlY2F0ZWRcbiAgICogVXNlIENvb2tpZSBNaWRkbGV3YXJlIGluc3RlYWQgb2YgYGMuY29va2llKClgLiBUaGUgYGMuY29va2llKClgIHdpbGwgYmUgcmVtb3ZlZCBpbiB2NC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogaW1wb3J0IHsgc2V0Q29va2llIH0gZnJvbSAnaG9uby9jb29raWUnXG4gICAqIC8vIC4uLlxuICAgKiBhcHAuZ2V0KCcvJywgKGMpID0+IHtcbiAgICogICBzZXRDb29raWUoYywgJ2tleScsICd2YWx1ZScpXG4gICAqICAgLy8uLi5cbiAgICogfSlcbiAgICovXG4gIGNvb2tpZSA9IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG9wdD86IENvb2tpZU9wdGlvbnMpOiB2b2lkID0+IHtcbiAgICBjb25zdCBjb29raWUgPSBzZXJpYWxpemUobmFtZSwgdmFsdWUsIG9wdClcbiAgICB0aGlzLmhlYWRlcignc2V0LWNvb2tpZScsIGNvb2tpZSwgeyBhcHBlbmQ6IHRydWUgfSlcbiAgfVxuXG4gIG5vdEZvdW5kID0gKCk6IFJlc3BvbnNlIHwgUHJvbWlzZTxSZXNwb25zZT4gPT4ge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIHRoaXMubm90Rm91bmRIYW5kbGVyKHRoaXMpXG4gIH1cblxuICAvKiogQGRlcHJlY2F0ZWRcbiAgICogVXNlIGBnZXRSdW50aW1lS2V5KClgIGV4cG9ydGVkIGZyb20gYGhvbm8vYWRhcHRlcmAgaW5zdGVhZCBvZiBgYy5ydW50aW1lKClgLiBUaGUgYGMucnVudGltZSgpYCB3aWxsIGJlIHJlbW92ZWQgaW4gdjQuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIGltcG9ydCB7IGdldFJ1bnRpbWVLZXkgfSBmcm9tICdob25vL2FkYXB0ZXInXG4gICAqIC8vIC4uLlxuICAgKiBhcHAuZ2V0KCcvJywgKGMpID0+IHtcbiAgICogICBjb25zdCBrZXkgPSBnZXRSdW50aW1lS2V5KClcbiAgICogICAvLy4uLlxuICAgKiB9KVxuICAgKi9cbiAgZ2V0IHJ1bnRpbWUoKTogUnVudGltZSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBjb25zdCBnbG9iYWwgPSBnbG9iYWxUaGlzIGFzIGFueVxuXG4gICAgaWYgKGdsb2JhbD8uRGVubyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJ2Rlbm8nXG4gICAgfVxuXG4gICAgaWYgKGdsb2JhbD8uQnVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAnYnVuJ1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZ2xvYmFsPy5XZWJTb2NrZXRQYWlyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gJ3dvcmtlcmQnXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBnbG9iYWw/LkVkZ2VSdW50aW1lID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuICdlZGdlLWxpZ2h0J1xuICAgIH1cblxuICAgIGlmIChnbG9iYWw/LmZhc3RseSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJ2Zhc3RseSdcbiAgICB9XG5cbiAgICBpZiAoZ2xvYmFsPy5fX2xhZ29uX18gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICdsYWdvbidcbiAgICB9XG5cbiAgICBpZiAoZ2xvYmFsPy5wcm9jZXNzPy5yZWxlYXNlPy5uYW1lID09PSAnbm9kZScpIHtcbiAgICAgIHJldHVybiAnbm9kZSdcbiAgICB9XG5cbiAgICByZXR1cm4gJ290aGVyJ1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsU0FBUyxTQUFTLFFBQVEsb0JBQW1CO0FBRTdDLFNBQVMsWUFBWSxRQUFRLG9CQUFtQjtBQW1GaEQsTUFBTSxhQUFhO0FBRW5CLE9BQU8sTUFBTTtJQU9YLElBQTZCO0lBQzdCLE1BQXFCLENBQUMsRUFBQztJQUNmLE9BQXVCLENBQUMsRUFBQztJQUNqQyxZQUFxQixLQUFLLENBQUE7SUFDMUIsUUFBMkIsVUFBUztJQUU1QixVQUFzQixJQUFHO0lBQ3pCLE9BQXFEO0lBQ3JELEtBQTBCLFVBQVUsWUFBWTtLQUFiO0lBQ25DLE1BQTBDLFVBQVUsbUJBQW1CO0tBQXBCO0lBQ25ELEtBQTBCO0lBQzFCLFFBQVEsSUFBSSxDQUFBO0lBQ1osWUFBc0IsQ0FBQyxVQUFzQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVE7SUFDL0Usa0JBQXNDLElBQU0sSUFBSSxXQUFVO0lBRWxFLFlBQVksR0FBNkIsRUFBRSxPQUEyQixDQUFFO1FBQ3RFLElBQUksQ0FBQyxHQUFHLEdBQUc7UUFDWCxJQUFJLFNBQVM7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