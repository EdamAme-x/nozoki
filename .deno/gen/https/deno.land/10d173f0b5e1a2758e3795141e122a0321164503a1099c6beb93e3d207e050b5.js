// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assert } from "../_util/asserts.ts";
export class RetryError extends Error {
    constructor(cause, attempts){
        super(`Retrying exceeded the maxAttempts (${attempts}).`);
        this.name = "RetryError";
        this.cause = cause;
    }
}
const defaultRetryOptions = {
    multiplier: 2,
    maxTimeout: 60000,
    maxAttempts: 5,
    minTimeout: 1000,
    jitter: 1
};
/**
 * Calls the given (possibly asynchronous) function up to `maxAttempts` times.
 * Retries as long as the given function throws.
 * If the attempts are exhausted, throws an `RetryError` with `cause` set to the inner exception.
 *
 * The backoff is calculated by multiplying `minTimeout` with `multiplier` to the power of the current attempt counter (starting at 0 up to `maxAttempts - 1`). It is capped at `maxTimeout` however.
 * How long the actual delay is, depends on `jitter`.
 *
 * When `jitter` is the default value of `1`, waits between two attempts for a randomized amount between 0 and the backoff time.
 * With the default options the maximal delay will be `15s = 1s + 2s + 4s + 8s`. If all five attempts are exhausted the mean delay will be `9.5s = ½(4s + 15s)`.
 *
 * When `jitter` is `0`, waits the full backoff time.
 *
 * @example
 * ```typescript
 * import { retry } from "https://deno.land/std@$STD_VERSION/async/mod.ts";
 * const req = async () => {
 *  // some function that throws sometimes
 * };
 *
 * // Below resolves to the first non-error result of `req`
 * const retryPromise = await retry(req, {
 *  multiplier: 2,
 *  maxTimeout: 60000,
 *  maxAttempts: 5,
 *  minTimeout: 100,
 *  jitter: 1,
 * });
 * ```
 *
 * @example
 * ```typescript
 * import { retry } from "https://deno.land/std@$STD_VERSION/async/mod.ts";
 * const req = async () => {
 *  // some function that throws sometimes
 * };
 *
 * // Make sure we wait at least 1 minute, but at most 2 minutes
 * const retryPromise = await retry(req, {
 *  multiplier: 2.34,
 *  maxTimeout: 80000,
 *  maxAttempts: 7,
 *  minTimeout: 1000,
 *  jitter: 0.5,
 * });
 * ```
 */ export async function retry(fn, opts) {
    const options = {
        ...defaultRetryOptions,
        ...opts
    };
    assert(options.maxTimeout >= 0, "maxTimeout is less than 0");
    assert(options.minTimeout <= options.maxTimeout, "minTimeout is greater than maxTimeout");
    assert(options.jitter <= 1, "jitter is greater than 1");
    let attempt = 0;
    while(true){
        try {
            return await fn();
        } catch (error) {
            if (attempt + 1 >= options.maxAttempts) {
                throw new RetryError(error, options.maxAttempts);
            }
            const timeout = _exponentialBackoffWithJitter(options.maxTimeout, options.minTimeout, attempt, options.multiplier, options.jitter);
            await new Promise((r)=>setTimeout(r, timeout));
        }
        attempt++;
    }
}
export function _exponentialBackoffWithJitter(cap, base, attempt, multiplier, jitter) {
    const exp = Math.min(cap, base * multiplier ** attempt);
    return (1 - jitter * Math.random()) * exp;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE5My4wL2FzeW5jL3JldHJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGFzc2VydCB9IGZyb20gXCIuLi9fdXRpbC9hc3NlcnRzLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBSZXRyeUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihjYXVzZTogdW5rbm93biwgYXR0ZW1wdHM6IG51bWJlcikge1xuICAgIHN1cGVyKGBSZXRyeWluZyBleGNlZWRlZCB0aGUgbWF4QXR0ZW1wdHMgKCR7YXR0ZW1wdHN9KS5gKTtcbiAgICB0aGlzLm5hbWUgPSBcIlJldHJ5RXJyb3JcIjtcbiAgICB0aGlzLmNhdXNlID0gY2F1c2U7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXRyeU9wdGlvbnMge1xuICAvKiogSG93IG11Y2ggdG8gYmFja29mZiBhZnRlciBlYWNoIHJldHJ5LiBUaGlzIGlzIGAyYCBieSBkZWZhdWx0LiAqL1xuICBtdWx0aXBsaWVyPzogbnVtYmVyO1xuICAvKiogVGhlIG1heGltdW0gbWlsbGlzZWNvbmRzIGJldHdlZW4gYXR0ZW1wdHMuIFRoaXMgaXMgYDYwMDAwYCBieSBkZWZhdWx0LiAqL1xuICBtYXhUaW1lb3V0PzogbnVtYmVyO1xuICAvKiogVGhlIG1heGltdW0gYW1vdW50IG9mIGF0dGVtcHRzIHVudGlsIGZhaWx1cmUuIFRoaXMgaXMgYDVgIGJ5IGRlZmF1bHQuICovXG4gIG1heEF0dGVtcHRzPzogbnVtYmVyO1xuICAvKiogVGhlIGluaXRpYWwgYW5kIG1pbmltdW0gYW1vdW50IG9mIG1pbGxpc2Vjb25kcyBiZXR3ZWVuIGF0dGVtcHRzLiBUaGlzIGlzIGAxMDAwYCBieSBkZWZhdWx0LiAqL1xuICBtaW5UaW1lb3V0PzogbnVtYmVyO1xuICAvKiogQW1vdW50IG9mIGppdHRlciB0byBpbnRyb2R1Y2UgdG8gdGhlIHRpbWUgYmV0d2VlbiBhdHRlbXB0cy4gVGhpcyBpcyBgMWAgZm9yIGZ1bGwgaml0dGVyIGJ5IGRlZmF1bHQuICovXG4gIGppdHRlcj86IG51bWJlcjtcbn1cblxuY29uc3QgZGVmYXVsdFJldHJ5T3B0aW9uczogUmVxdWlyZWQ8UmV0cnlPcHRpb25zPiA9IHtcbiAgbXVsdGlwbGllcjogMixcbiAgbWF4VGltZW91dDogNjAwMDAsXG4gIG1heEF0dGVtcHRzOiA1LFxuICBtaW5UaW1lb3V0OiAxMDAwLFxuICBqaXR0ZXI6IDEsXG59O1xuXG4vKipcbiAqIENhbGxzIHRoZSBnaXZlbiAocG9zc2libHkgYXN5bmNocm9ub3VzKSBmdW5jdGlvbiB1cCB0byBgbWF4QXR0ZW1wdHNgIHRpbWVzLlxuICogUmV0cmllcyBhcyBsb25nIGFzIHRoZSBnaXZlbiBmdW5jdGlvbiB0aHJvd3MuXG4gKiBJZiB0aGUgYXR0ZW1wdHMgYXJlIGV4aGF1c3RlZCwgdGhyb3dzIGFuIGBSZXRyeUVycm9yYCB3aXRoIGBjYXVzZWAgc2V0IHRvIHRoZSBpbm5lciBleGNlcHRpb24uXG4gKlxuICogVGhlIGJhY2tvZmYgaXMgY2FsY3VsYXRlZCBieSBtdWx0aXBseWluZyBgbWluVGltZW91dGAgd2l0aCBgbXVsdGlwbGllcmAgdG8gdGhlIHBvd2VyIG9mIHRoZSBjdXJyZW50IGF0dGVtcHQgY291bnRlciAoc3RhcnRpbmcgYXQgMCB1cCB0byBgbWF4QXR0ZW1wdHMgLSAxYCkuIEl0IGlzIGNhcHBlZCBhdCBgbWF4VGltZW91dGAgaG93ZXZlci5cbiAqIEhvdyBsb25nIHRoZSBhY3R1YWwgZGVsYXkgaXMsIGRlcGVuZHMgb24gYGppdHRlcmAuXG4gKlxuICogV2hlbiBgaml0dGVyYCBpcyB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBgMWAsIHdhaXRzIGJldHdlZW4gdHdvIGF0dGVtcHRzIGZvciBhIHJhbmRvbWl6ZWQgYW1vdW50IGJldHdlZW4gMCBhbmQgdGhlIGJhY2tvZmYgdGltZS5cbiAqIFdpdGggdGhlIGRlZmF1bHQgb3B0aW9ucyB0aGUgbWF4aW1hbCBkZWxheSB3aWxsIGJlIGAxNXMgPSAxcyArIDJzICsgNHMgKyA4c2AuIElmIGFsbCBmaXZlIGF0dGVtcHRzIGFyZSBleGhhdXN0ZWQgdGhlIG1lYW4gZGVsYXkgd2lsbCBiZSBgOS41cyA9IMK9KDRzICsgMTVzKWAuXG4gKlxuICogV2hlbiBgaml0dGVyYCBpcyBgMGAsIHdhaXRzIHRoZSBmdWxsIGJhY2tvZmYgdGltZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgcmV0cnkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9hc3luYy9tb2QudHNcIjtcbiAqIGNvbnN0IHJlcSA9IGFzeW5jICgpID0+IHtcbiAqICAvLyBzb21lIGZ1bmN0aW9uIHRoYXQgdGhyb3dzIHNvbWV0aW1lc1xuICogfTtcbiAqXG4gKiAvLyBCZWxvdyByZXNvbHZlcyB0byB0aGUgZmlyc3Qgbm9uLWVycm9yIHJlc3VsdCBvZiBgcmVxYFxuICogY29uc3QgcmV0cnlQcm9taXNlID0gYXdhaXQgcmV0cnkocmVxLCB7XG4gKiAgbXVsdGlwbGllcjogMixcbiAqICBtYXhUaW1lb3V0OiA2MDAwMCxcbiAqICBtYXhBdHRlbXB0czogNSxcbiAqICBtaW5UaW1lb3V0OiAxMDAsXG4gKiAgaml0dGVyOiAxLFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgcmV0cnkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9hc3luYy9tb2QudHNcIjtcbiAqIGNvbnN0IHJlcSA9IGFzeW5jICgpID0+IHtcbiAqICAvLyBzb21lIGZ1bmN0aW9uIHRoYXQgdGhyb3dzIHNvbWV0aW1lc1xuICogfTtcbiAqXG4gKiAvLyBNYWtlIHN1cmUgd2Ugd2FpdCBhdCBsZWFzdCAxIG1pbnV0ZSwgYnV0IGF0IG1vc3QgMiBtaW51dGVzXG4gKiBjb25zdCByZXRyeVByb21pc2UgPSBhd2FpdCByZXRyeShyZXEsIHtcbiAqICBtdWx0aXBsaWVyOiAyLjM0LFxuICogIG1heFRpbWVvdXQ6IDgwMDAwLFxuICogIG1heEF0dGVtcHRzOiA3LFxuICogIG1pblRpbWVvdXQ6IDEwMDAsXG4gKiAgaml0dGVyOiAwLjUsXG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmV0cnk8VD4oXG4gIGZuOiAoKCkgPT4gUHJvbWlzZTxUPikgfCAoKCkgPT4gVCksXG4gIG9wdHM/OiBSZXRyeU9wdGlvbnMsXG4pIHtcbiAgY29uc3Qgb3B0aW9uczogUmVxdWlyZWQ8UmV0cnlPcHRpb25zPiA9IHtcbiAgICAuLi5kZWZhdWx0UmV0cnlPcHRpb25zLFxuICAgIC4uLm9wdHMsXG4gIH07XG5cbiAgYXNzZXJ0KG9wdGlvbnMubWF4VGltZW91dCA+PSAwLCBcIm1heFRpbWVvdXQgaXMgbGVzcyB0aGFuIDBcIik7XG4gIGFzc2VydChcbiAgICBvcHRpb25zLm1pblRpbWVvdXQgPD0gb3B0aW9ucy5tYXhUaW1lb3V0LFxuICAgIFwibWluVGltZW91dCBpcyBncmVhdGVyIHRoYW4gbWF4VGltZW91dFwiLFxuICApO1xuICBhc3NlcnQob3B0aW9ucy5qaXR0ZXIgPD0gMSwgXCJqaXR0ZXIgaXMgZ3JlYXRlciB0aGFuIDFcIik7XG5cbiAgbGV0IGF0dGVtcHQgPSAwO1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgZm4oKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGF0dGVtcHQgKyAxID49IG9wdGlvbnMubWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJldHJ5RXJyb3IoZXJyb3IsIG9wdGlvbnMubWF4QXR0ZW1wdHMpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gX2V4cG9uZW50aWFsQmFja29mZldpdGhKaXR0ZXIoXG4gICAgICAgIG9wdGlvbnMubWF4VGltZW91dCxcbiAgICAgICAgb3B0aW9ucy5taW5UaW1lb3V0LFxuICAgICAgICBhdHRlbXB0LFxuICAgICAgICBvcHRpb25zLm11bHRpcGxpZXIsXG4gICAgICAgIG9wdGlvbnMuaml0dGVyLFxuICAgICAgKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIHRpbWVvdXQpKTtcbiAgICB9XG4gICAgYXR0ZW1wdCsrO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfZXhwb25lbnRpYWxCYWNrb2ZmV2l0aEppdHRlcihcbiAgY2FwOiBudW1iZXIsXG4gIGJhc2U6IG51bWJlcixcbiAgYXR0ZW1wdDogbnVtYmVyLFxuICBtdWx0aXBsaWVyOiBudW1iZXIsXG4gIGppdHRlcjogbnVtYmVyLFxuKSB7XG4gIGNvbnN0IGV4cCA9IE1hdGgubWluKGNhcCwgYmFzZSAqIG11bHRpcGxpZXIgKiogYXR0ZW1wdCk7XG4gIHJldHVybiAoMSAtIGppdHRlciAqIE1hdGgucmFuZG9tKCkpICogZXhwO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxNQUFNLFFBQVEsc0JBQXNCO0FBRTdDLE9BQU8sTUFBTSxtQkFBbUI7SUFDOUIsWUFBWSxLQUFjLEVBQUUsUUFBZ0IsQ0FBRTtRQUM1QyxLQUFLLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRSxTQUFTLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsSUFBSSxHQUFHO1FBQ1osSUFBSSxDQUFDLEtBQUssR0FBRztJQUNmO0FBQ0YsQ0FBQztBQWVELE1BQU0sc0JBQThDO0lBQ2xELFlBQVk7SUFDWixZQUFZO0lBQ1osYUFBYTtJQUNiLFlBQVk7SUFDWixRQUFRO0FBQ1Y7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQThDQyxHQUNELE9BQU8sZUFBZSxNQUNwQixFQUFrQyxFQUNsQyxJQUFtQixFQUNuQjtJQUNBLE1BQU0sVUFBa0M7UUFDdEMsR0FBRyxtQkFBbUI7UUFDdEIsR0FBRyxJQUFJO0lBQ1Q7SUFFQSxPQUFPLFFBQVEsVUFBVSxJQUFJLEdBQUc7SUFDaEMsT0FDRSxRQUFRLFVBQVUsSUFBSSxRQUFRLFVBQVUsRUFDeEM7SUFFRixPQUFPLFFBQVEsTUFBTSxJQUFJLEdBQUc7SUFFNUIsSUFBSSxVQUFVO0lBQ2QsTUFBTyxJQUFJLENBQUU7UUFDWCxJQUFJO1lBQ0YsT0FBTyxNQUFNO1FBQ2YsRUFBRSxPQUFPLE9BQU87WUFDZCxJQUFJLFVBQVUsS0FBSyxRQUFRLFdBQVcsRUFBRTtnQkFDdEMsTUFBTSxJQUFJLFdBQVcsT0FBTyxRQUFRLFdBQVcsRUFBRTtZQUNuRCxDQUFDO1lBRUQsTUFBTSxVQUFVLDhCQUNkLFFBQVEsVUFBVSxFQUNsQixRQUFRLFVBQVUsRUFDbEIsU0FDQSxRQUFRLFVBQVUsRUFDbEIsUUFBUSxNQUFNO1lBRWhCLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBTSxXQUFXLEdBQUc7UUFDekM7UUFDQTtJQUNGO0FBQ0YsQ0FBQztBQUVELE9BQU8sU0FBUyw4QkFDZCxHQUFXLEVBQ1gsSUFBWSxFQUNaLE9BQWUsRUFDZixVQUFrQixFQUNsQixNQUFjLEVBQ2Q7SUFDQSxNQUFNLE1BQU0sS0FBSyxHQUFHLENBQUMsS0FBSyxPQUFPLGNBQWM7SUFDL0MsT0FBTyxDQUFDLElBQUksU0FBUyxLQUFLLE1BQU0sRUFBRSxJQUFJO0FBQ3hDLENBQUMifQ==