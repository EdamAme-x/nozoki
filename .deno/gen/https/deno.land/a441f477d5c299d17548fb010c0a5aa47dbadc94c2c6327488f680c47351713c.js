// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { delay } from "../async/delay.ts";
/** Thrown by Server after it has been closed. */ const ERROR_SERVER_CLOSED = "Server closed";
/** Default port for serving HTTP. */ const HTTP_PORT = 80;
/** Default port for serving HTTPS. */ const HTTPS_PORT = 443;
/** Initial backoff delay of 5ms following a temporary accept failure. */ const INITIAL_ACCEPT_BACKOFF_DELAY = 5;
/** Max backoff delay of 1s following a temporary accept failure. */ const MAX_ACCEPT_BACKOFF_DELAY = 1000;
/**
 * @deprecated (will be removed after 1.0.0) Use `Deno.serve` instead.
 *
 * Used to construct an HTTP server.
 */ export class Server {
    #port;
    #host;
    #handler;
    #closed = false;
    #listeners = new Set();
    #acceptBackoffDelayAbortController = new AbortController();
    #httpConnections = new Set();
    #onError;
    /**
   * Constructs a new HTTP Server instance.
   *
   * ```ts
   * import { Server } from "https://deno.land/std@$STD_VERSION/http/server.ts";
   *
   * const port = 4505;
   * const handler = (request: Request) => {
   *   const body = `Your user-agent is:\n\n${request.headers.get(
   *    "user-agent",
   *   ) ?? "Unknown"}`;
   *
   *   return new Response(body, { status: 200 });
   * };
   *
   * const server = new Server({ port, handler });
   * ```
   *
   * @param serverInit Options for running an HTTP server.
   */ constructor(serverInit){
        this.#port = serverInit.port;
        this.#host = serverInit.hostname;
        this.#handler = serverInit.handler;
        this.#onError = serverInit.onError ?? function(error) {
            console.error(error);
            return new Response("Internal Server Error", {
                status: 500
            });
        };
    }
    /**
   * Accept incoming connections on the given listener, and handle requests on
   * these connections with the given handler.
   *
   * HTTP/2 support is only enabled if the provided Deno.Listener returns TLS
   * connections and was configured with "h2" in the ALPN protocols.
   *
   * Throws a server closed error if called after the server has been closed.
   *
   * Will always close the created listener.
   *
   * ```ts
   * import { Server } from "https://deno.land/std@$STD_VERSION/http/server.ts";
   *
   * const handler = (request: Request) => {
   *   const body = `Your user-agent is:\n\n${request.headers.get(
   *    "user-agent",
   *   ) ?? "Unknown"}`;
   *
   *   return new Response(body, { status: 200 });
   * };
   *
   * const server = new Server({ handler });
   * const listener = Deno.listen({ port: 4505 });
   *
   * console.log("server listening on http://localhost:4505");
   *
   * await server.serve(listener);
   * ```
   *
   * @param listener The listener to accept connections from.
   */ async serve(listener) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#trackListener(listener);
        try {
            return await this.#accept(listener);
        } finally{
            this.#untrackListener(listener);
            try {
                listener.close();
            } catch  {
            // Listener has already been closed.
            }
        }
    }
    /**
   * Create a listener on the server, accept incoming connections, and handle
   * requests on these connections with the given handler.
   *
   * If the server was constructed without a specified port, 80 is used.
   *
   * If the server was constructed with the hostname omitted from the options, the
   * non-routable meta-address `0.0.0.0` is used.
   *
   * Throws a server closed error if the server has been closed.
   *
   * ```ts
   * import { Server } from "https://deno.land/std@$STD_VERSION/http/server.ts";
   *
   * const port = 4505;
   * const handler = (request: Request) => {
   *   const body = `Your user-agent is:\n\n${request.headers.get(
   *    "user-agent",
   *   ) ?? "Unknown"}`;
   *
   *   return new Response(body, { status: 200 });
   * };
   *
   * const server = new Server({ port, handler });
   *
   * console.log("server listening on http://localhost:4505");
   *
   * await server.listenAndServe();
   * ```
   */ async listenAndServe() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener = Deno.listen({
            port: this.#port ?? HTTP_PORT,
            hostname: this.#host ?? "0.0.0.0",
            transport: "tcp"
        });
        return await this.serve(listener);
    }
    /**
   * Create a listener on the server, accept incoming connections, upgrade them
   * to TLS, and handle requests on these connections with the given handler.
   *
   * If the server was constructed without a specified port, 443 is used.
   *
   * If the server was constructed with the hostname omitted from the options, the
   * non-routable meta-address `0.0.0.0` is used.
   *
   * Throws a server closed error if the server has been closed.
   *
   * ```ts
   * import { Server } from "https://deno.land/std@$STD_VERSION/http/server.ts";
   *
   * const port = 4505;
   * const handler = (request: Request) => {
   *   const body = `Your user-agent is:\n\n${request.headers.get(
   *    "user-agent",
   *   ) ?? "Unknown"}`;
   *
   *   return new Response(body, { status: 200 });
   * };
   *
   * const server = new Server({ port, handler });
   *
   * const certFile = "/path/to/certFile.crt";
   * const keyFile = "/path/to/keyFile.key";
   *
   * console.log("server listening on https://localhost:4505");
   *
   * await server.listenAndServeTls(certFile, keyFile);
   * ```
   *
   * @param certFile The path to the file containing the TLS certificate.
   * @param keyFile The path to the file containing the TLS private key.
   */ async listenAndServeTls(certFile, keyFile) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener = Deno.listenTls({
            port: this.#port ?? HTTPS_PORT,
            hostname: this.#host ?? "0.0.0.0",
            certFile,
            keyFile,
            transport: "tcp"
        });
        return await this.serve(listener);
    }
    /**
   * Immediately close the server listeners and associated HTTP connections.
   *
   * Throws a server closed error if called after the server has been closed.
   */ close() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#closed = true;
        for (const listener of this.#listeners){
            try {
                listener.close();
            } catch  {
            // Listener has already been closed.
            }
        }
        this.#listeners.clear();
        this.#acceptBackoffDelayAbortController.abort();
        for (const httpConn of this.#httpConnections){
            this.#closeHttpConn(httpConn);
        }
        this.#httpConnections.clear();
    }
    /** Get whether the server is closed. */ get closed() {
        return this.#closed;
    }
    /** Get the list of network addresses the server is listening on. */ get addrs() {
        return Array.from(this.#listeners).map((listener)=>listener.addr);
    }
    /**
   * Responds to an HTTP request.
   *
   * @param requestEvent The HTTP request to respond to.
   * @param connInfo Information about the underlying connection.
   */ async #respond(requestEvent, connInfo) {
        let response;
        try {
            // Handle the request event, generating a response.
            response = await this.#handler(requestEvent.request, connInfo);
            if (response.bodyUsed && response.body !== null) {
                throw new TypeError("Response body already consumed.");
            }
        } catch (error) {
            // Invoke onError handler when request handler throws.
            response = await this.#onError(error);
        }
        try {
            // Send the response.
            await requestEvent.respondWith(response);
        } catch  {
        // `respondWith()` can throw for various reasons, including downstream and
        // upstream connection errors, as well as errors thrown during streaming
        // of the response content.  In order to avoid false negatives, we ignore
        // the error here and let `serveHttp` close the connection on the
        // following iteration if it is in fact a downstream connection error.
        }
    }
    /**
   * Serves all HTTP requests on a single connection.
   *
   * @param httpConn The HTTP connection to yield requests from.
   * @param connInfo Information about the underlying connection.
   */ async #serveHttp(httpConn, connInfo) {
        while(!this.#closed){
            let requestEvent;
            try {
                // Yield the new HTTP request on the connection.
                requestEvent = await httpConn.nextRequest();
            } catch  {
                break;
            }
            if (requestEvent === null) {
                break;
            }
            // Respond to the request. Note we do not await this async method to
            // allow the connection to handle multiple requests in the case of h2.
            this.#respond(requestEvent, connInfo);
        }
        this.#closeHttpConn(httpConn);
    }
    /**
   * Accepts all connections on a single network listener.
   *
   * @param listener The listener to accept connections from.
   */ async #accept(listener) {
        let acceptBackoffDelay;
        while(!this.#closed){
            let conn;
            try {
                // Wait for a new connection.
                conn = await listener.accept();
            } catch (error) {
                if (// The listener is closed.
                error instanceof Deno.errors.BadResource || // TLS handshake errors.
                error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof || error instanceof Deno.errors.ConnectionReset || error instanceof Deno.errors.NotConnected) {
                    // Backoff after transient errors to allow time for the system to
                    // recover, and avoid blocking up the event loop with a continuously
                    // running loop.
                    if (!acceptBackoffDelay) {
                        acceptBackoffDelay = INITIAL_ACCEPT_BACKOFF_DELAY;
                    } else {
                        acceptBackoffDelay *= 2;
                    }
                    if (acceptBackoffDelay >= MAX_ACCEPT_BACKOFF_DELAY) {
                        acceptBackoffDelay = MAX_ACCEPT_BACKOFF_DELAY;
                    }
                    try {
                        await delay(acceptBackoffDelay, {
                            signal: this.#acceptBackoffDelayAbortController.signal
                        });
                    } catch (err) {
                        // The backoff delay timer is aborted when closing the server.
                        if (!(err instanceof DOMException && err.name === "AbortError")) {
                            throw err;
                        }
                    }
                    continue;
                }
                throw error;
            }
            acceptBackoffDelay = undefined;
            // "Upgrade" the network connection into an HTTP connection.
            let httpConn;
            try {
                httpConn = Deno.serveHttp(conn);
            } catch  {
                continue;
            }
            // Closing the underlying listener will not close HTTP connections, so we
            // track for closure upon server close.
            this.#trackHttpConnection(httpConn);
            const connInfo = {
                localAddr: conn.localAddr,
                remoteAddr: conn.remoteAddr
            };
            // Serve the requests that arrive on the just-accepted connection. Note
            // we do not await this async method to allow the server to accept new
            // connections.
            this.#serveHttp(httpConn, connInfo);
        }
    }
    /**
   * Untracks and closes an HTTP connection.
   *
   * @param httpConn The HTTP connection to close.
   */ #closeHttpConn(httpConn) {
        this.#untrackHttpConnection(httpConn);
        try {
            httpConn.close();
        } catch  {
        // Connection has already been closed.
        }
    }
    /**
   * Adds the listener to the internal tracking list.
   *
   * @param listener Listener to track.
   */ #trackListener(listener) {
        this.#listeners.add(listener);
    }
    /**
   * Removes the listener from the internal tracking list.
   *
   * @param listener Listener to untrack.
   */ #untrackListener(listener) {
        this.#listeners.delete(listener);
    }
    /**
   * Adds the HTTP connection to the internal tracking list.
   *
   * @param httpConn HTTP connection to track.
   */ #trackHttpConnection(httpConn) {
        this.#httpConnections.add(httpConn);
    }
    /**
   * Removes the HTTP connection from the internal tracking list.
   *
   * @param httpConn HTTP connection to untrack.
   */ #untrackHttpConnection(httpConn) {
        this.#httpConnections.delete(httpConn);
    }
}
/**
 * @deprecated (will be removed after 1.0.0) Use `Deno.serve` instead.
 *
 * Constructs a server, accepts incoming connections on the given listener, and
 * handles requests on these connections with the given handler.
 *
 * ```ts
 * import { serveListener } from "https://deno.land/std@$STD_VERSION/http/server.ts";
 *
 * const listener = Deno.listen({ port: 4505 });
 *
 * console.log("server listening on http://localhost:4505");
 *
 * await serveListener(listener, (request) => {
 *   const body = `Your user-agent is:\n\n${request.headers.get(
 *     "user-agent",
 *   ) ?? "Unknown"}`;
 *
 *   return new Response(body, { status: 200 });
 * });
 * ```
 *
 * @param listener The listener to accept connections from.
 * @param handler The handler for individual HTTP requests.
 * @param options Optional serve options.
 */ export async function serveListener(listener, handler, options) {
    const server = new Server({
        handler,
        onError: options?.onError
    });
    options?.signal?.addEventListener("abort", ()=>server.close(), {
        once: true
    });
    return await server.serve(listener);
}
function hostnameForDisplay(hostname) {
    // If the hostname is "0.0.0.0", we display "localhost" in console
    // because browsers in Windows don't resolve "0.0.0.0".
    // See the discussion in https://github.com/denoland/deno_std/issues/1165
    return hostname === "0.0.0.0" ? "localhost" : hostname;
}
/**
 * @deprecated (will be removed after 1.0.0) Use `Deno.serve` instead.
 *
 * Serves HTTP requests with the given handler.
 *
 * You can specify an object with a port and hostname option, which is the
 * address to listen on. The default is port 8000 on hostname "0.0.0.0".
 *
 * The below example serves with the port 8000.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@$STD_VERSION/http/server.ts";
 * serve((_req) => new Response("Hello, world"));
 * ```
 *
 * You can change the listening address by the `hostname` and `port` options.
 * The below example serves with the port 3000.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@$STD_VERSION/http/server.ts";
 * serve((_req) => new Response("Hello, world"), { port: 3000 });
 * ```
 *
 * `serve` function prints the message `Listening on http://<hostname>:<port>/`
 * on start-up by default. If you like to change this message, you can specify
 * `onListen` option to override it.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@$STD_VERSION/http/server.ts";
 * serve((_req) => new Response("Hello, world"), {
 *   onListen({ port, hostname }) {
 *     console.log(`Server started at http://${hostname}:${port}`);
 *     // ... more info specific to your server ..
 *   },
 * });
 * ```
 *
 * You can also specify `undefined` or `null` to stop the logging behavior.
 *
 * ```ts
 * import { serve } from "https://deno.land/std@$STD_VERSION/http/server.ts";
 * serve((_req) => new Response("Hello, world"), { onListen: undefined });
 * ```
 *
 * @param handler The handler for individual HTTP requests.
 * @param options The options. See `ServeInit` documentation for details.
 */ export async function serve(handler, options = {}) {
    let port = options.port ?? 8000;
    if (typeof port !== "number") {
        port = Number(port);
    }
    const hostname = options.hostname ?? "0.0.0.0";
    const server = new Server({
        port,
        hostname,
        handler,
        onError: options.onError
    });
    options?.signal?.addEventListener("abort", ()=>server.close(), {
        once: true
    });
    const listener = Deno.listen({
        port,
        hostname,
        transport: "tcp"
    });
    const s = server.serve(listener);
    port = server.addrs[0].port;
    if ("onListen" in options) {
        options.onListen?.({
            port,
            hostname
        });
    } else {
        console.log(`Listening on http://${hostnameForDisplay(hostname)}:${port}/`);
    }
    return await s;
}
/**
 * @deprecated (will be removed after 1.0.0) Use `Deno.serve` instead.
 *
 * Serves HTTPS requests with the given handler.
 *
 * You must specify `key` or `keyFile` and `cert` or `certFile` options.
 *
 * You can specify an object with a port and hostname option, which is the
 * address to listen on. The default is port 8443 on hostname "0.0.0.0".
 *
 * The below example serves with the default port 8443.
 *
 * ```ts
 * import { serveTls } from "https://deno.land/std@$STD_VERSION/http/server.ts";
 *
 * const cert = "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n";
 * const key = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n";
 * serveTls((_req) => new Response("Hello, world"), { cert, key });
 *
 * // Or
 *
 * const certFile = "/path/to/certFile.crt";
 * const keyFile = "/path/to/keyFile.key";
 * serveTls((_req) => new Response("Hello, world"), { certFile, keyFile });
 * ```
 *
 * `serveTls` function prints the message `Listening on https://<hostname>:<port>/`
 * on start-up by default. If you like to change this message, you can specify
 * `onListen` option to override it.
 *
 * ```ts
 * import { serveTls } from "https://deno.land/std@$STD_VERSION/http/server.ts";
 * const certFile = "/path/to/certFile.crt";
 * const keyFile = "/path/to/keyFile.key";
 * serveTls((_req) => new Response("Hello, world"), {
 *   certFile,
 *   keyFile,
 *   onListen({ port, hostname }) {
 *     console.log(`Server started at https://${hostname}:${port}`);
 *     // ... more info specific to your server ..
 *   },
 * });
 * ```
 *
 * You can also specify `undefined` or `null` to stop the logging behavior.
 *
 * ```ts
 * import { serveTls } from "https://deno.land/std@$STD_VERSION/http/server.ts";
 * const certFile = "/path/to/certFile.crt";
 * const keyFile = "/path/to/keyFile.key";
 * serveTls((_req) => new Response("Hello, world"), {
 *   certFile,
 *   keyFile,
 *   onListen: undefined,
 * });
 * ```
 *
 * @param handler The handler for individual HTTPS requests.
 * @param options The options. See `ServeTlsInit` documentation for details.
 * @returns
 */ export async function serveTls(handler, options) {
    if (!options.key && !options.keyFile) {
        throw new Error("TLS config is given, but 'key' is missing.");
    }
    if (!options.cert && !options.certFile) {
        throw new Error("TLS config is given, but 'cert' is missing.");
    }
    let port = options.port ?? 8443;
    if (typeof port !== "number") {
        port = Number(port);
    }
    const hostname = options.hostname ?? "0.0.0.0";
    const server = new Server({
        port,
        hostname,
        handler,
        onError: options.onError
    });
    options?.signal?.addEventListener("abort", ()=>server.close(), {
        once: true
    });
    const key = options.key || Deno.readTextFileSync(options.keyFile);
    const cert = options.cert || Deno.readTextFileSync(options.certFile);
    const listener = Deno.listenTls({
        port,
        hostname,
        cert,
        key,
        transport: "tcp"
    });
    const s = server.serve(listener);
    port = server.addrs[0].port;
    if ("onListen" in options) {
        options.onListen?.({
            port,
            hostname
        });
    } else {
        console.log(`Listening on https://${hostnameForDisplay(hostname)}:${port}/`);
    }
    return await s;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwNi4wL2h0dHAvc2VydmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyBkZWxheSB9IGZyb20gXCIuLi9hc3luYy9kZWxheS50c1wiO1xuXG4vKiogVGhyb3duIGJ5IFNlcnZlciBhZnRlciBpdCBoYXMgYmVlbiBjbG9zZWQuICovXG5jb25zdCBFUlJPUl9TRVJWRVJfQ0xPU0VEID0gXCJTZXJ2ZXIgY2xvc2VkXCI7XG5cbi8qKiBEZWZhdWx0IHBvcnQgZm9yIHNlcnZpbmcgSFRUUC4gKi9cbmNvbnN0IEhUVFBfUE9SVCA9IDgwO1xuXG4vKiogRGVmYXVsdCBwb3J0IGZvciBzZXJ2aW5nIEhUVFBTLiAqL1xuY29uc3QgSFRUUFNfUE9SVCA9IDQ0MztcblxuLyoqIEluaXRpYWwgYmFja29mZiBkZWxheSBvZiA1bXMgZm9sbG93aW5nIGEgdGVtcG9yYXJ5IGFjY2VwdCBmYWlsdXJlLiAqL1xuY29uc3QgSU5JVElBTF9BQ0NFUFRfQkFDS09GRl9ERUxBWSA9IDU7XG5cbi8qKiBNYXggYmFja29mZiBkZWxheSBvZiAxcyBmb2xsb3dpbmcgYSB0ZW1wb3JhcnkgYWNjZXB0IGZhaWx1cmUuICovXG5jb25zdCBNQVhfQUNDRVBUX0JBQ0tPRkZfREVMQVkgPSAxMDAwO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkICh3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgMS4wLjApIFVzZSBgRGVuby5TZXJ2ZUhhbmRsZXJJbmZvYCBpbnN0ZWFkLlxuICpcbiAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb25uZWN0aW9uIGEgcmVxdWVzdCBhcnJpdmVkIG9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbm5JbmZvIHtcbiAgLyoqIFRoZSBsb2NhbCBhZGRyZXNzIG9mIHRoZSBjb25uZWN0aW9uLiAqL1xuICByZWFkb25seSBsb2NhbEFkZHI6IERlbm8uQWRkcjtcbiAgLyoqIFRoZSByZW1vdGUgYWRkcmVzcyBvZiB0aGUgY29ubmVjdGlvbi4gKi9cbiAgcmVhZG9ubHkgcmVtb3RlQWRkcjogRGVuby5BZGRyO1xufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkICh3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgMS4wLjApIFVzZSBgRGVuby5TZXJ2ZUhhbmRsZXJgIGluc3RlYWQuXG4gKlxuICogQSBoYW5kbGVyIGZvciBIVFRQIHJlcXVlc3RzLiBDb25zdW1lcyBhIHJlcXVlc3QgYW5kIGNvbm5lY3Rpb24gaW5mb3JtYXRpb25cbiAqIGFuZCByZXR1cm5zIGEgcmVzcG9uc2UuXG4gKlxuICogSWYgYSBoYW5kbGVyIHRocm93cywgdGhlIHNlcnZlciBjYWxsaW5nIHRoZSBoYW5kbGVyIHdpbGwgYXNzdW1lIHRoZSBpbXBhY3RcbiAqIG9mIHRoZSBlcnJvciBpcyBpc29sYXRlZCB0byB0aGUgaW5kaXZpZHVhbCByZXF1ZXN0LiBJdCB3aWxsIGNhdGNoIHRoZSBlcnJvclxuICogYW5kIGNsb3NlIHRoZSB1bmRlcmx5aW5nIGNvbm5lY3Rpb24uXG4gKi9cbmV4cG9ydCB0eXBlIEhhbmRsZXIgPSAoXG4gIHJlcXVlc3Q6IFJlcXVlc3QsXG4gIGNvbm5JbmZvOiBDb25uSW5mbyxcbikgPT4gUmVzcG9uc2UgfCBQcm9taXNlPFJlc3BvbnNlPjtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCAod2lsbCBiZSByZW1vdmVkIGFmdGVyIDEuMC4wKSBVc2UgYERlbm8uU2VydmVJbml0YCBpbnN0ZWFkLlxuICpcbiAqIE9wdGlvbnMgZm9yIHJ1bm5pbmcgYW4gSFRUUCBzZXJ2ZXIuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VydmVySW5pdCBleHRlbmRzIFBhcnRpYWw8RGVuby5MaXN0ZW5PcHRpb25zPiB7XG4gIC8qKiBUaGUgaGFuZGxlciB0byBpbnZva2UgZm9yIGluZGl2aWR1YWwgSFRUUCByZXF1ZXN0cy4gKi9cbiAgaGFuZGxlcjogSGFuZGxlcjtcblxuICAvKipcbiAgICogVGhlIGhhbmRsZXIgdG8gaW52b2tlIHdoZW4gcm91dGUgaGFuZGxlcnMgdGhyb3cgYW4gZXJyb3IuXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IGVycm9yIGhhbmRsZXIgbG9ncyBhbmQgcmV0dXJucyB0aGUgZXJyb3IgaW4gSlNPTiBmb3JtYXQuXG4gICAqL1xuICBvbkVycm9yPzogKGVycm9yOiB1bmtub3duKSA9PiBSZXNwb25zZSB8IFByb21pc2U8UmVzcG9uc2U+O1xufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkICh3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgMS4wLjApIFVzZSBgRGVuby5zZXJ2ZWAgaW5zdGVhZC5cbiAqXG4gKiBVc2VkIHRvIGNvbnN0cnVjdCBhbiBIVFRQIHNlcnZlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFNlcnZlciB7XG4gICNwb3J0PzogbnVtYmVyO1xuICAjaG9zdD86IHN0cmluZztcbiAgI2hhbmRsZXI6IEhhbmRsZXI7XG4gICNjbG9zZWQgPSBmYWxzZTtcbiAgI2xpc3RlbmVyczogU2V0PERlbm8uTGlzdGVuZXI+ID0gbmV3IFNldCgpO1xuICAjYWNjZXB0QmFja29mZkRlbGF5QWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAjaHR0cENvbm5lY3Rpb25zOiBTZXQ8RGVuby5IdHRwQ29ubj4gPSBuZXcgU2V0KCk7XG4gICNvbkVycm9yOiAoZXJyb3I6IHVua25vd24pID0+IFJlc3BvbnNlIHwgUHJvbWlzZTxSZXNwb25zZT47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBuZXcgSFRUUCBTZXJ2ZXIgaW5zdGFuY2UuXG4gICAqXG4gICAqIGBgYHRzXG4gICAqIGltcG9ydCB7IFNlcnZlciB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2h0dHAvc2VydmVyLnRzXCI7XG4gICAqXG4gICAqIGNvbnN0IHBvcnQgPSA0NTA1O1xuICAgKiBjb25zdCBoYW5kbGVyID0gKHJlcXVlc3Q6IFJlcXVlc3QpID0+IHtcbiAgICogICBjb25zdCBib2R5ID0gYFlvdXIgdXNlci1hZ2VudCBpczpcXG5cXG4ke3JlcXVlc3QuaGVhZGVycy5nZXQoXG4gICAqICAgIFwidXNlci1hZ2VudFwiLFxuICAgKiAgICkgPz8gXCJVbmtub3duXCJ9YDtcbiAgICpcbiAgICogICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHsgc3RhdHVzOiAyMDAgfSk7XG4gICAqIH07XG4gICAqXG4gICAqIGNvbnN0IHNlcnZlciA9IG5ldyBTZXJ2ZXIoeyBwb3J0LCBoYW5kbGVyIH0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIHNlcnZlckluaXQgT3B0aW9ucyBmb3IgcnVubmluZyBhbiBIVFRQIHNlcnZlci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHNlcnZlckluaXQ6IFNlcnZlckluaXQpIHtcbiAgICB0aGlzLiNwb3J0ID0gc2VydmVySW5pdC5wb3J0O1xuICAgIHRoaXMuI2hvc3QgPSBzZXJ2ZXJJbml0Lmhvc3RuYW1lO1xuICAgIHRoaXMuI2hhbmRsZXIgPSBzZXJ2ZXJJbml0LmhhbmRsZXI7XG4gICAgdGhpcy4jb25FcnJvciA9IHNlcnZlckluaXQub25FcnJvciA/P1xuICAgICAgZnVuY3Rpb24gKGVycm9yOiB1bmtub3duKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFwiSW50ZXJuYWwgU2VydmVyIEVycm9yXCIsIHsgc3RhdHVzOiA1MDAgfSk7XG4gICAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEFjY2VwdCBpbmNvbWluZyBjb25uZWN0aW9ucyBvbiB0aGUgZ2l2ZW4gbGlzdGVuZXIsIGFuZCBoYW5kbGUgcmVxdWVzdHMgb25cbiAgICogdGhlc2UgY29ubmVjdGlvbnMgd2l0aCB0aGUgZ2l2ZW4gaGFuZGxlci5cbiAgICpcbiAgICogSFRUUC8yIHN1cHBvcnQgaXMgb25seSBlbmFibGVkIGlmIHRoZSBwcm92aWRlZCBEZW5vLkxpc3RlbmVyIHJldHVybnMgVExTXG4gICAqIGNvbm5lY3Rpb25zIGFuZCB3YXMgY29uZmlndXJlZCB3aXRoIFwiaDJcIiBpbiB0aGUgQUxQTiBwcm90b2NvbHMuXG4gICAqXG4gICAqIFRocm93cyBhIHNlcnZlciBjbG9zZWQgZXJyb3IgaWYgY2FsbGVkIGFmdGVyIHRoZSBzZXJ2ZXIgaGFzIGJlZW4gY2xvc2VkLlxuICAgKlxuICAgKiBXaWxsIGFsd2F5cyBjbG9zZSB0aGUgY3JlYXRlZCBsaXN0ZW5lci5cbiAgICpcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgU2VydmVyIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAgICpcbiAgICogY29uc3QgaGFuZGxlciA9IChyZXF1ZXN0OiBSZXF1ZXN0KSA9PiB7XG4gICAqICAgY29uc3QgYm9keSA9IGBZb3VyIHVzZXItYWdlbnQgaXM6XFxuXFxuJHtyZXF1ZXN0LmhlYWRlcnMuZ2V0KFxuICAgKiAgICBcInVzZXItYWdlbnRcIixcbiAgICogICApID8/IFwiVW5rbm93blwifWA7XG4gICAqXG4gICAqICAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5LCB7IHN0YXR1czogMjAwIH0pO1xuICAgKiB9O1xuICAgKlxuICAgKiBjb25zdCBzZXJ2ZXIgPSBuZXcgU2VydmVyKHsgaGFuZGxlciB9KTtcbiAgICogY29uc3QgbGlzdGVuZXIgPSBEZW5vLmxpc3Rlbih7IHBvcnQ6IDQ1MDUgfSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKFwic2VydmVyIGxpc3RlbmluZyBvbiBodHRwOi8vbG9jYWxob3N0OjQ1MDVcIik7XG4gICAqXG4gICAqIGF3YWl0IHNlcnZlci5zZXJ2ZShsaXN0ZW5lcik7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIHRvIGFjY2VwdCBjb25uZWN0aW9ucyBmcm9tLlxuICAgKi9cbiAgYXN5bmMgc2VydmUobGlzdGVuZXI6IERlbm8uTGlzdGVuZXIpIHtcbiAgICBpZiAodGhpcy4jY2xvc2VkKSB7XG4gICAgICB0aHJvdyBuZXcgRGVuby5lcnJvcnMuSHR0cChFUlJPUl9TRVJWRVJfQ0xPU0VEKTtcbiAgICB9XG5cbiAgICB0aGlzLiN0cmFja0xpc3RlbmVyKGxpc3RlbmVyKTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy4jYWNjZXB0KGxpc3RlbmVyKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy4jdW50cmFja0xpc3RlbmVyKGxpc3RlbmVyKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbGlzdGVuZXIuY2xvc2UoKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBMaXN0ZW5lciBoYXMgYWxyZWFkeSBiZWVuIGNsb3NlZC5cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbGlzdGVuZXIgb24gdGhlIHNlcnZlciwgYWNjZXB0IGluY29taW5nIGNvbm5lY3Rpb25zLCBhbmQgaGFuZGxlXG4gICAqIHJlcXVlc3RzIG9uIHRoZXNlIGNvbm5lY3Rpb25zIHdpdGggdGhlIGdpdmVuIGhhbmRsZXIuXG4gICAqXG4gICAqIElmIHRoZSBzZXJ2ZXIgd2FzIGNvbnN0cnVjdGVkIHdpdGhvdXQgYSBzcGVjaWZpZWQgcG9ydCwgODAgaXMgdXNlZC5cbiAgICpcbiAgICogSWYgdGhlIHNlcnZlciB3YXMgY29uc3RydWN0ZWQgd2l0aCB0aGUgaG9zdG5hbWUgb21pdHRlZCBmcm9tIHRoZSBvcHRpb25zLCB0aGVcbiAgICogbm9uLXJvdXRhYmxlIG1ldGEtYWRkcmVzcyBgMC4wLjAuMGAgaXMgdXNlZC5cbiAgICpcbiAgICogVGhyb3dzIGEgc2VydmVyIGNsb3NlZCBlcnJvciBpZiB0aGUgc2VydmVyIGhhcyBiZWVuIGNsb3NlZC5cbiAgICpcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgU2VydmVyIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAgICpcbiAgICogY29uc3QgcG9ydCA9IDQ1MDU7XG4gICAqIGNvbnN0IGhhbmRsZXIgPSAocmVxdWVzdDogUmVxdWVzdCkgPT4ge1xuICAgKiAgIGNvbnN0IGJvZHkgPSBgWW91ciB1c2VyLWFnZW50IGlzOlxcblxcbiR7cmVxdWVzdC5oZWFkZXJzLmdldChcbiAgICogICAgXCJ1c2VyLWFnZW50XCIsXG4gICAqICAgKSA/PyBcIlVua25vd25cIn1gO1xuICAgKlxuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgICogfTtcbiAgICpcbiAgICogY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlcih7IHBvcnQsIGhhbmRsZXIgfSk7XG4gICAqXG4gICAqIGNvbnNvbGUubG9nKFwic2VydmVyIGxpc3RlbmluZyBvbiBodHRwOi8vbG9jYWxob3N0OjQ1MDVcIik7XG4gICAqXG4gICAqIGF3YWl0IHNlcnZlci5saXN0ZW5BbmRTZXJ2ZSgpO1xuICAgKiBgYGBcbiAgICovXG4gIGFzeW5jIGxpc3RlbkFuZFNlcnZlKCkge1xuICAgIGlmICh0aGlzLiNjbG9zZWQpIHtcbiAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5IdHRwKEVSUk9SX1NFUlZFUl9DTE9TRUQpO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbmVyID0gRGVuby5saXN0ZW4oe1xuICAgICAgcG9ydDogdGhpcy4jcG9ydCA/PyBIVFRQX1BPUlQsXG4gICAgICBob3N0bmFtZTogdGhpcy4jaG9zdCA/PyBcIjAuMC4wLjBcIixcbiAgICAgIHRyYW5zcG9ydDogXCJ0Y3BcIixcbiAgICB9KTtcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLnNlcnZlKGxpc3RlbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsaXN0ZW5lciBvbiB0aGUgc2VydmVyLCBhY2NlcHQgaW5jb21pbmcgY29ubmVjdGlvbnMsIHVwZ3JhZGUgdGhlbVxuICAgKiB0byBUTFMsIGFuZCBoYW5kbGUgcmVxdWVzdHMgb24gdGhlc2UgY29ubmVjdGlvbnMgd2l0aCB0aGUgZ2l2ZW4gaGFuZGxlci5cbiAgICpcbiAgICogSWYgdGhlIHNlcnZlciB3YXMgY29uc3RydWN0ZWQgd2l0aG91dCBhIHNwZWNpZmllZCBwb3J0LCA0NDMgaXMgdXNlZC5cbiAgICpcbiAgICogSWYgdGhlIHNlcnZlciB3YXMgY29uc3RydWN0ZWQgd2l0aCB0aGUgaG9zdG5hbWUgb21pdHRlZCBmcm9tIHRoZSBvcHRpb25zLCB0aGVcbiAgICogbm9uLXJvdXRhYmxlIG1ldGEtYWRkcmVzcyBgMC4wLjAuMGAgaXMgdXNlZC5cbiAgICpcbiAgICogVGhyb3dzIGEgc2VydmVyIGNsb3NlZCBlcnJvciBpZiB0aGUgc2VydmVyIGhhcyBiZWVuIGNsb3NlZC5cbiAgICpcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgU2VydmVyIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAgICpcbiAgICogY29uc3QgcG9ydCA9IDQ1MDU7XG4gICAqIGNvbnN0IGhhbmRsZXIgPSAocmVxdWVzdDogUmVxdWVzdCkgPT4ge1xuICAgKiAgIGNvbnN0IGJvZHkgPSBgWW91ciB1c2VyLWFnZW50IGlzOlxcblxcbiR7cmVxdWVzdC5oZWFkZXJzLmdldChcbiAgICogICAgXCJ1c2VyLWFnZW50XCIsXG4gICAqICAgKSA/PyBcIlVua25vd25cIn1gO1xuICAgKlxuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgICogfTtcbiAgICpcbiAgICogY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlcih7IHBvcnQsIGhhbmRsZXIgfSk7XG4gICAqXG4gICAqIGNvbnN0IGNlcnRGaWxlID0gXCIvcGF0aC90by9jZXJ0RmlsZS5jcnRcIjtcbiAgICogY29uc3Qga2V5RmlsZSA9IFwiL3BhdGgvdG8va2V5RmlsZS5rZXlcIjtcbiAgICpcbiAgICogY29uc29sZS5sb2coXCJzZXJ2ZXIgbGlzdGVuaW5nIG9uIGh0dHBzOi8vbG9jYWxob3N0OjQ1MDVcIik7XG4gICAqXG4gICAqIGF3YWl0IHNlcnZlci5saXN0ZW5BbmRTZXJ2ZVRscyhjZXJ0RmlsZSwga2V5RmlsZSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gY2VydEZpbGUgVGhlIHBhdGggdG8gdGhlIGZpbGUgY29udGFpbmluZyB0aGUgVExTIGNlcnRpZmljYXRlLlxuICAgKiBAcGFyYW0ga2V5RmlsZSBUaGUgcGF0aCB0byB0aGUgZmlsZSBjb250YWluaW5nIHRoZSBUTFMgcHJpdmF0ZSBrZXkuXG4gICAqL1xuICBhc3luYyBsaXN0ZW5BbmRTZXJ2ZVRscyhjZXJ0RmlsZTogc3RyaW5nLCBrZXlGaWxlOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy4jY2xvc2VkKSB7XG4gICAgICB0aHJvdyBuZXcgRGVuby5lcnJvcnMuSHR0cChFUlJPUl9TRVJWRVJfQ0xPU0VEKTtcbiAgICB9XG5cbiAgICBjb25zdCBsaXN0ZW5lciA9IERlbm8ubGlzdGVuVGxzKHtcbiAgICAgIHBvcnQ6IHRoaXMuI3BvcnQgPz8gSFRUUFNfUE9SVCxcbiAgICAgIGhvc3RuYW1lOiB0aGlzLiNob3N0ID8/IFwiMC4wLjAuMFwiLFxuICAgICAgY2VydEZpbGUsXG4gICAgICBrZXlGaWxlLFxuICAgICAgdHJhbnNwb3J0OiBcInRjcFwiLFxuICAgICAgLy8gQUxQTiBwcm90b2NvbCBzdXBwb3J0IG5vdCB5ZXQgc3RhYmxlLlxuICAgICAgLy8gYWxwblByb3RvY29sczogW1wiaDJcIiwgXCJodHRwLzEuMVwiXSxcbiAgICB9KTtcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLnNlcnZlKGxpc3RlbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbW1lZGlhdGVseSBjbG9zZSB0aGUgc2VydmVyIGxpc3RlbmVycyBhbmQgYXNzb2NpYXRlZCBIVFRQIGNvbm5lY3Rpb25zLlxuICAgKlxuICAgKiBUaHJvd3MgYSBzZXJ2ZXIgY2xvc2VkIGVycm9yIGlmIGNhbGxlZCBhZnRlciB0aGUgc2VydmVyIGhhcyBiZWVuIGNsb3NlZC5cbiAgICovXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLiNjbG9zZWQpIHtcbiAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5IdHRwKEVSUk9SX1NFUlZFUl9DTE9TRUQpO1xuICAgIH1cblxuICAgIHRoaXMuI2Nsb3NlZCA9IHRydWU7XG5cbiAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIHRoaXMuI2xpc3RlbmVycykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGlzdGVuZXIuY2xvc2UoKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBMaXN0ZW5lciBoYXMgYWxyZWFkeSBiZWVuIGNsb3NlZC5cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLiNsaXN0ZW5lcnMuY2xlYXIoKTtcblxuICAgIHRoaXMuI2FjY2VwdEJhY2tvZmZEZWxheUFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuXG4gICAgZm9yIChjb25zdCBodHRwQ29ubiBvZiB0aGlzLiNodHRwQ29ubmVjdGlvbnMpIHtcbiAgICAgIHRoaXMuI2Nsb3NlSHR0cENvbm4oaHR0cENvbm4pO1xuICAgIH1cblxuICAgIHRoaXMuI2h0dHBDb25uZWN0aW9ucy5jbGVhcigpO1xuICB9XG5cbiAgLyoqIEdldCB3aGV0aGVyIHRoZSBzZXJ2ZXIgaXMgY2xvc2VkLiAqL1xuICBnZXQgY2xvc2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLiNjbG9zZWQ7XG4gIH1cblxuICAvKiogR2V0IHRoZSBsaXN0IG9mIG5ldHdvcmsgYWRkcmVzc2VzIHRoZSBzZXJ2ZXIgaXMgbGlzdGVuaW5nIG9uLiAqL1xuICBnZXQgYWRkcnMoKTogRGVuby5BZGRyW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuI2xpc3RlbmVycykubWFwKChsaXN0ZW5lcikgPT4gbGlzdGVuZXIuYWRkcik7XG4gIH1cblxuICAvKipcbiAgICogUmVzcG9uZHMgdG8gYW4gSFRUUCByZXF1ZXN0LlxuICAgKlxuICAgKiBAcGFyYW0gcmVxdWVzdEV2ZW50IFRoZSBIVFRQIHJlcXVlc3QgdG8gcmVzcG9uZCB0by5cbiAgICogQHBhcmFtIGNvbm5JbmZvIEluZm9ybWF0aW9uIGFib3V0IHRoZSB1bmRlcmx5aW5nIGNvbm5lY3Rpb24uXG4gICAqL1xuICBhc3luYyAjcmVzcG9uZChcbiAgICByZXF1ZXN0RXZlbnQ6IERlbm8uUmVxdWVzdEV2ZW50LFxuICAgIGNvbm5JbmZvOiBDb25uSW5mbyxcbiAgKSB7XG4gICAgbGV0IHJlc3BvbnNlOiBSZXNwb25zZTtcbiAgICB0cnkge1xuICAgICAgLy8gSGFuZGxlIHRoZSByZXF1ZXN0IGV2ZW50LCBnZW5lcmF0aW5nIGEgcmVzcG9uc2UuXG4gICAgICByZXNwb25zZSA9IGF3YWl0IHRoaXMuI2hhbmRsZXIocmVxdWVzdEV2ZW50LnJlcXVlc3QsIGNvbm5JbmZvKTtcblxuICAgICAgaWYgKHJlc3BvbnNlLmJvZHlVc2VkICYmIHJlc3BvbnNlLmJvZHkgIT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlJlc3BvbnNlIGJvZHkgYWxyZWFkeSBjb25zdW1lZC5cIik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgIC8vIEludm9rZSBvbkVycm9yIGhhbmRsZXIgd2hlbiByZXF1ZXN0IGhhbmRsZXIgdGhyb3dzLlxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLiNvbkVycm9yKGVycm9yKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gU2VuZCB0aGUgcmVzcG9uc2UuXG4gICAgICBhd2FpdCByZXF1ZXN0RXZlbnQucmVzcG9uZFdpdGgocmVzcG9uc2UpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gYHJlc3BvbmRXaXRoKClgIGNhbiB0aHJvdyBmb3IgdmFyaW91cyByZWFzb25zLCBpbmNsdWRpbmcgZG93bnN0cmVhbSBhbmRcbiAgICAgIC8vIHVwc3RyZWFtIGNvbm5lY3Rpb24gZXJyb3JzLCBhcyB3ZWxsIGFzIGVycm9ycyB0aHJvd24gZHVyaW5nIHN0cmVhbWluZ1xuICAgICAgLy8gb2YgdGhlIHJlc3BvbnNlIGNvbnRlbnQuICBJbiBvcmRlciB0byBhdm9pZCBmYWxzZSBuZWdhdGl2ZXMsIHdlIGlnbm9yZVxuICAgICAgLy8gdGhlIGVycm9yIGhlcmUgYW5kIGxldCBgc2VydmVIdHRwYCBjbG9zZSB0aGUgY29ubmVjdGlvbiBvbiB0aGVcbiAgICAgIC8vIGZvbGxvd2luZyBpdGVyYXRpb24gaWYgaXQgaXMgaW4gZmFjdCBhIGRvd25zdHJlYW0gY29ubmVjdGlvbiBlcnJvci5cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VydmVzIGFsbCBIVFRQIHJlcXVlc3RzIG9uIGEgc2luZ2xlIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBodHRwQ29ubiBUaGUgSFRUUCBjb25uZWN0aW9uIHRvIHlpZWxkIHJlcXVlc3RzIGZyb20uXG4gICAqIEBwYXJhbSBjb25uSW5mbyBJbmZvcm1hdGlvbiBhYm91dCB0aGUgdW5kZXJseWluZyBjb25uZWN0aW9uLlxuICAgKi9cbiAgYXN5bmMgI3NlcnZlSHR0cChodHRwQ29ubjogRGVuby5IdHRwQ29ubiwgY29ubkluZm86IENvbm5JbmZvKSB7XG4gICAgd2hpbGUgKCF0aGlzLiNjbG9zZWQpIHtcbiAgICAgIGxldCByZXF1ZXN0RXZlbnQ6IERlbm8uUmVxdWVzdEV2ZW50IHwgbnVsbDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gWWllbGQgdGhlIG5ldyBIVFRQIHJlcXVlc3Qgb24gdGhlIGNvbm5lY3Rpb24uXG4gICAgICAgIHJlcXVlc3RFdmVudCA9IGF3YWl0IGh0dHBDb25uLm5leHRSZXF1ZXN0KCk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gQ29ubmVjdGlvbiBoYXMgYmVlbiBjbG9zZWQuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVxdWVzdEV2ZW50ID09PSBudWxsKSB7XG4gICAgICAgIC8vIENvbm5lY3Rpb24gaGFzIGJlZW4gY2xvc2VkLlxuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gUmVzcG9uZCB0byB0aGUgcmVxdWVzdC4gTm90ZSB3ZSBkbyBub3QgYXdhaXQgdGhpcyBhc3luYyBtZXRob2QgdG9cbiAgICAgIC8vIGFsbG93IHRoZSBjb25uZWN0aW9uIHRvIGhhbmRsZSBtdWx0aXBsZSByZXF1ZXN0cyBpbiB0aGUgY2FzZSBvZiBoMi5cbiAgICAgIHRoaXMuI3Jlc3BvbmQocmVxdWVzdEV2ZW50LCBjb25uSW5mbyk7XG4gICAgfVxuXG4gICAgdGhpcy4jY2xvc2VIdHRwQ29ubihodHRwQ29ubik7XG4gIH1cblxuICAvKipcbiAgICogQWNjZXB0cyBhbGwgY29ubmVjdGlvbnMgb24gYSBzaW5nbGUgbmV0d29yayBsaXN0ZW5lci5cbiAgICpcbiAgICogQHBhcmFtIGxpc3RlbmVyIFRoZSBsaXN0ZW5lciB0byBhY2NlcHQgY29ubmVjdGlvbnMgZnJvbS5cbiAgICovXG4gIGFzeW5jICNhY2NlcHQobGlzdGVuZXI6IERlbm8uTGlzdGVuZXIpIHtcbiAgICBsZXQgYWNjZXB0QmFja29mZkRlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgICB3aGlsZSAoIXRoaXMuI2Nsb3NlZCkge1xuICAgICAgbGV0IGNvbm46IERlbm8uQ29ubjtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gV2FpdCBmb3IgYSBuZXcgY29ubmVjdGlvbi5cbiAgICAgICAgY29ubiA9IGF3YWl0IGxpc3RlbmVyLmFjY2VwdCgpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIC8vIFRoZSBsaXN0ZW5lciBpcyBjbG9zZWQuXG4gICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5CYWRSZXNvdXJjZSB8fFxuICAgICAgICAgIC8vIFRMUyBoYW5kc2hha2UgZXJyb3JzLlxuICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuSW52YWxpZERhdGEgfHxcbiAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLlVuZXhwZWN0ZWRFb2YgfHxcbiAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkNvbm5lY3Rpb25SZXNldCB8fFxuICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Q29ubmVjdGVkXG4gICAgICAgICkge1xuICAgICAgICAgIC8vIEJhY2tvZmYgYWZ0ZXIgdHJhbnNpZW50IGVycm9ycyB0byBhbGxvdyB0aW1lIGZvciB0aGUgc3lzdGVtIHRvXG4gICAgICAgICAgLy8gcmVjb3ZlciwgYW5kIGF2b2lkIGJsb2NraW5nIHVwIHRoZSBldmVudCBsb29wIHdpdGggYSBjb250aW51b3VzbHlcbiAgICAgICAgICAvLyBydW5uaW5nIGxvb3AuXG4gICAgICAgICAgaWYgKCFhY2NlcHRCYWNrb2ZmRGVsYXkpIHtcbiAgICAgICAgICAgIGFjY2VwdEJhY2tvZmZEZWxheSA9IElOSVRJQUxfQUNDRVBUX0JBQ0tPRkZfREVMQVk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjY2VwdEJhY2tvZmZEZWxheSAqPSAyO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChhY2NlcHRCYWNrb2ZmRGVsYXkgPj0gTUFYX0FDQ0VQVF9CQUNLT0ZGX0RFTEFZKSB7XG4gICAgICAgICAgICBhY2NlcHRCYWNrb2ZmRGVsYXkgPSBNQVhfQUNDRVBUX0JBQ0tPRkZfREVMQVk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGRlbGF5KGFjY2VwdEJhY2tvZmZEZWxheSwge1xuICAgICAgICAgICAgICBzaWduYWw6IHRoaXMuI2FjY2VwdEJhY2tvZmZEZWxheUFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnI6IHVua25vd24pIHtcbiAgICAgICAgICAgIC8vIFRoZSBiYWNrb2ZmIGRlbGF5IHRpbWVyIGlzIGFib3J0ZWQgd2hlbiBjbG9zaW5nIHRoZSBzZXJ2ZXIuXG4gICAgICAgICAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBET01FeGNlcHRpb24gJiYgZXJyLm5hbWUgPT09IFwiQWJvcnRFcnJvclwiKSkge1xuICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cblxuICAgICAgYWNjZXB0QmFja29mZkRlbGF5ID0gdW5kZWZpbmVkO1xuXG4gICAgICAvLyBcIlVwZ3JhZGVcIiB0aGUgbmV0d29yayBjb25uZWN0aW9uIGludG8gYW4gSFRUUCBjb25uZWN0aW9uLlxuICAgICAgbGV0IGh0dHBDb25uOiBEZW5vLkh0dHBDb25uO1xuXG4gICAgICB0cnkge1xuICAgICAgICBodHRwQ29ubiA9IERlbm8uc2VydmVIdHRwKGNvbm4pO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIENvbm5lY3Rpb24gaGFzIGJlZW4gY2xvc2VkLlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2xvc2luZyB0aGUgdW5kZXJseWluZyBsaXN0ZW5lciB3aWxsIG5vdCBjbG9zZSBIVFRQIGNvbm5lY3Rpb25zLCBzbyB3ZVxuICAgICAgLy8gdHJhY2sgZm9yIGNsb3N1cmUgdXBvbiBzZXJ2ZXIgY2xvc2UuXG4gICAgICB0aGlzLiN0cmFja0h0dHBDb25uZWN0aW9uKGh0dHBDb25uKTtcblxuICAgICAgY29uc3QgY29ubkluZm86IENvbm5JbmZvID0ge1xuICAgICAgICBsb2NhbEFkZHI6IGNvbm4ubG9jYWxBZGRyLFxuICAgICAgICByZW1vdGVBZGRyOiBjb25uLnJlbW90ZUFkZHIsXG4gICAgICB9O1xuXG4gICAgICAvLyBTZXJ2ZSB0aGUgcmVxdWVzdHMgdGhhdCBhcnJpdmUgb24gdGhlIGp1c3QtYWNjZXB0ZWQgY29ubmVjdGlvbi4gTm90ZVxuICAgICAgLy8gd2UgZG8gbm90IGF3YWl0IHRoaXMgYXN5bmMgbWV0aG9kIHRvIGFsbG93IHRoZSBzZXJ2ZXIgdG8gYWNjZXB0IG5ld1xuICAgICAgLy8gY29ubmVjdGlvbnMuXG4gICAgICB0aGlzLiNzZXJ2ZUh0dHAoaHR0cENvbm4sIGNvbm5JbmZvKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVW50cmFja3MgYW5kIGNsb3NlcyBhbiBIVFRQIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBodHRwQ29ubiBUaGUgSFRUUCBjb25uZWN0aW9uIHRvIGNsb3NlLlxuICAgKi9cbiAgI2Nsb3NlSHR0cENvbm4oaHR0cENvbm46IERlbm8uSHR0cENvbm4pIHtcbiAgICB0aGlzLiN1bnRyYWNrSHR0cENvbm5lY3Rpb24oaHR0cENvbm4pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGh0dHBDb25uLmNsb3NlKCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBDb25uZWN0aW9uIGhhcyBhbHJlYWR5IGJlZW4gY2xvc2VkLlxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBsaXN0ZW5lciB0byB0aGUgaW50ZXJuYWwgdHJhY2tpbmcgbGlzdC5cbiAgICpcbiAgICogQHBhcmFtIGxpc3RlbmVyIExpc3RlbmVyIHRvIHRyYWNrLlxuICAgKi9cbiAgI3RyYWNrTGlzdGVuZXIobGlzdGVuZXI6IERlbm8uTGlzdGVuZXIpIHtcbiAgICB0aGlzLiNsaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBsaXN0ZW5lciBmcm9tIHRoZSBpbnRlcm5hbCB0cmFja2luZyBsaXN0LlxuICAgKlxuICAgKiBAcGFyYW0gbGlzdGVuZXIgTGlzdGVuZXIgdG8gdW50cmFjay5cbiAgICovXG4gICN1bnRyYWNrTGlzdGVuZXIobGlzdGVuZXI6IERlbm8uTGlzdGVuZXIpIHtcbiAgICB0aGlzLiNsaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBIVFRQIGNvbm5lY3Rpb24gdG8gdGhlIGludGVybmFsIHRyYWNraW5nIGxpc3QuXG4gICAqXG4gICAqIEBwYXJhbSBodHRwQ29ubiBIVFRQIGNvbm5lY3Rpb24gdG8gdHJhY2suXG4gICAqL1xuICAjdHJhY2tIdHRwQ29ubmVjdGlvbihodHRwQ29ubjogRGVuby5IdHRwQ29ubikge1xuICAgIHRoaXMuI2h0dHBDb25uZWN0aW9ucy5hZGQoaHR0cENvbm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIEhUVFAgY29ubmVjdGlvbiBmcm9tIHRoZSBpbnRlcm5hbCB0cmFja2luZyBsaXN0LlxuICAgKlxuICAgKiBAcGFyYW0gaHR0cENvbm4gSFRUUCBjb25uZWN0aW9uIHRvIHVudHJhY2suXG4gICAqL1xuICAjdW50cmFja0h0dHBDb25uZWN0aW9uKGh0dHBDb25uOiBEZW5vLkh0dHBDb25uKSB7XG4gICAgdGhpcy4jaHR0cENvbm5lY3Rpb25zLmRlbGV0ZShodHRwQ29ubik7XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZCAod2lsbCBiZSByZW1vdmVkIGFmdGVyIDEuMC4wKSBVc2UgYERlbm8uU2VydmVJbml0YCBpbnN0ZWFkLlxuICpcbiAqIEFkZGl0aW9uYWwgc2VydmUgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZUluaXQgZXh0ZW5kcyBQYXJ0aWFsPERlbm8uTGlzdGVuT3B0aW9ucz4ge1xuICAvKiogQW4gQWJvcnRTaWduYWwgdG8gY2xvc2UgdGhlIHNlcnZlciBhbmQgYWxsIGNvbm5lY3Rpb25zLiAqL1xuICBzaWduYWw/OiBBYm9ydFNpZ25hbDtcblxuICAvKiogVGhlIGhhbmRsZXIgdG8gaW52b2tlIHdoZW4gcm91dGUgaGFuZGxlcnMgdGhyb3cgYW4gZXJyb3IuICovXG4gIG9uRXJyb3I/OiAoZXJyb3I6IHVua25vd24pID0+IFJlc3BvbnNlIHwgUHJvbWlzZTxSZXNwb25zZT47XG5cbiAgLyoqIFRoZSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiB0aGUgc2VydmVyIHN0YXJ0ZWQgbGlzdGVuaW5nICovXG4gIG9uTGlzdGVuPzogKHBhcmFtczogeyBob3N0bmFtZTogc3RyaW5nOyBwb3J0OiBudW1iZXIgfSkgPT4gdm9pZDtcbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZCAod2lsbCBiZSByZW1vdmVkIGFmdGVyIDEuMC4wKSBVc2UgYERlbm8uU2VydmVPcHRpb25zYCBpbnN0ZWFkLlxuICpcbiAqIEFkZGl0aW9uYWwgc2VydmUgbGlzdGVuZXIgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZUxpc3RlbmVyT3B0aW9ucyB7XG4gIC8qKiBBbiBBYm9ydFNpZ25hbCB0byBjbG9zZSB0aGUgc2VydmVyIGFuZCBhbGwgY29ubmVjdGlvbnMuICovXG4gIHNpZ25hbD86IEFib3J0U2lnbmFsO1xuXG4gIC8qKiBUaGUgaGFuZGxlciB0byBpbnZva2Ugd2hlbiByb3V0ZSBoYW5kbGVycyB0aHJvdyBhbiBlcnJvci4gKi9cbiAgb25FcnJvcj86IChlcnJvcjogdW5rbm93bikgPT4gUmVzcG9uc2UgfCBQcm9taXNlPFJlc3BvbnNlPjtcblxuICAvKiogVGhlIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHRoZSBzZXJ2ZXIgc3RhcnRlZCBsaXN0ZW5pbmcgKi9cbiAgb25MaXN0ZW4/OiAocGFyYW1zOiB7IGhvc3RuYW1lOiBzdHJpbmc7IHBvcnQ6IG51bWJlciB9KSA9PiB2b2lkO1xufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkICh3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgMS4wLjApIFVzZSBgRGVuby5zZXJ2ZWAgaW5zdGVhZC5cbiAqXG4gKiBDb25zdHJ1Y3RzIGEgc2VydmVyLCBhY2NlcHRzIGluY29taW5nIGNvbm5lY3Rpb25zIG9uIHRoZSBnaXZlbiBsaXN0ZW5lciwgYW5kXG4gKiBoYW5kbGVzIHJlcXVlc3RzIG9uIHRoZXNlIGNvbm5lY3Rpb25zIHdpdGggdGhlIGdpdmVuIGhhbmRsZXIuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHNlcnZlTGlzdGVuZXIgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9odHRwL3NlcnZlci50c1wiO1xuICpcbiAqIGNvbnN0IGxpc3RlbmVyID0gRGVuby5saXN0ZW4oeyBwb3J0OiA0NTA1IH0pO1xuICpcbiAqIGNvbnNvbGUubG9nKFwic2VydmVyIGxpc3RlbmluZyBvbiBodHRwOi8vbG9jYWxob3N0OjQ1MDVcIik7XG4gKlxuICogYXdhaXQgc2VydmVMaXN0ZW5lcihsaXN0ZW5lciwgKHJlcXVlc3QpID0+IHtcbiAqICAgY29uc3QgYm9keSA9IGBZb3VyIHVzZXItYWdlbnQgaXM6XFxuXFxuJHtyZXF1ZXN0LmhlYWRlcnMuZ2V0KFxuICogICAgIFwidXNlci1hZ2VudFwiLFxuICogICApID8/IFwiVW5rbm93blwifWA7XG4gKlxuICogICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHsgc3RhdHVzOiAyMDAgfSk7XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgdG8gYWNjZXB0IGNvbm5lY3Rpb25zIGZyb20uXG4gKiBAcGFyYW0gaGFuZGxlciBUaGUgaGFuZGxlciBmb3IgaW5kaXZpZHVhbCBIVFRQIHJlcXVlc3RzLlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9uYWwgc2VydmUgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlcnZlTGlzdGVuZXIoXG4gIGxpc3RlbmVyOiBEZW5vLkxpc3RlbmVyLFxuICBoYW5kbGVyOiBIYW5kbGVyLFxuICBvcHRpb25zPzogU2VydmVMaXN0ZW5lck9wdGlvbnMsXG4pIHtcbiAgY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlcih7IGhhbmRsZXIsIG9uRXJyb3I6IG9wdGlvbnM/Lm9uRXJyb3IgfSk7XG5cbiAgb3B0aW9ucz8uc2lnbmFsPy5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgKCkgPT4gc2VydmVyLmNsb3NlKCksIHtcbiAgICBvbmNlOiB0cnVlLFxuICB9KTtcblxuICByZXR1cm4gYXdhaXQgc2VydmVyLnNlcnZlKGxpc3RlbmVyKTtcbn1cblxuZnVuY3Rpb24gaG9zdG5hbWVGb3JEaXNwbGF5KGhvc3RuYW1lOiBzdHJpbmcpIHtcbiAgLy8gSWYgdGhlIGhvc3RuYW1lIGlzIFwiMC4wLjAuMFwiLCB3ZSBkaXNwbGF5IFwibG9jYWxob3N0XCIgaW4gY29uc29sZVxuICAvLyBiZWNhdXNlIGJyb3dzZXJzIGluIFdpbmRvd3MgZG9uJ3QgcmVzb2x2ZSBcIjAuMC4wLjBcIi5cbiAgLy8gU2VlIHRoZSBkaXNjdXNzaW9uIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9kZW5vbGFuZC9kZW5vX3N0ZC9pc3N1ZXMvMTE2NVxuICByZXR1cm4gaG9zdG5hbWUgPT09IFwiMC4wLjAuMFwiID8gXCJsb2NhbGhvc3RcIiA6IGhvc3RuYW1lO1xufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkICh3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgMS4wLjApIFVzZSBgRGVuby5zZXJ2ZWAgaW5zdGVhZC5cbiAqXG4gKiBTZXJ2ZXMgSFRUUCByZXF1ZXN0cyB3aXRoIHRoZSBnaXZlbiBoYW5kbGVyLlxuICpcbiAqIFlvdSBjYW4gc3BlY2lmeSBhbiBvYmplY3Qgd2l0aCBhIHBvcnQgYW5kIGhvc3RuYW1lIG9wdGlvbiwgd2hpY2ggaXMgdGhlXG4gKiBhZGRyZXNzIHRvIGxpc3RlbiBvbi4gVGhlIGRlZmF1bHQgaXMgcG9ydCA4MDAwIG9uIGhvc3RuYW1lIFwiMC4wLjAuMFwiLlxuICpcbiAqIFRoZSBiZWxvdyBleGFtcGxlIHNlcnZlcyB3aXRoIHRoZSBwb3J0IDgwMDAuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHNlcnZlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAqIHNlcnZlKChfcmVxKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGRcIikpO1xuICogYGBgXG4gKlxuICogWW91IGNhbiBjaGFuZ2UgdGhlIGxpc3RlbmluZyBhZGRyZXNzIGJ5IHRoZSBgaG9zdG5hbWVgIGFuZCBgcG9ydGAgb3B0aW9ucy5cbiAqIFRoZSBiZWxvdyBleGFtcGxlIHNlcnZlcyB3aXRoIHRoZSBwb3J0IDMwMDAuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHNlcnZlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAqIHNlcnZlKChfcmVxKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGRcIiksIHsgcG9ydDogMzAwMCB9KTtcbiAqIGBgYFxuICpcbiAqIGBzZXJ2ZWAgZnVuY3Rpb24gcHJpbnRzIHRoZSBtZXNzYWdlIGBMaXN0ZW5pbmcgb24gaHR0cDovLzxob3N0bmFtZT46PHBvcnQ+L2BcbiAqIG9uIHN0YXJ0LXVwIGJ5IGRlZmF1bHQuIElmIHlvdSBsaWtlIHRvIGNoYW5nZSB0aGlzIG1lc3NhZ2UsIHlvdSBjYW4gc3BlY2lmeVxuICogYG9uTGlzdGVuYCBvcHRpb24gdG8gb3ZlcnJpZGUgaXQuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHNlcnZlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAqIHNlcnZlKChfcmVxKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGRcIiksIHtcbiAqICAgb25MaXN0ZW4oeyBwb3J0LCBob3N0bmFtZSB9KSB7XG4gKiAgICAgY29uc29sZS5sb2coYFNlcnZlciBzdGFydGVkIGF0IGh0dHA6Ly8ke2hvc3RuYW1lfToke3BvcnR9YCk7XG4gKiAgICAgLy8gLi4uIG1vcmUgaW5mbyBzcGVjaWZpYyB0byB5b3VyIHNlcnZlciAuLlxuICogICB9LFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBZb3UgY2FuIGFsc28gc3BlY2lmeSBgdW5kZWZpbmVkYCBvciBgbnVsbGAgdG8gc3RvcCB0aGUgbG9nZ2luZyBiZWhhdmlvci5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9odHRwL3NlcnZlci50c1wiO1xuICogc2VydmUoKF9yZXEpID0+IG5ldyBSZXNwb25zZShcIkhlbGxvLCB3b3JsZFwiKSwgeyBvbkxpc3RlbjogdW5kZWZpbmVkIH0pO1xuICogYGBgXG4gKlxuICogQHBhcmFtIGhhbmRsZXIgVGhlIGhhbmRsZXIgZm9yIGluZGl2aWR1YWwgSFRUUCByZXF1ZXN0cy5cbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zLiBTZWUgYFNlcnZlSW5pdGAgZG9jdW1lbnRhdGlvbiBmb3IgZGV0YWlscy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlcnZlKFxuICBoYW5kbGVyOiBIYW5kbGVyLFxuICBvcHRpb25zOiBTZXJ2ZUluaXQgPSB7fSxcbikge1xuICBsZXQgcG9ydCA9IG9wdGlvbnMucG9ydCA/PyA4MDAwO1xuICBpZiAodHlwZW9mIHBvcnQgIT09IFwibnVtYmVyXCIpIHtcbiAgICBwb3J0ID0gTnVtYmVyKHBvcnQpO1xuICB9XG5cbiAgY29uc3QgaG9zdG5hbWUgPSBvcHRpb25zLmhvc3RuYW1lID8/IFwiMC4wLjAuMFwiO1xuICBjb25zdCBzZXJ2ZXIgPSBuZXcgU2VydmVyKHtcbiAgICBwb3J0LFxuICAgIGhvc3RuYW1lLFxuICAgIGhhbmRsZXIsXG4gICAgb25FcnJvcjogb3B0aW9ucy5vbkVycm9yLFxuICB9KTtcblxuICBvcHRpb25zPy5zaWduYWw/LmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCAoKSA9PiBzZXJ2ZXIuY2xvc2UoKSwge1xuICAgIG9uY2U6IHRydWUsXG4gIH0pO1xuXG4gIGNvbnN0IGxpc3RlbmVyID0gRGVuby5saXN0ZW4oe1xuICAgIHBvcnQsXG4gICAgaG9zdG5hbWUsXG4gICAgdHJhbnNwb3J0OiBcInRjcFwiLFxuICB9KTtcblxuICBjb25zdCBzID0gc2VydmVyLnNlcnZlKGxpc3RlbmVyKTtcblxuICBwb3J0ID0gKHNlcnZlci5hZGRyc1swXSBhcyBEZW5vLk5ldEFkZHIpLnBvcnQ7XG5cbiAgaWYgKFwib25MaXN0ZW5cIiBpbiBvcHRpb25zKSB7XG4gICAgb3B0aW9ucy5vbkxpc3Rlbj8uKHsgcG9ydCwgaG9zdG5hbWUgfSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coYExpc3RlbmluZyBvbiBodHRwOi8vJHtob3N0bmFtZUZvckRpc3BsYXkoaG9zdG5hbWUpfToke3BvcnR9L2ApO1xuICB9XG5cbiAgcmV0dXJuIGF3YWl0IHM7XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgKHdpbGwgYmUgcmVtb3ZlZCBhZnRlciAxLjAuMCkgVXNlIGBEZW5vLlNlcnZlVGxzT3B0aW9uc2AgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZVRsc0luaXQgZXh0ZW5kcyBTZXJ2ZUluaXQge1xuICAvKiogU2VydmVyIHByaXZhdGUga2V5IGluIFBFTSBmb3JtYXQgKi9cbiAga2V5Pzogc3RyaW5nO1xuXG4gIC8qKiBDZXJ0IGNoYWluIGluIFBFTSBmb3JtYXQgKi9cbiAgY2VydD86IHN0cmluZztcblxuICAvKiogVGhlIHBhdGggdG8gdGhlIGZpbGUgY29udGFpbmluZyB0aGUgVExTIHByaXZhdGUga2V5LiAqL1xuICBrZXlGaWxlPzogc3RyaW5nO1xuXG4gIC8qKiBUaGUgcGF0aCB0byB0aGUgZmlsZSBjb250YWluaW5nIHRoZSBUTFMgY2VydGlmaWNhdGUgKi9cbiAgY2VydEZpbGU/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgKHdpbGwgYmUgcmVtb3ZlZCBhZnRlciAxLjAuMCkgVXNlIGBEZW5vLnNlcnZlYCBpbnN0ZWFkLlxuICpcbiAqIFNlcnZlcyBIVFRQUyByZXF1ZXN0cyB3aXRoIHRoZSBnaXZlbiBoYW5kbGVyLlxuICpcbiAqIFlvdSBtdXN0IHNwZWNpZnkgYGtleWAgb3IgYGtleUZpbGVgIGFuZCBgY2VydGAgb3IgYGNlcnRGaWxlYCBvcHRpb25zLlxuICpcbiAqIFlvdSBjYW4gc3BlY2lmeSBhbiBvYmplY3Qgd2l0aCBhIHBvcnQgYW5kIGhvc3RuYW1lIG9wdGlvbiwgd2hpY2ggaXMgdGhlXG4gKiBhZGRyZXNzIHRvIGxpc3RlbiBvbi4gVGhlIGRlZmF1bHQgaXMgcG9ydCA4NDQzIG9uIGhvc3RuYW1lIFwiMC4wLjAuMFwiLlxuICpcbiAqIFRoZSBiZWxvdyBleGFtcGxlIHNlcnZlcyB3aXRoIHRoZSBkZWZhdWx0IHBvcnQgODQ0My5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgc2VydmVUbHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9odHRwL3NlcnZlci50c1wiO1xuICpcbiAqIGNvbnN0IGNlcnQgPSBcIi0tLS0tQkVHSU4gQ0VSVElGSUNBVEUtLS0tLVxcbi4uLlxcbi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS1cXG5cIjtcbiAqIGNvbnN0IGtleSA9IFwiLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXFxuLi4uXFxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxcblwiO1xuICogc2VydmVUbHMoKF9yZXEpID0+IG5ldyBSZXNwb25zZShcIkhlbGxvLCB3b3JsZFwiKSwgeyBjZXJ0LCBrZXkgfSk7XG4gKlxuICogLy8gT3JcbiAqXG4gKiBjb25zdCBjZXJ0RmlsZSA9IFwiL3BhdGgvdG8vY2VydEZpbGUuY3J0XCI7XG4gKiBjb25zdCBrZXlGaWxlID0gXCIvcGF0aC90by9rZXlGaWxlLmtleVwiO1xuICogc2VydmVUbHMoKF9yZXEpID0+IG5ldyBSZXNwb25zZShcIkhlbGxvLCB3b3JsZFwiKSwgeyBjZXJ0RmlsZSwga2V5RmlsZSB9KTtcbiAqIGBgYFxuICpcbiAqIGBzZXJ2ZVRsc2AgZnVuY3Rpb24gcHJpbnRzIHRoZSBtZXNzYWdlIGBMaXN0ZW5pbmcgb24gaHR0cHM6Ly88aG9zdG5hbWU+Ojxwb3J0Pi9gXG4gKiBvbiBzdGFydC11cCBieSBkZWZhdWx0LiBJZiB5b3UgbGlrZSB0byBjaGFuZ2UgdGhpcyBtZXNzYWdlLCB5b3UgY2FuIHNwZWNpZnlcbiAqIGBvbkxpc3RlbmAgb3B0aW9uIHRvIG92ZXJyaWRlIGl0LlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBzZXJ2ZVRscyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2h0dHAvc2VydmVyLnRzXCI7XG4gKiBjb25zdCBjZXJ0RmlsZSA9IFwiL3BhdGgvdG8vY2VydEZpbGUuY3J0XCI7XG4gKiBjb25zdCBrZXlGaWxlID0gXCIvcGF0aC90by9rZXlGaWxlLmtleVwiO1xuICogc2VydmVUbHMoKF9yZXEpID0+IG5ldyBSZXNwb25zZShcIkhlbGxvLCB3b3JsZFwiKSwge1xuICogICBjZXJ0RmlsZSxcbiAqICAga2V5RmlsZSxcbiAqICAgb25MaXN0ZW4oeyBwb3J0LCBob3N0bmFtZSB9KSB7XG4gKiAgICAgY29uc29sZS5sb2coYFNlcnZlciBzdGFydGVkIGF0IGh0dHBzOi8vJHtob3N0bmFtZX06JHtwb3J0fWApO1xuICogICAgIC8vIC4uLiBtb3JlIGluZm8gc3BlY2lmaWMgdG8geW91ciBzZXJ2ZXIgLi5cbiAqICAgfSxcbiAqIH0pO1xuICogYGBgXG4gKlxuICogWW91IGNhbiBhbHNvIHNwZWNpZnkgYHVuZGVmaW5lZGAgb3IgYG51bGxgIHRvIHN0b3AgdGhlIGxvZ2dpbmcgYmVoYXZpb3IuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHNlcnZlVGxzIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAqIGNvbnN0IGNlcnRGaWxlID0gXCIvcGF0aC90by9jZXJ0RmlsZS5jcnRcIjtcbiAqIGNvbnN0IGtleUZpbGUgPSBcIi9wYXRoL3RvL2tleUZpbGUua2V5XCI7XG4gKiBzZXJ2ZVRscygoX3JlcSkgPT4gbmV3IFJlc3BvbnNlKFwiSGVsbG8sIHdvcmxkXCIpLCB7XG4gKiAgIGNlcnRGaWxlLFxuICogICBrZXlGaWxlLFxuICogICBvbkxpc3RlbjogdW5kZWZpbmVkLFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gaGFuZGxlciBUaGUgaGFuZGxlciBmb3IgaW5kaXZpZHVhbCBIVFRQUyByZXF1ZXN0cy5cbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zLiBTZWUgYFNlcnZlVGxzSW5pdGAgZG9jdW1lbnRhdGlvbiBmb3IgZGV0YWlscy5cbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXJ2ZVRscyhcbiAgaGFuZGxlcjogSGFuZGxlcixcbiAgb3B0aW9uczogU2VydmVUbHNJbml0LFxuKSB7XG4gIGlmICghb3B0aW9ucy5rZXkgJiYgIW9wdGlvbnMua2V5RmlsZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlRMUyBjb25maWcgaXMgZ2l2ZW4sIGJ1dCAna2V5JyBpcyBtaXNzaW5nLlwiKTtcbiAgfVxuXG4gIGlmICghb3B0aW9ucy5jZXJ0ICYmICFvcHRpb25zLmNlcnRGaWxlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVExTIGNvbmZpZyBpcyBnaXZlbiwgYnV0ICdjZXJ0JyBpcyBtaXNzaW5nLlwiKTtcbiAgfVxuXG4gIGxldCBwb3J0ID0gb3B0aW9ucy5wb3J0ID8/IDg0NDM7XG4gIGlmICh0eXBlb2YgcG9ydCAhPT0gXCJudW1iZXJcIikge1xuICAgIHBvcnQgPSBOdW1iZXIocG9ydCk7XG4gIH1cblxuICBjb25zdCBob3N0bmFtZSA9IG9wdGlvbnMuaG9zdG5hbWUgPz8gXCIwLjAuMC4wXCI7XG4gIGNvbnN0IHNlcnZlciA9IG5ldyBTZXJ2ZXIoe1xuICAgIHBvcnQsXG4gICAgaG9zdG5hbWUsXG4gICAgaGFuZGxlcixcbiAgICBvbkVycm9yOiBvcHRpb25zLm9uRXJyb3IsXG4gIH0pO1xuXG4gIG9wdGlvbnM/LnNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsICgpID0+IHNlcnZlci5jbG9zZSgpLCB7XG4gICAgb25jZTogdHJ1ZSxcbiAgfSk7XG5cbiAgY29uc3Qga2V5ID0gb3B0aW9ucy5rZXkgfHwgRGVuby5yZWFkVGV4dEZpbGVTeW5jKG9wdGlvbnMua2V5RmlsZSEpO1xuICBjb25zdCBjZXJ0ID0gb3B0aW9ucy5jZXJ0IHx8IERlbm8ucmVhZFRleHRGaWxlU3luYyhvcHRpb25zLmNlcnRGaWxlISk7XG5cbiAgY29uc3QgbGlzdGVuZXIgPSBEZW5vLmxpc3RlblRscyh7XG4gICAgcG9ydCxcbiAgICBob3N0bmFtZSxcbiAgICBjZXJ0LFxuICAgIGtleSxcbiAgICB0cmFuc3BvcnQ6IFwidGNwXCIsXG4gICAgLy8gQUxQTiBwcm90b2NvbCBzdXBwb3J0IG5vdCB5ZXQgc3RhYmxlLlxuICAgIC8vIGFscG5Qcm90b2NvbHM6IFtcImgyXCIsIFwiaHR0cC8xLjFcIl0sXG4gIH0pO1xuXG4gIGNvbnN0IHMgPSBzZXJ2ZXIuc2VydmUobGlzdGVuZXIpO1xuXG4gIHBvcnQgPSAoc2VydmVyLmFkZHJzWzBdIGFzIERlbm8uTmV0QWRkcikucG9ydDtcblxuICBpZiAoXCJvbkxpc3RlblwiIGluIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zLm9uTGlzdGVuPy4oeyBwb3J0LCBob3N0bmFtZSB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIGBMaXN0ZW5pbmcgb24gaHR0cHM6Ly8ke2hvc3RuYW1lRm9yRGlzcGxheShob3N0bmFtZSl9OiR7cG9ydH0vYCxcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGF3YWl0IHM7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQVMsS0FBSyxRQUFRLG9CQUFvQjtBQUUxQywrQ0FBK0MsR0FDL0MsTUFBTSxzQkFB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