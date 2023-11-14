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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvbm96b2tpL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSG9ubyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC94L2hvbm9AdjMuNC4xL21vZC50c1wiO1xuaW1wb3J0IHsgc2VydmVTdGF0aWMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9ob25vL21pZGRsZXdhcmUudHNcIjtcbmltcG9ydCB7IEhhbmRsZXIgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9ob25vQHYzLjQuMS90eXBlcy50c1wiO1xuaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkL2h0dHAvc2VydmVyLnRzXCI7XG4vLyBvYnN0cnVjdGlvblxuaW1wb3J0IG9icyBmcm9tIFwiaHR0cHM6Ly9lc20uc2gvamF2YXNjcmlwdC1vYmZ1c2NhdG9yQDQuMS4wXCI7XG5pbXBvcnQgeyBtaW5pZnkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9taW5pZmllci9tb2QudHNcIjtcbi8vIHR5cGUgZGVmXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvY29udGV4dC50c1wiO1xuXG5jb25zdCBhcHA6IEhvbm8gPSBuZXcgSG9ubygpO1xuXG5hcHAuZ2V0KFxuICBcIi9cIixcbiAgKGM6IENvbnRleHQpID0+IGMudGV4dChcIkNvbWluZyBzb29uLi4uIENyZWF0ZWQgYnkgQGFtZXgyMTg5IC8gYW1lX3hcIiksXG4pO1xuXG5hcHAucG9zdChcIi9jaGVja1wiLCAoYzogQ29udGV4dCkgPT4gYy50ZXh0KFwic3VjY2Vzc1wiKSk7XG5cbmFwcC5nZXQoXG4gIFwiL3N0YXRpYy8qXCIsXG4gIHNlcnZlU3RhdGljKHtcbiAgICByb290OiBcIi4vXCIsXG4gIH0pIGFzIHVua25vd24gYXMgSGFuZGxlcixcbik7XG5cbi8vIE5PVEU6IHRvIE1haW4gSGFuZGxlclxuYXBwLmdldChcIi9wcmV2aWV3XCIsIGFzeW5jIChjOiBDb250ZXh0KSA9PiB7XG4gIGNvbnN0IGh0bWwgPSBhd2FpdCBEZW5vLnJlYWRUZXh0RmlsZShcIi4vcGFjay9pbmRleC5odG1sXCIpO1xuICByZXR1cm4gYy5odG1sKGh0bWwpO1xufSk7XG5cbmFwcC5nZXQoXCIvcnVudGltZVwiLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGJhc2UgPSBhd2FpdCBEZW5vLnJlYWRUZXh0RmlsZShcIi4vcGFjay9pbmRleC5qc1wiKTtcbiAgY29uc3QganM6IG9icy5PYmZ1c2NhdGlvblJlc3VsdCA9IG9icy5vYmZ1c2NhdGUoXG4gICAgYmFzZSxcbiAgKTtcblxuICByZXR1cm4gbmV3IFJlc3BvbnNlKG1pbmlmeShcImpzXCIsIGpzLmdldE9iZnVzY2F0ZWRDb2RlKCkpLCB7XG4gICAgaGVhZGVyczogbmV3IEhlYWRlcnMoe1xuICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJ0ZXh0L2phdmFzY3JpcHRcIixcbiAgICB9KSxcbiAgfSk7XG59KTtcblxuLy8gQHRzLWlnbm9yZVxuc2VydmUoYXBwLmZldGNoLCB7XG4gIHBvcnQ6IDgwODAsXG59KTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLElBQUksUUFBUSx5Q0FBeUM7QUFDOUQsU0FBUyxXQUFXLFFBQVEseUNBQXlDO0FBRXJFLFNBQVMsS0FBSyxRQUFRLHVDQUF1QztBQUM3RCxjQUFjO0FBQ2QsT0FBTyxTQUFTLDZDQUE2QztBQUM3RCxTQUFTLE1BQU0sUUFBUSxzQ0FBc0M7QUFJN0QsTUFBTSxNQUFZLElBQUk7QUFFdEIsSUFBSSxHQUFHLENBQ0wsS0FDQSxDQUFDLElBQWUsRUFBRSxJQUFJLENBQUM7QUFHekIsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQWUsRUFBRSxJQUFJLENBQUM7QUFFMUMsSUFBSSxHQUFHLENBQ0wsYUFDQSxZQUFZO0lBQ1YsTUFBTTtBQUNSO0FBR0Ysd0JBQXdCO0FBQ3hCLElBQUksR0FBRyxDQUFDLFlBQVksT0FBTyxJQUFlO0lBQ3hDLE1BQU0sT0FBTyxNQUFNLEtBQUssWUFBWSxDQUFDO0lBQ3JDLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFDaEI7QUFFQSxJQUFJLEdBQUcsQ0FBQyxZQUFZLFVBQVk7SUFDOUIsTUFBTSxPQUFPLE1BQU0sS0FBSyxZQUFZLENBQUM7SUFDckMsTUFBTSxLQUE0QixJQUFJLFNBQVMsQ0FDN0M7SUFHRixPQUFPLElBQUksU0FBUyxPQUFPLE1BQU0sR0FBRyxpQkFBaUIsS0FBSztRQUN4RCxTQUFTLElBQUksUUFBUTtZQUNuQixnQkFBZ0I7UUFDbEI7SUFDRjtBQUNGO0FBRUEsYUFBYTtBQUNiLE1BQU0sSUFBSSxLQUFLLEVBQUU7SUFDZixNQUFNO0FBQ1IifQ==