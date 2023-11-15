// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { deferred } from "./deferred.ts";
export function abortable(p, signal) {
    if (p instanceof Promise) {
        return abortablePromise(p, signal);
    } else {
        return abortableAsyncIterable(p, signal);
    }
}
/**
 * Make Promise abortable with the given signal.
 *
 * @example
 * ```typescript
 * import { abortablePromise } from "https://deno.land/std@$STD_VERSION/async/mod.ts";
 *
 * const request = fetch("https://example.com");
 *
 * const c = new AbortController();
 * setTimeout(() => c.abort(), 100);
 *
 * const p = abortablePromise(request, c.signal);
 *
 * // The below throws if the request didn't resolve in 100ms
 * await p;
 * ```
 */ export function abortablePromise(p, signal) {
    if (signal.aborted) {
        return Promise.reject(createAbortError(signal.reason));
    }
    const waiter = deferred();
    const abort = ()=>waiter.reject(createAbortError(signal.reason));
    signal.addEventListener("abort", abort, {
        once: true
    });
    return Promise.race([
        waiter,
        p.finally(()=>{
            signal.removeEventListener("abort", abort);
        })
    ]);
}
/**
 * Make AsyncIterable abortable with the given signal.
 *
 * @example
 * ```typescript
 * import { abortableAsyncIterable } from "https://deno.land/std@$STD_VERSION/async/mod.ts";
 * import { delay } from "https://deno.land/std@$STD_VERSION/async/mod.ts";
 *
 * const p = async function* () {
 *   yield "Hello";
 *   await delay(1000);
 *   yield "World";
 * };
 * const c = new AbortController();
 * setTimeout(() => c.abort(), 100);
 *
 * // Below throws `DOMException` after 100 ms
 * // and items become `["Hello"]`
 * const items: string[] = [];
 * for await (const item of abortableAsyncIterable(p(), c.signal)) {
 *   items.push(item);
 * }
 * ```
 */ export async function* abortableAsyncIterable(p, signal) {
    if (signal.aborted) {
        throw createAbortError(signal.reason);
    }
    const waiter = deferred();
    const abort = ()=>waiter.reject(createAbortError(signal.reason));
    signal.addEventListener("abort", abort, {
        once: true
    });
    const it = p[Symbol.asyncIterator]();
    while(true){
        const { done , value  } = await Promise.race([
            waiter,
            it.next()
        ]);
        if (done) {
            signal.removeEventListener("abort", abort);
            return;
        }
        yield value;
    }
}
// This `reason` comes from `AbortSignal` thus must be `any`.
// deno-lint-ignore no-explicit-any
function createAbortError(reason) {
    return new DOMException(reason ? `Aborted: ${reason}` : "Aborted", "AbortError");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE5My4wL2FzeW5jL2Fib3J0YWJsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBkZWZlcnJlZCB9IGZyb20gXCIuL2RlZmVycmVkLnRzXCI7XG5cbi8qKlxuICogTWFrZSBQcm9taXNlIGFib3J0YWJsZSB3aXRoIHRoZSBnaXZlbiBzaWduYWwuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IGFib3J0YWJsZSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2FzeW5jL21vZC50c1wiO1xuICogaW1wb3J0IHsgZGVsYXkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9hc3luYy9tb2QudHNcIjtcbiAqXG4gKiBjb25zdCBwID0gZGVsYXkoMTAwMCk7XG4gKiBjb25zdCBjID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICogc2V0VGltZW91dCgoKSA9PiBjLmFib3J0KCksIDEwMCk7XG4gKlxuICogLy8gQmVsb3cgdGhyb3dzIGBET01FeGNlcHRpb25gIGFmdGVyIDEwMCBtc1xuICogYXdhaXQgYWJvcnRhYmxlKHAsIGMuc2lnbmFsKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWJvcnRhYmxlPFQ+KHA6IFByb21pc2U8VD4sIHNpZ25hbDogQWJvcnRTaWduYWwpOiBQcm9taXNlPFQ+O1xuLyoqXG4gKiBNYWtlIEFzeW5jSXRlcmFibGUgYWJvcnRhYmxlIHdpdGggdGhlIGdpdmVuIHNpZ25hbC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgYWJvcnRhYmxlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vYXN5bmMvbW9kLnRzXCI7XG4gKiBpbXBvcnQgeyBkZWxheSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2FzeW5jL21vZC50c1wiO1xuICpcbiAqIGNvbnN0IHAgPSBhc3luYyBmdW5jdGlvbiogKCkge1xuICogICB5aWVsZCBcIkhlbGxvXCI7XG4gKiAgIGF3YWl0IGRlbGF5KDEwMDApO1xuICogICB5aWVsZCBcIldvcmxkXCI7XG4gKiB9O1xuICogY29uc3QgYyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAqIHNldFRpbWVvdXQoKCkgPT4gYy5hYm9ydCgpLCAxMDApO1xuICpcbiAqIC8vIEJlbG93IHRocm93cyBgRE9NRXhjZXB0aW9uYCBhZnRlciAxMDAgbXNcbiAqIC8vIGFuZCBpdGVtcyBiZWNvbWUgYFtcIkhlbGxvXCJdYFxuICogY29uc3QgaXRlbXM6IHN0cmluZ1tdID0gW107XG4gKiBmb3IgYXdhaXQgKGNvbnN0IGl0ZW0gb2YgYWJvcnRhYmxlKHAoKSwgYy5zaWduYWwpKSB7XG4gKiAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFib3J0YWJsZTxUPihcbiAgcDogQXN5bmNJdGVyYWJsZTxUPixcbiAgc2lnbmFsOiBBYm9ydFNpZ25hbCxcbik6IEFzeW5jR2VuZXJhdG9yPFQ+O1xuZXhwb3J0IGZ1bmN0aW9uIGFib3J0YWJsZTxUPihcbiAgcDogUHJvbWlzZTxUPiB8IEFzeW5jSXRlcmFibGU8VD4sXG4gIHNpZ25hbDogQWJvcnRTaWduYWwsXG4pOiBQcm9taXNlPFQ+IHwgQXN5bmNJdGVyYWJsZTxUPiB7XG4gIGlmIChwIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgIHJldHVybiBhYm9ydGFibGVQcm9taXNlKHAsIHNpZ25hbCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGFib3J0YWJsZUFzeW5jSXRlcmFibGUocCwgc2lnbmFsKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2UgUHJvbWlzZSBhYm9ydGFibGUgd2l0aCB0aGUgZ2l2ZW4gc2lnbmFsLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBhYm9ydGFibGVQcm9taXNlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vYXN5bmMvbW9kLnRzXCI7XG4gKlxuICogY29uc3QgcmVxdWVzdCA9IGZldGNoKFwiaHR0cHM6Ly9leGFtcGxlLmNvbVwiKTtcbiAqXG4gKiBjb25zdCBjID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICogc2V0VGltZW91dCgoKSA9PiBjLmFib3J0KCksIDEwMCk7XG4gKlxuICogY29uc3QgcCA9IGFib3J0YWJsZVByb21pc2UocmVxdWVzdCwgYy5zaWduYWwpO1xuICpcbiAqIC8vIFRoZSBiZWxvdyB0aHJvd3MgaWYgdGhlIHJlcXVlc3QgZGlkbid0IHJlc29sdmUgaW4gMTAwbXNcbiAqIGF3YWl0IHA7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFib3J0YWJsZVByb21pc2U8VD4oXG4gIHA6IFByb21pc2U8VD4sXG4gIHNpZ25hbDogQWJvcnRTaWduYWwsXG4pOiBQcm9taXNlPFQ+IHtcbiAgaWYgKHNpZ25hbC5hYm9ydGVkKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGNyZWF0ZUFib3J0RXJyb3Ioc2lnbmFsLnJlYXNvbikpO1xuICB9XG4gIGNvbnN0IHdhaXRlciA9IGRlZmVycmVkPG5ldmVyPigpO1xuICBjb25zdCBhYm9ydCA9ICgpID0+IHdhaXRlci5yZWplY3QoY3JlYXRlQWJvcnRFcnJvcihzaWduYWwucmVhc29uKSk7XG4gIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgYWJvcnQsIHsgb25jZTogdHJ1ZSB9KTtcbiAgcmV0dXJuIFByb21pc2UucmFjZShbXG4gICAgd2FpdGVyLFxuICAgIHAuZmluYWxseSgoKSA9PiB7XG4gICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0KTtcbiAgICB9KSxcbiAgXSk7XG59XG5cbi8qKlxuICogTWFrZSBBc3luY0l0ZXJhYmxlIGFib3J0YWJsZSB3aXRoIHRoZSBnaXZlbiBzaWduYWwuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IGFib3J0YWJsZUFzeW5jSXRlcmFibGUgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9hc3luYy9tb2QudHNcIjtcbiAqIGltcG9ydCB7IGRlbGF5IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vYXN5bmMvbW9kLnRzXCI7XG4gKlxuICogY29uc3QgcCA9IGFzeW5jIGZ1bmN0aW9uKiAoKSB7XG4gKiAgIHlpZWxkIFwiSGVsbG9cIjtcbiAqICAgYXdhaXQgZGVsYXkoMTAwMCk7XG4gKiAgIHlpZWxkIFwiV29ybGRcIjtcbiAqIH07XG4gKiBjb25zdCBjID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICogc2V0VGltZW91dCgoKSA9PiBjLmFib3J0KCksIDEwMCk7XG4gKlxuICogLy8gQmVsb3cgdGhyb3dzIGBET01FeGNlcHRpb25gIGFmdGVyIDEwMCBtc1xuICogLy8gYW5kIGl0ZW1zIGJlY29tZSBgW1wiSGVsbG9cIl1gXG4gKiBjb25zdCBpdGVtczogc3RyaW5nW10gPSBbXTtcbiAqIGZvciBhd2FpdCAoY29uc3QgaXRlbSBvZiBhYm9ydGFibGVBc3luY0l0ZXJhYmxlKHAoKSwgYy5zaWduYWwpKSB7XG4gKiAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uKiBhYm9ydGFibGVBc3luY0l0ZXJhYmxlPFQ+KFxuICBwOiBBc3luY0l0ZXJhYmxlPFQ+LFxuICBzaWduYWw6IEFib3J0U2lnbmFsLFxuKTogQXN5bmNHZW5lcmF0b3I8VD4ge1xuICBpZiAoc2lnbmFsLmFib3J0ZWQpIHtcbiAgICB0aHJvdyBjcmVhdGVBYm9ydEVycm9yKHNpZ25hbC5yZWFzb24pO1xuICB9XG4gIGNvbnN0IHdhaXRlciA9IGRlZmVycmVkPG5ldmVyPigpO1xuICBjb25zdCBhYm9ydCA9ICgpID0+IHdhaXRlci5yZWplY3QoY3JlYXRlQWJvcnRFcnJvcihzaWduYWwucmVhc29uKSk7XG4gIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgYWJvcnQsIHsgb25jZTogdHJ1ZSB9KTtcblxuICBjb25zdCBpdCA9IHBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgY29uc3QgeyBkb25lLCB2YWx1ZSB9ID0gYXdhaXQgUHJvbWlzZS5yYWNlKFt3YWl0ZXIsIGl0Lm5leHQoKV0pO1xuICAgIGlmIChkb25lKSB7XG4gICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgeWllbGQgdmFsdWU7XG4gIH1cbn1cblxuLy8gVGhpcyBgcmVhc29uYCBjb21lcyBmcm9tIGBBYm9ydFNpZ25hbGAgdGh1cyBtdXN0IGJlIGBhbnlgLlxuLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbmZ1bmN0aW9uIGNyZWF0ZUFib3J0RXJyb3IocmVhc29uPzogYW55KTogRE9NRXhjZXB0aW9uIHtcbiAgcmV0dXJuIG5ldyBET01FeGNlcHRpb24oXG4gICAgcmVhc29uID8gYEFib3J0ZWQ6ICR7cmVhc29ufWAgOiBcIkFib3J0ZWRcIixcbiAgICBcIkFib3J0RXJyb3JcIixcbiAgKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsUUFBUSxRQUFRLGdCQUFnQjtBQStDekMsT0FBTyxTQUFTLFVBQ2QsQ0FBZ0MsRUFDaEMsTUFBbUIsRUFDWTtJQUMvQixJQUFJLGFBQWEsU0FBUztRQUN4QixPQUFPLGlCQUFpQixHQUFHO0lBQzdCLE9BQU87UUFDTCxPQUFPLHVCQUF1QixHQUFHO0lBQ25DLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaUJDLEdBQ0QsT0FBTyxTQUFTLGlCQUNkLENBQWEsRUFDYixNQUFtQixFQUNQO0lBQ1osSUFBSSxPQUFPLE9BQU8sRUFBRTtRQUNsQixPQUFPLFFBQVEsTUFBTSxDQUFDLGlCQUFpQixPQUFPLE1BQU07SUFDdEQsQ0FBQztJQUNELE1BQU0sU0FBUztJQUNmLE1BQU0sUUFBUSxJQUFNLE9BQU8sTUFBTSxDQUFDLGlCQUFpQixPQUFPLE1BQU07SUFDaEUsT0FBTyxnQkFBZ0IsQ0FBQyxTQUFTLE9BQU87UUFBRSxNQUFNLElBQUk7SUFBQztJQUNyRCxPQUFPLFFBQVEsSUFBSSxDQUFDO1FBQ2xCO1FBQ0EsRUFBRSxPQUFPLENBQUMsSUFBTTtZQUNkLE9BQU8sbUJBQW1CLENBQUMsU0FBUztRQUN0QztLQUNEO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVCQyxHQUNELE9BQU8sZ0JBQWdCLHVCQUNyQixDQUFtQixFQUNuQixNQUFtQixFQUNBO0lBQ25CLElBQUksT0FBTyxPQUFPLEVBQUU7UUFDbEIsTUFBTSxpQkFBaUIsT0FBTyxNQUFNLEVBQUU7SUFDeEMsQ0FBQztJQUNELE1BQU0sU0FBUztJQUNmLE1BQU0sUUFBUSxJQUFNLE9BQU8sTUFBTSxDQUFDLGlCQUFpQixPQUFPLE1BQU07SUFDaEUsT0FBTyxnQkFBZ0IsQ0FBQyxTQUFTLE9BQU87UUFBRSxNQUFNLElBQUk7SUFBQztJQUVyRCxNQUFNLEtBQUssQ0FBQyxDQUFDLE9BQU8sYUFBYSxDQUFDO0lBQ2xDLE1BQU8sSUFBSSxDQUFFO1FBQ1gsTUFBTSxFQUFFLEtBQUksRUFBRSxNQUFLLEVBQUUsR0FBRyxNQUFNLFFBQVEsSUFBSSxDQUFDO1lBQUM7WUFBUSxHQUFHLElBQUk7U0FBRztRQUM5RCxJQUFJLE1BQU07WUFDUixPQUFPLG1CQUFtQixDQUFDLFNBQVM7WUFDcEM7UUFDRixDQUFDO1FBQ0QsTUFBTTtJQUNSO0FBQ0YsQ0FBQztBQUVELDZEQUE2RDtBQUM3RCxtQ0FBbUM7QUFDbkMsU0FBUyxpQkFBaUIsTUFBWSxFQUFnQjtJQUNwRCxPQUFPLElBQUksYUFDVCxTQUFTLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLFNBQVMsRUFDekM7QUFFSiJ9