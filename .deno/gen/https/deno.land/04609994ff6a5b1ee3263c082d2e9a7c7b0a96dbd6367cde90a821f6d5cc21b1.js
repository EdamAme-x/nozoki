import { compose } from './compose.ts';
import { Context } from './context.ts';
import { HTTPException } from './http-exception.ts';
import { METHOD_NAME_ALL, METHOD_NAME_ALL_LOWERCASE, METHODS } from './router.ts';
import { getPath, getPathNoStrict, getQueryStrings, mergePath } from './utils/url.ts';
function defineDynamicClass() {
    return class {
    };
}
const notFoundHandler = (c)=>{
    return c.text('404 Not Found', 404);
};
const errorHandler = (err, c)=>{
    if (err instanceof HTTPException) {
        return err.getResponse();
    }
    console.trace(err);
    const message = 'Internal Server Error';
    return c.text(message, 500);
};
class Hono extends defineDynamicClass() {
    /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */ router;
    getPath;
    _basePath = '';
    path = '*';
    routes = [];
    constructor(init = {}){
        super();
        // Implementation of app.get(...handlers[]) or app.get(path, ...handlers[])
        const allMethods = [
            ...METHODS,
            METHOD_NAME_ALL_LOWERCASE
        ];
        allMethods.map((method)=>{
            this[method] = (args1, ...args)=>{
                if (typeof args1 === 'string') {
                    this.path = args1;
                } else {
                    this.addRoute(method, this.path, args1);
                }
                args.map((handler)=>{
                    if (typeof handler !== 'string') {
                        this.addRoute(method, this.path, handler);
                    }
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return this;
            };
        });
        // Implementation of app.on(method, path, ...handlers[])
        this.on = (method, path, ...handlers)=>{
            if (!method) return this;
            this.path = path;
            for (const m of [
                method
            ].flat()){
                handlers.map((handler)=>{
                    this.addRoute(m.toUpperCase(), this.path, handler);
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return this;
        };
        // Implementation of app.use(...handlers[]) or app.get(path, ...handlers[])
        this.use = (arg1, ...handlers)=>{
            if (typeof arg1 === 'string') {
                this.path = arg1;
            } else {
                handlers.unshift(arg1);
            }
            handlers.map((handler)=>{
                this.addRoute(METHOD_NAME_ALL, this.path, handler);
            });
            return this;
        };
        const strict = init.strict ?? true;
        delete init.strict;
        Object.assign(this, init);
        this.getPath = strict ? init.getPath ?? getPath : getPathNoStrict;
    }
    clone() {
        const clone = new Hono({
            router: this.router,
            getPath: this.getPath
        });
        clone.routes = this.routes;
        return clone;
    }
    notFoundHandler = notFoundHandler;
    errorHandler = errorHandler;
    route(path, app) {
        const subApp = this.basePath(path);
        if (!app) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return subApp;
        }
        app.routes.map((r)=>{
            const handler = app.errorHandler === errorHandler ? r.handler : async (c, next)=>(await compose([
                    r.handler
                ], app.errorHandler)(c, next)).res;
            subApp.addRoute(r.method, r.path, handler);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this;
    }
    basePath(path) {
        const subApp = this.clone();
        subApp._basePath = mergePath(this._basePath, path);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return subApp;
    }
    onError(handler) {
        this.errorHandler = handler;
        return this;
    }
    notFound(handler) {
        this.notFoundHandler = handler;
        return this;
    }
    showRoutes() {
        const length = 8;
        this.routes.map((route)=>{
            console.log(`\x1b[32m${route.method}\x1b[0m ${' '.repeat(length - route.method.length)} ${route.path}`);
        });
    }
    /**
   * @experimental
   * `app.mount()` is an experimental feature.
   * The API might be changed.
   */ mount(path, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applicationHandler, optionHandler) {
        const mergedPath = mergePath(this._basePath, path);
        const pathPrefixLength = mergedPath === '/' ? 0 : mergedPath.length;
        const handler = async (c, next)=>{
            let executionContext = undefined;
            try {
                executionContext = c.executionCtx;
            } catch  {} // Do nothing
            const options = optionHandler ? optionHandler(c) : [
                c.env,
                executionContext
            ];
            const optionsArray = Array.isArray(options) ? options : [
                options
            ];
            const queryStrings = getQueryStrings(c.req.url);
            const res = await applicationHandler(new Request(new URL((c.req.path.slice(pathPrefixLength) || '/') + queryStrings, c.req.url), c.req.raw), ...optionsArray);
            if (res) return res;
            await next();
        };
        this.addRoute(METHOD_NAME_ALL, mergePath(path, '*'), handler);
        return this;
    }
    get routerName() {
        this.matchRoute('GET', '/');
        return this.router.name;
    }
    /**
   * @deprecate
   * `app.head()` is no longer used.
   * `app.get()` implicitly handles the HEAD method.
   */ head = ()=>{
        console.warn('`app.head()` is no longer used. `app.get()` implicitly handles the HEAD method.');
        return this;
    };
    addRoute(method, path, handler) {
        method = method.toUpperCase();
        if (this._basePath) {
            path = mergePath(this._basePath, path);
        }
        this.router.add(method, path, handler);
        const r = {
            path: path,
            method: method,
            handler: handler
        };
        this.routes.push(r);
    }
    matchRoute(method, path) {
        return this.router.match(method, path) || {
            handlers: [],
            params: {}
        };
    }
    handleError(err, c) {
        if (err instanceof Error) {
            return this.errorHandler(err, c);
        }
        throw err;
    }
    dispatch(request, executionCtx, env, method) {
        const path = this.getPath(request);
        // Handle HEAD method
        if (method === 'HEAD') {
            return (async ()=>new Response(null, await this.dispatch(request, executionCtx, env, 'GET')))();
        }
        const { handlers , params  } = this.matchRoute(method, path);
        const c = new Context(request, {
            env,
            executionCtx,
            notFoundHandler: this.notFoundHandler,
            path,
            params
        });
        // Do not `compose` if it has only one handler
        if (handlers.length === 1) {
            let res;
            try {
                res = handlers[0](c, async ()=>{});
                if (!res) {
                    return this.notFoundHandler(c);
                }
            } catch (err) {
                return this.handleError(err, c);
            }
            if (res instanceof Response) return res;
            if ('response' in res) {
                res = res.response;
            }
            if (res instanceof Response) return res;
            return (async ()=>{
                let awaited;
                try {
                    awaited = await res;
                    if (awaited !== undefined && 'response' in awaited) {
                        awaited = awaited['response'];
                    }
                    if (!awaited) {
                        return this.notFoundHandler(c);
                    }
                } catch (err) {
                    return this.handleError(err, c);
                }
                return awaited;
            })();
        }
        const composed = compose(handlers, this.errorHandler, this.notFoundHandler);
        return (async ()=>{
            try {
                const tmp = composed(c);
                const context = tmp instanceof Promise ? await tmp : tmp;
                if (!context.finalized) {
                    throw new Error('Context is not finalized. You may forget returning Response object or `await next()`');
                }
                return context.res;
            } catch (err) {
                return this.handleError(err, c);
            }
        })();
    }
    /**
   * @deprecate
   * `app.handleEvent()` will be removed in v4.
   * Use `app.fetch()` instead of `app.handleEvent()`.
   */ handleEvent = (event)=>{
        return this.dispatch(event.request, event, undefined, event.request.method);
    };
    fetch = (request, Env, executionCtx)=>{
        return this.dispatch(request, executionCtx, Env, request.method);
    };
    request = (input, requestInit)=>{
        if (input instanceof Request) {
            if (requestInit !== undefined) {
                input = new Request(input, requestInit);
            }
            return this.fetch(input);
        }
        input = input.toString();
        const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath('/', input)}`;
        const req = new Request(path, requestInit);
        return this.fetch(req);
    };
    fire = ()=>{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        addEventListener('fetch', (event)=>{
            event.respondWith(this.dispatch(event.request, event, undefined, event.request.method));
        });
    };
}
export { Hono as HonoBase };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvaG9uby1iYXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvbXBvc2UgfSBmcm9tICcuL2NvbXBvc2UudHMnXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHR5cGUgeyBFeGVjdXRpb25Db250ZXh0IH0gZnJvbSAnLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHsgSFRUUEV4Y2VwdGlvbiB9IGZyb20gJy4vaHR0cC1leGNlcHRpb24udHMnXG5pbXBvcnQgdHlwZSB7IFJvdXRlciB9IGZyb20gJy4vcm91dGVyLnRzJ1xuaW1wb3J0IHsgTUVUSE9EX05BTUVfQUxMLCBNRVRIT0RfTkFNRV9BTExfTE9XRVJDQVNFLCBNRVRIT0RTIH0gZnJvbSAnLi9yb3V0ZXIudHMnXG5pbXBvcnQgdHlwZSB7XG4gIEVudixcbiAgRXJyb3JIYW5kbGVyLFxuICBILFxuICBIYW5kbGVySW50ZXJmYWNlLFxuICBNaWRkbGV3YXJlSGFuZGxlcixcbiAgTWlkZGxld2FyZUhhbmRsZXJJbnRlcmZhY2UsXG4gIE5leHQsXG4gIE5vdEZvdW5kSGFuZGxlcixcbiAgT25IYW5kbGVySW50ZXJmYWNlLFxuICBUeXBlZFJlc3BvbnNlLFxuICBNZXJnZVBhdGgsXG4gIE1lcmdlU2NoZW1hUGF0aCxcbiAgRmV0Y2hFdmVudExpa2UsXG59IGZyb20gJy4vdHlwZXMudHMnXG5pbXBvcnQgdHlwZSB7IFJlbW92ZUJsYW5rUmVjb3JkIH0gZnJvbSAnLi91dGlscy90eXBlcy50cydcbmltcG9ydCB7IGdldFBhdGgsIGdldFBhdGhOb1N0cmljdCwgZ2V0UXVlcnlTdHJpbmdzLCBtZXJnZVBhdGggfSBmcm9tICcuL3V0aWxzL3VybC50cydcblxudHlwZSBNZXRob2RzID0gdHlwZW9mIE1FVEhPRFNbbnVtYmVyXSB8IHR5cGVvZiBNRVRIT0RfTkFNRV9BTExfTE9XRVJDQVNFXG5cbmludGVyZmFjZSBSb3V0ZXJSb3V0ZSB7XG4gIHBhdGg6IHN0cmluZ1xuICBtZXRob2Q6IHN0cmluZ1xuICBoYW5kbGVyOiBIXG59XG5cbmZ1bmN0aW9uIGRlZmluZUR5bmFtaWNDbGFzcygpOiB7XG4gIG5ldyA8RSBleHRlbmRzIEVudiA9IEVudiwgUyA9IHt9LCBCYXNlUGF0aCBleHRlbmRzIHN0cmluZyA9ICcvJz4oKToge1xuICAgIFtNIGluIE1ldGhvZHNdOiBIYW5kbGVySW50ZXJmYWNlPEUsIE0sIFMsIEJhc2VQYXRoPlxuICB9ICYge1xuICAgIG9uOiBPbkhhbmRsZXJJbnRlcmZhY2U8RSwgUywgQmFzZVBhdGg+XG4gIH0gJiB7XG4gICAgdXNlOiBNaWRkbGV3YXJlSGFuZGxlckludGVyZmFjZTxFLCBTLCBCYXNlUGF0aD5cbiAgfVxufSB7XG4gIHJldHVybiBjbGFzcyB7fSBhcyBuZXZlclxufVxuXG5jb25zdCBub3RGb3VuZEhhbmRsZXIgPSAoYzogQ29udGV4dCkgPT4ge1xuICByZXR1cm4gYy50ZXh0KCc0MDQgTm90IEZvdW5kJywgNDA0KVxufVxuXG5jb25zdCBlcnJvckhhbmRsZXIgPSAoZXJyOiBFcnJvciwgYzogQ29udGV4dCkgPT4ge1xuICBpZiAoZXJyIGluc3RhbmNlb2YgSFRUUEV4Y2VwdGlvbikge1xuICAgIHJldHVybiBlcnIuZ2V0UmVzcG9uc2UoKVxuICB9XG4gIGNvbnNvbGUudHJhY2UoZXJyKVxuICBjb25zdCBtZXNzYWdlID0gJ0ludGVybmFsIFNlcnZlciBFcnJvcidcbiAgcmV0dXJuIGMudGV4dChtZXNzYWdlLCA1MDApXG59XG5cbmNsYXNzIEhvbm88RSBleHRlbmRzIEVudiA9IEVudiwgUyA9IHt9LCBCYXNlUGF0aCBleHRlbmRzIHN0cmluZyA9ICcvJz4gZXh0ZW5kcyBkZWZpbmVEeW5hbWljQ2xhc3MoKTxcbiAgRSxcbiAgUyxcbiAgQmFzZVBhdGhcbj4ge1xuICAvKlxuICAgIFRoaXMgY2xhc3MgaXMgbGlrZSBhbiBhYnN0cmFjdCBjbGFzcyBhbmQgZG9lcyBub3QgaGF2ZSBhIHJvdXRlci5cbiAgICBUbyB1c2UgaXQsIGluaGVyaXQgdGhlIGNsYXNzIGFuZCBpbXBsZW1lbnQgcm91dGVyIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgKi9cbiAgcm91dGVyITogUm91dGVyPEg+XG4gIHJlYWRvbmx5IGdldFBhdGg6IChyZXF1ZXN0OiBSZXF1ZXN0KSA9PiBzdHJpbmdcbiAgcHJpdmF0ZSBfYmFzZVBhdGg6IHN0cmluZyA9ICcnXG4gIHByaXZhdGUgcGF0aDogc3RyaW5nID0gJyonXG5cbiAgcm91dGVzOiBSb3V0ZXJSb3V0ZVtdID0gW11cblxuICBjb25zdHJ1Y3Rvcihpbml0OiBQYXJ0aWFsPFBpY2s8SG9ubywgJ3JvdXRlcicgfCAnZ2V0UGF0aCc+ICYgeyBzdHJpY3Q6IGJvb2xlYW4gfT4gPSB7fSkge1xuICAgIHN1cGVyKClcblxuICAgIC8vIEltcGxlbWVudGF0aW9uIG9mIGFwcC5nZXQoLi4uaGFuZGxlcnNbXSkgb3IgYXBwLmdldChwYXRoLCAuLi5oYW5kbGVyc1tdKVxuICAgIGNvbnN0IGFsbE1ldGhvZHMgPSBbLi4uTUVUSE9EUywgTUVUSE9EX05BTUVfQUxMX0xPV0VSQ0FTRV1cbiAgICBhbGxNZXRob2RzLm1hcCgobWV0aG9kKSA9PiB7XG4gICAgICB0aGlzW21ldGhvZF0gPSAoYXJnczE6IHN0cmluZyB8IEgsIC4uLmFyZ3M6IEhbXSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGFyZ3MxID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMucGF0aCA9IGFyZ3MxXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5hZGRSb3V0ZShtZXRob2QsIHRoaXMucGF0aCwgYXJnczEpXG4gICAgICAgIH1cbiAgICAgICAgYXJncy5tYXAoKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFJvdXRlKG1ldGhvZCwgdGhpcy5wYXRoLCBoYW5kbGVyKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgcmV0dXJuIHRoaXMgYXMgYW55XG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIEltcGxlbWVudGF0aW9uIG9mIGFwcC5vbihtZXRob2QsIHBhdGgsIC4uLmhhbmRsZXJzW10pXG4gICAgdGhpcy5vbiA9IChtZXRob2Q6IHN0cmluZyB8IHN0cmluZ1tdLCBwYXRoOiBzdHJpbmcsIC4uLmhhbmRsZXJzOiBIW10pID0+IHtcbiAgICAgIGlmICghbWV0aG9kKSByZXR1cm4gdGhpc1xuICAgICAgdGhpcy5wYXRoID0gcGF0aFxuICAgICAgZm9yIChjb25zdCBtIG9mIFttZXRob2RdLmZsYXQoKSkge1xuICAgICAgICBoYW5kbGVycy5tYXAoKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICB0aGlzLmFkZFJvdXRlKG0udG9VcHBlckNhc2UoKSwgdGhpcy5wYXRoLCBoYW5kbGVyKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgIHJldHVybiB0aGlzIGFzIGFueVxuICAgIH1cblxuICAgIC8vIEltcGxlbWVudGF0aW9uIG9mIGFwcC51c2UoLi4uaGFuZGxlcnNbXSkgb3IgYXBwLmdldChwYXRoLCAuLi5oYW5kbGVyc1tdKVxuICAgIHRoaXMudXNlID0gKGFyZzE6IHN0cmluZyB8IE1pZGRsZXdhcmVIYW5kbGVyLCAuLi5oYW5kbGVyczogTWlkZGxld2FyZUhhbmRsZXJbXSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBhcmcxID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLnBhdGggPSBhcmcxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoYW5kbGVycy51bnNoaWZ0KGFyZzEpXG4gICAgICB9XG4gICAgICBoYW5kbGVycy5tYXAoKGhhbmRsZXIpID0+IHtcbiAgICAgICAgdGhpcy5hZGRSb3V0ZShNRVRIT0RfTkFNRV9BTEwsIHRoaXMucGF0aCwgaGFuZGxlcilcbiAgICAgIH0pXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIGNvbnN0IHN0cmljdCA9IGluaXQuc3RyaWN0ID8/IHRydWVcbiAgICBkZWxldGUgaW5pdC5zdHJpY3RcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIGluaXQpXG4gICAgdGhpcy5nZXRQYXRoID0gc3RyaWN0ID8gaW5pdC5nZXRQYXRoID8/IGdldFBhdGggOiBnZXRQYXRoTm9TdHJpY3RcbiAgfVxuXG4gIHByaXZhdGUgY2xvbmUoKTogSG9ubzxFLCBTLCBCYXNlUGF0aD4ge1xuICAgIGNvbnN0IGNsb25lID0gbmV3IEhvbm88RSwgUywgQmFzZVBhdGg+KHtcbiAgICAgIHJvdXRlcjogdGhpcy5yb3V0ZXIsXG4gICAgICBnZXRQYXRoOiB0aGlzLmdldFBhdGgsXG4gICAgfSlcbiAgICBjbG9uZS5yb3V0ZXMgPSB0aGlzLnJvdXRlc1xuICAgIHJldHVybiBjbG9uZVxuICB9XG5cbiAgcHJpdmF0ZSBub3RGb3VuZEhhbmRsZXI6IE5vdEZvdW5kSGFuZGxlciA9IG5vdEZvdW5kSGFuZGxlclxuICBwcml2YXRlIGVycm9ySGFuZGxlcjogRXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyXG5cbiAgcm91dGU8U3ViUGF0aCBleHRlbmRzIHN0cmluZywgU3ViRW52IGV4dGVuZHMgRW52LCBTdWJTY2hlbWEsIFN1YkJhc2VQYXRoIGV4dGVuZHMgc3RyaW5nPihcbiAgICBwYXRoOiBTdWJQYXRoLFxuICAgIGFwcDogSG9ubzxTdWJFbnYsIFN1YlNjaGVtYSwgU3ViQmFzZVBhdGg+XG4gICk6IEhvbm88RSwgUmVtb3ZlQmxhbmtSZWNvcmQ8TWVyZ2VTY2hlbWFQYXRoPFN1YlNjaGVtYSwgU3ViUGF0aD4gfCBTPiwgQmFzZVBhdGg+XG4gIC8qKiBAZGVzY3JpcHRpb25cbiAgICogVXNlIGBiYXNlUGF0aGAgaW5zdGVhZCBvZiBgcm91dGVgIHdoZW4gcGFzc2luZyAqKm9uZSoqIGFyZ3VtZW50LCBzdWNoIGFzIGBhcHAucm91dGUoJy9hcGknKWAuXG4gICAqIFRoZSB1c2Ugb2YgYHJvdXRlYCB3aXRoICoqb25lKiogYXJndW1lbnQgaGFzIGJlZW4gcmVtb3ZlZCBpbiB2NC5cbiAgICogSG93ZXZlciwgeW91IGNhbiBzdGlsbCB1c2UgYHJvdXRlYCB3aXRoICoqdHdvKiogYXJndW1lbnRzLCBsaWtlIGBhcHAucm91dGUoJy9hcGknLCBzdWJBcHApYC5cIlxuICAgKi9cbiAgcm91dGU8U3ViUGF0aCBleHRlbmRzIHN0cmluZz4ocGF0aDogU3ViUGF0aCk6IEhvbm88RSwgUmVtb3ZlQmxhbmtSZWNvcmQ8Uz4sIEJhc2VQYXRoPlxuICByb3V0ZTxTdWJQYXRoIGV4dGVuZHMgc3RyaW5nLCBTdWJFbnYgZXh0ZW5kcyBFbnYsIFN1YlNjaGVtYSwgU3ViQmFzZVBhdGggZXh0ZW5kcyBzdHJpbmc+KFxuICAgIHBhdGg6IFN1YlBhdGgsXG4gICAgYXBwPzogSG9ubzxTdWJFbnYsIFN1YlNjaGVtYSwgU3ViQmFzZVBhdGg+XG4gICk6IEhvbm88RSwgUmVtb3ZlQmxhbmtSZWNvcmQ8TWVyZ2VTY2hlbWFQYXRoPFN1YlNjaGVtYSwgU3ViUGF0aD4gfCBTPiwgQmFzZVBhdGg+IHtcbiAgICBjb25zdCBzdWJBcHAgPSB0aGlzLmJhc2VQYXRoKHBhdGgpXG5cbiAgICBpZiAoIWFwcCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgIHJldHVybiBzdWJBcHAgYXMgYW55XG4gICAgfVxuXG4gICAgYXBwLnJvdXRlcy5tYXAoKHIpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPVxuICAgICAgICBhcHAuZXJyb3JIYW5kbGVyID09PSBlcnJvckhhbmRsZXJcbiAgICAgICAgICA/IHIuaGFuZGxlclxuICAgICAgICAgIDogYXN5bmMgKGM6IENvbnRleHQsIG5leHQ6IE5leHQpID0+XG4gICAgICAgICAgICAgIChhd2FpdCBjb21wb3NlPENvbnRleHQ+KFtyLmhhbmRsZXJdLCBhcHAuZXJyb3JIYW5kbGVyKShjLCBuZXh0KSkucmVzXG4gICAgICBzdWJBcHAuYWRkUm91dGUoci5tZXRob2QsIHIucGF0aCwgaGFuZGxlcilcbiAgICB9KVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgcmV0dXJuIHRoaXMgYXMgYW55XG4gIH1cblxuICBiYXNlUGF0aDxTdWJQYXRoIGV4dGVuZHMgc3RyaW5nPihwYXRoOiBTdWJQYXRoKTogSG9ubzxFLCBTLCBNZXJnZVBhdGg8QmFzZVBhdGgsIFN1YlBhdGg+PiB7XG4gICAgY29uc3Qgc3ViQXBwID0gdGhpcy5jbG9uZSgpXG4gICAgc3ViQXBwLl9iYXNlUGF0aCA9IG1lcmdlUGF0aCh0aGlzLl9iYXNlUGF0aCwgcGF0aClcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIHJldHVybiBzdWJBcHAgYXMgYW55XG4gIH1cblxuICBvbkVycm9yKGhhbmRsZXI6IEVycm9ySGFuZGxlcjxFPikge1xuICAgIHRoaXMuZXJyb3JIYW5kbGVyID0gaGFuZGxlclxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBub3RGb3VuZChoYW5kbGVyOiBOb3RGb3VuZEhhbmRsZXI8RT4pIHtcbiAgICB0aGlzLm5vdEZvdW5kSGFuZGxlciA9IGhhbmRsZXJcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2hvd1JvdXRlcygpIHtcbiAgICBjb25zdCBsZW5ndGggPSA4XG4gICAgdGhpcy5yb3V0ZXMubWFwKChyb3V0ZSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGBcXHgxYlszMm0ke3JvdXRlLm1ldGhvZH1cXHgxYlswbSAkeycgJy5yZXBlYXQobGVuZ3RoIC0gcm91dGUubWV0aG9kLmxlbmd0aCl9ICR7cm91dGUucGF0aH1gXG4gICAgICApXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAZXhwZXJpbWVudGFsXG4gICAqIGBhcHAubW91bnQoKWAgaXMgYW4gZXhwZXJpbWVudGFsIGZlYXR1cmUuXG4gICAqIFRoZSBBUEkgbWlnaHQgYmUgY2hhbmdlZC5cbiAgICovXG4gIG1vdW50KFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGFwcGxpY2F0aW9uSGFuZGxlcjogKHJlcXVlc3Q6IFJlcXVlc3QsIC4uLmFyZ3M6IGFueSkgPT4gUmVzcG9uc2UgfCBQcm9taXNlPFJlc3BvbnNlPixcbiAgICBvcHRpb25IYW5kbGVyPzogKGM6IENvbnRleHQpID0+IHVua25vd25cbiAgKTogSG9ubzxFLCBTLCBCYXNlUGF0aD4ge1xuICAgIGNvbnN0IG1lcmdlZFBhdGggPSBtZXJnZVBhdGgodGhpcy5fYmFzZVBhdGgsIHBhdGgpXG4gICAgY29uc3QgcGF0aFByZWZpeExlbmd0aCA9IG1lcmdlZFBhdGggPT09ICcvJyA/IDAgOiBtZXJnZWRQYXRoLmxlbmd0aFxuXG4gICAgY29uc3QgaGFuZGxlcjogTWlkZGxld2FyZUhhbmRsZXIgPSBhc3luYyAoYywgbmV4dCkgPT4ge1xuICAgICAgbGV0IGV4ZWN1dGlvbkNvbnRleHQ6IEV4ZWN1dGlvbkNvbnRleHQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcbiAgICAgIHRyeSB7XG4gICAgICAgIGV4ZWN1dGlvbkNvbnRleHQgPSBjLmV4ZWN1dGlvbkN0eFxuICAgICAgfSBjYXRjaCB7fSAvLyBEbyBub3RoaW5nXG4gICAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uSGFuZGxlciA/IG9wdGlvbkhhbmRsZXIoYykgOiBbYy5lbnYsIGV4ZWN1dGlvbkNvbnRleHRdXG4gICAgICBjb25zdCBvcHRpb25zQXJyYXkgPSBBcnJheS5pc0FycmF5KG9wdGlvbnMpID8gb3B0aW9ucyA6IFtvcHRpb25zXVxuXG4gICAgICBjb25zdCBxdWVyeVN0cmluZ3MgPSBnZXRRdWVyeVN0cmluZ3MoYy5yZXEudXJsKVxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgYXBwbGljYXRpb25IYW5kbGVyKFxuICAgICAgICBuZXcgUmVxdWVzdChcbiAgICAgICAgICBuZXcgVVJMKChjLnJlcS5wYXRoLnNsaWNlKHBhdGhQcmVmaXhMZW5ndGgpIHx8ICcvJykgKyBxdWVyeVN0cmluZ3MsIGMucmVxLnVybCksXG4gICAgICAgICAgYy5yZXEucmF3XG4gICAgICAgICksXG4gICAgICAgIC4uLm9wdGlvbnNBcnJheVxuICAgICAgKVxuXG4gICAgICBpZiAocmVzKSByZXR1cm4gcmVzXG5cbiAgICAgIGF3YWl0IG5leHQoKVxuICAgIH1cbiAgICB0aGlzLmFkZFJvdXRlKE1FVEhPRF9OQU1FX0FMTCwgbWVyZ2VQYXRoKHBhdGgsICcqJyksIGhhbmRsZXIpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGdldCByb3V0ZXJOYW1lKCkge1xuICAgIHRoaXMubWF0Y2hSb3V0ZSgnR0VUJywgJy8nKVxuICAgIHJldHVybiB0aGlzLnJvdXRlci5uYW1lXG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZVxuICAgKiBgYXBwLmhlYWQoKWAgaXMgbm8gbG9uZ2VyIHVzZWQuXG4gICAqIGBhcHAuZ2V0KClgIGltcGxpY2l0bHkgaGFuZGxlcyB0aGUgSEVBRCBtZXRob2QuXG4gICAqL1xuICBoZWFkID0gKCkgPT4ge1xuICAgIGNvbnNvbGUud2FybignYGFwcC5oZWFkKClgIGlzIG5vIGxvbmdlciB1c2VkLiBgYXBwLmdldCgpYCBpbXBsaWNpdGx5IGhhbmRsZXMgdGhlIEhFQUQgbWV0aG9kLicpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHByaXZhdGUgYWRkUm91dGUobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgaGFuZGxlcjogSCkge1xuICAgIG1ldGhvZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgaWYgKHRoaXMuX2Jhc2VQYXRoKSB7XG4gICAgICBwYXRoID0gbWVyZ2VQYXRoKHRoaXMuX2Jhc2VQYXRoLCBwYXRoKVxuICAgIH1cbiAgICB0aGlzLnJvdXRlci5hZGQobWV0aG9kLCBwYXRoLCBoYW5kbGVyKVxuICAgIGNvbnN0IHI6IFJvdXRlclJvdXRlID0geyBwYXRoOiBwYXRoLCBtZXRob2Q6IG1ldGhvZCwgaGFuZGxlcjogaGFuZGxlciB9XG4gICAgdGhpcy5yb3V0ZXMucHVzaChyKVxuICB9XG5cbiAgcHJpdmF0ZSBtYXRjaFJvdXRlKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5yb3V0ZXIubWF0Y2gobWV0aG9kLCBwYXRoKSB8fCB7IGhhbmRsZXJzOiBbXSwgcGFyYW1zOiB7fSB9XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZUVycm9yKGVycjogdW5rbm93biwgYzogQ29udGV4dDxFPikge1xuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgcmV0dXJuIHRoaXMuZXJyb3JIYW5kbGVyKGVyciwgYylcbiAgICB9XG4gICAgdGhyb3cgZXJyXG4gIH1cblxuICBwcml2YXRlIGRpc3BhdGNoKFxuICAgIHJlcXVlc3Q6IFJlcXVlc3QsXG4gICAgZXhlY3V0aW9uQ3R4OiBFeGVjdXRpb25Db250ZXh0IHwgRmV0Y2hFdmVudExpa2UgfCB1bmRlZmluZWQsXG4gICAgZW52OiBFWydCaW5kaW5ncyddLFxuICAgIG1ldGhvZDogc3RyaW5nXG4gICk6IFJlc3BvbnNlIHwgUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgocmVxdWVzdClcblxuICAgIC8vIEhhbmRsZSBIRUFEIG1ldGhvZFxuICAgIGlmIChtZXRob2QgPT09ICdIRUFEJykge1xuICAgICAgcmV0dXJuIChhc3luYyAoKSA9PlxuICAgICAgICBuZXcgUmVzcG9uc2UobnVsbCwgYXdhaXQgdGhpcy5kaXNwYXRjaChyZXF1ZXN0LCBleGVjdXRpb25DdHgsIGVudiwgJ0dFVCcpKSkoKVxuICAgIH1cblxuICAgIGNvbnN0IHsgaGFuZGxlcnMsIHBhcmFtcyB9ID0gdGhpcy5tYXRjaFJvdXRlKG1ldGhvZCwgcGF0aClcblxuICAgIGNvbnN0IGMgPSBuZXcgQ29udGV4dChyZXF1ZXN0LCB7XG4gICAgICBlbnYsXG4gICAgICBleGVjdXRpb25DdHgsXG4gICAgICBub3RGb3VuZEhhbmRsZXI6IHRoaXMubm90Rm91bmRIYW5kbGVyLFxuICAgICAgcGF0aCxcbiAgICAgIHBhcmFtcyxcbiAgICB9KVxuXG4gICAgLy8gRG8gbm90IGBjb21wb3NlYCBpZiBpdCBoYXMgb25seSBvbmUgaGFuZGxlclxuICAgIGlmIChoYW5kbGVycy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxldCByZXM6IFJldHVyblR5cGU8SD5cblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzID0gaGFuZGxlcnNbMF0oYywgYXN5bmMgKCkgPT4ge30pXG4gICAgICAgIGlmICghcmVzKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubm90Rm91bmRIYW5kbGVyKGMpXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVFcnJvcihlcnIsIGMpXG4gICAgICB9XG5cbiAgICAgIGlmIChyZXMgaW5zdGFuY2VvZiBSZXNwb25zZSkgcmV0dXJuIHJlc1xuXG4gICAgICBpZiAoJ3Jlc3BvbnNlJyBpbiByZXMpIHtcbiAgICAgICAgcmVzID0gcmVzLnJlc3BvbnNlXG4gICAgICB9XG5cbiAgICAgIGlmIChyZXMgaW5zdGFuY2VvZiBSZXNwb25zZSkgcmV0dXJuIHJlc1xuXG4gICAgICByZXR1cm4gKGFzeW5jICgpID0+IHtcbiAgICAgICAgbGV0IGF3YWl0ZWQ6IFJlc3BvbnNlIHwgVHlwZWRSZXNwb25zZSB8IHZvaWRcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdGVkID0gYXdhaXQgcmVzXG4gICAgICAgICAgaWYgKGF3YWl0ZWQgIT09IHVuZGVmaW5lZCAmJiAncmVzcG9uc2UnIGluIGF3YWl0ZWQpIHtcbiAgICAgICAgICAgIGF3YWl0ZWQgPSBhd2FpdGVkWydyZXNwb25zZSddIGFzIFJlc3BvbnNlXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghYXdhaXRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm90Rm91bmRIYW5kbGVyKGMpXG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVFcnJvcihlcnIsIGMpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF3YWl0ZWRcbiAgICAgIH0pKClcbiAgICB9XG5cbiAgICBjb25zdCBjb21wb3NlZCA9IGNvbXBvc2U8Q29udGV4dD4oaGFuZGxlcnMsIHRoaXMuZXJyb3JIYW5kbGVyLCB0aGlzLm5vdEZvdW5kSGFuZGxlcilcblxuICAgIHJldHVybiAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdG1wID0gY29tcG9zZWQoYylcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHRtcCBpbnN0YW5jZW9mIFByb21pc2UgPyBhd2FpdCB0bXAgOiB0bXBcbiAgICAgICAgaWYgKCFjb250ZXh0LmZpbmFsaXplZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdDb250ZXh0IGlzIG5vdCBmaW5hbGl6ZWQuIFlvdSBtYXkgZm9yZ2V0IHJldHVybmluZyBSZXNwb25zZSBvYmplY3Qgb3IgYGF3YWl0IG5leHQoKWAnXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZXh0LnJlc1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUVycm9yKGVyciwgYylcbiAgICAgIH1cbiAgICB9KSgpXG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZVxuICAgKiBgYXBwLmhhbmRsZUV2ZW50KClgIHdpbGwgYmUgcmVtb3ZlZCBpbiB2NC5cbiAgICogVXNlIGBhcHAuZmV0Y2goKWAgaW5zdGVhZCBvZiBgYXBwLmhhbmRsZUV2ZW50KClgLlxuICAgKi9cbiAgaGFuZGxlRXZlbnQgPSAoZXZlbnQ6IEZldGNoRXZlbnRMaWtlKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goZXZlbnQucmVxdWVzdCwgZXZlbnQsIHVuZGVmaW5lZCwgZXZlbnQucmVxdWVzdC5tZXRob2QpXG4gIH1cblxuICBmZXRjaCA9IChyZXF1ZXN0OiBSZXF1ZXN0LCBFbnY/OiBFWydCaW5kaW5ncyddIHwge30sIGV4ZWN1dGlvbkN0eD86IEV4ZWN1dGlvbkNvbnRleHQpID0+IHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChyZXF1ZXN0LCBleGVjdXRpb25DdHgsIEVudiwgcmVxdWVzdC5tZXRob2QpXG4gIH1cblxuICByZXF1ZXN0ID0gKGlucHV0OiBSZXF1ZXN0IHwgc3RyaW5nIHwgVVJMLCByZXF1ZXN0SW5pdD86IFJlcXVlc3RJbml0KSA9PiB7XG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgaWYgKHJlcXVlc3RJbml0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaW5wdXQgPSBuZXcgUmVxdWVzdChpbnB1dCwgcmVxdWVzdEluaXQpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5mZXRjaChpbnB1dClcbiAgICB9XG4gICAgaW5wdXQgPSBpbnB1dC50b1N0cmluZygpXG4gICAgY29uc3QgcGF0aCA9IC9eaHR0cHM/OlxcL1xcLy8udGVzdChpbnB1dCkgPyBpbnB1dCA6IGBodHRwOi8vbG9jYWxob3N0JHttZXJnZVBhdGgoJy8nLCBpbnB1dCl9YFxuICAgIGNvbnN0IHJlcSA9IG5ldyBSZXF1ZXN0KHBhdGgsIHJlcXVlc3RJbml0KVxuICAgIHJldHVybiB0aGlzLmZldGNoKHJlcSlcbiAgfVxuXG4gIGZpcmUgPSAoKSA9PiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBhZGRFdmVudExpc3RlbmVyKCdmZXRjaCcsIChldmVudDogRmV0Y2hFdmVudExpa2UpOiB2b2lkID0+IHtcbiAgICAgIGV2ZW50LnJlc3BvbmRXaXRoKHRoaXMuZGlzcGF0Y2goZXZlbnQucmVxdWVzdCwgZXZlbnQsIHVuZGVmaW5lZCwgZXZlbnQucmVxdWVzdC5tZXRob2QpKVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IHsgSG9ubyBhcyBIb25vQmFzZSB9XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxPQUFPLFFBQVEsZUFBYztBQUN0QyxTQUFTLE9BQU8sUUFBUSxlQUFjO0FBRXRDLFNBQVMsYUFBYSxRQUFRLHNCQUFxQjtBQUVuRCxTQUFTLGVBQWUsRUFBRSx5QkFBeUIsRUFBRSxPQUFPLFFBQVEsY0FBYTtBQWlCakYsU0FBUyxPQUFPLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxTQUFTLFFBQVEsaUJBQWdCO0FBVXJGLFNBQVMscUJBUVA7SUFDQSxPQUFPO0lBQU87QUFDaEI7QUFFQSxNQUFNLGtCQUFrQixDQUFDLElBQWU7SUFDdEMsT0FBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUI7QUFDakM7QUFFQSxNQUFNLGVBQWUsQ0FBQyxLQUFZLElBQWU7SUFDL0MsSUFBSSxlQUFlLGVBQWU7UUFDaEMsT0FBTyxJQUFJLFdBQVc7SUFDeEIsQ0FBQztJQUNELFFBQVEsS0FBSyxDQUFDO0lBQ2QsTUFBTSxVQUFVO0lBQ2hCLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUztBQUN6QjtBQUVBLE1BQU0sYUFBeUU7SUFLN0U7OztFQUdBLEdBQ0EsT0FBa0I7SUFDVCxRQUFxQztJQUN0QyxZQUFvQixHQUFFO0lBQ3RCLE9BQWUsSUFBRztJQUUxQixT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