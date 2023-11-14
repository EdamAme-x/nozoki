import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";
import { serve } from "https://deno.land/std/http/server.ts";
// obstruction
import obs from "https://esm.sh/javascript-obfuscator@4.1.0";
import { minify } from "https://deno.land/x/minifier/mod.ts";
const app = new Hono();
app.get("/", (c)=>c.text("Coming soon... Created by @amex2189 / ame_x"));
app.post("/check", (c)=>c.text("success"));
app.get("/static/*", serveStatic({
    root: "./"
}));
// NOTE: to Main Handler
app.get("/preview", async (c)=>{
    const html = await Deno.readTextFile("./pack/index.html");
    return c.html(html);
});
app.get("/runtime", async ()=>{
    const base = await Deno.readTextFile("./pack/index.js");
    const js = obs.obfuscate(base);
    return new Response(minify("js", js.getObfuscatedCode()), {
        headers: new Headers({
            "Content-Type": "text/javascript"
        })
    });
});
// @ts-ignore
serve(app.fetch, {
    port: 8080
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvbm96b2tpL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSG9ubyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC94L2hvbm9AdjMuNC4xL21vZC50c1wiO1xuaW1wb3J0IHsgc2VydmVTdGF0aWMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9ob25vL21pZGRsZXdhcmUudHNcIjtcbmltcG9ydCB7IEhhbmRsZXIgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9ob25vQHYzLjQuMS90eXBlcy50c1wiO1xuaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkL2h0dHAvc2VydmVyLnRzXCI7XG4vLyBvYnN0cnVjdGlvblxuaW1wb3J0IG9icyBmcm9tIFwiaHR0cHM6Ly9lc20uc2gvamF2YXNjcmlwdC1vYmZ1c2NhdG9yQDQuMS4wXCI7XG5pbXBvcnQgeyBtaW5pZnkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9taW5pZmllci9tb2QudHNcIjtcbi8vIHR5cGUgZGVmXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvY29udGV4dC50c1wiO1xuXG5jb25zdCBhcHA6IEhvbm8gPSBuZXcgSG9ubygpO1xuXG5hcHAuZ2V0KFxuICBcIi9cIixcbiAgKGM6IENvbnRleHQpID0+IGMudGV4dChcIkNvbWluZyBzb29uLi4uIENyZWF0ZWQgYnkgQGFtZXgyMTg5IC8gYW1lX3hcIiksXG4pO1xuXG5hcHAucG9zdChcIi9jaGVja1wiLCAoYzogQ29udGV4dCkgPT4gYy50ZXh0KFwic3VjY2Vzc1wiKSk7XG5cbmFwcC5nZXQoXG4gIFwiL3N0YXRpYy8qXCIsXG4gIHNlcnZlU3RhdGljKHtcbiAgICByb290OiBcIi4vXCIsXG4gIH0pIGFzIHVua25vd24gYXMgSGFuZGxlcixcbik7XG5cbi8vIE5PVEU6IHRvIE1haW4gSGFuZGxlclxuYXBwLmdldChcIi9wcmV2aWV3XCIsIGFzeW5jIChjOiBDb250ZXh0KSA9PiB7XG4gIGNvbnN0IGh0bWwgPSBhd2FpdCBEZW5vLnJlYWRUZXh0RmlsZShcIi4vcGFjay9pbmRleC5odG1sXCIpO1xuICByZXR1cm4gYy5odG1sKGh0bWwpO1xufSk7XG5cbmFwcC5nZXQoXCIvcnVudGltZVwiLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGJhc2U6IHN0cmluZyA9IGF3YWl0IERlbm8ucmVhZFRleHRGaWxlKFwiLi9wYWNrL2luZGV4LmpzXCIpO1xuICBjb25zdCBqczogb2JzLk9iZnVzY2F0aW9uUmVzdWx0ID0gb2JzLm9iZnVzY2F0ZShcbiAgICBiYXNlLFxuICApO1xuXG4gIHJldHVybiBuZXcgUmVzcG9uc2UobWluaWZ5KFwianNcIiwganMuZ2V0T2JmdXNjYXRlZENvZGUoKSksIHtcbiAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh7XG4gICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvamF2YXNjcmlwdFwiLFxuICAgIH0pLFxuICB9KTtcbn0pO1xuXG4vLyBAdHMtaWdub3JlXG5zZXJ2ZShhcHAuZmV0Y2gsIHtcbiAgcG9ydDogODA4MCxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsSUFBSSxRQUFRLHlDQUF5QztBQUM5RCxTQUFTLFdBQVcsUUFBUSx5Q0FBeUM7QUFFckUsU0FBUyxLQUFLLFFBQVEsdUNBQXVDO0FBQzdELGNBQWM7QUFDZCxPQUFPLFNBQVMsNkNBQTZDO0FBQzdELFNBQVMsTUFBTSxRQUFRLHNDQUFzQztBQUk3RCxNQUFNLE1BQVksSUFBSTtBQUV0QixJQUFJLEdBQUcsQ0FDTCxLQUNBLENBQUMsSUFBZSxFQUFFLElBQUksQ0FBQztBQUd6QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBZSxFQUFFLElBQUksQ0FBQztBQUUxQyxJQUFJLEdBQUcsQ0FDTCxhQUNBLFlBQVk7SUFDVixNQUFNO0FBQ1I7QUFHRix3QkFBd0I7QUFDeEIsSUFBSSxHQUFHLENBQUMsWUFBWSxPQUFPLElBQWU7SUFDeEMsTUFBTSxPQUFPLE1BQU0sS0FBSyxZQUFZLENBQUM7SUFDckMsT0FBTyxFQUFFLElBQUksQ0FBQztBQUNoQjtBQUVBLElBQUksR0FBRyxDQUFDLFlBQVksVUFBWTtJQUM5QixNQUFNLE9BQWUsTUFBTSxLQUFLLFlBQVksQ0FBQztJQUM3QyxNQUFNLEtBQTRCLElBQUksU0FBUyxDQUM3QztJQUdGLE9BQU8sSUFBSSxTQUFTLE9BQU8sTUFBTSxHQUFHLGlCQUFpQixLQUFLO1FBQ3hELFNBQVMsSUFBSSxRQUFRO1lBQ25CLGdCQUFnQjtRQUNsQjtJQUNGO0FBQ0Y7QUFFQSxhQUFhO0FBQ2IsTUFBTSxJQUFJLEtBQUssRUFBRTtJQUNmLE1BQU07QUFDUiJ9