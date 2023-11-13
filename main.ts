import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { serveStatic } from 'https://deno.land/x/hono/middleware.ts'

const app = new Hono();

app.get("/", (c) => c.text("Coming soon... Created by @amex2189"));

app.post("/check", (c) => c.text("success"));

app.get("/static/*", serveStatic({
  root: "./"
});

Deno.serve(app.fetch);
