// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { delay } from "./delay.ts";
export class DeadlineError extends Error {
    constructor(){
        super("Deadline");
        this.name = this.constructor.name;
    }
}
/**
 * Create a promise which will be rejected with {@linkcode DeadlineError} when a given delay is exceeded.
 *
 * NOTE: Prefer to use `AbortSignal.timeout` instead for the APIs accept `AbortSignal`.
 *
 * @example
 * ```typescript
 * import { deadline } from "https://deno.land/std@$STD_VERSION/async/deadline.ts";
 * import { delay } from "https://deno.land/std@$STD_VERSION/async/delay.ts";
 *
 * const delayedPromise = delay(1000);
 * // Below throws `DeadlineError` after 10 ms
 * const result = await deadline(delayedPromise, 10);
 * ```
 */ export function deadline(p, ms, options = {}) {
    const controller = new AbortController();
    const { signal  } = options;
    if (signal?.aborted) {
        return Promise.reject(new DeadlineError());
    }
    signal?.addEventListener("abort", ()=>controller.abort(signal.reason));
    const d = delay(ms, {
        signal: controller.signal
    }).catch(()=>{}) // Do NOTHING on abort.
    .then(()=>Promise.reject(new DeadlineError()));
    return Promise.race([
        p.finally(()=>controller.abort()),
        d
    ]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE5My4wL2FzeW5jL2RlYWRsaW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGRlbGF5IH0gZnJvbSBcIi4vZGVsYXkudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEZWFkbGluZU9wdGlvbnMge1xuICAvKiogU2lnbmFsIHVzZWQgdG8gYWJvcnQgdGhlIGRlYWRsaW5lLiAqL1xuICBzaWduYWw/OiBBYm9ydFNpZ25hbDtcbn1cblxuZXhwb3J0IGNsYXNzIERlYWRsaW5lRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFwiRGVhZGxpbmVcIik7XG4gICAgdGhpcy5uYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlamVjdGVkIHdpdGgge0BsaW5rY29kZSBEZWFkbGluZUVycm9yfSB3aGVuIGEgZ2l2ZW4gZGVsYXkgaXMgZXhjZWVkZWQuXG4gKlxuICogTk9URTogUHJlZmVyIHRvIHVzZSBgQWJvcnRTaWduYWwudGltZW91dGAgaW5zdGVhZCBmb3IgdGhlIEFQSXMgYWNjZXB0IGBBYm9ydFNpZ25hbGAuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IGRlYWRsaW5lIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vYXN5bmMvZGVhZGxpbmUudHNcIjtcbiAqIGltcG9ydCB7IGRlbGF5IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vYXN5bmMvZGVsYXkudHNcIjtcbiAqXG4gKiBjb25zdCBkZWxheWVkUHJvbWlzZSA9IGRlbGF5KDEwMDApO1xuICogLy8gQmVsb3cgdGhyb3dzIGBEZWFkbGluZUVycm9yYCBhZnRlciAxMCBtc1xuICogY29uc3QgcmVzdWx0ID0gYXdhaXQgZGVhZGxpbmUoZGVsYXllZFByb21pc2UsIDEwKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVhZGxpbmU8VD4oXG4gIHA6IFByb21pc2U8VD4sXG4gIG1zOiBudW1iZXIsXG4gIG9wdGlvbnM6IERlYWRsaW5lT3B0aW9ucyA9IHt9LFxuKTogUHJvbWlzZTxUPiB7XG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gIGNvbnN0IHsgc2lnbmFsIH0gPSBvcHRpb25zO1xuICBpZiAoc2lnbmFsPy5hYm9ydGVkKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBEZWFkbGluZUVycm9yKCkpO1xuICB9XG4gIHNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsICgpID0+IGNvbnRyb2xsZXIuYWJvcnQoc2lnbmFsLnJlYXNvbikpO1xuICBjb25zdCBkID0gZGVsYXkobXMsIHsgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCB9KVxuICAgIC5jYXRjaCgoKSA9PiB7fSkgLy8gRG8gTk9USElORyBvbiBhYm9ydC5cbiAgICAudGhlbigoKSA9PiBQcm9taXNlLnJlamVjdChuZXcgRGVhZGxpbmVFcnJvcigpKSk7XG4gIHJldHVybiBQcm9taXNlLnJhY2UoW3AuZmluYWxseSgoKSA9PiBjb250cm9sbGVyLmFib3J0KCkpLCBkXSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLEtBQUssUUFBUSxhQUFhO0FBT25DLE9BQU8sTUFBTSxzQkFBc0I7SUFDakMsYUFBYztRQUNaLEtBQUssQ0FBQztRQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJO0lBQ25DO0FBQ0YsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7OztDQWNDLEdBQ0QsT0FBTyxTQUFTLFNBQ2QsQ0FBYSxFQUNiLEVBQVUsRUFDVixVQUEyQixDQUFDLENBQUMsRUFDakI7SUFDWixNQUFNLGFBQWEsSUFBSTtJQUN2QixNQUFNLEVBQUUsT0FBTSxFQUFFLEdBQUc7SUFDbkIsSUFBSSxRQUFRLFNBQVM7UUFDbkIsT0FBTyxRQUFRLE1BQU0sQ0FBQyxJQUFJO0lBQzVCLENBQUM7SUFDRCxRQUFRLGlCQUFpQixTQUFTLElBQU0sV0FBVyxLQUFLLENBQUMsT0FBTyxNQUFNO0lBQ3RFLE1BQU0sSUFBSSxNQUFNLElBQUk7UUFBRSxRQUFRLFdBQVcsTUFBTTtJQUFDLEdBQzdDLEtBQUssQ0FBQyxJQUFNLENBQUMsR0FBRyx1QkFBdUI7S0FDdkMsSUFBSSxDQUFDLElBQU0sUUFBUSxNQUFNLENBQUMsSUFBSTtJQUNqQyxPQUFPLFFBQVEsSUFBSSxDQUFDO1FBQUMsRUFBRSxPQUFPLENBQUMsSUFBTSxXQUFXLEtBQUs7UUFBSztLQUFFO0FBQzlELENBQUMifQ==