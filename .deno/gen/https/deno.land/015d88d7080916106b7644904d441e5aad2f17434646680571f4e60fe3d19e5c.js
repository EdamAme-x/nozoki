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
    if (signal?.aborted) {
        return Promise.reject(new DOMException("Delay was aborted.", "AbortError"));
    }
    return new Promise((resolve, reject)=>{
        const abort = ()=>{
            clearTimeout(i);
            reject(new DOMException("Delay was aborted.", "AbortError"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE5My4wL2FzeW5jL2RlbGF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVsYXlPcHRpb25zIHtcbiAgLyoqIFNpZ25hbCB1c2VkIHRvIGFib3J0IHRoZSBkZWxheS4gKi9cbiAgc2lnbmFsPzogQWJvcnRTaWduYWw7XG4gIC8qKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgcHJvY2VzcyBzaG91bGQgY29udGludWUgdG8gcnVuIGFzIGxvbmcgYXMgdGhlIHRpbWVyIGV4aXN0cy5cbiAgICpcbiAgICogQGRlZmF1bHQge3RydWV9XG4gICAqL1xuICBwZXJzaXN0ZW50PzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgUHJvbWlzZSBhZnRlciBhIGdpdmVuIGFtb3VudCBvZiBtaWxsaXNlY29uZHMuXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBkZWxheSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2FzeW5jL2RlbGF5LnRzXCI7XG4gKlxuICogLy8gLi4uXG4gKiBjb25zdCBkZWxheWVkUHJvbWlzZSA9IGRlbGF5KDEwMCk7XG4gKiBjb25zdCByZXN1bHQgPSBhd2FpdCBkZWxheWVkUHJvbWlzZTtcbiAqIC8vIC4uLlxuICogYGBgXG4gKlxuICogVG8gYWxsb3cgdGhlIHByb2Nlc3MgdG8gY29udGludWUgdG8gcnVuIGFzIGxvbmcgYXMgdGhlIHRpbWVyIGV4aXN0cy4gUmVxdWlyZXNcbiAqIGAtLXVuc3RhYmxlYCBmbGFnLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IGRlbGF5IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vYXN5bmMvZGVsYXkudHNcIjtcbiAqXG4gKiAvLyAuLi5cbiAqIGF3YWl0IGRlbGF5KDEwMCwgeyBwZXJzaXN0ZW50OiBmYWxzZSB9KTtcbiAqIC8vIC4uLlxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxheShtczogbnVtYmVyLCBvcHRpb25zOiBEZWxheU9wdGlvbnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IHNpZ25hbCwgcGVyc2lzdGVudCB9ID0gb3B0aW9ucztcbiAgaWYgKHNpZ25hbD8uYWJvcnRlZCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRE9NRXhjZXB0aW9uKFwiRGVsYXkgd2FzIGFib3J0ZWQuXCIsIFwiQWJvcnRFcnJvclwiKSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBhYm9ydCA9ICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dChpKTtcbiAgICAgIHJlamVjdChuZXcgRE9NRXhjZXB0aW9uKFwiRGVsYXkgd2FzIGFib3J0ZWQuXCIsIFwiQWJvcnRFcnJvclwiKSk7XG4gICAgfTtcbiAgICBjb25zdCBkb25lID0gKCkgPT4ge1xuICAgICAgc2lnbmFsPy5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgYWJvcnQpO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH07XG4gICAgY29uc3QgaSA9IHNldFRpbWVvdXQoZG9uZSwgbXMpO1xuICAgIHNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgaWYgKHBlcnNpc3RlbnQgPT09IGZhbHNlKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBAdHMtaWdub3JlIEZvciBicm93c2VyIGNvbXBhdGliaWxpdHlcbiAgICAgICAgRGVuby51bnJlZlRpbWVyKGkpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBSZWZlcmVuY2VFcnJvcikpIHtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmVycm9yKFwiYHBlcnNpc3RlbnRgIG9wdGlvbiBpcyBvbmx5IGF2YWlsYWJsZSBpbiBEZW5vXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQVlyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0JDLEdBQ0QsT0FBTyxTQUFTLE1BQU0sRUFBVSxFQUFFLFVBQXdCLENBQUMsQ0FBQyxFQUFpQjtJQUMzRSxNQUFNLEVBQUUsT0FBTSxFQUFFLFdBQVUsRUFBRSxHQUFHO0lBQy9CLElBQUksUUFBUSxTQUFTO1FBQ25CLE9BQU8sUUFBUSxNQUFNLENBQUMsSUFBSSxhQUFhLHNCQUFzQjtJQUMvRCxDQUFDO0lBQ0QsT0FBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFNBQVc7UUFDdEMsTUFBTSxRQUFRLElBQU07WUFDbEIsYUFBYTtZQUNiLE9BQU8sSUFBSSxhQUFhLHNCQUFzQjtRQUNoRDtRQUNBLE1BQU0sT0FBTyxJQUFNO1lBQ2pCLFFBQVEsb0JBQW9CLFNBQVM7WUFDckM7UUFDRjtRQUNBLE1BQU0sSUFBSSxXQUFXLE1BQU07UUFDM0IsUUFBUSxpQkFBaUIsU0FBUyxPQUFPO1lBQUUsTUFBTSxJQUFJO1FBQUM7UUFDdEQsSUFBSSxlQUFlLEtBQUssRUFBRTtZQUN4QixJQUFJO2dCQUNGLHVDQUF1QztnQkFDdkMsS0FBSyxVQUFVLENBQUM7WUFDbEIsRUFBRSxPQUFPLE9BQU87Z0JBQ2QsSUFBSSxDQUFDLENBQUMsaUJBQWlCLGNBQWMsR0FBRztvQkFDdEMsTUFBTSxNQUFNO2dCQUNkLENBQUM7Z0JBQ0QsUUFBUSxLQUFLLENBQUM7WUFDaEI7UUFDRixDQUFDO0lBQ0g7QUFDRixDQUFDIn0=