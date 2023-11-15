// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
// Utility for representing n-tuple
class Queue {
    #source;
    #queue;
    head;
    done;
    constructor(iterable){
        this.#source = iterable[Symbol.asyncIterator]();
        this.#queue = {
            value: undefined,
            next: undefined
        };
        this.head = this.#queue;
        this.done = false;
    }
    async next() {
        const result = await this.#source.next();
        if (!result.done) {
            const nextNode = {
                value: result.value,
                next: undefined
            };
            this.#queue.next = nextNode;
            this.#queue = nextNode;
        } else {
            this.done = true;
        }
    }
}
/**
 * Branches the given async iterable into the n branches.
 *
 * @example
 * ```ts
 * import { tee } from "https://deno.land/std@$STD_VERSION/async/tee.ts";
 *
 * const gen = async function* gen() {
 *   yield 1;
 *   yield 2;
 *   yield 3;
 * };
 *
 * const [branch1, branch2] = tee(gen());
 *
 * for await (const n of branch1) {
 *   console.log(n); // => 1, 2, 3
 * }
 *
 * for await (const n of branch2) {
 *   console.log(n); // => 1, 2, 3
 * }
 * ```
 */ export function tee(iterable, n = 2) {
    const queue = new Queue(iterable);
    async function* generator() {
        let buffer = queue.head;
        while(true){
            if (buffer.next) {
                buffer = buffer.next;
                yield buffer.value;
            } else if (queue.done) {
                return;
            } else {
                await queue.next();
            }
        }
    }
    const branches = Array.from({
        length: n
    }).map(()=>generator());
    return branches;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE5My4wL2FzeW5jL3RlZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vLyBVdGlsaXR5IGZvciByZXByZXNlbnRpbmcgbi10dXBsZVxudHlwZSBUdXBsZTxULCBOIGV4dGVuZHMgbnVtYmVyPiA9IE4gZXh0ZW5kcyBOXG4gID8gbnVtYmVyIGV4dGVuZHMgTiA/IFRbXSA6IFR1cGxlT2Y8VCwgTiwgW10+XG4gIDogbmV2ZXI7XG50eXBlIFR1cGxlT2Y8VCwgTiBleHRlbmRzIG51bWJlciwgUiBleHRlbmRzIHVua25vd25bXT4gPSBSW1wibGVuZ3RoXCJdIGV4dGVuZHMgTlxuICA/IFJcbiAgOiBUdXBsZU9mPFQsIE4sIFtULCAuLi5SXT47XG5cbmludGVyZmFjZSBRdWV1ZU5vZGU8VD4ge1xuICB2YWx1ZTogVDtcbiAgbmV4dDogUXVldWVOb2RlPFQ+IHwgdW5kZWZpbmVkO1xufVxuXG5jbGFzcyBRdWV1ZTxUPiB7XG4gICNzb3VyY2U6IEFzeW5jSXRlcmF0b3I8VD47XG4gICNxdWV1ZTogUXVldWVOb2RlPFQ+O1xuICBoZWFkOiBRdWV1ZU5vZGU8VD47XG5cbiAgZG9uZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihpdGVyYWJsZTogQXN5bmNJdGVyYWJsZTxUPikge1xuICAgIHRoaXMuI3NvdXJjZSA9IGl0ZXJhYmxlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIHRoaXMuI3F1ZXVlID0ge1xuICAgICAgdmFsdWU6IHVuZGVmaW5lZCEsXG4gICAgICBuZXh0OiB1bmRlZmluZWQsXG4gICAgfTtcbiAgICB0aGlzLmhlYWQgPSB0aGlzLiNxdWV1ZTtcbiAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgfVxuXG4gIGFzeW5jIG5leHQoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy4jc291cmNlLm5leHQoKTtcbiAgICBpZiAoIXJlc3VsdC5kb25lKSB7XG4gICAgICBjb25zdCBuZXh0Tm9kZTogUXVldWVOb2RlPFQ+ID0ge1xuICAgICAgICB2YWx1ZTogcmVzdWx0LnZhbHVlLFxuICAgICAgICBuZXh0OiB1bmRlZmluZWQsXG4gICAgICB9O1xuICAgICAgdGhpcy4jcXVldWUubmV4dCA9IG5leHROb2RlO1xuICAgICAgdGhpcy4jcXVldWUgPSBuZXh0Tm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBCcmFuY2hlcyB0aGUgZ2l2ZW4gYXN5bmMgaXRlcmFibGUgaW50byB0aGUgbiBicmFuY2hlcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHRlZSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2FzeW5jL3RlZS50c1wiO1xuICpcbiAqIGNvbnN0IGdlbiA9IGFzeW5jIGZ1bmN0aW9uKiBnZW4oKSB7XG4gKiAgIHlpZWxkIDE7XG4gKiAgIHlpZWxkIDI7XG4gKiAgIHlpZWxkIDM7XG4gKiB9O1xuICpcbiAqIGNvbnN0IFticmFuY2gxLCBicmFuY2gyXSA9IHRlZShnZW4oKSk7XG4gKlxuICogZm9yIGF3YWl0IChjb25zdCBuIG9mIGJyYW5jaDEpIHtcbiAqICAgY29uc29sZS5sb2cobik7IC8vID0+IDEsIDIsIDNcbiAqIH1cbiAqXG4gKiBmb3IgYXdhaXQgKGNvbnN0IG4gb2YgYnJhbmNoMikge1xuICogICBjb25zb2xlLmxvZyhuKTsgLy8gPT4gMSwgMiwgM1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZWU8VCwgTiBleHRlbmRzIG51bWJlciA9IDI+KFxuICBpdGVyYWJsZTogQXN5bmNJdGVyYWJsZTxUPixcbiAgbjogTiA9IDIgYXMgTixcbik6IFR1cGxlPEFzeW5jSXRlcmFibGU8VD4sIE4+IHtcbiAgY29uc3QgcXVldWUgPSBuZXcgUXVldWU8VD4oaXRlcmFibGUpO1xuXG4gIGFzeW5jIGZ1bmN0aW9uKiBnZW5lcmF0b3IoKTogQXN5bmNHZW5lcmF0b3I8VD4ge1xuICAgIGxldCBidWZmZXIgPSBxdWV1ZS5oZWFkO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoYnVmZmVyLm5leHQpIHtcbiAgICAgICAgYnVmZmVyID0gYnVmZmVyLm5leHQ7XG4gICAgICAgIHlpZWxkIGJ1ZmZlci52YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAocXVldWUuZG9uZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBxdWV1ZS5uZXh0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgYnJhbmNoZXMgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiBuIH0pLm1hcChcbiAgICAoKSA9PiBnZW5lcmF0b3IoKSxcbiAgKSBhcyBUdXBsZTxcbiAgICBBc3luY0l0ZXJhYmxlPFQ+LFxuICAgIE5cbiAgPjtcbiAgcmV0dXJuIGJyYW5jaGVzO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsbUNBQW1DO0FBYW5DLE1BQU07SUFDSixDQUFDLE1BQU0sQ0FBbUI7SUFDMUIsQ0FBQyxLQUFLLENBQWU7SUFDckIsS0FBbUI7SUFFbkIsS0FBYztJQUVkLFlBQVksUUFBMEIsQ0FBRTtRQUN0QyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sYUFBYSxDQUFDO1FBQzdDLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRztZQUNaLE9BQU87WUFDUCxNQUFNO1FBQ1I7UUFDQSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUs7UUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLO0lBQ25CO0lBRUEsTUFBTSxPQUFPO1FBQ1gsTUFBTSxTQUFTLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUk7UUFDdEMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFO1lBQ2hCLE1BQU0sV0FBeUI7Z0JBQzdCLE9BQU8sT0FBTyxLQUFLO2dCQUNuQixNQUFNO1lBQ1I7WUFDQSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHO1lBQ25CLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRztRQUNoQixPQUFPO1lBQ0wsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJO1FBQ2xCLENBQUM7SUFDSDtBQUNGO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJDLEdBQ0QsT0FBTyxTQUFTLElBQ2QsUUFBMEIsRUFDMUIsSUFBTyxDQUFNLEVBQ2U7SUFDNUIsTUFBTSxRQUFRLElBQUksTUFBUztJQUUzQixnQkFBZ0IsWUFBK0I7UUFDN0MsSUFBSSxTQUFTLE1BQU0sSUFBSTtRQUN2QixNQUFPLElBQUksQ0FBRTtZQUNYLElBQUksT0FBTyxJQUFJLEVBQUU7Z0JBQ2YsU0FBUyxPQUFPLElBQUk7Z0JBQ3BCLE1BQU0sT0FBTyxLQUFLO1lBQ3BCLE9BQU8sSUFBSSxNQUFNLElBQUksRUFBRTtnQkFDckI7WUFDRixPQUFPO2dCQUNMLE1BQU0sTUFBTSxJQUFJO1lBQ2xCLENBQUM7UUFDSDtJQUNGO0lBRUEsTUFBTSxXQUFXLE1BQU0sSUFBSSxDQUFDO1FBQUUsUUFBUTtJQUFFLEdBQUcsR0FBRyxDQUM1QyxJQUFNO0lBS1IsT0FBTztBQUNULENBQUMifQ==