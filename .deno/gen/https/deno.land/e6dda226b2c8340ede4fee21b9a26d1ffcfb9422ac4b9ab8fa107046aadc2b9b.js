// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Resolve a Promise after a given amount of milliseconds.
 *
 * @example
 *
 * ```typescript
 * import { delay } from "https://deno.land/std@$STD_VERSION/async/delay.ts";
 *
 * // ...
 * const delayedPromise = delay(100);
 * const result = await delayedPromise;
 * // ...
 * ```
 *
 * To allow the process to continue to run as long as the timer exists. Requires
 * `--unstable` flag.
 *
 * ```typescript
 * import { delay } from "https://deno.land/std@$STD_VERSION/async/delay.ts";
 *
 * // ...
 * await delay(100, { persistent: false });
 * // ...
 * ```
 */ export function delay(ms, options = {}) {
    const { signal , persistent  } = options;
    if (signal?.aborted) return Promise.reject(signal.reason);
    return new Promise((resolve, reject)=>{
        const abort = ()=>{
            clearTimeout(i);
            reject(signal?.reason);
        };
        const done = ()=>{
            signal?.removeEventListener("abort", abort);
            resolve();
        };
        const i = setTimeout(done, ms);
        signal?.addEventListener("abort", abort, {
            once: true
        });
        if (persistent === false) {
            try {
                // @ts-ignore For browser compatibility
                Deno.unrefTimer(i);
            } catch (error) {
                if (!(error instanceof ReferenceError)) {
                    throw error;
                }
                console.error("`persistent` option is only available in Deno");
            }
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwNi4wL2FzeW5jL2RlbGF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVsYXlPcHRpb25zIHtcbiAgLyoqIFNpZ25hbCB1c2VkIHRvIGFib3J0IHRoZSBkZWxheS4gKi9cbiAgc2lnbmFsPzogQWJvcnRTaWduYWw7XG4gIC8qKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgcHJvY2VzcyBzaG91bGQgY29udGludWUgdG8gcnVuIGFzIGxvbmcgYXMgdGhlIHRpbWVyIGV4aXN0cy5cbiAgICpcbiAgICogQGRlZmF1bHQge3RydWV9XG4gICAqL1xuICBwZXJzaXN0ZW50PzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgUHJvbWlzZSBhZnRlciBhIGdpdmVuIGFtb3VudCBvZiBtaWxsaXNlY29uZHMuXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBkZWxheSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2FzeW5jL2RlbGF5LnRzXCI7XG4gKlxuICogLy8gLi4uXG4gKiBjb25zdCBkZWxheWVkUHJvbWlzZSA9IGRlbGF5KDEwMCk7XG4gKiBjb25zdCByZXN1bHQgPSBhd2FpdCBkZWxheWVkUHJvbWlzZTtcbiAqIC8vIC4uLlxuICogYGBgXG4gKlxuICogVG8gYWxsb3cgdGhlIHByb2Nlc3MgdG8gY29udGludWUgdG8gcnVuIGFzIGxvbmcgYXMgdGhlIHRpbWVyIGV4aXN0cy4gUmVxdWlyZXNcbiAqIGAtLXVuc3RhYmxlYCBmbGFnLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IGRlbGF5IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vYXN5bmMvZGVsYXkudHNcIjtcbiAqXG4gKiAvLyAuLi5cbiAqIGF3YWl0IGRlbGF5KDEwMCwgeyBwZXJzaXN0ZW50OiBmYWxzZSB9KTtcbiAqIC8vIC4uLlxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxheShtczogbnVtYmVyLCBvcHRpb25zOiBEZWxheU9wdGlvbnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IHNpZ25hbCwgcGVyc2lzdGVudCB9ID0gb3B0aW9ucztcbiAgaWYgKHNpZ25hbD8uYWJvcnRlZCkgcmV0dXJuIFByb21pc2UucmVqZWN0KHNpZ25hbC5yZWFzb24pO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGFib3J0ID0gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KGkpO1xuICAgICAgcmVqZWN0KHNpZ25hbD8ucmVhc29uKTtcbiAgICB9O1xuICAgIGNvbnN0IGRvbmUgPSAoKSA9PiB7XG4gICAgICBzaWduYWw/LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBhYm9ydCk7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfTtcbiAgICBjb25zdCBpID0gc2V0VGltZW91dChkb25lLCBtcyk7XG4gICAgc2lnbmFsPy5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgYWJvcnQsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICBpZiAocGVyc2lzdGVudCA9PT0gZmFsc2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgRm9yIGJyb3dzZXIgY29tcGF0aWJpbGl0eVxuICAgICAgICBEZW5vLnVucmVmVGltZXIoaSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIFJlZmVyZW5jZUVycm9yKSkge1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJgcGVyc2lzdGVudGAgb3B0aW9uIGlzIG9ubHkgYXZhaWxhYmxlIGluIERlbm9cIik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBWXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QkMsR0FDRCxPQUFPLFNBQVMsTUFBTSxFQUFVLEVBQUUsVUFBd0IsQ0FBQyxDQUFDLEVBQWlCO0lBQzNFLE1BQU0sRUFBRSxPQUFNLEVBQUUsV0FBVSxFQUFFLEdBQUc7SUFDL0IsSUFBSSxRQUFRLFNBQVMsT0FBTyxRQUFRLE1BQU0sQ0FBQyxPQUFPLE1BQU07SUFDeEQsT0FBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFNBQVc7UUFDdEMsTUFBTSxRQUFRLElBQU07WUFDbEIsYUFBYTtZQUNiLE9BQU8sUUFBUTtRQUNqQjtRQUNBLE1BQU0sT0FBTyxJQUFNO1lBQ2pCLFFBQVEsb0JBQW9CLFNBQVM7WUFDckM7UUFDRjtRQUNBLE1BQU0sSUFBSSxXQUFXLE1BQU07UUFDM0IsUUFBUSxpQkFBaUIsU0FBUyxPQUFPO1lBQUUsTUFBTSxJQUFJO1FBQUM7UUFDdEQsSUFBSSxlQUFlLEtBQUssRUFBRTtZQUN4QixJQUFJO2dCQUNGLHVDQUF1QztnQkFDdkMsS0FBSyxVQUFVLENBQUM7WUFDbEIsRUFBRSxPQUFPLE9BQU87Z0JBQ2QsSUFBSSxDQUFDLENBQUMsaUJBQWlCLGNBQWMsR0FBRztvQkFDdEMsTUFBTSxNQUFNO2dCQUNkLENBQUM7Z0JBQ0QsUUFBUSxLQUFLLENBQUM7WUFDaEI7UUFDRixDQUFDO0lBQ0g7QUFDRixDQUFDIn0=