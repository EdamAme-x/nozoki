import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";
import { Handler } from "https://deno.land/x/hono@v3.4.1/types.ts";
import { serve } from "https://deno.land/std/http/server.ts";
// obstruction
import obs from "https://esm.sh/javascript-obfuscator@4.1.0";
import { minify } from "https://deno.land/x/minifier/mod.ts";
// type def
import { Context } from "https://deno.land/x/hono@v3.4.1/context.ts";

const app: Hono = new Hono();

app.get(
  "/",
  (c: Context) => c.text("Coming soon... Created by @amex2189 / ame_x"),
);

app.post("/check", (c: Context) => c.text("success"));

app.get(
  "/static/*",
  serveStatic({
    root: "./",
  }) as unknown as Handler,
);

// NOTE: to Main Handler
app.get("/preview", async (c: Context) => {
  const html = await Deno.readTextFile("./pack/index.html");
  return c.html(html);
});

app.get("/runtime", async () => {
  const base = await Deno.readTextFile("./pack/index.js");
  const js: obs.ObfuscationResult = obs.obfuscate(
    base,
  );

  return new Response(minify("js", js.getObfuscatedCode()), {
    headers: new Headers({
      "Content-Type": "text/javascript",
    }),
  });
});

// @ts-ignore
serve(app.fetch, {
  port: 8080,
});
