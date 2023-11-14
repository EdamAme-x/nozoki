import { replaceUrlParam, mergePath, removeIndexString, deepMerge } from './utils.ts';
const createProxy = (callback, path)=>{
    const proxy = new Proxy(()=>{}, {
        get (_obj, key) {
            if (typeof key !== 'string') return undefined;
            return createProxy(callback, [
                ...path,
                key
            ]);
        },
        apply (_1, _2, args) {
            return callback({
                path,
                args
            });
        }
    });
    return proxy;
};
class ClientRequestImpl {
    url;
    method;
    queryParams = undefined;
    pathParams = {};
    rBody;
    cType = undefined;
    constructor(url, method){
        this.url = url;
        this.method = method;
    }
    fetch = (args, opt)=>{
        if (args) {
            if (args.query) {
                for (const [k, v] of Object.entries(args.query)){
                    this.queryParams ||= new URLSearchParams();
                    if (Array.isArray(v)) {
                        for (const v2 of v){
                            this.queryParams.append(k, v2);
                        }
                    } else {
                        this.queryParams.set(k, v);
                    }
                }
            }
            if (args.queries) {
                for (const [k, v] of Object.entries(args.queries)){
                    for (const v2 of v){
                        this.queryParams ||= new URLSearchParams();
                        this.queryParams.append(k, v2);
                    }
                }
            }
            if (args.form) {
                const form = new FormData();
                for (const [k, v] of Object.entries(args.form)){
                    form.append(k, v);
                }
                this.rBody = form;
            }
            if (args.json) {
                this.rBody = JSON.stringify(args.json);
                this.cType = 'application/json';
            }
            if (args.param) {
                this.pathParams = args.param;
            }
        }
        let methodUpperCase = this.method.toUpperCase();
        let setBody = !(methodUpperCase === 'GET' || methodUpperCase === 'HEAD');
        const headerValues = opt?.headers ? opt.headers : {};
        if (this.cType) headerValues['Content-Type'] = this.cType;
        const headers = new Headers(headerValues ?? undefined);
        let url = this.url;
        url = removeIndexString(url);
        url = replaceUrlParam(url, this.pathParams);
        if (this.queryParams) {
            url = url + '?' + this.queryParams.toString();
        }
        methodUpperCase = this.method.toUpperCase();
        setBody = !(methodUpperCase === 'GET' || methodUpperCase === 'HEAD');
        // Pass URL string to 1st arg for testing with MSW and node-fetch
        return (opt?.fetch || fetch)(url, {
            body: setBody ? this.rBody : undefined,
            method: methodUpperCase,
            headers: headers
        });
    };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hc = (baseUrl, options)=>createProxy(async (opts)=>{
        const parts = [
            ...opts.path
        ];
        let method = '';
        if (/^\$/.test(parts[parts.length - 1])) {
            const last = parts.pop();
            if (last) {
                method = last.replace(/^\$/, '');
            }
        }
        const path = parts.join('/');
        const url = mergePath(baseUrl, path);
        const req = new ClientRequestImpl(url, method);
        if (method) {
            options ??= {};
            const args = deepMerge(options, {
                ...opts.args[1] ?? {}
            });
            return req.fetch(opts.args[0], args);
        }
        return req;
    }, []);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvY2xpZW50L2NsaWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEhvbm8gfSBmcm9tICcuLi9ob25vLnRzJ1xuaW1wb3J0IHR5cGUgeyBWYWxpZGF0aW9uVGFyZ2V0cyB9IGZyb20gJy4uL3R5cGVzLnRzJ1xuaW1wb3J0IHR5cGUgeyBVbmlvblRvSW50ZXJzZWN0aW9uIH0gZnJvbSAnLi4vdXRpbHMvdHlwZXMudHMnXG5pbXBvcnQgdHlwZSB7IENhbGxiYWNrLCBDbGllbnQsIENsaWVudFJlcXVlc3RPcHRpb25zIH0gZnJvbSAnLi90eXBlcy50cydcbmltcG9ydCB7IHJlcGxhY2VVcmxQYXJhbSwgbWVyZ2VQYXRoLCByZW1vdmVJbmRleFN0cmluZywgZGVlcE1lcmdlIH0gZnJvbSAnLi91dGlscy50cydcblxuY29uc3QgY3JlYXRlUHJveHkgPSAoY2FsbGJhY2s6IENhbGxiYWNrLCBwYXRoOiBzdHJpbmdbXSkgPT4ge1xuICBjb25zdCBwcm94eTogdW5rbm93biA9IG5ldyBQcm94eSgoKSA9PiB7fSwge1xuICAgIGdldChfb2JqLCBrZXkpIHtcbiAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgcmV0dXJuIGNyZWF0ZVByb3h5KGNhbGxiYWNrLCBbLi4ucGF0aCwga2V5XSlcbiAgICB9LFxuICAgIGFwcGx5KF8xLCBfMiwgYXJncykge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgICAgcGF0aCxcbiAgICAgICAgYXJncyxcbiAgICAgIH0pXG4gICAgfSxcbiAgfSlcbiAgcmV0dXJuIHByb3h5XG59XG5cbmNsYXNzIENsaWVudFJlcXVlc3RJbXBsIHtcbiAgcHJpdmF0ZSB1cmw6IHN0cmluZ1xuICBwcml2YXRlIG1ldGhvZDogc3RyaW5nXG4gIHByaXZhdGUgcXVlcnlQYXJhbXM6IFVSTFNlYXJjaFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZFxuICBwcml2YXRlIHBhdGhQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fVxuICBwcml2YXRlIHJCb2R5OiBCb2R5SW5pdCB8IHVuZGVmaW5lZFxuICBwcml2YXRlIGNUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZywgbWV0aG9kOiBzdHJpbmcpIHtcbiAgICB0aGlzLnVybCA9IHVybFxuICAgIHRoaXMubWV0aG9kID0gbWV0aG9kXG4gIH1cbiAgZmV0Y2ggPSAoXG4gICAgYXJncz86IFZhbGlkYXRpb25UYXJnZXRzICYge1xuICAgICAgcGFyYW0/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG4gICAgfSxcbiAgICBvcHQ/OiBDbGllbnRSZXF1ZXN0T3B0aW9uc1xuICApID0+IHtcbiAgICBpZiAoYXJncykge1xuICAgICAgaWYgKGFyZ3MucXVlcnkpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoYXJncy5xdWVyeSkpIHtcbiAgICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1zIHx8PSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2KSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB2MiBvZiB2KSB7XG4gICAgICAgICAgICAgIHRoaXMucXVlcnlQYXJhbXMuYXBwZW5kKGssIHYyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5UGFyYW1zLnNldChrLCB2KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoYXJncy5xdWVyaWVzKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKGFyZ3MucXVlcmllcykpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IHYyIG9mIHYpIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlQYXJhbXMgfHw9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxuICAgICAgICAgICAgdGhpcy5xdWVyeVBhcmFtcy5hcHBlbmQoaywgdjIpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLmZvcm0pIHtcbiAgICAgICAgY29uc3QgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgICAgIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKGFyZ3MuZm9ybSkpIHtcbiAgICAgICAgICBmb3JtLmFwcGVuZChrLCB2KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuckJvZHkgPSBmb3JtXG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLmpzb24pIHtcbiAgICAgICAgdGhpcy5yQm9keSA9IEpTT04uc3RyaW5naWZ5KGFyZ3MuanNvbilcbiAgICAgICAgdGhpcy5jVHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgfVxuXG4gICAgICBpZiAoYXJncy5wYXJhbSkge1xuICAgICAgICB0aGlzLnBhdGhQYXJhbXMgPSBhcmdzLnBhcmFtXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IG1ldGhvZFVwcGVyQ2FzZSA9IHRoaXMubWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICBsZXQgc2V0Qm9keSA9ICEobWV0aG9kVXBwZXJDYXNlID09PSAnR0VUJyB8fCBtZXRob2RVcHBlckNhc2UgPT09ICdIRUFEJylcblxuICAgIGNvbnN0IGhlYWRlclZhbHVlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IG9wdD8uaGVhZGVycyA/IG9wdC5oZWFkZXJzIDoge31cbiAgICBpZiAodGhpcy5jVHlwZSkgaGVhZGVyVmFsdWVzWydDb250ZW50LVR5cGUnXSA9IHRoaXMuY1R5cGVcblxuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyhoZWFkZXJWYWx1ZXMgPz8gdW5kZWZpbmVkKVxuICAgIGxldCB1cmwgPSB0aGlzLnVybFxuXG4gICAgdXJsID0gcmVtb3ZlSW5kZXhTdHJpbmcodXJsKVxuICAgIHVybCA9IHJlcGxhY2VVcmxQYXJhbSh1cmwsIHRoaXMucGF0aFBhcmFtcylcblxuICAgIGlmICh0aGlzLnF1ZXJ5UGFyYW1zKSB7XG4gICAgICB1cmwgPSB1cmwgKyAnPycgKyB0aGlzLnF1ZXJ5UGFyYW1zLnRvU3RyaW5nKClcbiAgICB9XG4gICAgbWV0aG9kVXBwZXJDYXNlID0gdGhpcy5tZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHNldEJvZHkgPSAhKG1ldGhvZFVwcGVyQ2FzZSA9PT0gJ0dFVCcgfHwgbWV0aG9kVXBwZXJDYXNlID09PSAnSEVBRCcpXG5cbiAgICAvLyBQYXNzIFVSTCBzdHJpbmcgdG8gMXN0IGFyZyBmb3IgdGVzdGluZyB3aXRoIE1TVyBhbmQgbm9kZS1mZXRjaFxuICAgIHJldHVybiAob3B0Py5mZXRjaCB8fCBmZXRjaCkodXJsLCB7XG4gICAgICBib2R5OiBzZXRCb2R5ID8gdGhpcy5yQm9keSA6IHVuZGVmaW5lZCxcbiAgICAgIG1ldGhvZDogbWV0aG9kVXBwZXJDYXNlLFxuICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICB9KVxuICB9XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG5leHBvcnQgY29uc3QgaGMgPSA8VCBleHRlbmRzIEhvbm88YW55LCBhbnksIGFueT4+KGJhc2VVcmw6IHN0cmluZywgb3B0aW9ucz86IENsaWVudFJlcXVlc3RPcHRpb25zKSA9PlxuICBjcmVhdGVQcm94eShhc3luYyAob3B0cykgPT4ge1xuICAgIGNvbnN0IHBhcnRzID0gWy4uLm9wdHMucGF0aF1cblxuICAgIGxldCBtZXRob2QgPSAnJ1xuICAgIGlmICgvXlxcJC8udGVzdChwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSkpIHtcbiAgICAgIGNvbnN0IGxhc3QgPSBwYXJ0cy5wb3AoKVxuICAgICAgaWYgKGxhc3QpIHtcbiAgICAgICAgbWV0aG9kID0gbGFzdC5yZXBsYWNlKC9eXFwkLywgJycpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcGF0aCA9IHBhcnRzLmpvaW4oJy8nKVxuICAgIGNvbnN0IHVybCA9IG1lcmdlUGF0aChiYXNlVXJsLCBwYXRoKVxuICAgIGNvbnN0IHJlcSA9IG5ldyBDbGllbnRSZXF1ZXN0SW1wbCh1cmwsIG1ldGhvZClcbiAgICBpZiAobWV0aG9kKSB7XG4gICAgICBvcHRpb25zID8/PSB7fVxuICAgICAgY29uc3QgYXJncyA9IGRlZXBNZXJnZTxDbGllbnRSZXF1ZXN0T3B0aW9ucz4ob3B0aW9ucywgeyAuLi4ob3B0cy5hcmdzWzFdID8/IHt9KSB9KVxuICAgICAgcmV0dXJuIHJlcS5mZXRjaChvcHRzLmFyZ3NbMF0sIGFyZ3MpXG4gICAgfVxuICAgIHJldHVybiByZXFcbiAgfSwgW10pIGFzIFVuaW9uVG9JbnRlcnNlY3Rpb248Q2xpZW50PFQ+PlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLFNBQVMsZUFBZSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLFFBQVEsYUFBWTtBQUVyRixNQUFNLGNBQWMsQ0FBQyxVQUFvQixPQUFtQjtJQUMxRCxNQUFNLFFBQWlCLElBQUksTUFBTSxJQUFNLENBQUMsR0FBRztRQUN6QyxLQUFJLElBQUksRUFBRSxHQUFHLEVBQUU7WUFDYixJQUFJLE9BQU8sUUFBUSxVQUFVLE9BQU87WUFDcEMsT0FBTyxZQUFZLFVBQVU7bUJBQUk7Z0JBQU07YUFBSTtRQUM3QztRQUNBLE9BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUU7WUFDbEIsT0FBTyxTQUFTO2dCQUNkO2dCQUNBO1lBQ0Y7UUFDRjtJQUNGO0lBQ0EsT0FBTztBQUNUO0FBRUEsTUFBTTtJQUNJLElBQVc7SUFDWCxPQUFjO0lBQ2QsY0FBMkMsVUFBUztJQUNwRCxhQUFxQyxDQUFDLEVBQUM7SUFDdkMsTUFBMkI7SUFDM0IsUUFBNEIsVUFBUztJQUU3QyxZQUFZLEdB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