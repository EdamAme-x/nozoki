// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * A debounced function that will be delayed by a given `wait`
 * time in milliseconds. If the method is called again before
 * the timeout expires, the previous call will be aborted.
 */ /**
 * Creates a debounced function that delays the given `func`
 * by a given `wait` time in milliseconds. If the method is called
 * again before the timeout expires, the previous call will be
 * aborted.
 *
 * @example
 * ```
 * import { debounce } from "https://deno.land/std@$STD_VERSION/async/debounce.ts";
 *
 * const log = debounce(
 *   (event: Deno.FsEvent) =>
 *     console.log("[%s] %s", event.kind, event.paths[0]),
 *   200,
 * );
 *
 * for await (const event of Deno.watchFs("./")) {
 *   log(event);
 * }
 * // wait 200ms ...
 * // output: Function debounced after 200ms with baz
 * ```
 *
 * @param fn    The function to debounce.
 * @param wait  The time in milliseconds to delay the function.
 */ // deno-lint-ignore no-explicit-any
export function debounce(fn, wait) {
    let timeout = null;
    let flush = null;
    const debounced = (...args)=>{
        debounced.clear();
        flush = ()=>{
            debounced.clear();
            fn.call(debounced, ...args);
        };
        timeout = setTimeout(flush, wait);
    };
    debounced.clear = ()=>{
        if (typeof timeout === "number") {
            clearTimeout(timeout);
            timeout = null;
            flush = null;
        }
    };
    debounced.flush = ()=>{
        flush?.();
    };
    Object.defineProperty(debounced, "pending", {
        get: ()=>typeof timeout === "number"
    });
    return debounced;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE5My4wL2FzeW5jL2RlYm91bmNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogQSBkZWJvdW5jZWQgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGRlbGF5ZWQgYnkgYSBnaXZlbiBgd2FpdGBcbiAqIHRpbWUgaW4gbWlsbGlzZWNvbmRzLiBJZiB0aGUgbWV0aG9kIGlzIGNhbGxlZCBhZ2FpbiBiZWZvcmVcbiAqIHRoZSB0aW1lb3V0IGV4cGlyZXMsIHRoZSBwcmV2aW91cyBjYWxsIHdpbGwgYmUgYWJvcnRlZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWJvdW5jZWRGdW5jdGlvbjxUIGV4dGVuZHMgQXJyYXk8dW5rbm93bj4+IHtcbiAgKC4uLmFyZ3M6IFQpOiB2b2lkO1xuICAvKiogQ2xlYXJzIHRoZSBkZWJvdW5jZSB0aW1lb3V0IGFuZCBvbWl0cyBjYWxsaW5nIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24uICovXG4gIGNsZWFyKCk6IHZvaWQ7XG4gIC8qKiBDbGVhcnMgdGhlIGRlYm91bmNlIHRpbWVvdXQgYW5kIGNhbGxzIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gaW1tZWRpYXRlbHkuICovXG4gIGZsdXNoKCk6IHZvaWQ7XG4gIC8qKiBSZXR1cm5zIGEgYm9vbGVhbiB3aGV0aGVyIGEgZGVib3VuY2UgY2FsbCBpcyBwZW5kaW5nIG9yIG5vdC4gKi9cbiAgcmVhZG9ubHkgcGVuZGluZzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZGVsYXlzIHRoZSBnaXZlbiBgZnVuY2BcbiAqIGJ5IGEgZ2l2ZW4gYHdhaXRgIHRpbWUgaW4gbWlsbGlzZWNvbmRzLiBJZiB0aGUgbWV0aG9kIGlzIGNhbGxlZFxuICogYWdhaW4gYmVmb3JlIHRoZSB0aW1lb3V0IGV4cGlyZXMsIHRoZSBwcmV2aW91cyBjYWxsIHdpbGwgYmVcbiAqIGFib3J0ZWQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHsgZGVib3VuY2UgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9hc3luYy9kZWJvdW5jZS50c1wiO1xuICpcbiAqIGNvbnN0IGxvZyA9IGRlYm91bmNlKFxuICogICAoZXZlbnQ6IERlbm8uRnNFdmVudCkgPT5cbiAqICAgICBjb25zb2xlLmxvZyhcIlslc10gJXNcIiwgZXZlbnQua2luZCwgZXZlbnQucGF0aHNbMF0pLFxuICogICAyMDAsXG4gKiApO1xuICpcbiAqIGZvciBhd2FpdCAoY29uc3QgZXZlbnQgb2YgRGVuby53YXRjaEZzKFwiLi9cIikpIHtcbiAqICAgbG9nKGV2ZW50KTtcbiAqIH1cbiAqIC8vIHdhaXQgMjAwbXMgLi4uXG4gKiAvLyBvdXRwdXQ6IEZ1bmN0aW9uIGRlYm91bmNlZCBhZnRlciAyMDBtcyB3aXRoIGJhelxuICogYGBgXG4gKlxuICogQHBhcmFtIGZuICAgIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB3YWl0ICBUaGUgdGltZSBpbiBtaWxsaXNlY29uZHMgdG8gZGVsYXkgdGhlIGZ1bmN0aW9uLlxuICovXG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuZXhwb3J0IGZ1bmN0aW9uIGRlYm91bmNlPFQgZXh0ZW5kcyBBcnJheTxhbnk+PihcbiAgZm46ICh0aGlzOiBEZWJvdW5jZWRGdW5jdGlvbjxUPiwgLi4uYXJnczogVCkgPT4gdm9pZCxcbiAgd2FpdDogbnVtYmVyLFxuKTogRGVib3VuY2VkRnVuY3Rpb248VD4ge1xuICBsZXQgdGltZW91dDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gIGxldCBmbHVzaDogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3QgZGVib3VuY2VkOiBEZWJvdW5jZWRGdW5jdGlvbjxUPiA9ICgoLi4uYXJnczogVCkgPT4ge1xuICAgIGRlYm91bmNlZC5jbGVhcigpO1xuICAgIGZsdXNoID0gKCkgPT4ge1xuICAgICAgZGVib3VuY2VkLmNsZWFyKCk7XG4gICAgICBmbi5jYWxsKGRlYm91bmNlZCwgLi4uYXJncyk7XG4gICAgfTtcbiAgICB0aW1lb3V0ID0gc2V0VGltZW91dChmbHVzaCwgd2FpdCk7XG4gIH0pIGFzIERlYm91bmNlZEZ1bmN0aW9uPFQ+O1xuXG4gIGRlYm91bmNlZC5jbGVhciA9ICgpID0+IHtcbiAgICBpZiAodHlwZW9mIHRpbWVvdXQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgZmx1c2ggPSBudWxsO1xuICAgIH1cbiAgfTtcblxuICBkZWJvdW5jZWQuZmx1c2ggPSAoKSA9PiB7XG4gICAgZmx1c2g/LigpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkZWJvdW5jZWQsIFwicGVuZGluZ1wiLCB7XG4gICAgZ2V0OiAoKSA9PiB0eXBlb2YgdGltZW91dCA9PT0gXCJudW1iZXJcIixcbiAgfSk7XG5cbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7O0NBSUMsR0FXRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXlCQyxHQUNELG1DQUFtQztBQUNuQyxPQUFPLFNBQVMsU0FDZCxFQUFvRCxFQUNwRCxJQUFZLEVBQ1U7SUFDdEIsSUFBSSxVQUF5QixJQUFJO0lBQ2pDLElBQUksUUFBNkIsSUFBSTtJQUVyQyxNQUFNLFlBQW1DLENBQUMsR0FBRyxPQUFZO1FBQ3ZELFVBQVUsS0FBSztRQUNmLFFBQVEsSUFBTTtZQUNaLFVBQVUsS0FBSztZQUNmLEdBQUcsSUFBSSxDQUFDLGNBQWM7UUFDeEI7UUFDQSxVQUFVLFdBQVcsT0FBTztJQUM5QjtJQUVBLFVBQVUsS0FBSyxHQUFHLElBQU07UUFDdEIsSUFBSSxPQUFPLFlBQVksVUFBVTtZQUMvQixhQUFhO1lBQ2IsVUFBVSxJQUFJO1lBQ2QsUUFBUSxJQUFJO1FBQ2QsQ0FBQztJQUNIO0lBRUEsVUFBVSxLQUFLLEdBQUcsSUFBTTtRQUN0QjtJQUNGO0lBRUEsT0FBTyxjQUFjLENBQUMsV0FBVyxXQUFXO1FBQzFDLEtBQUssSUFBTSxPQUFPLFlBQVk7SUFDaEM7SUFFQSxPQUFPO0FBQ1QsQ0FBQyJ9