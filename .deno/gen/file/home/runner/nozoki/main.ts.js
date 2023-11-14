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
serve(app.fetch);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvbm96b2tpL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSG9ubyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC94L2hvbm9AdjMuNC4xL21vZC50c1wiO1xuaW1wb3J0IHsgc2VydmVTdGF0aWMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9ob25vL21pZGRsZXdhcmUudHNcIjtcbmltcG9ydCB7IEhhbmRsZXIgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9ob25vQHYzLjQuMS90eXBlcy50c1wiO1xuaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkL2h0dHAvc2VydmVyLnRzXCI7XG4vLyBvYnN0cnVjdGlvblxuaW1wb3J0IG9icyBmcm9tIFwiaHR0cHM6Ly9lc20uc2gvamF2YXNjcmlwdC1vYmZ1c2NhdG9yQDQuMS4wXCI7XG5pbXBvcnQgeyBtaW5pZnkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQveC9taW5pZmllci9tb2QudHNcIjtcbi8vIHR5cGUgZGVmXG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvY29udGV4dC50c1wiO1xuXG5jb25zdCBhcHA6IEhvbm8gPSBuZXcgSG9ubygpO1xuXG5hcHAuZ2V0KFwiL1wiLCAoYzogQ29udGV4dCkgPT4gYy50ZXh0KFwiQ29taW5nIHNvb24uLi4gQ3JlYXRlZCBieSBAYW1leDIxODkgLyBhbWVfeFwiKSk7XG5cbmFwcC5wb3N0KFwiL2NoZWNrXCIsIChjOiBDb250ZXh0KSA9PiBjLnRleHQoXCJzdWNjZXNzXCIpKTtcblxuYXBwLmdldChcbiAgXCIvc3RhdGljLypcIixcbiAgc2VydmVTdGF0aWMoe1xuICAgIHJvb3Q6IFwiLi9cIixcbiAgfSkgYXMgdW5rbm93biBhcyBIYW5kbGVyLFxuKTtcblxuLy8gTk9URTogdG8gTWFpbiBIYW5kbGVyXG5hcHAuZ2V0KFwiL3ByZXZpZXdcIiwgYXN5bmMgKGM6IENvbnRleHQpID0+IHtcbiAgY29uc3QgaHRtbCA9IGF3YWl0IERlbm8ucmVhZFRleHRGaWxlKFwiLi9wYWNrL2luZGV4Lmh0bWxcIik7XG4gIHJldHVybiBjLmh0bWwoaHRtbCk7XG59KTtcblxuYXBwLmdldChcIi9ydW50aW1lXCIsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgYmFzZSA9IGF3YWl0IERlbm8ucmVhZFRleHRGaWxlKFwiLi9wYWNrL2luZGV4LmpzXCIpO1xuICBjb25zdCBqczogb2JzLk9iZnVzY2F0aW9uUmVzdWx0ID0gb2JzLm9iZnVzY2F0ZShcbiAgICBiYXNlLFxuICApO1xuXG4gIHJldHVybiBuZXcgUmVzcG9uc2UobWluaWZ5KFwianNcIiwganMuZ2V0T2JmdXNjYXRlZENvZGUoKSksIHtcbiAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh7XG4gICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvamF2YXNjcmlwdFwiLFxuICAgIH0pLFxuICB9KTtcbn0pO1xuXG4vLyBAdHMtaWdub3JlXG5zZXJ2ZShhcHAuZmV0Y2gpO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsSUFBSSxRQUFRLHlDQUF5QztBQUM5RCxTQUFTLFdBQVcsUUFBUSx5Q0FBeUM7QUFFckUsU0FBUyxLQUFLLFFBQVEsdUNBQXVDO0FBQzdELGNBQWM7QUFDZCxPQUFPLFNBQVMsNkNBQTZDO0FBQzdELFNBQVMsTUFBTSxRQUFRLHNDQUFzQztBQUk3RCxNQUFNLE1BQVksSUFBSTtBQUV0QixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBZSxFQUFFLElBQUksQ0FBQztBQUVwQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBZSxFQUFFLElBQUksQ0FBQztBQUUxQyxJQUFJLEdBQUcsQ0FDTCxhQUNBLFlBQVk7SUFDVixNQUFNO0FBQ1I7QUFHRix3QkFBd0I7QUFDeEIsSUFBSSxHQUFHLENBQUMsWUFBWSxPQUFPLElBQWU7SUFDeEMsTUFBTSxPQUFPLE1BQU0sS0FBSyxZQUFZLENBQUM7SUFDckMsT0FBTyxFQUFFLElBQUksQ0FBQztBQUNoQjtBQUVBLElBQUksR0FBRyxDQUFDLFlBQVksVUFBWTtJQUM5QixNQUFNLE9BQU8sTUFBTSxLQUFLLFlBQVksQ0FBQztJQUNyQyxNQUFNLEtBQTRCLElBQUksU0FBUyxDQUM3QztJQUdGLE9BQU8sSUFBSSxTQUFTLE9BQU8sTUFBTSxHQUFHLGlCQUFpQixLQUFLO1FBQ3hELFNBQVMsSUFBSSxRQUFRO1lBQ25CLGdCQUFnQjtRQUNsQjtJQUNGO0FBQ0Y7QUFFQSxhQUFhO0FBQ2IsTUFBTSxJQUFJLEtBQUsifQ==