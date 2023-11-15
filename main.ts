import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { serveStatic } from "https://deno.land/x/hono@v3.2.7/middleware.ts";
import { Handler } from "https://deno.land/x/hono@v3.4.1/types.ts";
import { serve } from "https://deno.land/std@0.193.0/http/server.ts";
// obstruction
import obs from "https://esm.sh/javascript-obfuscator@4.1.0";
import { minify } from "https://deno.land/x/minifier@v1.1.1/mod.ts";
// type def
import { Context } from "https://deno.land/x/hono@v3.4.1/context.ts";

const app: Hono = new Hono();

app.post("/check", (c: Context) => c.text("success"));

app.get(
  "/static/*",
  serveStatic({
    root: "./",
  }) as unknown as Handler,
);

app.get("/", async (c: Context) => {
  const html = await Deno.readTextFile("./pack/index.html");
  return c.html(html);
});

app.get("/runtime", async () => {
  try {
    const base: string = await Deno.readTextFile("./pack/index.js");

    const js: obs.ObfuscationResult = obs.obfuscate(
      base,
    );

    return new Response(minify("js", js.getObfuscatedCode()), {
      headers: new Headers({
        "Content-Type": "text/javascript",
      }),
    });
  }catch (_e) {
    // ReAction
    const base: string = await Deno.readTextFile("./pack/index.js");

    const js: obs.ObfuscationResult = obs.obfuscate(
      base,
    );

    return new Response(minify("js", js.getObfuscatedCode()), {
      headers: new Headers({
        "Content-Type": "text/javascript",
      }),
    });
  }
});

serve(app.fetch, {
  port: 8080,
});
