import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { serveStatic } from "https://deno.land/x/hono@v3.2.7/middleware.ts";
import { serve } from "https://deno.land/std@0.193.0/http/server.ts";
// obstruction
import obs from "https://esm.sh/javascript-obfuscator@4.1.0";
import { minify } from "https://deno.land/x/minifier@v1.1.1/mod.ts";
const app = new Hono();
app.post("/check", (c)=>c.text("success"));
app.get("/static/*", serveStatic({
    root: "./"
}));
app.get("/", async (c)=>{
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
serve(app.fetch, {
    port: 8080
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvbm96b2tpLTIvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIb25vIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvbW9kLnRzXCI7XG5pbXBvcnQgeyBzZXJ2ZVN0YXRpYyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC94L2hvbm9AdjMuMi43L21pZGRsZXdhcmUudHNcIjtcbmltcG9ydCB7IEhhbmRsZXIgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9ob25vQHYzLjQuMS90eXBlcy50c1wiO1xuaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuMTkzLjAvaHR0cC9zZXJ2ZXIudHNcIjtcbi8vIG9ic3RydWN0aW9uXG5pbXBvcnQgb2JzIGZyb20gXCJodHRwczovL2VzbS5zaC9qYXZhc2NyaXB0LW9iZnVzY2F0b3JANC4xLjBcIjtcbmltcG9ydCB7IG1pbmlmeSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC94L21pbmlmaWVyQHYxLjEuMS9tb2QudHNcIjtcbi8vIHR5cGUgZGVmXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvY29udGV4dC50c1wiO1xuXG5jb25zdCBhcHA6IEhvbm8gPSBuZXcgSG9ubygpO1xuXG5hcHAucG9zdChcIi9jaGVja1wiLCAoYzogQ29udGV4dCkgPT4gYy50ZXh0KFwic3VjY2Vzc1wiKSk7XG5cbmFwcC5nZXQoXG4gIFwiL3N0YXRpYy8qXCIsXG4gIHNlcnZlU3RhdGljKHtcbiAgICByb290OiBcIi4vXCIsXG4gIH0pIGFzIHVua25vd24gYXMgSGFuZGxlcixcbik7XG5cbmFwcC5nZXQoXCIvXCIsIGFzeW5jIChjOiBDb250ZXh0KSA9PiB7XG4gIGNvbnN0IGh0bWwgPSBhd2FpdCBEZW5vLnJlYWRUZXh0RmlsZShcIi4vcGFjay9pbmRleC5odG1sXCIpO1xuICByZXR1cm4gYy5odG1sKGh0bWwpO1xufSk7XG5cbmFwcC5nZXQoXCIvcnVudGltZVwiLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGJhc2U6IHN0cmluZyA9IGF3YWl0IERlbm8ucmVhZFRleHRGaWxlKFwiLi9wYWNrL2luZGV4LmpzXCIpO1xuICBjb25zdCBqczogb2JzLk9iZnVzY2F0aW9uUmVzdWx0ID0gb2JzLm9iZnVzY2F0ZShcbiAgICBiYXNlLFxuICApO1xuXG4gIHJldHVybiBuZXcgUmVzcG9uc2UobWluaWZ5KFwianNcIiwganMuZ2V0T2JmdXNjYXRlZENvZGUoKSksIHtcbiAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh7XG4gICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvamF2YXNjcmlwdFwiLFxuICAgIH0pLFxuICB9KTtcbn0pO1xuXG5zZXJ2ZShhcHAuZmV0Y2gsIHtcbiAgcG9ydDogODA4MCxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsSUFBSSxRQUFRLHlDQUF5QztBQUM5RCxTQUFTLFdBQVcsUUFBUSxnREFBZ0Q7QUFFNUUsU0FBUyxLQUFLLFFBQVEsK0NBQStDO0FBQ3JFLGNBQWM7QUFDZCxPQUFPLFNBQVMsNkNBQTZDO0FBQzdELFNBQVMsTUFBTSxRQUFRLDZDQUE2QztBQUlwRSxNQUFNLE1BQVksSUFBSTtBQUV0QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBZSxFQUFFLElBQUksQ0FBQztBQUUxQyxJQUFJLEdBQUcsQ0FDTCxhQUNBLFlBQVk7SUFDVixNQUFNO0FBQ1I7QUFHRixJQUFJLEdBQUcsQ0FBQyxLQUFLLE9BQU8sSUFBZTtJQUNqQyxNQUFNLE9BQU8sTUFBTSxLQUFLLFlBQVksQ0FBQztJQUNyQyxPQUFPLEVBQUUsSUFBSSxDQUFDO0FBQ2hCO0FBRUEsSUFBSSxHQUFHLENBQUMsWUFBWSxVQUFZO0lBQzlCLE1BQU0sT0FBZSxNQUFNLEtBQUssWUFBWSxDQUFDO0lBQzdDLE1BQU0sS0FBNEIsSUFBSSxTQUFTLENBQzdDO0lBR0YsT0FBTyxJQUFJLFNBQVMsT0FBTyxNQUFNLEdBQUcsaUJBQWlCLEtBQUs7UUFDeEQsU0FBUyxJQUFJLFFBQVE7WUFDbkIsZ0JBQWdCO1FBQ2xCO0lBQ0Y7QUFDRjtBQUVBLE1BQU0sSUFBSSxLQUFLLEVBQUU7SUFDZixNQUFNO0FBQ1IifQ==