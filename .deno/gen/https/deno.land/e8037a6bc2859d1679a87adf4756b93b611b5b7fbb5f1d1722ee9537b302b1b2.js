// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
/** Find first index of binary pattern from source. If not found, then return -1
 * @param source source array
 * @param pat pattern to find in source array
 * @param start the index to start looking in the source
 */ export function indexOf(source, pat, start = 0) {
    if (start >= source.length) {
        return -1;
    }
    if (start < 0) {
        start = 0;
    }
    const s = pat[0];
    for(let i = start; i < source.length; i++){
        if (source[i] !== s) continue;
        const pin = i;
        let matched = 1;
        let j = i;
        while(matched < pat.length){
            j++;
            if (source[j] !== pat[j - pin]) {
                break;
            }
            matched++;
        }
        if (matched === pat.length) {
            return pin;
        }
    }
    return -1;
}
/** Find last index of binary pattern from source. If not found, then return -1.
 * @param source source array
 * @param pat pattern to find in source array
 * @param start the index to start looking in the source
 */ export function lastIndexOf(source, pat, start = source.length - 1) {
    if (start < 0) {
        return -1;
    }
    if (start >= source.length) {
        start = source.length - 1;
    }
    const e = pat[pat.length - 1];
    for(let i = start; i >= 0; i--){
        if (source[i] !== e) continue;
        const pin = i;
        let matched = 1;
        let j = i;
        while(matched < pat.length){
            j--;
            if (source[j] !== pat[pat.length - 1 - (pin - j)]) {
                break;
            }
            matched++;
        }
        if (matched === pat.length) {
            return pin - pat.length + 1;
        }
    }
    return -1;
}
/** Check whether binary arrays are equal to each other.
 * @param a first array to check equality
 * @param b second array to check equality
 */ export function equals(a, b) {
    if (a.length !== b.length) return false;
    for(let i = 0; i < b.length; i++){
        if (a[i] !== b[i]) return false;
    }
    return true;
}
/** Check whether binary array starts with prefix.
 * @param source source array
 * @param prefix prefix array to check in source
 */ export function startsWith(source, prefix) {
    for(let i = 0, max = prefix.length; i < max; i++){
        if (source[i] !== prefix[i]) return false;
    }
    return true;
}
/** Check whether binary array ends with suffix.
 * @param source source array
 * @param suffix suffix array to check in source
 */ export function endsWith(source, suffix) {
    for(let srci = source.length - 1, sfxi = suffix.length - 1; sfxi >= 0; srci--, sfxi--){
        if (source[srci] !== suffix[sfxi]) return false;
    }
    return true;
}
/** Repeat bytes. returns a new byte slice consisting of `count` copies of `b`.
 * @param origin The origin bytes
 * @param count The count you want to repeat.
 * @throws `RangeError` When count is negative
 */ export function repeat(origin, count) {
    if (count === 0) {
        return new Uint8Array();
    }
    if (count < 0) {
        throw new RangeError("bytes: negative repeat count");
    } else if (origin.length * count / count !== origin.length) {
        throw new Error("bytes: repeat count causes overflow");
    }
    const int = Math.floor(count);
    if (int !== count) {
        throw new Error("bytes: repeat count must be an integer");
    }
    const nb = new Uint8Array(origin.length * count);
    let bp = copy(origin, nb);
    for(; bp < nb.length; bp *= 2){
        copy(nb.slice(0, bp), nb, bp);
    }
    return nb;
}
/** Concatenate multiple binary arrays and return new one.
 * @param buf binary arrays to concatenate
 */ export function concat(...buf) {
    let length = 0;
    for (const b of buf){
        length += b.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const b of buf){
        output.set(b, index);
        index += b.length;
    }
    return output;
}
/** Check source array contains pattern array.
 * @param source source array
 * @param pat patter array
 */ export function contains(source, pat) {
    return indexOf(source, pat) != -1;
}
/**
 * Copy bytes from one Uint8Array to another.  Bytes from `src` which don't fit
 * into `dst` will not be copied.
 *
 * @param src Source byte array
 * @param dst Destination byte array
 * @param off Offset into `dst` at which to begin writing values from `src`.
 * @return number of bytes copied
 */ export function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjkyLjAvYnl0ZXMvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbi8qKiBGaW5kIGZpcnN0IGluZGV4IG9mIGJpbmFyeSBwYXR0ZXJuIGZyb20gc291cmNlLiBJZiBub3QgZm91bmQsIHRoZW4gcmV0dXJuIC0xXG4gKiBAcGFyYW0gc291cmNlIHNvdXJjZSBhcnJheVxuICogQHBhcmFtIHBhdCBwYXR0ZXJuIHRvIGZpbmQgaW4gc291cmNlIGFycmF5XG4gKiBAcGFyYW0gc3RhcnQgdGhlIGluZGV4IHRvIHN0YXJ0IGxvb2tpbmcgaW4gdGhlIHNvdXJjZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhPZihcbiAgc291cmNlOiBVaW50OEFycmF5LFxuICBwYXQ6IFVpbnQ4QXJyYXksXG4gIHN0YXJ0ID0gMCxcbik6IG51bWJlciB7XG4gIGlmIChzdGFydCA+PSBzb3VyY2UubGVuZ3RoKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IDA7XG4gIH1cbiAgY29uc3QgcyA9IHBhdFswXTtcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgc291cmNlLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHNvdXJjZVtpXSAhPT0gcykgY29udGludWU7XG4gICAgY29uc3QgcGluID0gaTtcbiAgICBsZXQgbWF0Y2hlZCA9IDE7XG4gICAgbGV0IGogPSBpO1xuICAgIHdoaWxlIChtYXRjaGVkIDwgcGF0Lmxlbmd0aCkge1xuICAgICAgaisrO1xuICAgICAgaWYgKHNvdXJjZVtqXSAhPT0gcGF0W2ogLSBwaW5dKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgbWF0Y2hlZCsrO1xuICAgIH1cbiAgICBpZiAobWF0Y2hlZCA9PT0gcGF0Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHBpbjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG4vKiogRmluZCBsYXN0IGluZGV4IG9mIGJpbmFyeSBwYXR0ZXJuIGZyb20gc291cmNlLiBJZiBub3QgZm91bmQsIHRoZW4gcmV0dXJuIC0xLlxuICogQHBhcmFtIHNvdXJjZSBzb3VyY2UgYXJyYXlcbiAqIEBwYXJhbSBwYXQgcGF0dGVybiB0byBmaW5kIGluIHNvdXJjZSBhcnJheVxuICogQHBhcmFtIHN0YXJ0IHRoZSBpbmRleCB0byBzdGFydCBsb29raW5nIGluIHRoZSBzb3VyY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhc3RJbmRleE9mKFxuICBzb3VyY2U6IFVpbnQ4QXJyYXksXG4gIHBhdDogVWludDhBcnJheSxcbiAgc3RhcnQgPSBzb3VyY2UubGVuZ3RoIC0gMSxcbik6IG51bWJlciB7XG4gIGlmIChzdGFydCA8IDApIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgaWYgKHN0YXJ0ID49IHNvdXJjZS5sZW5ndGgpIHtcbiAgICBzdGFydCA9IHNvdXJjZS5sZW5ndGggLSAxO1xuICB9XG4gIGNvbnN0IGUgPSBwYXRbcGF0Lmxlbmd0aCAtIDFdO1xuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKHNvdXJjZVtpXSAhPT0gZSkgY29udGludWU7XG4gICAgY29uc3QgcGluID0gaTtcbiAgICBsZXQgbWF0Y2hlZCA9IDE7XG4gICAgbGV0IGogPSBpO1xuICAgIHdoaWxlIChtYXRjaGVkIDwgcGF0Lmxlbmd0aCkge1xuICAgICAgai0tO1xuICAgICAgaWYgKHNvdXJjZVtqXSAhPT0gcGF0W3BhdC5sZW5ndGggLSAxIC0gKHBpbiAtIGopXSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIG1hdGNoZWQrKztcbiAgICB9XG4gICAgaWYgKG1hdGNoZWQgPT09IHBhdC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBwaW4gLSBwYXQubGVuZ3RoICsgMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG4vKiogQ2hlY2sgd2hldGhlciBiaW5hcnkgYXJyYXlzIGFyZSBlcXVhbCB0byBlYWNoIG90aGVyLlxuICogQHBhcmFtIGEgZmlyc3QgYXJyYXkgdG8gY2hlY2sgZXF1YWxpdHlcbiAqIEBwYXJhbSBiIHNlY29uZCBhcnJheSB0byBjaGVjayBlcXVhbGl0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGE6IFVpbnQ4QXJyYXksIGI6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiogQ2hlY2sgd2hldGhlciBiaW5hcnkgYXJyYXkgc3RhcnRzIHdpdGggcHJlZml4LlxuICogQHBhcmFtIHNvdXJjZSBzb3VyY2UgYXJyYXlcbiAqIEBwYXJhbSBwcmVmaXggcHJlZml4IGFycmF5IHRvIGNoZWNrIGluIHNvdXJjZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRzV2l0aChzb3VyY2U6IFVpbnQ4QXJyYXksIHByZWZpeDogVWludDhBcnJheSk6IGJvb2xlYW4ge1xuICBmb3IgKGxldCBpID0gMCwgbWF4ID0gcHJlZml4Lmxlbmd0aDsgaSA8IG1heDsgaSsrKSB7XG4gICAgaWYgKHNvdXJjZVtpXSAhPT0gcHJlZml4W2ldKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKiBDaGVjayB3aGV0aGVyIGJpbmFyeSBhcnJheSBlbmRzIHdpdGggc3VmZml4LlxuICogQHBhcmFtIHNvdXJjZSBzb3VyY2UgYXJyYXlcbiAqIEBwYXJhbSBzdWZmaXggc3VmZml4IGFycmF5IHRvIGNoZWNrIGluIHNvdXJjZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5kc1dpdGgoc291cmNlOiBVaW50OEFycmF5LCBzdWZmaXg6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgZm9yIChcbiAgICBsZXQgc3JjaSA9IHNvdXJjZS5sZW5ndGggLSAxLCBzZnhpID0gc3VmZml4Lmxlbmd0aCAtIDE7XG4gICAgc2Z4aSA+PSAwO1xuICAgIHNyY2ktLSwgc2Z4aS0tXG4gICkge1xuICAgIGlmIChzb3VyY2Vbc3JjaV0gIT09IHN1ZmZpeFtzZnhpXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiogUmVwZWF0IGJ5dGVzLiByZXR1cm5zIGEgbmV3IGJ5dGUgc2xpY2UgY29uc2lzdGluZyBvZiBgY291bnRgIGNvcGllcyBvZiBgYmAuXG4gKiBAcGFyYW0gb3JpZ2luIFRoZSBvcmlnaW4gYnl0ZXNcbiAqIEBwYXJhbSBjb3VudCBUaGUgY291bnQgeW91IHdhbnQgdG8gcmVwZWF0LlxuICogQHRocm93cyBgUmFuZ2VFcnJvcmAgV2hlbiBjb3VudCBpcyBuZWdhdGl2ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVwZWF0KG9yaWdpbjogVWludDhBcnJheSwgY291bnQ6IG51bWJlcik6IFVpbnQ4QXJyYXkge1xuICBpZiAoY291bnQgPT09IDApIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoKTtcbiAgfVxuXG4gIGlmIChjb3VudCA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcImJ5dGVzOiBuZWdhdGl2ZSByZXBlYXQgY291bnRcIik7XG4gIH0gZWxzZSBpZiAoKG9yaWdpbi5sZW5ndGggKiBjb3VudCkgLyBjb3VudCAhPT0gb3JpZ2luLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcImJ5dGVzOiByZXBlYXQgY291bnQgY2F1c2VzIG92ZXJmbG93XCIpO1xuICB9XG5cbiAgY29uc3QgaW50ID0gTWF0aC5mbG9vcihjb3VudCk7XG5cbiAgaWYgKGludCAhPT0gY291bnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJieXRlczogcmVwZWF0IGNvdW50IG11c3QgYmUgYW4gaW50ZWdlclwiKTtcbiAgfVxuXG4gIGNvbnN0IG5iID0gbmV3IFVpbnQ4QXJyYXkob3JpZ2luLmxlbmd0aCAqIGNvdW50KTtcblxuICBsZXQgYnAgPSBjb3B5KG9yaWdpbiwgbmIpO1xuXG4gIGZvciAoOyBicCA8IG5iLmxlbmd0aDsgYnAgKj0gMikge1xuICAgIGNvcHkobmIuc2xpY2UoMCwgYnApLCBuYiwgYnApO1xuICB9XG5cbiAgcmV0dXJuIG5iO1xufVxuXG4vKiogQ29uY2F0ZW5hdGUgbXVsdGlwbGUgYmluYXJ5IGFycmF5cyBhbmQgcmV0dXJuIG5ldyBvbmUuXG4gKiBAcGFyYW0gYnVmIGJpbmFyeSBhcnJheXMgdG8gY29uY2F0ZW5hdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdCguLi5idWY6IFVpbnQ4QXJyYXlbXSk6IFVpbnQ4QXJyYXkge1xuICBsZXQgbGVuZ3RoID0gMDtcbiAgZm9yIChjb25zdCBiIG9mIGJ1Zikge1xuICAgIGxlbmd0aCArPSBiLmxlbmd0aDtcbiAgfVxuXG4gIGNvbnN0IG91dHB1dCA9IG5ldyBVaW50OEFycmF5KGxlbmd0aCk7XG4gIGxldCBpbmRleCA9IDA7XG4gIGZvciAoY29uc3QgYiBvZiBidWYpIHtcbiAgICBvdXRwdXQuc2V0KGIsIGluZGV4KTtcbiAgICBpbmRleCArPSBiLmxlbmd0aDtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG5cbi8qKiBDaGVjayBzb3VyY2UgYXJyYXkgY29udGFpbnMgcGF0dGVybiBhcnJheS5cbiAqIEBwYXJhbSBzb3VyY2Ugc291cmNlIGFycmF5XG4gKiBAcGFyYW0gcGF0IHBhdHRlciBhcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnMoc291cmNlOiBVaW50OEFycmF5LCBwYXQ6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIGluZGV4T2Yoc291cmNlLCBwYXQpICE9IC0xO1xufVxuXG4vKipcbiAqIENvcHkgYnl0ZXMgZnJvbSBvbmUgVWludDhBcnJheSB0byBhbm90aGVyLiAgQnl0ZXMgZnJvbSBgc3JjYCB3aGljaCBkb24ndCBmaXRcbiAqIGludG8gYGRzdGAgd2lsbCBub3QgYmUgY29waWVkLlxuICpcbiAqIEBwYXJhbSBzcmMgU291cmNlIGJ5dGUgYXJyYXlcbiAqIEBwYXJhbSBkc3QgRGVzdGluYXRpb24gYnl0ZSBhcnJheVxuICogQHBhcmFtIG9mZiBPZmZzZXQgaW50byBgZHN0YCBhdCB3aGljaCB0byBiZWdpbiB3cml0aW5nIHZhbHVlcyBmcm9tIGBzcmNgLlxuICogQHJldHVybiBudW1iZXIgb2YgYnl0ZXMgY29waWVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KHNyYzogVWludDhBcnJheSwgZHN0OiBVaW50OEFycmF5LCBvZmYgPSAwKTogbnVtYmVyIHtcbiAgb2ZmID0gTWF0aC5tYXgoMCwgTWF0aC5taW4ob2ZmLCBkc3QuYnl0ZUxlbmd0aCkpO1xuICBjb25zdCBkc3RCeXRlc0F2YWlsYWJsZSA9IGRzdC5ieXRlTGVuZ3RoIC0gb2ZmO1xuICBpZiAoc3JjLmJ5dGVMZW5ndGggPiBkc3RCeXRlc0F2YWlsYWJsZSkge1xuICAgIHNyYyA9IHNyYy5zdWJhcnJheSgwLCBkc3RCeXRlc0F2YWlsYWJsZSk7XG4gIH1cbiAgZHN0LnNldChzcmMsIG9mZik7XG4gIHJldHVybiBzcmMuYnl0ZUxlbmd0aDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUU7Ozs7Q0FJQyxHQUNELE9BQU8sU0FBUyxRQUNkLE1BQWtCLEVBQ2xCLEdBQWUsRUFDZixRQUFRLENBQUMsRUFDRDtJQUNSLElBQUksU0FBUyxPQUFPLE1BQU0sRUFBRTtRQUMxQixPQUFPLENBQUM7SUFDVixDQUFDO0lBQ0QsSUFBSSxRQUFRLEdBQUc7UUFDYixRQUFRO0lBQ1YsQ0FBQztJQUNELE1BQU0sSUFBSSxHQUFHLENBQUMsRUFBRTtJQUNoQixJQUFLLElBQUksSUFBSSxPQUFPLElBQUksT0FBTyxN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