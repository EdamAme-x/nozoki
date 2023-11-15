// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { delay } from "../async/mod.ts";
/** Thrown by Server after it has been closed. */ const ERROR_SERVER_CLOSED = "Server closed";
/** Default port for serving HTTP. */ const HTTP_PORT = 80;
/** Default port for serving HTTPS. */ const HTTPS_PORT = 443;
/** Initial backoff delay of 5ms following a temporary accept failure. */ const INITIAL_ACCEPT_BACKOFF_DELAY = 5;
/** Max backoff delay of 1s following a temporary accept failure. */ const MAX_ACCEPT_BACKOFF_DELAY = 1000;
/** Used to construct an HTTP server. */ export class Server {
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
/** Serves HTTP requests with the given handler.
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
/** Serves HTTPS requests with the given handler.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE5My4wL2h0dHAvc2VydmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyBkZWxheSB9IGZyb20gXCIuLi9hc3luYy9tb2QudHNcIjtcblxuLyoqIFRocm93biBieSBTZXJ2ZXIgYWZ0ZXIgaXQgaGFzIGJlZW4gY2xvc2VkLiAqL1xuY29uc3QgRVJST1JfU0VSVkVSX0NMT1NFRCA9IFwiU2VydmVyIGNsb3NlZFwiO1xuXG4vKiogRGVmYXVsdCBwb3J0IGZvciBzZXJ2aW5nIEhUVFAuICovXG5jb25zdCBIVFRQX1BPUlQgPSA4MDtcblxuLyoqIERlZmF1bHQgcG9ydCBmb3Igc2VydmluZyBIVFRQUy4gKi9cbmNvbnN0IEhUVFBTX1BPUlQgPSA0NDM7XG5cbi8qKiBJbml0aWFsIGJhY2tvZmYgZGVsYXkgb2YgNW1zIGZvbGxvd2luZyBhIHRlbXBvcmFyeSBhY2NlcHQgZmFpbHVyZS4gKi9cbmNvbnN0IElOSVRJQUxfQUNDRVBUX0JBQ0tPRkZfREVMQVkgPSA1O1xuXG4vKiogTWF4IGJhY2tvZmYgZGVsYXkgb2YgMXMgZm9sbG93aW5nIGEgdGVtcG9yYXJ5IGFjY2VwdCBmYWlsdXJlLiAqL1xuY29uc3QgTUFYX0FDQ0VQVF9CQUNLT0ZGX0RFTEFZID0gMTAwMDtcblxuLyoqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjb25uZWN0aW9uIGEgcmVxdWVzdCBhcnJpdmVkIG9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb25uSW5mbyB7XG4gIC8qKiBUaGUgbG9jYWwgYWRkcmVzcyBvZiB0aGUgY29ubmVjdGlvbi4gKi9cbiAgcmVhZG9ubHkgbG9jYWxBZGRyOiBEZW5vLkFkZHI7XG4gIC8qKiBUaGUgcmVtb3RlIGFkZHJlc3Mgb2YgdGhlIGNvbm5lY3Rpb24uICovXG4gIHJlYWRvbmx5IHJlbW90ZUFkZHI6IERlbm8uQWRkcjtcbn1cblxuLyoqXG4gKiBBIGhhbmRsZXIgZm9yIEhUVFAgcmVxdWVzdHMuIENvbnN1bWVzIGEgcmVxdWVzdCBhbmQgY29ubmVjdGlvbiBpbmZvcm1hdGlvblxuICogYW5kIHJldHVybnMgYSByZXNwb25zZS5cbiAqXG4gKiBJZiBhIGhhbmRsZXIgdGhyb3dzLCB0aGUgc2VydmVyIGNhbGxpbmcgdGhlIGhhbmRsZXIgd2lsbCBhc3N1bWUgdGhlIGltcGFjdFxuICogb2YgdGhlIGVycm9yIGlzIGlzb2xhdGVkIHRvIHRoZSBpbmRpdmlkdWFsIHJlcXVlc3QuIEl0IHdpbGwgY2F0Y2ggdGhlIGVycm9yXG4gKiBhbmQgY2xvc2UgdGhlIHVuZGVybHlpbmcgY29ubmVjdGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgSGFuZGxlciA9IChcbiAgcmVxdWVzdDogUmVxdWVzdCxcbiAgY29ubkluZm86IENvbm5JbmZvLFxuKSA9PiBSZXNwb25zZSB8IFByb21pc2U8UmVzcG9uc2U+O1xuXG4vKiogT3B0aW9ucyBmb3IgcnVubmluZyBhbiBIVFRQIHNlcnZlci4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VydmVySW5pdCBleHRlbmRzIFBhcnRpYWw8RGVuby5MaXN0ZW5PcHRpb25zPiB7XG4gIC8qKiBUaGUgaGFuZGxlciB0byBpbnZva2UgZm9yIGluZGl2aWR1YWwgSFRUUCByZXF1ZXN0cy4gKi9cbiAgaGFuZGxlcjogSGFuZGxlcjtcblxuICAvKipcbiAgICogVGhlIGhhbmRsZXIgdG8gaW52b2tlIHdoZW4gcm91dGUgaGFuZGxlcnMgdGhyb3cgYW4gZXJyb3IuXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IGVycm9yIGhhbmRsZXIgbG9ncyBhbmQgcmV0dXJucyB0aGUgZXJyb3IgaW4gSlNPTiBmb3JtYXQuXG4gICAqL1xuICBvbkVycm9yPzogKGVycm9yOiB1bmtub3duKSA9PiBSZXNwb25zZSB8IFByb21pc2U8UmVzcG9uc2U+O1xufVxuXG4vKiogVXNlZCB0byBjb25zdHJ1Y3QgYW4gSFRUUCBzZXJ2ZXIuICovXG5leHBvcnQgY2xhc3MgU2VydmVyIHtcbiAgI3BvcnQ/OiBudW1iZXI7XG4gICNob3N0Pzogc3RyaW5nO1xuICAjaGFuZGxlcjogSGFuZGxlcjtcbiAgI2Nsb3NlZCA9IGZhbHNlO1xuICAjbGlzdGVuZXJzOiBTZXQ8RGVuby5MaXN0ZW5lcj4gPSBuZXcgU2V0KCk7XG4gICNhY2NlcHRCYWNrb2ZmRGVsYXlBYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICNodHRwQ29ubmVjdGlvbnM6IFNldDxEZW5vLkh0dHBDb25uPiA9IG5ldyBTZXQoKTtcbiAgI29uRXJyb3I6IChlcnJvcjogdW5rbm93bikgPT4gUmVzcG9uc2UgfCBQcm9taXNlPFJlc3BvbnNlPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIG5ldyBIVFRQIFNlcnZlciBpbnN0YW5jZS5cbiAgICpcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgU2VydmVyIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAgICpcbiAgICogY29uc3QgcG9ydCA9IDQ1MDU7XG4gICAqIGNvbnN0IGhhbmRsZXIgPSAocmVxdWVzdDogUmVxdWVzdCkgPT4ge1xuICAgKiAgIGNvbnN0IGJvZHkgPSBgWW91ciB1c2VyLWFnZW50IGlzOlxcblxcbiR7cmVxdWVzdC5oZWFkZXJzLmdldChcbiAgICogICAgXCJ1c2VyLWFnZW50XCIsXG4gICAqICAgKSA/PyBcIlVua25vd25cIn1gO1xuICAgKlxuICAgKiAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgeyBzdGF0dXM6IDIwMCB9KTtcbiAgICogfTtcbiAgICpcbiAgICogY29uc3Qgc2VydmVyID0gbmV3IFNlcnZlcih7IHBvcnQsIGhhbmRsZXIgfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gc2VydmVySW5pdCBPcHRpb25zIGZvciBydW5uaW5nIGFuIEhUVFAgc2VydmVyLlxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2VydmVySW5pdDogU2VydmVySW5pdCkge1xuICAgIHRoaXMuI3BvcnQgPSBzZXJ2ZXJJbml0LnBvcnQ7XG4gICAgdGhpcy4jaG9zdCA9IHNlcnZlckluaXQuaG9zdG5hbWU7XG4gICAgdGhpcy4jaGFuZGxlciA9IHNlcnZlckluaXQuaGFuZGxlcjtcbiAgICB0aGlzLiNvbkVycm9yID0gc2VydmVySW5pdC5vbkVycm9yID8/XG4gICAgICBmdW5jdGlvbiAoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXCJJbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcIiwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQWNjZXB0IGluY29taW5nIGNvbm5lY3Rpb25zIG9uIHRoZSBnaXZlbiBsaXN0ZW5lciwgYW5kIGhhbmRsZSByZXF1ZXN0cyBvblxuICAgKiB0aGVzZSBjb25uZWN0aW9ucyB3aXRoIHRoZSBnaXZlbiBoYW5kbGVyLlxuICAgKlxuICAgKiBIVFRQLzIgc3VwcG9ydCBpcyBvbmx5IGVuYWJsZWQgaWYgdGhlIHByb3ZpZGVkIERlbm8uTGlzdGVuZXIgcmV0dXJucyBUTFNcbiAgICogY29ubmVjdGlvbnMgYW5kIHdhcyBjb25maWd1cmVkIHdpdGggXCJoMlwiIGluIHRoZSBBTFBOIHByb3RvY29scy5cbiAgICpcbiAgICogVGhyb3dzIGEgc2VydmVyIGNsb3NlZCBlcnJvciBpZiBjYWxsZWQgYWZ0ZXIgdGhlIHNlcnZlciBoYXMgYmVlbiBjbG9zZWQuXG4gICAqXG4gICAqIFdpbGwgYWx3YXlzIGNsb3NlIHRoZSBjcmVhdGVkIGxpc3RlbmVyLlxuICAgKlxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBTZXJ2ZXIgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9odHRwL3NlcnZlci50c1wiO1xuICAgKlxuICAgKiBjb25zdCBoYW5kbGVyID0gKHJlcXVlc3Q6IFJlcXVlc3QpID0+IHtcbiAgICogICBjb25zdCBib2R5ID0gYFlvdXIgdXNlci1hZ2VudCBpczpcXG5cXG4ke3JlcXVlc3QuaGVhZGVycy5nZXQoXG4gICAqICAgIFwidXNlci1hZ2VudFwiLFxuICAgKiAgICkgPz8gXCJVbmtub3duXCJ9YDtcbiAgICpcbiAgICogICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHsgc3RhdHVzOiAyMDAgfSk7XG4gICAqIH07XG4gICAqXG4gICAqIGNvbnN0IHNlcnZlciA9IG5ldyBTZXJ2ZXIoeyBoYW5kbGVyIH0pO1xuICAgKiBjb25zdCBsaXN0ZW5lciA9IERlbm8ubGlzdGVuKHsgcG9ydDogNDUwNSB9KTtcbiAgICpcbiAgICogY29uc29sZS5sb2coXCJzZXJ2ZXIgbGlzdGVuaW5nIG9uIGh0dHA6Ly9sb2NhbGhvc3Q6NDUwNVwiKTtcbiAgICpcbiAgICogYXdhaXQgc2VydmVyLnNlcnZlKGxpc3RlbmVyKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgdG8gYWNjZXB0IGNvbm5lY3Rpb25zIGZyb20uXG4gICAqL1xuICBhc3luYyBzZXJ2ZShsaXN0ZW5lcjogRGVuby5MaXN0ZW5lcikge1xuICAgIGlmICh0aGlzLiNjbG9zZWQpIHtcbiAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5IdHRwKEVSUk9SX1NFUlZFUl9DTE9TRUQpO1xuICAgIH1cblxuICAgIHRoaXMuI3RyYWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLiNhY2NlcHQobGlzdGVuZXIpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLiN1bnRyYWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuXG4gICAgICB0cnkge1xuICAgICAgICBsaXN0ZW5lci5jbG9zZSgpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIExpc3RlbmVyIGhhcyBhbHJlYWR5IGJlZW4gY2xvc2VkLlxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsaXN0ZW5lciBvbiB0aGUgc2VydmVyLCBhY2NlcHQgaW5jb21pbmcgY29ubmVjdGlvbnMsIGFuZCBoYW5kbGVcbiAgICogcmVxdWVzdHMgb24gdGhlc2UgY29ubmVjdGlvbnMgd2l0aCB0aGUgZ2l2ZW4gaGFuZGxlci5cbiAgICpcbiAgICogSWYgdGhlIHNlcnZlciB3YXMgY29uc3RydWN0ZWQgd2l0aG91dCBhIHNwZWNpZmllZCBwb3J0LCA4MCBpcyB1c2VkLlxuICAgKlxuICAgKiBJZiB0aGUgc2VydmVyIHdhcyBjb25zdHJ1Y3RlZCB3aXRoIHRoZSBob3N0bmFtZSBvbWl0dGVkIGZyb20gdGhlIG9wdGlvbnMsIHRoZVxuICAgKiBub24tcm91dGFibGUgbWV0YS1hZGRyZXNzIGAwLjAuMC4wYCBpcyB1c2VkLlxuICAgKlxuICAgKiBUaHJvd3MgYSBzZXJ2ZXIgY2xvc2VkIGVycm9yIGlmIHRoZSBzZXJ2ZXIgaGFzIGJlZW4gY2xvc2VkLlxuICAgKlxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBTZXJ2ZXIgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9odHRwL3NlcnZlci50c1wiO1xuICAgKlxuICAgKiBjb25zdCBwb3J0ID0gNDUwNTtcbiAgICogY29uc3QgaGFuZGxlciA9IChyZXF1ZXN0OiBSZXF1ZXN0KSA9PiB7XG4gICAqICAgY29uc3QgYm9keSA9IGBZb3VyIHVzZXItYWdlbnQgaXM6XFxuXFxuJHtyZXF1ZXN0LmhlYWRlcnMuZ2V0KFxuICAgKiAgICBcInVzZXItYWdlbnRcIixcbiAgICogICApID8/IFwiVW5rbm93blwifWA7XG4gICAqXG4gICAqICAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5LCB7IHN0YXR1czogMjAwIH0pO1xuICAgKiB9O1xuICAgKlxuICAgKiBjb25zdCBzZXJ2ZXIgPSBuZXcgU2VydmVyKHsgcG9ydCwgaGFuZGxlciB9KTtcbiAgICpcbiAgICogY29uc29sZS5sb2coXCJzZXJ2ZXIgbGlzdGVuaW5nIG9uIGh0dHA6Ly9sb2NhbGhvc3Q6NDUwNVwiKTtcbiAgICpcbiAgICogYXdhaXQgc2VydmVyLmxpc3RlbkFuZFNlcnZlKCk7XG4gICAqIGBgYFxuICAgKi9cbiAgYXN5bmMgbGlzdGVuQW5kU2VydmUoKSB7XG4gICAgaWYgKHRoaXMuI2Nsb3NlZCkge1xuICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkh0dHAoRVJST1JfU0VSVkVSX0NMT1NFRCk7XG4gICAgfVxuXG4gICAgY29uc3QgbGlzdGVuZXIgPSBEZW5vLmxpc3Rlbih7XG4gICAgICBwb3J0OiB0aGlzLiNwb3J0ID8/IEhUVFBfUE9SVCxcbiAgICAgIGhvc3RuYW1lOiB0aGlzLiNob3N0ID8/IFwiMC4wLjAuMFwiLFxuICAgICAgdHJhbnNwb3J0OiBcInRjcFwiLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc2VydmUobGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxpc3RlbmVyIG9uIHRoZSBzZXJ2ZXIsIGFjY2VwdCBpbmNvbWluZyBjb25uZWN0aW9ucywgdXBncmFkZSB0aGVtXG4gICAqIHRvIFRMUywgYW5kIGhhbmRsZSByZXF1ZXN0cyBvbiB0aGVzZSBjb25uZWN0aW9ucyB3aXRoIHRoZSBnaXZlbiBoYW5kbGVyLlxuICAgKlxuICAgKiBJZiB0aGUgc2VydmVyIHdhcyBjb25zdHJ1Y3RlZCB3aXRob3V0IGEgc3BlY2lmaWVkIHBvcnQsIDQ0MyBpcyB1c2VkLlxuICAgKlxuICAgKiBJZiB0aGUgc2VydmVyIHdhcyBjb25zdHJ1Y3RlZCB3aXRoIHRoZSBob3N0bmFtZSBvbWl0dGVkIGZyb20gdGhlIG9wdGlvbnMsIHRoZVxuICAgKiBub24tcm91dGFibGUgbWV0YS1hZGRyZXNzIGAwLjAuMC4wYCBpcyB1c2VkLlxuICAgKlxuICAgKiBUaHJvd3MgYSBzZXJ2ZXIgY2xvc2VkIGVycm9yIGlmIHRoZSBzZXJ2ZXIgaGFzIGJlZW4gY2xvc2VkLlxuICAgKlxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQgeyBTZXJ2ZXIgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9odHRwL3NlcnZlci50c1wiO1xuICAgKlxuICAgKiBjb25zdCBwb3J0ID0gNDUwNTtcbiAgICogY29uc3QgaGFuZGxlciA9IChyZXF1ZXN0OiBSZXF1ZXN0KSA9PiB7XG4gICAqICAgY29uc3QgYm9keSA9IGBZb3VyIHVzZXItYWdlbnQgaXM6XFxuXFxuJHtyZXF1ZXN0LmhlYWRlcnMuZ2V0KFxuICAgKiAgICBcInVzZXItYWdlbnRcIixcbiAgICogICApID8/IFwiVW5rbm93blwifWA7XG4gICAqXG4gICAqICAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5LCB7IHN0YXR1czogMjAwIH0pO1xuICAgKiB9O1xuICAgKlxuICAgKiBjb25zdCBzZXJ2ZXIgPSBuZXcgU2VydmVyKHsgcG9ydCwgaGFuZGxlciB9KTtcbiAgICpcbiAgICogY29uc3QgY2VydEZpbGUgPSBcIi9wYXRoL3RvL2NlcnRGaWxlLmNydFwiO1xuICAgKiBjb25zdCBrZXlGaWxlID0gXCIvcGF0aC90by9rZXlGaWxlLmtleVwiO1xuICAgKlxuICAgKiBjb25zb2xlLmxvZyhcInNlcnZlciBsaXN0ZW5pbmcgb24gaHR0cHM6Ly9sb2NhbGhvc3Q6NDUwNVwiKTtcbiAgICpcbiAgICogYXdhaXQgc2VydmVyLmxpc3RlbkFuZFNlcnZlVGxzKGNlcnRGaWxlLCBrZXlGaWxlKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBjZXJ0RmlsZSBUaGUgcGF0aCB0byB0aGUgZmlsZSBjb250YWluaW5nIHRoZSBUTFMgY2VydGlmaWNhdGUuXG4gICAqIEBwYXJhbSBrZXlGaWxlIFRoZSBwYXRoIHRvIHRoZSBmaWxlIGNvbnRhaW5pbmcgdGhlIFRMUyBwcml2YXRlIGtleS5cbiAgICovXG4gIGFzeW5jIGxpc3RlbkFuZFNlcnZlVGxzKGNlcnRGaWxlOiBzdHJpbmcsIGtleUZpbGU6IHN0cmluZykge1xuICAgIGlmICh0aGlzLiNjbG9zZWQpIHtcbiAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5IdHRwKEVSUk9SX1NFUlZFUl9DTE9TRUQpO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbmVyID0gRGVuby5saXN0ZW5UbHMoe1xuICAgICAgcG9ydDogdGhpcy4jcG9ydCA/PyBIVFRQU19QT1JULFxuICAgICAgaG9zdG5hbWU6IHRoaXMuI2hvc3QgPz8gXCIwLjAuMC4wXCIsXG4gICAgICBjZXJ0RmlsZSxcbiAgICAgIGtleUZpbGUsXG4gICAgICB0cmFuc3BvcnQ6IFwidGNwXCIsXG4gICAgICAvLyBBTFBOIHByb3RvY29sIHN1cHBvcnQgbm90IHlldCBzdGFibGUuXG4gICAgICAvLyBhbHBuUHJvdG9jb2xzOiBbXCJoMlwiLCBcImh0dHAvMS4xXCJdLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc2VydmUobGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEltbWVkaWF0ZWx5IGNsb3NlIHRoZSBzZXJ2ZXIgbGlzdGVuZXJzIGFuZCBhc3NvY2lhdGVkIEhUVFAgY29ubmVjdGlvbnMuXG4gICAqXG4gICAqIFRocm93cyBhIHNlcnZlciBjbG9zZWQgZXJyb3IgaWYgY2FsbGVkIGFmdGVyIHRoZSBzZXJ2ZXIgaGFzIGJlZW4gY2xvc2VkLlxuICAgKi9cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMuI2Nsb3NlZCkge1xuICAgICAgdGhyb3cgbmV3IERlbm8uZXJyb3JzLkh0dHAoRVJST1JfU0VSVkVSX0NMT1NFRCk7XG4gICAgfVxuXG4gICAgdGhpcy4jY2xvc2VkID0gdHJ1ZTtcblxuICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgdGhpcy4jbGlzdGVuZXJzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBsaXN0ZW5lci5jbG9zZSgpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIExpc3RlbmVyIGhhcyBhbHJlYWR5IGJlZW4gY2xvc2VkLlxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuI2xpc3RlbmVycy5jbGVhcigpO1xuXG4gICAgdGhpcy4jYWNjZXB0QmFja29mZkRlbGF5QWJvcnRDb250cm9sbGVyLmFib3J0KCk7XG5cbiAgICBmb3IgKGNvbnN0IGh0dHBDb25uIG9mIHRoaXMuI2h0dHBDb25uZWN0aW9ucykge1xuICAgICAgdGhpcy4jY2xvc2VIdHRwQ29ubihodHRwQ29ubik7XG4gICAgfVxuXG4gICAgdGhpcy4jaHR0cENvbm5lY3Rpb25zLmNsZWFyKCk7XG4gIH1cblxuICAvKiogR2V0IHdoZXRoZXIgdGhlIHNlcnZlciBpcyBjbG9zZWQuICovXG4gIGdldCBjbG9zZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuI2Nsb3NlZDtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGxpc3Qgb2YgbmV0d29yayBhZGRyZXNzZXMgdGhlIHNlcnZlciBpcyBsaXN0ZW5pbmcgb24uICovXG4gIGdldCBhZGRycygpOiBEZW5vLkFkZHJbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy4jbGlzdGVuZXJzKS5tYXAoKGxpc3RlbmVyKSA9PiBsaXN0ZW5lci5hZGRyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNwb25kcyB0byBhbiBIVFRQIHJlcXVlc3QuXG4gICAqXG4gICAqIEBwYXJhbSByZXF1ZXN0RXZlbnQgVGhlIEhUVFAgcmVxdWVzdCB0byByZXNwb25kIHRvLlxuICAgKiBAcGFyYW0gY29ubkluZm8gSW5mb3JtYXRpb24gYWJvdXQgdGhlIHVuZGVybHlpbmcgY29ubmVjdGlvbi5cbiAgICovXG4gIGFzeW5jICNyZXNwb25kKFxuICAgIHJlcXVlc3RFdmVudDogRGVuby5SZXF1ZXN0RXZlbnQsXG4gICAgY29ubkluZm86IENvbm5JbmZvLFxuICApIHtcbiAgICBsZXQgcmVzcG9uc2U6IFJlc3BvbnNlO1xuICAgIHRyeSB7XG4gICAgICAvLyBIYW5kbGUgdGhlIHJlcXVlc3QgZXZlbnQsIGdlbmVyYXRpbmcgYSByZXNwb25zZS5cbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgdGhpcy4jaGFuZGxlcihyZXF1ZXN0RXZlbnQucmVxdWVzdCwgY29ubkluZm8pO1xuXG4gICAgICBpZiAocmVzcG9uc2UuYm9keVVzZWQgJiYgcmVzcG9uc2UuYm9keSAhPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVzcG9uc2UgYm9keSBhbHJlYWR5IGNvbnN1bWVkLlwiKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgLy8gSW52b2tlIG9uRXJyb3IgaGFuZGxlciB3aGVuIHJlcXVlc3QgaGFuZGxlciB0aHJvd3MuXG4gICAgICByZXNwb25zZSA9IGF3YWl0IHRoaXMuI29uRXJyb3IoZXJyb3IpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAvLyBTZW5kIHRoZSByZXNwb25zZS5cbiAgICAgIGF3YWl0IHJlcXVlc3RFdmVudC5yZXNwb25kV2l0aChyZXNwb25zZSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBgcmVzcG9uZFdpdGgoKWAgY2FuIHRocm93IGZvciB2YXJpb3VzIHJlYXNvbnMsIGluY2x1ZGluZyBkb3duc3RyZWFtIGFuZFxuICAgICAgLy8gdXBzdHJlYW0gY29ubmVjdGlvbiBlcnJvcnMsIGFzIHdlbGwgYXMgZXJyb3JzIHRocm93biBkdXJpbmcgc3RyZWFtaW5nXG4gICAgICAvLyBvZiB0aGUgcmVzcG9uc2UgY29udGVudC4gIEluIG9yZGVyIHRvIGF2b2lkIGZhbHNlIG5lZ2F0aXZlcywgd2UgaWdub3JlXG4gICAgICAvLyB0aGUgZXJyb3IgaGVyZSBhbmQgbGV0IGBzZXJ2ZUh0dHBgIGNsb3NlIHRoZSBjb25uZWN0aW9uIG9uIHRoZVxuICAgICAgLy8gZm9sbG93aW5nIGl0ZXJhdGlvbiBpZiBpdCBpcyBpbiBmYWN0IGEgZG93bnN0cmVhbSBjb25uZWN0aW9uIGVycm9yLlxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXJ2ZXMgYWxsIEhUVFAgcmVxdWVzdHMgb24gYSBzaW5nbGUgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIGh0dHBDb25uIFRoZSBIVFRQIGNvbm5lY3Rpb24gdG8geWllbGQgcmVxdWVzdHMgZnJvbS5cbiAgICogQHBhcmFtIGNvbm5JbmZvIEluZm9ybWF0aW9uIGFib3V0IHRoZSB1bmRlcmx5aW5nIGNvbm5lY3Rpb24uXG4gICAqL1xuICBhc3luYyAjc2VydmVIdHRwKGh0dHBDb25uOiBEZW5vLkh0dHBDb25uLCBjb25uSW5mbzogQ29ubkluZm8pIHtcbiAgICB3aGlsZSAoIXRoaXMuI2Nsb3NlZCkge1xuICAgICAgbGV0IHJlcXVlc3RFdmVudDogRGVuby5SZXF1ZXN0RXZlbnQgfCBudWxsO1xuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBZaWVsZCB0aGUgbmV3IEhUVFAgcmVxdWVzdCBvbiB0aGUgY29ubmVjdGlvbi5cbiAgICAgICAgcmVxdWVzdEV2ZW50ID0gYXdhaXQgaHR0cENvbm4ubmV4dFJlcXVlc3QoKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBDb25uZWN0aW9uIGhhcyBiZWVuIGNsb3NlZC5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXF1ZXN0RXZlbnQgPT09IG51bGwpIHtcbiAgICAgICAgLy8gQ29ubmVjdGlvbiBoYXMgYmVlbiBjbG9zZWQuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXNwb25kIHRvIHRoZSByZXF1ZXN0LiBOb3RlIHdlIGRvIG5vdCBhd2FpdCB0aGlzIGFzeW5jIG1ldGhvZCB0b1xuICAgICAgLy8gYWxsb3cgdGhlIGNvbm5lY3Rpb24gdG8gaGFuZGxlIG11bHRpcGxlIHJlcXVlc3RzIGluIHRoZSBjYXNlIG9mIGgyLlxuICAgICAgdGhpcy4jcmVzcG9uZChyZXF1ZXN0RXZlbnQsIGNvbm5JbmZvKTtcbiAgICB9XG5cbiAgICB0aGlzLiNjbG9zZUh0dHBDb25uKGh0dHBDb25uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBY2NlcHRzIGFsbCBjb25uZWN0aW9ucyBvbiBhIHNpbmdsZSBuZXR3b3JrIGxpc3RlbmVyLlxuICAgKlxuICAgKiBAcGFyYW0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIHRvIGFjY2VwdCBjb25uZWN0aW9ucyBmcm9tLlxuICAgKi9cbiAgYXN5bmMgI2FjY2VwdChsaXN0ZW5lcjogRGVuby5MaXN0ZW5lcikge1xuICAgIGxldCBhY2NlcHRCYWNrb2ZmRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAgIHdoaWxlICghdGhpcy4jY2xvc2VkKSB7XG4gICAgICBsZXQgY29ubjogRGVuby5Db25uO1xuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBXYWl0IGZvciBhIG5ldyBjb25uZWN0aW9uLlxuICAgICAgICBjb25uID0gYXdhaXQgbGlzdGVuZXIuYWNjZXB0KCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgLy8gVGhlIGxpc3RlbmVyIGlzIGNsb3NlZC5cbiAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkJhZFJlc291cmNlIHx8XG4gICAgICAgICAgLy8gVExTIGhhbmRzaGFrZSBlcnJvcnMuXG4gICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5JbnZhbGlkRGF0YSB8fFxuICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuVW5leHBlY3RlZEVvZiB8fFxuICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuQ29ubmVjdGlvblJlc2V0IHx8XG4gICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RDb25uZWN0ZWRcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gQmFja29mZiBhZnRlciB0cmFuc2llbnQgZXJyb3JzIHRvIGFsbG93IHRpbWUgZm9yIHRoZSBzeXN0ZW0gdG9cbiAgICAgICAgICAvLyByZWNvdmVyLCBhbmQgYXZvaWQgYmxvY2tpbmcgdXAgdGhlIGV2ZW50IGxvb3Agd2l0aCBhIGNvbnRpbnVvdXNseVxuICAgICAgICAgIC8vIHJ1bm5pbmcgbG9vcC5cbiAgICAgICAgICBpZiAoIWFjY2VwdEJhY2tvZmZEZWxheSkge1xuICAgICAgICAgICAgYWNjZXB0QmFja29mZkRlbGF5ID0gSU5JVElBTF9BQ0NFUFRfQkFDS09GRl9ERUxBWTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWNjZXB0QmFja29mZkRlbGF5ICo9IDI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGFjY2VwdEJhY2tvZmZEZWxheSA+PSBNQVhfQUNDRVBUX0JBQ0tPRkZfREVMQVkpIHtcbiAgICAgICAgICAgIGFjY2VwdEJhY2tvZmZEZWxheSA9IE1BWF9BQ0NFUFRfQkFDS09GRl9ERUxBWTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgZGVsYXkoYWNjZXB0QmFja29mZkRlbGF5LCB7XG4gICAgICAgICAgICAgIHNpZ25hbDogdGhpcy4jYWNjZXB0QmFja29mZkRlbGF5QWJvcnRDb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuICAgICAgICAgICAgLy8gVGhlIGJhY2tvZmYgZGVsYXkgdGltZXIgaXMgYWJvcnRlZCB3aGVuIGNsb3NpbmcgdGhlIHNlcnZlci5cbiAgICAgICAgICAgIGlmICghKGVyciBpbnN0YW5jZW9mIERPTUV4Y2VwdGlvbiAmJiBlcnIubmFtZSA9PT0gXCJBYm9ydEVycm9yXCIpKSB7XG4gICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuXG4gICAgICBhY2NlcHRCYWNrb2ZmRGVsYXkgPSB1bmRlZmluZWQ7XG5cbiAgICAgIC8vIFwiVXBncmFkZVwiIHRoZSBuZXR3b3JrIGNvbm5lY3Rpb24gaW50byBhbiBIVFRQIGNvbm5lY3Rpb24uXG4gICAgICBsZXQgaHR0cENvbm46IERlbm8uSHR0cENvbm47XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGh0dHBDb25uID0gRGVuby5zZXJ2ZUh0dHAoY29ubik7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gQ29ubmVjdGlvbiBoYXMgYmVlbiBjbG9zZWQuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBDbG9zaW5nIHRoZSB1bmRlcmx5aW5nIGxpc3RlbmVyIHdpbGwgbm90IGNsb3NlIEhUVFAgY29ubmVjdGlvbnMsIHNvIHdlXG4gICAgICAvLyB0cmFjayBmb3IgY2xvc3VyZSB1cG9uIHNlcnZlciBjbG9zZS5cbiAgICAgIHRoaXMuI3RyYWNrSHR0cENvbm5lY3Rpb24oaHR0cENvbm4pO1xuXG4gICAgICBjb25zdCBjb25uSW5mbzogQ29ubkluZm8gPSB7XG4gICAgICAgIGxvY2FsQWRkcjogY29ubi5sb2NhbEFkZHIsXG4gICAgICAgIHJlbW90ZUFkZHI6IGNvbm4ucmVtb3RlQWRkcixcbiAgICAgIH07XG5cbiAgICAgIC8vIFNlcnZlIHRoZSByZXF1ZXN0cyB0aGF0IGFycml2ZSBvbiB0aGUganVzdC1hY2NlcHRlZCBjb25uZWN0aW9uLiBOb3RlXG4gICAgICAvLyB3ZSBkbyBub3QgYXdhaXQgdGhpcyBhc3luYyBtZXRob2QgdG8gYWxsb3cgdGhlIHNlcnZlciB0byBhY2NlcHQgbmV3XG4gICAgICAvLyBjb25uZWN0aW9ucy5cbiAgICAgIHRoaXMuI3NlcnZlSHR0cChodHRwQ29ubiwgY29ubkluZm8pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVbnRyYWNrcyBhbmQgY2xvc2VzIGFuIEhUVFAgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIGh0dHBDb25uIFRoZSBIVFRQIGNvbm5lY3Rpb24gdG8gY2xvc2UuXG4gICAqL1xuICAjY2xvc2VIdHRwQ29ubihodHRwQ29ubjogRGVuby5IdHRwQ29ubikge1xuICAgIHRoaXMuI3VudHJhY2tIdHRwQ29ubmVjdGlvbihodHRwQ29ubik7XG5cbiAgICB0cnkge1xuICAgICAgaHR0cENvbm4uY2xvc2UoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIENvbm5lY3Rpb24gaGFzIGFscmVhZHkgYmVlbiBjbG9zZWQuXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIGxpc3RlbmVyIHRvIHRoZSBpbnRlcm5hbCB0cmFja2luZyBsaXN0LlxuICAgKlxuICAgKiBAcGFyYW0gbGlzdGVuZXIgTGlzdGVuZXIgdG8gdHJhY2suXG4gICAqL1xuICAjdHJhY2tMaXN0ZW5lcihsaXN0ZW5lcjogRGVuby5MaXN0ZW5lcikge1xuICAgIHRoaXMuI2xpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGxpc3RlbmVyIGZyb20gdGhlIGludGVybmFsIHRyYWNraW5nIGxpc3QuXG4gICAqXG4gICAqIEBwYXJhbSBsaXN0ZW5lciBMaXN0ZW5lciB0byB1bnRyYWNrLlxuICAgKi9cbiAgI3VudHJhY2tMaXN0ZW5lcihsaXN0ZW5lcjogRGVuby5MaXN0ZW5lcikge1xuICAgIHRoaXMuI2xpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIEhUVFAgY29ubmVjdGlvbiB0byB0aGUgaW50ZXJuYWwgdHJhY2tpbmcgbGlzdC5cbiAgICpcbiAgICogQHBhcmFtIGh0dHBDb25uIEhUVFAgY29ubmVjdGlvbiB0byB0cmFjay5cbiAgICovXG4gICN0cmFja0h0dHBDb25uZWN0aW9uKGh0dHBDb25uOiBEZW5vLkh0dHBDb25uKSB7XG4gICAgdGhpcy4jaHR0cENvbm5lY3Rpb25zLmFkZChodHRwQ29ubik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgSFRUUCBjb25uZWN0aW9uIGZyb20gdGhlIGludGVybmFsIHRyYWNraW5nIGxpc3QuXG4gICAqXG4gICAqIEBwYXJhbSBodHRwQ29ubiBIVFRQIGNvbm5lY3Rpb24gdG8gdW50cmFjay5cbiAgICovXG4gICN1bnRyYWNrSHR0cENvbm5lY3Rpb24oaHR0cENvbm46IERlbm8uSHR0cENvbm4pIHtcbiAgICB0aGlzLiNodHRwQ29ubmVjdGlvbnMuZGVsZXRlKGh0dHBDb25uKTtcbiAgfVxufVxuXG4vKiogQWRkaXRpb25hbCBzZXJ2ZSBvcHRpb25zLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZUluaXQgZXh0ZW5kcyBQYXJ0aWFsPERlbm8uTGlzdGVuT3B0aW9ucz4ge1xuICAvKiogQW4gQWJvcnRTaWduYWwgdG8gY2xvc2UgdGhlIHNlcnZlciBhbmQgYWxsIGNvbm5lY3Rpb25zLiAqL1xuICBzaWduYWw/OiBBYm9ydFNpZ25hbDtcblxuICAvKiogVGhlIGhhbmRsZXIgdG8gaW52b2tlIHdoZW4gcm91dGUgaGFuZGxlcnMgdGhyb3cgYW4gZXJyb3IuICovXG4gIG9uRXJyb3I/OiAoZXJyb3I6IHVua25vd24pID0+IFJlc3BvbnNlIHwgUHJvbWlzZTxSZXNwb25zZT47XG5cbiAgLyoqIFRoZSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiB0aGUgc2VydmVyIHN0YXJ0ZWQgbGlzdGVuaW5nICovXG4gIG9uTGlzdGVuPzogKHBhcmFtczogeyBob3N0bmFtZTogc3RyaW5nOyBwb3J0OiBudW1iZXIgfSkgPT4gdm9pZDtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgc2VydmVyLCBhY2NlcHRzIGluY29taW5nIGNvbm5lY3Rpb25zIG9uIHRoZSBnaXZlbiBsaXN0ZW5lciwgYW5kXG4gKiBoYW5kbGVzIHJlcXVlc3RzIG9uIHRoZXNlIGNvbm5lY3Rpb25zIHdpdGggdGhlIGdpdmVuIGhhbmRsZXIuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHNlcnZlTGlzdGVuZXIgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9odHRwL3NlcnZlci50c1wiO1xuICpcbiAqIGNvbnN0IGxpc3RlbmVyID0gRGVuby5saXN0ZW4oeyBwb3J0OiA0NTA1IH0pO1xuICpcbiAqIGNvbnNvbGUubG9nKFwic2VydmVyIGxpc3RlbmluZyBvbiBodHRwOi8vbG9jYWxob3N0OjQ1MDVcIik7XG4gKlxuICogYXdhaXQgc2VydmVMaXN0ZW5lcihsaXN0ZW5lciwgKHJlcXVlc3QpID0+IHtcbiAqICAgY29uc3QgYm9keSA9IGBZb3VyIHVzZXItYWdlbnQgaXM6XFxuXFxuJHtyZXF1ZXN0LmhlYWRlcnMuZ2V0KFxuICogICAgIFwidXNlci1hZ2VudFwiLFxuICogICApID8/IFwiVW5rbm93blwifWA7XG4gKlxuICogICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHsgc3RhdHVzOiAyMDAgfSk7XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgdG8gYWNjZXB0IGNvbm5lY3Rpb25zIGZyb20uXG4gKiBAcGFyYW0gaGFuZGxlciBUaGUgaGFuZGxlciBmb3IgaW5kaXZpZHVhbCBIVFRQIHJlcXVlc3RzLlxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9uYWwgc2VydmUgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlcnZlTGlzdGVuZXIoXG4gIGxpc3RlbmVyOiBEZW5vLkxpc3RlbmVyLFxuICBoYW5kbGVyOiBIYW5kbGVyLFxuICBvcHRpb25zPzogT21pdDxTZXJ2ZUluaXQsIFwicG9ydFwiIHwgXCJob3N0bmFtZVwiPixcbikge1xuICBjb25zdCBzZXJ2ZXIgPSBuZXcgU2VydmVyKHsgaGFuZGxlciwgb25FcnJvcjogb3B0aW9ucz8ub25FcnJvciB9KTtcblxuICBvcHRpb25zPy5zaWduYWw/LmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCAoKSA9PiBzZXJ2ZXIuY2xvc2UoKSwge1xuICAgIG9uY2U6IHRydWUsXG4gIH0pO1xuXG4gIHJldHVybiBhd2FpdCBzZXJ2ZXIuc2VydmUobGlzdGVuZXIpO1xufVxuXG5mdW5jdGlvbiBob3N0bmFtZUZvckRpc3BsYXkoaG9zdG5hbWU6IHN0cmluZykge1xuICAvLyBJZiB0aGUgaG9zdG5hbWUgaXMgXCIwLjAuMC4wXCIsIHdlIGRpc3BsYXkgXCJsb2NhbGhvc3RcIiBpbiBjb25zb2xlXG4gIC8vIGJlY2F1c2UgYnJvd3NlcnMgaW4gV2luZG93cyBkb24ndCByZXNvbHZlIFwiMC4wLjAuMFwiLlxuICAvLyBTZWUgdGhlIGRpc2N1c3Npb24gaW4gaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm9fc3RkL2lzc3Vlcy8xMTY1XG4gIHJldHVybiBob3N0bmFtZSA9PT0gXCIwLjAuMC4wXCIgPyBcImxvY2FsaG9zdFwiIDogaG9zdG5hbWU7XG59XG5cbi8qKiBTZXJ2ZXMgSFRUUCByZXF1ZXN0cyB3aXRoIHRoZSBnaXZlbiBoYW5kbGVyLlxuICpcbiAqIFlvdSBjYW4gc3BlY2lmeSBhbiBvYmplY3Qgd2l0aCBhIHBvcnQgYW5kIGhvc3RuYW1lIG9wdGlvbiwgd2hpY2ggaXMgdGhlXG4gKiBhZGRyZXNzIHRvIGxpc3RlbiBvbi4gVGhlIGRlZmF1bHQgaXMgcG9ydCA4MDAwIG9uIGhvc3RuYW1lIFwiMC4wLjAuMFwiLlxuICpcbiAqIFRoZSBiZWxvdyBleGFtcGxlIHNlcnZlcyB3aXRoIHRoZSBwb3J0IDgwMDAuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHNlcnZlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAqIHNlcnZlKChfcmVxKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGRcIikpO1xuICogYGBgXG4gKlxuICogWW91IGNhbiBjaGFuZ2UgdGhlIGxpc3RlbmluZyBhZGRyZXNzIGJ5IHRoZSBgaG9zdG5hbWVgIGFuZCBgcG9ydGAgb3B0aW9ucy5cbiAqIFRoZSBiZWxvdyBleGFtcGxlIHNlcnZlcyB3aXRoIHRoZSBwb3J0IDMwMDAuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHNlcnZlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAqIHNlcnZlKChfcmVxKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGRcIiksIHsgcG9ydDogMzAwMCB9KTtcbiAqIGBgYFxuICpcbiAqIGBzZXJ2ZWAgZnVuY3Rpb24gcHJpbnRzIHRoZSBtZXNzYWdlIGBMaXN0ZW5pbmcgb24gaHR0cDovLzxob3N0bmFtZT46PHBvcnQ+L2BcbiAqIG9uIHN0YXJ0LXVwIGJ5IGRlZmF1bHQuIElmIHlvdSBsaWtlIHRvIGNoYW5nZSB0aGlzIG1lc3NhZ2UsIHlvdSBjYW4gc3BlY2lmeVxuICogYG9uTGlzdGVuYCBvcHRpb24gdG8gb3ZlcnJpZGUgaXQuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHNlcnZlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAqIHNlcnZlKChfcmVxKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGRcIiksIHtcbiAqICAgb25MaXN0ZW4oeyBwb3J0LCBob3N0bmFtZSB9KSB7XG4gKiAgICAgY29uc29sZS5sb2coYFNlcnZlciBzdGFydGVkIGF0IGh0dHA6Ly8ke2hvc3RuYW1lfToke3BvcnR9YCk7XG4gKiAgICAgLy8gLi4uIG1vcmUgaW5mbyBzcGVjaWZpYyB0byB5b3VyIHNlcnZlciAuLlxuICogICB9LFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBZb3UgY2FuIGFsc28gc3BlY2lmeSBgdW5kZWZpbmVkYCBvciBgbnVsbGAgdG8gc3RvcCB0aGUgbG9nZ2luZyBiZWhhdmlvci5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgc2VydmUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9odHRwL3NlcnZlci50c1wiO1xuICogc2VydmUoKF9yZXEpID0+IG5ldyBSZXNwb25zZShcIkhlbGxvLCB3b3JsZFwiKSwgeyBvbkxpc3RlbjogdW5kZWZpbmVkIH0pO1xuICogYGBgXG4gKlxuICogQHBhcmFtIGhhbmRsZXIgVGhlIGhhbmRsZXIgZm9yIGluZGl2aWR1YWwgSFRUUCByZXF1ZXN0cy5cbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zLiBTZWUgYFNlcnZlSW5pdGAgZG9jdW1lbnRhdGlvbiBmb3IgZGV0YWlscy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlcnZlKFxuICBoYW5kbGVyOiBIYW5kbGVyLFxuICBvcHRpb25zOiBTZXJ2ZUluaXQgPSB7fSxcbikge1xuICBsZXQgcG9ydCA9IG9wdGlvbnMucG9ydCA/PyA4MDAwO1xuICBjb25zdCBob3N0bmFtZSA9IG9wdGlvbnMuaG9zdG5hbWUgPz8gXCIwLjAuMC4wXCI7XG4gIGNvbnN0IHNlcnZlciA9IG5ldyBTZXJ2ZXIoe1xuICAgIHBvcnQsXG4gICAgaG9zdG5hbWUsXG4gICAgaGFuZGxlcixcbiAgICBvbkVycm9yOiBvcHRpb25zLm9uRXJyb3IsXG4gIH0pO1xuXG4gIG9wdGlvbnM/LnNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsICgpID0+IHNlcnZlci5jbG9zZSgpLCB7XG4gICAgb25jZTogdHJ1ZSxcbiAgfSk7XG5cbiAgY29uc3QgbGlzdGVuZXIgPSBEZW5vLmxpc3Rlbih7XG4gICAgcG9ydCxcbiAgICBob3N0bmFtZSxcbiAgICB0cmFuc3BvcnQ6IFwidGNwXCIsXG4gIH0pO1xuXG4gIGNvbnN0IHMgPSBzZXJ2ZXIuc2VydmUobGlzdGVuZXIpO1xuXG4gIHBvcnQgPSAoc2VydmVyLmFkZHJzWzBdIGFzIERlbm8uTmV0QWRkcikucG9ydDtcblxuICBpZiAoXCJvbkxpc3RlblwiIGluIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zLm9uTGlzdGVuPy4oeyBwb3J0LCBob3N0bmFtZSB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhgTGlzdGVuaW5nIG9uIGh0dHA6Ly8ke2hvc3RuYW1lRm9yRGlzcGxheShob3N0bmFtZSl9OiR7cG9ydH0vYCk7XG4gIH1cblxuICByZXR1cm4gYXdhaXQgcztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTZXJ2ZVRsc0luaXQgZXh0ZW5kcyBTZXJ2ZUluaXQge1xuICAvKiogU2VydmVyIHByaXZhdGUga2V5IGluIFBFTSBmb3JtYXQgKi9cbiAga2V5Pzogc3RyaW5nO1xuXG4gIC8qKiBDZXJ0IGNoYWluIGluIFBFTSBmb3JtYXQgKi9cbiAgY2VydD86IHN0cmluZztcblxuICAvKiogVGhlIHBhdGggdG8gdGhlIGZpbGUgY29udGFpbmluZyB0aGUgVExTIHByaXZhdGUga2V5LiAqL1xuICBrZXlGaWxlPzogc3RyaW5nO1xuXG4gIC8qKiBUaGUgcGF0aCB0byB0aGUgZmlsZSBjb250YWluaW5nIHRoZSBUTFMgY2VydGlmaWNhdGUgKi9cbiAgY2VydEZpbGU/OiBzdHJpbmc7XG59XG5cbi8qKiBTZXJ2ZXMgSFRUUFMgcmVxdWVzdHMgd2l0aCB0aGUgZ2l2ZW4gaGFuZGxlci5cbiAqXG4gKiBZb3UgbXVzdCBzcGVjaWZ5IGBrZXlgIG9yIGBrZXlGaWxlYCBhbmQgYGNlcnRgIG9yIGBjZXJ0RmlsZWAgb3B0aW9ucy5cbiAqXG4gKiBZb3UgY2FuIHNwZWNpZnkgYW4gb2JqZWN0IHdpdGggYSBwb3J0IGFuZCBob3N0bmFtZSBvcHRpb24sIHdoaWNoIGlzIHRoZVxuICogYWRkcmVzcyB0byBsaXN0ZW4gb24uIFRoZSBkZWZhdWx0IGlzIHBvcnQgODQ0MyBvbiBob3N0bmFtZSBcIjAuMC4wLjBcIi5cbiAqXG4gKiBUaGUgYmVsb3cgZXhhbXBsZSBzZXJ2ZXMgd2l0aCB0aGUgZGVmYXVsdCBwb3J0IDg0NDMuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IHNlcnZlVGxzIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXIudHNcIjtcbiAqXG4gKiBjb25zdCBjZXJ0ID0gXCItLS0tLUJFR0lOIENFUlRJRklDQVRFLS0tLS1cXG4uLi5cXG4tLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tXFxuXCI7XG4gKiBjb25zdCBrZXkgPSBcIi0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxcbi4uLlxcbi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS1cXG5cIjtcbiAqIHNlcnZlVGxzKChfcmVxKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGRcIiksIHsgY2VydCwga2V5IH0pO1xuICpcbiAqIC8vIE9yXG4gKlxuICogY29uc3QgY2VydEZpbGUgPSBcIi9wYXRoL3RvL2NlcnRGaWxlLmNydFwiO1xuICogY29uc3Qga2V5RmlsZSA9IFwiL3BhdGgvdG8va2V5RmlsZS5rZXlcIjtcbiAqIHNlcnZlVGxzKChfcmVxKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGRcIiksIHsgY2VydEZpbGUsIGtleUZpbGUgfSk7XG4gKiBgYGBcbiAqXG4gKiBgc2VydmVUbHNgIGZ1bmN0aW9uIHByaW50cyB0aGUgbWVzc2FnZSBgTGlzdGVuaW5nIG9uIGh0dHBzOi8vPGhvc3RuYW1lPjo8cG9ydD4vYFxuICogb24gc3RhcnQtdXAgYnkgZGVmYXVsdC4gSWYgeW91IGxpa2UgdG8gY2hhbmdlIHRoaXMgbWVzc2FnZSwgeW91IGNhbiBzcGVjaWZ5XG4gKiBgb25MaXN0ZW5gIG9wdGlvbiB0byBvdmVycmlkZSBpdC5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgc2VydmVUbHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9odHRwL3NlcnZlci50c1wiO1xuICogY29uc3QgY2VydEZpbGUgPSBcIi9wYXRoL3RvL2NlcnRGaWxlLmNydFwiO1xuICogY29uc3Qga2V5RmlsZSA9IFwiL3BhdGgvdG8va2V5RmlsZS5rZXlcIjtcbiAqIHNlcnZlVGxzKChfcmVxKSA9PiBuZXcgUmVzcG9uc2UoXCJIZWxsbywgd29ybGRcIiksIHtcbiAqICAgY2VydEZpbGUsXG4gKiAgIGtleUZpbGUsXG4gKiAgIG9uTGlzdGVuKHsgcG9ydCwgaG9zdG5hbWUgfSkge1xuICogICAgIGNvbnNvbGUubG9nKGBTZXJ2ZXIgc3RhcnRlZCBhdCBodHRwczovLyR7aG9zdG5hbWV9OiR7cG9ydH1gKTtcbiAqICAgICAvLyAuLi4gbW9yZSBpbmZvIHNwZWNpZmljIHRvIHlvdXIgc2VydmVyIC4uXG4gKiAgIH0sXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIFlvdSBjYW4gYWxzbyBzcGVjaWZ5IGB1bmRlZmluZWRgIG9yIGBudWxsYCB0byBzdG9wIHRoZSBsb2dnaW5nIGJlaGF2aW9yLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBzZXJ2ZVRscyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2h0dHAvc2VydmVyLnRzXCI7XG4gKiBjb25zdCBjZXJ0RmlsZSA9IFwiL3BhdGgvdG8vY2VydEZpbGUuY3J0XCI7XG4gKiBjb25zdCBrZXlGaWxlID0gXCIvcGF0aC90by9rZXlGaWxlLmtleVwiO1xuICogc2VydmVUbHMoKF9yZXEpID0+IG5ldyBSZXNwb25zZShcIkhlbGxvLCB3b3JsZFwiKSwge1xuICogICBjZXJ0RmlsZSxcbiAqICAga2V5RmlsZSxcbiAqICAgb25MaXN0ZW46IHVuZGVmaW5lZCxcbiAqIH0pO1xuICogYGBgXG4gKlxuICogQHBhcmFtIGhhbmRsZXIgVGhlIGhhbmRsZXIgZm9yIGluZGl2aWR1YWwgSFRUUFMgcmVxdWVzdHMuXG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgb3B0aW9ucy4gU2VlIGBTZXJ2ZVRsc0luaXRgIGRvY3VtZW50YXRpb24gZm9yIGRldGFpbHMuXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VydmVUbHMoXG4gIGhhbmRsZXI6IEhhbmRsZXIsXG4gIG9wdGlvbnM6IFNlcnZlVGxzSW5pdCxcbikge1xuICBpZiAoIW9wdGlvbnMua2V5ICYmICFvcHRpb25zLmtleUZpbGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUTFMgY29uZmlnIGlzIGdpdmVuLCBidXQgJ2tleScgaXMgbWlzc2luZy5cIik7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMuY2VydCAmJiAhb3B0aW9ucy5jZXJ0RmlsZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlRMUyBjb25maWcgaXMgZ2l2ZW4sIGJ1dCAnY2VydCcgaXMgbWlzc2luZy5cIik7XG4gIH1cblxuICBsZXQgcG9ydCA9IG9wdGlvbnMucG9ydCA/PyA4NDQzO1xuICBjb25zdCBob3N0bmFtZSA9IG9wdGlvbnMuaG9zdG5hbWUgPz8gXCIwLjAuMC4wXCI7XG4gIGNvbnN0IHNlcnZlciA9IG5ldyBTZXJ2ZXIoe1xuICAgIHBvcnQsXG4gICAgaG9zdG5hbWUsXG4gICAgaGFuZGxlcixcbiAgICBvbkVycm9yOiBvcHRpb25zLm9uRXJyb3IsXG4gIH0pO1xuXG4gIG9wdGlvbnM/LnNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsICgpID0+IHNlcnZlci5jbG9zZSgpLCB7XG4gICAgb25jZTogdHJ1ZSxcbiAgfSk7XG5cbiAgY29uc3Qga2V5ID0gb3B0aW9ucy5rZXkgfHwgRGVuby5yZWFkVGV4dEZpbGVTeW5jKG9wdGlvbnMua2V5RmlsZSEpO1xuICBjb25zdCBjZXJ0ID0gb3B0aW9ucy5jZXJ0IHx8IERlbm8ucmVhZFRleHRGaWxlU3luYyhvcHRpb25zLmNlcnRGaWxlISk7XG5cbiAgY29uc3QgbGlzdGVuZXIgPSBEZW5vLmxpc3RlblRscyh7XG4gICAgcG9ydCxcbiAgICBob3N0bmFtZSxcbiAgICBjZXJ0LFxuICAgIGtleSxcbiAgICB0cmFuc3BvcnQ6IFwidGNwXCIsXG4gICAgLy8gQUxQTiBwcm90b2NvbCBzdXBwb3J0IG5vdCB5ZXQgc3RhYmxlLlxuICAgIC8vIGFscG5Qcm90b2NvbHM6IFtcImgyXCIsIFwiaHR0cC8xLjFcIl0sXG4gIH0pO1xuXG4gIGNvbnN0IHMgPSBzZXJ2ZXIuc2VydmUobGlzdGVuZXIpO1xuXG4gIHBvcnQgPSAoc2VydmVyLmFkZHJzWzBdIGFzIERlbm8uTmV0QWRkcikucG9ydDtcblxuICBpZiAoXCJvbkxpc3RlblwiIGluIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zLm9uTGlzdGVuPy4oeyBwb3J0LCBob3N0bmFtZSB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIGBMaXN0ZW5pbmcgb24gaHR0cHM6Ly8ke2hvc3RuYW1lRm9yRGlzcGxheShob3N0bmFtZSl9OiR7cG9ydH0vYCxcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGF3YWl0IHM7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQVMsS0FBSyxRQUFRLGtCQUFrQjtBQUV4QywrQ0FBK0MsR0FDL0MsTUFBTSxzQkFBc0I7QUFFNUIsbUNBQW1DLEdBQ25DLE1BQU0sWUFBWTtBQUVsQixvQ0FBb0MsR0FDcEMsTUFBTSxhQUFhO0FBRW5CLHVFQUF1RSxHQUN2RSxNQUFNLCtCQUErQjtBQUVyQyxrRUFBa0UsR0FDbEUsTUFBTSwyQkFBMkI7QUFvQ2pDLHNDQUFzQyxHQUN0QyxPQUFPLE1BQU07SUFDWCxDQUFDLElBQUksQ0FBVTtJQUNmLENBQUMsSUFBSSxDQUFVO0lBQ2YsQ0FBQyxPQUFPLENBQVU7SUFDbEIsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ2hCLENBQUMsU0FBUyxHQUF1QixJQUFJLE1BQU07SUFDM0MsQ0FBQyxpQ0FBaUMsR0FBRyxJQUFJLGtCQUFrQjtJQUMzRCxDQUFDLGVBQWUsR0FBdUIsSUFBSSxNQUFNO0lBQ2pELENBQUMsT0FBTyxDQUFtRDtJQUUzRDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CQyxHQUNELFlBQVksVUFBc0IsQ0FBRTtRQUNsQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsV0FBVyxJQUFJO1FBQzVCLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxXQUFXLFFBQVE7UUFDaEMsSUFBSSxDQUFDLENBQUMsT0FBTyxH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