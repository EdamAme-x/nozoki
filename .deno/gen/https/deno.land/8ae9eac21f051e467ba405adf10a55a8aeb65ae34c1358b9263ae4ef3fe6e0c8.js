// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
export const ERROR_WHILE_MAPPING_MESSAGE = "Threw while mapping.";
/**
 * pooledMap transforms values from an (async) iterable into another async
 * iterable. The transforms are done concurrently, with a max concurrency
 * defined by the poolLimit.
 *
 * If an error is thrown from `iterableFn`, no new transformations will begin.
 * All currently executing transformations are allowed to finish and still
 * yielded on success. After that, the rejections among them are gathered and
 * thrown by the iterator in an `AggregateError`.
 *
 * @example
 * ```typescript
 * import { pooledMap } from "https://deno.land/std@$STD_VERSION/async/pool.ts";
 *
 * const results = pooledMap(
 *   2,
 *   [1, 2, 3],
 *   (i) => new Promise((r) => setTimeout(() => r(i), 1000)),
 * );
 *
 * for await (const value of results) {
 *   // ...
 * }
 * ```
 *
 * @param poolLimit The maximum count of items being processed concurrently.
 * @param array The input array for mapping.
 * @param iteratorFn The function to call for every item of the array.
 */ export function pooledMap(poolLimit, array, iteratorFn) {
    // Create the async iterable that is returned from this function.
    const res = new TransformStream({
        async transform (p, controller) {
            try {
                const s = await p;
                controller.enqueue(s);
            } catch (e) {
                if (e instanceof AggregateError && e.message == ERROR_WHILE_MAPPING_MESSAGE) {
                    controller.error(e);
                }
            }
        }
    });
    // Start processing items from the iterator
    (async ()=>{
        const writer = res.writable.getWriter();
        const executing = [];
        try {
            for await (const item of array){
                const p = Promise.resolve().then(()=>iteratorFn(item));
                // Only write on success. If we `writer.write()` a rejected promise,
                // that will end the iteration. We don't want that yet. Instead let it
                // fail the race, taking us to the catch block where all currently
                // executing jobs are allowed to finish and all rejections among them
                // can be reported together.
                writer.write(p);
                const e = p.then(()=>executing.splice(executing.indexOf(e), 1));
                executing.push(e);
                if (executing.length >= poolLimit) {
                    await Promise.race(executing);
                }
            }
            // Wait until all ongoing events have processed, then close the writer.
            await Promise.all(executing);
            writer.close();
        } catch  {
            const errors = [];
            for (const result of (await Promise.allSettled(executing))){
                if (result.status == "rejected") {
                    errors.push(result.reason);
                }
            }
            writer.write(Promise.reject(new AggregateError(errors, ERROR_WHILE_MAPPING_MESSAGE))).catch(()=>{});
        }
    })();
    // Feature test until browser coverage is adequate
    return Symbol.asyncIterator in res.readable && typeof res.readable[Symbol.asyncIterator] === "function" ? res.readable[Symbol.asyncIterator]() : async function*() {
        const reader = res.readable.getReader();
        while(true){
            const { done , value  } = await reader.read();
            if (done) break;
            yield value;
        }
        reader.releaseLock();
    }();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE5My4wL2FzeW5jL3Bvb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuZXhwb3J0IGNvbnN0IEVSUk9SX1dISUxFX01BUFBJTkdfTUVTU0FHRSA9IFwiVGhyZXcgd2hpbGUgbWFwcGluZy5cIjtcblxuLyoqXG4gKiBwb29sZWRNYXAgdHJhbnNmb3JtcyB2YWx1ZXMgZnJvbSBhbiAoYXN5bmMpIGl0ZXJhYmxlIGludG8gYW5vdGhlciBhc3luY1xuICogaXRlcmFibGUuIFRoZSB0cmFuc2Zvcm1zIGFyZSBkb25lIGNvbmN1cnJlbnRseSwgd2l0aCBhIG1heCBjb25jdXJyZW5jeVxuICogZGVmaW5lZCBieSB0aGUgcG9vbExpbWl0LlxuICpcbiAqIElmIGFuIGVycm9yIGlzIHRocm93biBmcm9tIGBpdGVyYWJsZUZuYCwgbm8gbmV3IHRyYW5zZm9ybWF0aW9ucyB3aWxsIGJlZ2luLlxuICogQWxsIGN1cnJlbnRseSBleGVjdXRpbmcgdHJhbnNmb3JtYXRpb25zIGFyZSBhbGxvd2VkIHRvIGZpbmlzaCBhbmQgc3RpbGxcbiAqIHlpZWxkZWQgb24gc3VjY2Vzcy4gQWZ0ZXIgdGhhdCwgdGhlIHJlamVjdGlvbnMgYW1vbmcgdGhlbSBhcmUgZ2F0aGVyZWQgYW5kXG4gKiB0aHJvd24gYnkgdGhlIGl0ZXJhdG9yIGluIGFuIGBBZ2dyZWdhdGVFcnJvcmAuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IHBvb2xlZE1hcCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2FzeW5jL3Bvb2wudHNcIjtcbiAqXG4gKiBjb25zdCByZXN1bHRzID0gcG9vbGVkTWFwKFxuICogICAyLFxuICogICBbMSwgMiwgM10sXG4gKiAgIChpKSA9PiBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dCgoKSA9PiByKGkpLCAxMDAwKSksXG4gKiApO1xuICpcbiAqIGZvciBhd2FpdCAoY29uc3QgdmFsdWUgb2YgcmVzdWx0cykge1xuICogICAvLyAuLi5cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBwb29sTGltaXQgVGhlIG1heGltdW0gY291bnQgb2YgaXRlbXMgYmVpbmcgcHJvY2Vzc2VkIGNvbmN1cnJlbnRseS5cbiAqIEBwYXJhbSBhcnJheSBUaGUgaW5wdXQgYXJyYXkgZm9yIG1hcHBpbmcuXG4gKiBAcGFyYW0gaXRlcmF0b3JGbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZXZlcnkgaXRlbSBvZiB0aGUgYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwb29sZWRNYXA8VCwgUj4oXG4gIHBvb2xMaW1pdDogbnVtYmVyLFxuICBhcnJheTogSXRlcmFibGU8VD4gfCBBc3luY0l0ZXJhYmxlPFQ+LFxuICBpdGVyYXRvckZuOiAoZGF0YTogVCkgPT4gUHJvbWlzZTxSPixcbik6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxSPiB7XG4gIC8vIENyZWF0ZSB0aGUgYXN5bmMgaXRlcmFibGUgdGhhdCBpcyByZXR1cm5lZCBmcm9tIHRoaXMgZnVuY3Rpb24uXG4gIGNvbnN0IHJlcyA9IG5ldyBUcmFuc2Zvcm1TdHJlYW08UHJvbWlzZTxSPiwgUj4oe1xuICAgIGFzeW5jIHRyYW5zZm9ybShcbiAgICAgIHA6IFByb21pc2U8Uj4sXG4gICAgICBjb250cm9sbGVyOiBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0Q29udHJvbGxlcjxSPixcbiAgICApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHMgPSBhd2FpdCBwO1xuICAgICAgICBjb250cm9sbGVyLmVucXVldWUocyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBlIGluc3RhbmNlb2YgQWdncmVnYXRlRXJyb3IgJiZcbiAgICAgICAgICBlLm1lc3NhZ2UgPT0gRVJST1JfV0hJTEVfTUFQUElOR19NRVNTQUdFXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnRyb2xsZXIuZXJyb3IoZSBhcyB1bmtub3duKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuICAvLyBTdGFydCBwcm9jZXNzaW5nIGl0ZW1zIGZyb20gdGhlIGl0ZXJhdG9yXG4gIChhc3luYyAoKSA9PiB7XG4gICAgY29uc3Qgd3JpdGVyID0gcmVzLndyaXRhYmxlLmdldFdyaXRlcigpO1xuICAgIGNvbnN0IGV4ZWN1dGluZzogQXJyYXk8UHJvbWlzZTx1bmtub3duPj4gPSBbXTtcbiAgICB0cnkge1xuICAgICAgZm9yIGF3YWl0IChjb25zdCBpdGVtIG9mIGFycmF5KSB7XG4gICAgICAgIGNvbnN0IHAgPSBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IGl0ZXJhdG9yRm4oaXRlbSkpO1xuICAgICAgICAvLyBPbmx5IHdyaXRlIG9uIHN1Y2Nlc3MuIElmIHdlIGB3cml0ZXIud3JpdGUoKWAgYSByZWplY3RlZCBwcm9taXNlLFxuICAgICAgICAvLyB0aGF0IHdpbGwgZW5kIHRoZSBpdGVyYXRpb24uIFdlIGRvbid0IHdhbnQgdGhhdCB5ZXQuIEluc3RlYWQgbGV0IGl0XG4gICAgICAgIC8vIGZhaWwgdGhlIHJhY2UsIHRha2luZyB1cyB0byB0aGUgY2F0Y2ggYmxvY2sgd2hlcmUgYWxsIGN1cnJlbnRseVxuICAgICAgICAvLyBleGVjdXRpbmcgam9icyBhcmUgYWxsb3dlZCB0byBmaW5pc2ggYW5kIGFsbCByZWplY3Rpb25zIGFtb25nIHRoZW1cbiAgICAgICAgLy8gY2FuIGJlIHJlcG9ydGVkIHRvZ2V0aGVyLlxuICAgICAgICB3cml0ZXIud3JpdGUocCk7XG4gICAgICAgIGNvbnN0IGU6IFByb21pc2U8dW5rbm93bj4gPSBwLnRoZW4oKCkgPT5cbiAgICAgICAgICBleGVjdXRpbmcuc3BsaWNlKGV4ZWN1dGluZy5pbmRleE9mKGUpLCAxKVxuICAgICAgICApO1xuICAgICAgICBleGVjdXRpbmcucHVzaChlKTtcbiAgICAgICAgaWYgKGV4ZWN1dGluZy5sZW5ndGggPj0gcG9vbExpbWl0KSB7XG4gICAgICAgICAgYXdhaXQgUHJvbWlzZS5yYWNlKGV4ZWN1dGluZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFdhaXQgdW50aWwgYWxsIG9uZ29pbmcgZXZlbnRzIGhhdmUgcHJvY2Vzc2VkLCB0aGVuIGNsb3NlIHRoZSB3cml0ZXIuXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChleGVjdXRpbmcpO1xuICAgICAgd3JpdGVyLmNsb3NlKCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChleGVjdXRpbmcpKSB7XG4gICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09IFwicmVqZWN0ZWRcIikge1xuICAgICAgICAgIGVycm9ycy5wdXNoKHJlc3VsdC5yZWFzb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3cml0ZXIud3JpdGUoUHJvbWlzZS5yZWplY3QoXG4gICAgICAgIG5ldyBBZ2dyZWdhdGVFcnJvcihlcnJvcnMsIEVSUk9SX1dISUxFX01BUFBJTkdfTUVTU0FHRSksXG4gICAgICApKS5jYXRjaCgoKSA9PiB7fSk7XG4gICAgfVxuICB9KSgpO1xuICAvLyBGZWF0dXJlIHRlc3QgdW50aWwgYnJvd3NlciBjb3ZlcmFnZSBpcyBhZGVxdWF0ZVxuICByZXR1cm4gU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gcmVzLnJlYWRhYmxlICYmXG4gICAgICB0eXBlb2YgcmVzLnJlYWRhYmxlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9PT0gXCJmdW5jdGlvblwiXG4gICAgPyAocmVzLnJlYWRhYmxlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSBhcyAoKSA9PiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8Uj4pKClcbiAgICA6IChhc3luYyBmdW5jdGlvbiogKCkge1xuICAgICAgY29uc3QgcmVhZGVyID0gcmVzLnJlYWRhYmxlLmdldFJlYWRlcigpO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgeyBkb25lLCB2YWx1ZSB9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgICAgaWYgKGRvbmUpIGJyZWFrO1xuICAgICAgICB5aWVsZCB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJlYWRlci5yZWxlYXNlTG9jaygpO1xuICAgIH0pKCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxPQUFPLE1BQU0sOEJBQThCLHVCQUF1QjtBQUVsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTRCQyxHQUNELE9BQU8sU0FBUyxVQUNkLFNBQWlCLEVBQ2pCLEtBQXFDLEVBQ3JDLFVBQW1DLEVBQ1Q7SUFDMUIsaUVBQWlFO0lBQ2pFLE1BQU0sTUFBTSxJQUFJLGdCQUErQjtRQUM3QyxNQUFNLFdBQ0osQ0FBYSxFQUNiLFVBQStDLEVBQy9DO1lBQ0EsSUFBSTtnQkFDRixNQUFNLElBQUksTUFBTTtnQkFDaEIsV0FBVyxPQUFPLENBQUM7WUFDckIsRUFBRSxPQUFPLEdBQUc7Z0JBQ1YsSUFDRSxhQUFhLGtCQUNiLEVBQUUsT0FBTyxJQUFJLDZCQUNiO29CQUNBLFdBQVcsS0FBSyxDQUFDO2dCQUNuQixDQUFDO1lBQ0g7UUFDRjtJQUNGO0lBQ0EsMkNBQTJDO0lBQzFDLENBQUEsVUFBWTtRQUNYLE1BQU0sU0FBUyxJQUFJLFFBQVEsQ0FBQyxTQUFTO1FBQ3JDLE1BQU0sWUFBcUMsRUFBRTtRQUM3QyxJQUFJO1lBQ0YsV0FBVyxNQUFNLFFBQVEsTUFBTztnQkFDOUIsTUFBTSxJQUFJLFFBQVEsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFNLFdBQVc7Z0JBQ2xELG9FQUFvRTtnQkFDcEUsc0VBQXNFO2dCQUN0RSxrRUFBa0U7Z0JBQ2xFLHFFQUFxRTtnQkFDckUsNEJBQTRCO2dCQUM1QixPQUFPLEtBQUssQ0FBQztnQkFDYixNQUFNLElBQXNCLEVBQUUsSUFBSSxDQUFDLElBQ2pDLFVBQVUsTUFBTSxDQUFDLFVBQVUsT0FBTyxDQUFDLElBQUk7Z0JBRXpDLFVBQVUsSUFBSSxDQUFDO2dCQUNmLElBQUksVUFBVSxNQUFNLElBQUksV0FBVztvQkFDakMsTUFBTSxRQUFRLElBQUksQ0FBQztnQkFDckIsQ0FBQztZQUNIO1lBQ0EsdUVBQXVFO1lBQ3ZFLE1BQU0sUUFBUSxHQUFHLENBQUM7WUFDbEIsT0FBTyxLQUFLO1FBQ2QsRUFBRSxPQUFNO1lBQ04sTUFBTSxTQUFTLEVBQUU7WUFDakIsS0FBSyxNQUFNLFVBQVUsQ0FBQSxNQUFNLFFBQVEsVUFBVSxDQUFDLFVBQVMsRUFBRztnQkFDeEQsSUFBSSxPQUFPLE1BQU0sSUFBSSxZQUFZO29CQUMvQixPQUFPLElBQUksQ0FBQyxPQUFPLE1BQU07Z0JBQzNCLENBQUM7WUFDSDtZQUNBLE9BQU8sS0FBSyxDQUFDLFFBQVEsTUFBTSxDQUN6QixJQUFJLGVBQWUsUUFBUSwrQkFDMUIsS0FBSyxDQUFDLElBQU0sQ0FBQztRQUNsQjtJQUNGLENBQUE7SUFDQSxrREFBa0Q7SUFDbEQsT0FBTyxPQUFPLGFBQWEsSUFBSSxJQUFJLFFBQVEsSUFDdkMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxPQUFPLGFBQWEsQ0FBQyxLQUFLLGFBQzlDLEFBQUMsSUFBSSxRQUFRLENBQUMsT0FBTyxhQUFhLENBQUMsS0FDbkMsQUFBQyxrQkFBbUI7UUFDcEIsTUFBTSxTQUFTLElBQUksUUFBUSxDQUFDLFNBQVM7UUFDckMsTUFBTyxJQUFJLENBQUU7WUFDWCxNQUFNLEVBQUUsS0FBSSxFQUFFLE1BQUssRUFBRSxHQUFHLE1BQU0sT0FBTyxJQUFJO1lBQ3pDLElBQUksTUFBTSxLQUFNO1lBQ2hCLE1BQU07UUFDUjtRQUNBLE9BQU8sV0FBVztJQUNwQixHQUFJO0FBQ1IsQ0FBQyJ9