// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { deferred } from "./deferred.ts";
/**
 * The MuxAsyncIterator class multiplexes multiple async iterators into a single
 * stream. It currently makes an assumption that the final result (the value
 * returned and not yielded from the iterator) does not matter; if there is any
 * result, it is discarded.
 *
 * @example
 * ```typescript
 * import { MuxAsyncIterator } from "https://deno.land/std@$STD_VERSION/async/mod.ts";
 *
 * async function* gen123(): AsyncIterableIterator<number> {
 *   yield 1;
 *   yield 2;
 *   yield 3;
 * }
 *
 * async function* gen456(): AsyncIterableIterator<number> {
 *   yield 4;
 *   yield 5;
 *   yield 6;
 * }
 *
 * const mux = new MuxAsyncIterator<number>();
 * mux.add(gen123());
 * mux.add(gen456());
 * for await (const value of mux) {
 *   // ...
 * }
 * // ..
 * ```
 */ export class MuxAsyncIterator {
    #iteratorCount = 0;
    #yields = [];
    // deno-lint-ignore no-explicit-any
    #throws = [];
    #signal = deferred();
    add(iterable) {
        ++this.#iteratorCount;
        this.#callIteratorNext(iterable[Symbol.asyncIterator]());
    }
    async #callIteratorNext(iterator) {
        try {
            const { value , done  } = await iterator.next();
            if (done) {
                --this.#iteratorCount;
            } else {
                this.#yields.push({
                    iterator,
                    value
                });
            }
        } catch (e) {
            this.#throws.push(e);
        }
        this.#signal.resolve();
    }
    async *iterate() {
        while(this.#iteratorCount > 0){
            // Sleep until any of the wrapped iterators yields.
            await this.#signal;
            // Note that while we're looping over `yields`, new items may be added.
            for(let i = 0; i < this.#yields.length; i++){
                const { iterator , value  } = this.#yields[i];
                yield value;
                this.#callIteratorNext(iterator);
            }
            if (this.#throws.length) {
                for (const e of this.#throws){
                    throw e;
                }
                this.#throws.length = 0;
            }
            // Clear the `yields` list and reset the `signal` promise.
            this.#yields.length = 0;
            this.#signal = deferred();
        }
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE5My4wL2FzeW5jL211eF9hc3luY19pdGVyYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBEZWZlcnJlZCwgZGVmZXJyZWQgfSBmcm9tIFwiLi9kZWZlcnJlZC50c1wiO1xuXG5pbnRlcmZhY2UgVGFnZ2VkWWllbGRlZFZhbHVlPFQ+IHtcbiAgaXRlcmF0b3I6IEFzeW5jSXRlcmF0b3I8VD47XG4gIHZhbHVlOiBUO1xufVxuXG4vKipcbiAqIFRoZSBNdXhBc3luY0l0ZXJhdG9yIGNsYXNzIG11bHRpcGxleGVzIG11bHRpcGxlIGFzeW5jIGl0ZXJhdG9ycyBpbnRvIGEgc2luZ2xlXG4gKiBzdHJlYW0uIEl0IGN1cnJlbnRseSBtYWtlcyBhbiBhc3N1bXB0aW9uIHRoYXQgdGhlIGZpbmFsIHJlc3VsdCAodGhlIHZhbHVlXG4gKiByZXR1cm5lZCBhbmQgbm90IHlpZWxkZWQgZnJvbSB0aGUgaXRlcmF0b3IpIGRvZXMgbm90IG1hdHRlcjsgaWYgdGhlcmUgaXMgYW55XG4gKiByZXN1bHQsIGl0IGlzIGRpc2NhcmRlZC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgTXV4QXN5bmNJdGVyYXRvciB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2FzeW5jL21vZC50c1wiO1xuICpcbiAqIGFzeW5jIGZ1bmN0aW9uKiBnZW4xMjMoKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPG51bWJlcj4ge1xuICogICB5aWVsZCAxO1xuICogICB5aWVsZCAyO1xuICogICB5aWVsZCAzO1xuICogfVxuICpcbiAqIGFzeW5jIGZ1bmN0aW9uKiBnZW40NTYoKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPG51bWJlcj4ge1xuICogICB5aWVsZCA0O1xuICogICB5aWVsZCA1O1xuICogICB5aWVsZCA2O1xuICogfVxuICpcbiAqIGNvbnN0IG11eCA9IG5ldyBNdXhBc3luY0l0ZXJhdG9yPG51bWJlcj4oKTtcbiAqIG11eC5hZGQoZ2VuMTIzKCkpO1xuICogbXV4LmFkZChnZW40NTYoKSk7XG4gKiBmb3IgYXdhaXQgKGNvbnN0IHZhbHVlIG9mIG11eCkge1xuICogICAvLyAuLi5cbiAqIH1cbiAqIC8vIC4uXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIE11eEFzeW5jSXRlcmF0b3I8VD4gaW1wbGVtZW50cyBBc3luY0l0ZXJhYmxlPFQ+IHtcbiAgI2l0ZXJhdG9yQ291bnQgPSAwO1xuICAjeWllbGRzOiBBcnJheTxUYWdnZWRZaWVsZGVkVmFsdWU8VD4+ID0gW107XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICN0aHJvd3M6IGFueVtdID0gW107XG4gICNzaWduYWw6IERlZmVycmVkPHZvaWQ+ID0gZGVmZXJyZWQoKTtcblxuICBhZGQoaXRlcmFibGU6IEFzeW5jSXRlcmFibGU8VD4pIHtcbiAgICArK3RoaXMuI2l0ZXJhdG9yQ291bnQ7XG4gICAgdGhpcy4jY2FsbEl0ZXJhdG9yTmV4dChpdGVyYWJsZVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSk7XG4gIH1cblxuICBhc3luYyAjY2FsbEl0ZXJhdG9yTmV4dChcbiAgICBpdGVyYXRvcjogQXN5bmNJdGVyYXRvcjxUPixcbiAgKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgdmFsdWUsIGRvbmUgfSA9IGF3YWl0IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgIGlmIChkb25lKSB7XG4gICAgICAgIC0tdGhpcy4jaXRlcmF0b3JDb3VudDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuI3lpZWxkcy5wdXNoKHsgaXRlcmF0b3IsIHZhbHVlIH0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuI3Rocm93cy5wdXNoKGUpO1xuICAgIH1cbiAgICB0aGlzLiNzaWduYWwucmVzb2x2ZSgpO1xuICB9XG5cbiAgYXN5bmMgKml0ZXJhdGUoKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQ+IHtcbiAgICB3aGlsZSAodGhpcy4jaXRlcmF0b3JDb3VudCA+IDApIHtcbiAgICAgIC8vIFNsZWVwIHVudGlsIGFueSBvZiB0aGUgd3JhcHBlZCBpdGVyYXRvcnMgeWllbGRzLlxuICAgICAgYXdhaXQgdGhpcy4jc2lnbmFsO1xuXG4gICAgICAvLyBOb3RlIHRoYXQgd2hpbGUgd2UncmUgbG9vcGluZyBvdmVyIGB5aWVsZHNgLCBuZXcgaXRlbXMgbWF5IGJlIGFkZGVkLlxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLiN5aWVsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgeyBpdGVyYXRvciwgdmFsdWUgfSA9IHRoaXMuI3lpZWxkc1tpXTtcbiAgICAgICAgeWllbGQgdmFsdWU7XG4gICAgICAgIHRoaXMuI2NhbGxJdGVyYXRvck5leHQoaXRlcmF0b3IpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy4jdGhyb3dzLmxlbmd0aCkge1xuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgdGhpcy4jdGhyb3dzKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiN0aHJvd3MubGVuZ3RoID0gMDtcbiAgICAgIH1cbiAgICAgIC8vIENsZWFyIHRoZSBgeWllbGRzYCBsaXN0IGFuZCByZXNldCB0aGUgYHNpZ25hbGAgcHJvbWlzZS5cbiAgICAgIHRoaXMuI3lpZWxkcy5sZW5ndGggPSAwO1xuICAgICAgdGhpcy4jc2lnbmFsID0gZGVmZXJyZWQoKTtcbiAgICB9XG4gIH1cblxuICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk6IEFzeW5jSXRlcmF0b3I8VD4ge1xuICAgIHJldHVybiB0aGlzLml0ZXJhdGUoKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBbUIsUUFBUSxRQUFRLGdCQUFnQjtBQU9uRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBOEJDLEdBQ0QsT0FBTyxNQUFNO0lBQ1gsQ0FBQyxhQUFhLEdBQUcsRUFBRTtJQUNuQixDQUFDLE1BQU0sR0FBaUMsRUFBRSxDQUFDO0lBQzNDLG1DQUFtQztJQUNuQyxDQUFDLE1BQU0sR0FBVSxFQUFFLENBQUM7SUFDcEIsQ0FBQyxNQUFNLEdBQW1CLFdBQVc7SUFFckMsSUFBSSxRQUEwQixFQUFFO1FBQzlCLEVBQUUsSUFBSSxDQUFDLENBQUMsYUFBYTtRQUNyQixJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxhQUFhLENBQUM7SUFDdkQ7SUFFQSxNQUFNLENBQUMsZ0JBQWdCLENBQ3JCLFFBQTBCLEVBQzFCO1FBQ0EsSUFBSTtZQUNGLE1BQU0sRUFBRSxNQUFLLEVBQUUsS0FBSSxFQUFFLEdBQUcsTUFBTSxTQUFTLElBQUk7WUFDM0MsSUFBSSxNQUFNO2dCQUNSLEVBQUUsSUFBSSxDQUFDLENBQUMsYUFBYTtZQUN2QixPQUFPO2dCQUNMLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQUU7b0JBQVU7Z0JBQU07WUFDdEMsQ0FBQztRQUNILEVBQUUsT0FBTyxHQUFHO1lBQ1YsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNwQjtRQUNBLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPO0lBQ3RCO0lBRUEsT0FBTyxVQUFvQztRQUN6QyxNQUFPLElBQUksQ0FBQyxDQUFDLGFBQWEsR0FBRyxFQUFHO1lBQzlCLG1EQUFtRDtZQUNuRCxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU07WUFFbEIsdUVBQXVFO1lBQ3ZFLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUs7Z0JBQzVDLE1BQU0sRUFBRSxTQUFRLEVBQUUsTUFBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzNDLE1BQU07Z0JBQ04sSUFBSSxDQUFDLENBQUMsZ0JBQWdCLENBQUM7WUFDekI7WUFFQSxJQUFJLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3ZCLEtBQUssTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBRTtvQkFDNUIsTUFBTSxFQUFFO2dCQUNWO2dCQUNBLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUc7WUFDeEIsQ0FBQztZQUNELDBEQUEwRDtZQUMxRCxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHO1lBQ3RCLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRztRQUNqQjtJQUNGO0lBRUEsQ0FBQyxPQUFPLGFBQWEsQ0FBQyxHQUFxQjtRQUN6QyxPQUFPLElBQUksQ0FBQyxPQUFPO0lBQ3JCO0FBQ0YsQ0FBQyJ9