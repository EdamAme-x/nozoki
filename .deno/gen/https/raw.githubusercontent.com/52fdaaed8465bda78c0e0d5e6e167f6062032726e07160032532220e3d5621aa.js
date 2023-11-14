import { http } from "./deps.ts";
import { Request } from "./src/Request.ts";
import { Response } from "./src/Response.ts";
import { simplePathMatcher } from "./src/simplePathMatcher.ts";
import { isPathHandler } from "./src/functions/isPathHandler.ts";
export class App {
    middlewares = [];
    use(m) {
        this.middlewares.push(m);
    }
    async listen(port, host = "127.0.0.1") {
        const s = await http.serve(`${host}:${port}`);
        let self = this;
        let abort = false;
        async function start() {
            for await (const httpRequest of s){
                if (abort) break;
                const req = new Request(httpRequest);
                const res = new Response();
                try {
                    await runMiddlewares(self.middlewares, req, res);
                } catch (e) {
                    if (e instanceof Deno.errors.NotFound) {
                        res.status = 404;
                        console.error(`File not found: ${req.url}`);
                    }
                }
                try {
                    await httpRequest.respond(res.toHttpResponse());
                } finally{
                    res.close();
                // console.log(await resources());
                }
            }
        }
        function close() {
            abort = true;
        }
        start();
        return {
            port,
            close
        };
    }
    addPathHandler(method, pattern, handle) {
        this.middlewares.push({
            method,
            pattern,
            match: simplePathMatcher(pattern),
            handle
        });
    }
    get(pattern, handle) {
        this.addPathHandler("GET", pattern, handle);
    }
    post(pattern, handle) {
        this.addPathHandler("POST", pattern, handle);
    }
    put(pattern, handle) {
        this.addPathHandler("PUT", pattern, handle);
    }
    patch(pattern, handle) {
        this.addPathHandler("PATCH", pattern, handle);
    }
    delete(pattern, handle) {
        this.addPathHandler("DELETE", pattern, handle);
    }
}
async function runMiddlewares(ms, req, res) {
    if (ms.length) {
        const [m, ...rest] = ms;
        await runMiddleware(m, ms.length, req, res, ()=>{
            return runMiddlewares(rest, req, res);
        });
    }
}
async function runMiddleware(m, length, req, res, next) {
    if (isPathHandler(m)) {
        if (m.method === req.method) {
            const params = m.match(req.url);
            if (params) {
                // add split value by question mark to get real value
                Object.keys(params).map(function(key, index) {
                    params[key] = params[key].split('?')[0];
                });
                req.extra.matchedPattern = m.pattern;
                req.params = params;
                return m.handle(req, res);
            }
            if (length === 1) res.status = 404 // if is last next and no route is found the route does not exist
            ;
            await next();
        }
        await next();
    } else {
        await m(req, res, next);
    }
}
export const bodyParser = {
    json () {
        return async (req, res, next)=>{
            if (req.headers.get("Content-Type") === "application/json") {
                try {
                    // get full body content
                    const bodyText = new TextDecoder().decode(req.body);
                    // remove null chars
                    const clearBodyText = bodyText.replace(/\0/g, "");
                    // get only data content
                    const content = clearBodyText.split("\r\n\r\n")[1];
                    req.data = JSON.parse(content);
                } catch (e) {
                    // console.error("json: ", e.message)
                    res.status = 400;
                    req.error = e.message;
                    return;
                }
            }
            await next();
        };
    },
    urlencoded () {
        return async (req, res, next)=>{
            if (req.headers.get("Content-Type") === "application/x-www-form-urlencoded") {
                try {
                    const body = await req.body;
                    const text = new TextDecoder().decode(body);
                    const data = {};
                    for (let s of text.split("&")){
                        const result = /^(.+?)=(.*)$/.exec(s);
                        if (result !== null) {
                            if (result.length < 3) continue;
                            const key = decodeURIComponent(result[1].replace("+", " "));
                            const value = decodeURIComponent(result[2].replace("+", " "));
                            if (Array.isArray(data[key])) data[key] = [
                                ...data[key],
                                value
                            ];
                            else if (data[key]) data[key] = [
                                data[key],
                                value
                            ];
                            else data[key] = value;
                        }
                    }
                    req.data = data;
                } catch (e) {
                    console.error("urlencoded: ", e.message);
                    res.status = 400;
                    req.error = e.message;
                    return;
                }
            }
            await next();
        };
    }
};
export { simpleLog } from "./src/functions/simpleLog.ts";
export { static_ } from "./src/functions/static.ts";
export { Request };
export { Response };
export { simplePathMatcher };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9OTWF0aGFyL2Rlbm8tZXhwcmVzcy9tYXN0ZXIvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aHR0cH0gZnJvbSBcIi4vZGVwcy50c1wiXG5pbXBvcnQge1JlcXVlc3R9IGZyb20gXCIuL3NyYy9SZXF1ZXN0LnRzXCJcbmltcG9ydCB7UmVzcG9uc2V9IGZyb20gXCIuL3NyYy9SZXNwb25zZS50c1wiXG5pbXBvcnQge3NpbXBsZVBhdGhNYXRjaGVyfSBmcm9tIFwiLi9zcmMvc2ltcGxlUGF0aE1hdGNoZXIudHNcIlxuaW1wb3J0IHtFbmRIYW5kbGVyLCBNZXRob2QsIE1pZGRsZXdhcmUsIE5leHR9IGZyb20gXCIuL3R5cGVzL2luZGV4LnRzXCJcbmltcG9ydCB7aXNQYXRoSGFuZGxlcn0gZnJvbSBcIi4vc3JjL2Z1bmN0aW9ucy9pc1BhdGhIYW5kbGVyLnRzXCJcblxuXG5leHBvcnQgY2xhc3MgQXBwIHtcbiAgICBtaWRkbGV3YXJlczogTWlkZGxld2FyZVtdID0gW11cblxuICAgIHVzZShtOiBNaWRkbGV3YXJlKSB7XG4gICAgICAgIHRoaXMubWlkZGxld2FyZXMucHVzaChtKVxuICAgIH1cblxuICAgIGFzeW5jIGxpc3Rlbihwb3J0OiBudW1iZXIsIGhvc3QgPSBcIjEyNy4wLjAuMVwiKSB7XG4gICAgICAgIGNvbnN0IHMgPSBhd2FpdCBodHRwLnNlcnZlKGAke2hvc3R9OiR7cG9ydH1gKVxuICAgICAgICBsZXQgc2VsZiA9IHRoaXNcbiAgICAgICAgbGV0IGFib3J0ID0gZmFsc2VcblxuICAgICAgICBhc3luYyBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgICAgICAgIGZvciBhd2FpdCAoY29uc3QgaHR0cFJlcXVlc3Qgb2Ygcykge1xuICAgICAgICAgICAgICAgIGlmIChhYm9ydCkgYnJlYWtcbiAgICAgICAgICAgICAgICBjb25zdCByZXEgPSBuZXcgUmVxdWVzdChodHRwUmVxdWVzdClcbiAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBuZXcgUmVzcG9uc2UoKVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHJ1bk1pZGRsZXdhcmVzKHNlbGYubWlkZGxld2FyZXMsIHJlcSwgcmVzKVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnN0YXR1cyA9IDQwNFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmlsZSBub3QgZm91bmQ6ICR7cmVxLnVybH1gKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGh0dHBSZXF1ZXN0LnJlc3BvbmQocmVzLnRvSHR0cFJlc3BvbnNlKCkpXG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzLmNsb3NlKClcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYXdhaXQgcmVzb3VyY2VzKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgICAgICAgYWJvcnQgPSB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICBzdGFydCgpXG4gICAgICAgIHJldHVybiB7cG9ydCwgY2xvc2V9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRQYXRoSGFuZGxlcihtZXRob2Q6IE1ldGhvZCwgcGF0dGVybjogc3RyaW5nLCBoYW5kbGU6IEVuZEhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5taWRkbGV3YXJlcy5wdXNoKHtcbiAgICAgICAgICAgIG1ldGhvZCxcbiAgICAgICAgICAgIHBhdHRlcm4sXG4gICAgICAgICAgICBtYXRjaDogc2ltcGxlUGF0aE1hdGNoZXIocGF0dGVybiksXG4gICAgICAgICAgICBoYW5kbGUsXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZ2V0KHBhdHRlcm46IGFueSwgaGFuZGxlOiBFbmRIYW5kbGVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWRkUGF0aEhhbmRsZXIoXCJHRVRcIiwgcGF0dGVybiwgaGFuZGxlKVxuICAgIH1cblxuICAgIHBvc3QocGF0dGVybjogYW55LCBoYW5kbGU6IEVuZEhhbmRsZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hZGRQYXRoSGFuZGxlcihcIlBPU1RcIiwgcGF0dGVybiwgaGFuZGxlKVxuICAgIH1cblxuICAgIHB1dChwYXR0ZXJuOiBhbnksIGhhbmRsZTogRW5kSGFuZGxlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmFkZFBhdGhIYW5kbGVyKFwiUFVUXCIsIHBhdHRlcm4sIGhhbmRsZSlcbiAgICB9XG5cbiAgICBwYXRjaChwYXR0ZXJuOiBhbnksIGhhbmRsZTogRW5kSGFuZGxlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmFkZFBhdGhIYW5kbGVyKFwiUEFUQ0hcIiwgcGF0dGVybiwgaGFuZGxlKVxuICAgIH1cblxuICAgIGRlbGV0ZShwYXR0ZXJuOiBhbnksIGhhbmRsZTogRW5kSGFuZGxlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmFkZFBhdGhIYW5kbGVyKFwiREVMRVRFXCIsIHBhdHRlcm4sIGhhbmRsZSlcbiAgICB9XG59XG5cblxuYXN5bmMgZnVuY3Rpb24gcnVuTWlkZGxld2FyZXMoXG4gICAgbXM6IE1pZGRsZXdhcmVbXSxcbiAgICByZXE6IFJlcXVlc3QsXG4gICAgcmVzOiBSZXNwb25zZSxcbik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChtcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgW20sIC4uLnJlc3RdID0gbXNcbiAgICAgICAgYXdhaXQgcnVuTWlkZGxld2FyZShtLCBtcy5sZW5ndGgsIHJlcSwgcmVzLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcnVuTWlkZGxld2FyZXMocmVzdCwgcmVxLCByZXMpXG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW5NaWRkbGV3YXJlKFxuICAgIG06IE1pZGRsZXdhcmUsXG4gICAgbGVuZ3RoOiBudW1iZXIsXG4gICAgcmVxOiBSZXF1ZXN0LFxuICAgIHJlczogUmVzcG9uc2UsXG4gICAgbmV4dDogTmV4dCxcbik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChpc1BhdGhIYW5kbGVyKG0pKSB7XG4gICAgICAgIGlmIChtLm1ldGhvZCA9PT0gcmVxLm1ldGhvZCkge1xuICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gbS5tYXRjaChyZXEudXJsKVxuICAgICAgICAgICAgaWYgKHBhcmFtcykge1xuICAgICAgICAgICAgICAgIC8vIGFkZCBzcGxpdCB2YWx1ZSBieSBxdWVzdGlvbiBtYXJrIHRvIGdldCByZWFsIHZhbHVlXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMocGFyYW1zKS5tYXAoZnVuY3Rpb24oa2V5LCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJhbXNba2V5XSA9IHBhcmFtc1trZXldLnNwbGl0KCc/JylbMF07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVxLmV4dHJhLm1hdGNoZWRQYXR0ZXJuID0gbS5wYXR0ZXJuXG4gICAgICAgICAgICAgICAgcmVxLnBhcmFtcyA9IHBhcmFtc1xuICAgICAgICAgICAgICAgIHJldHVybiBtLmhhbmRsZShyZXEsIHJlcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZW5ndGggPT09IDEpIHJlcy5zdGF0dXMgPSA0MDQgLy8gaWYgaXMgbGFzdCBuZXh0IGFuZCBubyByb3V0ZSBpcyBmb3VuZCB0aGUgcm91dGUgZG9lcyBub3QgZXhpc3RcbiAgICAgICAgICAgIGF3YWl0IG5leHQoKVxuICAgICAgICB9XG4gICAgICAgIGF3YWl0IG5leHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IG0ocmVxLCByZXMsIG5leHQpXG4gICAgfVxufVxuXG5cbmV4cG9ydCBjb25zdCBib2R5UGFyc2VyID0ge1xuICAgIGpzb24oKTogTWlkZGxld2FyZSB7XG4gICAgICAgIHJldHVybiBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXEuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikgPT09IFwiYXBwbGljYXRpb24vanNvblwiKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGZ1bGwgYm9keSBjb250ZW50XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJvZHlUZXh0ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHJlcS5ib2R5KVxuICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgbnVsbCBjaGFyc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGVhckJvZHlUZXh0ID0gYm9keVRleHQucmVwbGFjZSgvXFwwL2csIFwiXCIpXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCBvbmx5IGRhdGEgY29udGVudFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gY2xlYXJCb2R5VGV4dC5zcGxpdChcIlxcclxcblxcclxcblwiKVsxXVxuICAgICAgICAgICAgICAgICAgICByZXEuZGF0YSA9IEpTT04ucGFyc2UoY29udGVudClcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoXCJqc29uOiBcIiwgZS5tZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICByZXMuc3RhdHVzID0gNDAwXG4gICAgICAgICAgICAgICAgICAgIHJlcS5lcnJvciA9IGUubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBuZXh0KClcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdXJsZW5jb2RlZCgpOiBNaWRkbGV3YXJlIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHJlcS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKSA9PT0gXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYm9keTogYW55ID0gYXdhaXQgcmVxLmJvZHlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dDogYW55ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJvZHkpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGE6IGFueSA9IHt9XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHMgb2YgdGV4dC5zcGxpdChcIiZcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IC9eKC4rPyk9KC4qKSQvLmV4ZWMocylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCA8IDMpIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdFsxXS5yZXBsYWNlKFwiK1wiLCBcIiBcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0WzJdLnJlcGxhY2UoXCIrXCIsIFwiIFwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhW2tleV0pKSBkYXRhW2tleV0gPSBbLi4uZGF0YVtrZXldLCB2YWx1ZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRhW2tleV0pIGRhdGFba2V5XSA9IFtkYXRhW2tleV0sIHZhbHVlXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgZGF0YVtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXEuZGF0YSA9IGRhdGFcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJ1cmxlbmNvZGVkOiBcIiwgZS5tZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICByZXMuc3RhdHVzID0gNDAwXG4gICAgICAgICAgICAgICAgICAgIHJlcS5lcnJvciA9IGUubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBuZXh0KClcbiAgICAgICAgfVxuICAgIH0sXG59XG5cbmV4cG9ydCB7c2ltcGxlTG9nfSBmcm9tIFwiLi9zcmMvZnVuY3Rpb25zL3NpbXBsZUxvZy50c1wiXG5leHBvcnQge3N0YXRpY199IGZyb20gXCIuL3NyYy9mdW5jdGlvbnMvc3RhdGljLnRzXCJcbmV4cG9ydCB7UmVxdWVzdH1cbmV4cG9ydCB7UmVzcG9uc2V9XG5leHBvcnQge3NpbXBsZVBhdGhNYXRjaGVyfVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVEsSUFBSSxRQUFPLFlBQVc7QUFDOUIsU0FBUSxPQUFPLFFBQU8sbUJBQWtCO0FBQ3hDLFNBQVEsUUFBUSxRQUFPLG9CQUFtQjtBQUMxQyxT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