// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { validateBinaryLike } from "./_util.ts";
/**
 * {@linkcode encodeBase64} and {@linkcode decodeBase64} for
 * [base64](https://en.wikipedia.org/wiki/Base64) encoding.
 *
 * This module is browser compatible.
 *
 * @example
 * ```ts
 * import {
 *   decodeBase64,
 *   encodeBase64,
 * } from "https://deno.land/std@$STD_VERSION/encoding/base64.ts";
 *
 * const b64Repr = "Zm9vYg==";
 *
 * const binaryData = decodeBase64(b64Repr);
 * console.log(binaryData);
 * // => Uint8Array [ 102, 111, 111, 98 ]
 *
 * console.log(encodeBase64(binaryData));
 * // => Zm9vYg==
 * ```
 *
 * @module
 */ const base64abc = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "/"
];
/**
 * @deprecated (will be removed in 0.210.0) Use a `encodeBase64` instead.
 *
 * CREDIT: https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
 * Encodes a given Uint8Array, ArrayBuffer or string into RFC4648 base64 representation
 * @param data
 */ export const encode = encodeBase64;
/**
 * @deprecated (will be removed in 0.210.0) Use a `decodeBase64` instead.
 *
 * Decodes a given RFC4648 base64 encoded string
 * @param b64
 */ export const decode = decodeBase64;
/**
 * Encodes a given Uint8Array, ArrayBuffer or string into RFC4648 base64 representation
 */ export function encodeBase64(data) {
    // CREDIT: https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
    const uint8 = validateBinaryLike(data);
    let result = "", i;
    const l = uint8.length;
    for(i = 2; i < l; i += 3){
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 0x0f) << 2 | uint8[i] >> 6];
        result += base64abc[uint8[i] & 0x3f];
    }
    if (i === l + 1) {
        // 1 octet yet to write
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4];
        result += "==";
    }
    if (i === l) {
        // 2 octets yet to write
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 0x0f) << 2];
        result += "=";
    }
    return result;
}
/**
 * Decodes a given RFC4648 base64 encoded string
 */ export function decodeBase64(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for(let i = 0; i < size; i++){
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwNi4wL2VuY29kaW5nL2Jhc2U2NC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyB2YWxpZGF0ZUJpbmFyeUxpa2UgfSBmcm9tIFwiLi9fdXRpbC50c1wiO1xuXG4vKipcbiAqIHtAbGlua2NvZGUgZW5jb2RlQmFzZTY0fSBhbmQge0BsaW5rY29kZSBkZWNvZGVCYXNlNjR9IGZvclxuICogW2Jhc2U2NF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmFzZTY0KSBlbmNvZGluZy5cbiAqXG4gKiBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQge1xuICogICBkZWNvZGVCYXNlNjQsXG4gKiAgIGVuY29kZUJhc2U2NCxcbiAqIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZW5jb2RpbmcvYmFzZTY0LnRzXCI7XG4gKlxuICogY29uc3QgYjY0UmVwciA9IFwiWm05dllnPT1cIjtcbiAqXG4gKiBjb25zdCBiaW5hcnlEYXRhID0gZGVjb2RlQmFzZTY0KGI2NFJlcHIpO1xuICogY29uc29sZS5sb2coYmluYXJ5RGF0YSk7XG4gKiAvLyA9PiBVaW50OEFycmF5IFsgMTAyLCAxMTEsIDExMSwgOTggXVxuICpcbiAqIGNvbnNvbGUubG9nKGVuY29kZUJhc2U2NChiaW5hcnlEYXRhKSk7XG4gKiAvLyA9PiBabTl2WWc9PVxuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmNvbnN0IGJhc2U2NGFiYyA9IFtcbiAgXCJBXCIsXG4gIFwiQlwiLFxuICBcIkNcIixcbiAgXCJEXCIsXG4gIFwiRVwiLFxuICBcIkZcIixcbiAgXCJHXCIsXG4gIFwiSFwiLFxuICBcIklcIixcbiAgXCJKXCIsXG4gIFwiS1wiLFxuICBcIkxcIixcbiAgXCJNXCIsXG4gIFwiTlwiLFxuICBcIk9cIixcbiAgXCJQXCIsXG4gIFwiUVwiLFxuICBcIlJcIixcbiAgXCJTXCIsXG4gIFwiVFwiLFxuICBcIlVcIixcbiAgXCJWXCIsXG4gIFwiV1wiLFxuICBcIlhcIixcbiAgXCJZXCIsXG4gIFwiWlwiLFxuICBcImFcIixcbiAgXCJiXCIsXG4gIFwiY1wiLFxuICBcImRcIixcbiAgXCJlXCIsXG4gIFwiZlwiLFxuICBcImdcIixcbiAgXCJoXCIsXG4gIFwiaVwiLFxuICBcImpcIixcbiAgXCJrXCIsXG4gIFwibFwiLFxuICBcIm1cIixcbiAgXCJuXCIsXG4gIFwib1wiLFxuICBcInBcIixcbiAgXCJxXCIsXG4gIFwiclwiLFxuICBcInNcIixcbiAgXCJ0XCIsXG4gIFwidVwiLFxuICBcInZcIixcbiAgXCJ3XCIsXG4gIFwieFwiLFxuICBcInlcIixcbiAgXCJ6XCIsXG4gIFwiMFwiLFxuICBcIjFcIixcbiAgXCIyXCIsXG4gIFwiM1wiLFxuICBcIjRcIixcbiAgXCI1XCIsXG4gIFwiNlwiLFxuICBcIjdcIixcbiAgXCI4XCIsXG4gIFwiOVwiLFxuICBcIitcIixcbiAgXCIvXCIsXG5dO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkICh3aWxsIGJlIHJlbW92ZWQgaW4gMC4yMTAuMCkgVXNlIGEgYGVuY29kZUJhc2U2NGAgaW5zdGVhZC5cbiAqXG4gKiBDUkVESVQ6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2VuZXBvbW55YXNjaGloLzcyYzQyM2Y3MjdkMzk1ZWVhYTA5Njk3MDU4MjM4NzI3XG4gKiBFbmNvZGVzIGEgZ2l2ZW4gVWludDhBcnJheSwgQXJyYXlCdWZmZXIgb3Igc3RyaW5nIGludG8gUkZDNDY0OCBiYXNlNjQgcmVwcmVzZW50YXRpb25cbiAqIEBwYXJhbSBkYXRhXG4gKi9cbmV4cG9ydCBjb25zdCBlbmNvZGUgPSBlbmNvZGVCYXNlNjQ7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgKHdpbGwgYmUgcmVtb3ZlZCBpbiAwLjIxMC4wKSBVc2UgYSBgZGVjb2RlQmFzZTY0YCBpbnN0ZWFkLlxuICpcbiAqIERlY29kZXMgYSBnaXZlbiBSRkM0NjQ4IGJhc2U2NCBlbmNvZGVkIHN0cmluZ1xuICogQHBhcmFtIGI2NFxuICovXG5leHBvcnQgY29uc3QgZGVjb2RlID0gZGVjb2RlQmFzZTY0O1xuXG4vKipcbiAqIEVuY29kZXMgYSBnaXZlbiBVaW50OEFycmF5LCBBcnJheUJ1ZmZlciBvciBzdHJpbmcgaW50byBSRkM0NjQ4IGJhc2U2NCByZXByZXNlbnRhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQmFzZTY0KGRhdGE6IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSB8IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIENSRURJVDogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZW5lcG9tbnlhc2NoaWgvNzJjNDIzZjcyN2QzOTVlZWFhMDk2OTcwNTgyMzg3MjdcbiAgY29uc3QgdWludDggPSB2YWxpZGF0ZUJpbmFyeUxpa2UoZGF0YSk7XG4gIGxldCByZXN1bHQgPSBcIlwiLFxuICAgIGk7XG4gIGNvbnN0IGwgPSB1aW50OC5sZW5ndGg7XG4gIGZvciAoaSA9IDI7IGkgPCBsOyBpICs9IDMpIHtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjW3VpbnQ4W2kgLSAyXSA+PiAyXTtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjWygodWludDhbaSAtIDJdICYgMHgwMykgPDwgNCkgfCAodWludDhbaSAtIDFdID4+IDQpXTtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjWygodWludDhbaSAtIDFdICYgMHgwZikgPDwgMikgfCAodWludDhbaV0gPj4gNildO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbdWludDhbaV0gJiAweDNmXTtcbiAgfVxuICBpZiAoaSA9PT0gbCArIDEpIHtcbiAgICAvLyAxIG9jdGV0IHlldCB0byB3cml0ZVxuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbdWludDhbaSAtIDJdID4+IDJdO1xuICAgIHJlc3VsdCArPSBiYXNlNjRhYmNbKHVpbnQ4W2kgLSAyXSAmIDB4MDMpIDw8IDRdO1xuICAgIHJlc3VsdCArPSBcIj09XCI7XG4gIH1cbiAgaWYgKGkgPT09IGwpIHtcbiAgICAvLyAyIG9jdGV0cyB5ZXQgdG8gd3JpdGVcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjW3VpbnQ4W2kgLSAyXSA+PiAyXTtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjWygodWludDhbaSAtIDJdICYgMHgwMykgPDwgNCkgfCAodWludDhbaSAtIDFdID4+IDQpXTtcbiAgICByZXN1bHQgKz0gYmFzZTY0YWJjWyh1aW50OFtpIC0gMV0gJiAweDBmKSA8PCAyXTtcbiAgICByZXN1bHQgKz0gXCI9XCI7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZWNvZGVzIGEgZ2l2ZW4gUkZDNDY0OCBiYXNlNjQgZW5jb2RlZCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZUJhc2U2NChiNjQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBjb25zdCBiaW5TdHJpbmcgPSBhdG9iKGI2NCk7XG4gIGNvbnN0IHNpemUgPSBiaW5TdHJpbmcubGVuZ3RoO1xuICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KHNpemUpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgIGJ5dGVzW2ldID0gYmluU3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gIH1cbiAgcmV0dXJuIGJ5dGVzO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxrQkFBa0IsUUFBUSxhQUFhO0FBRWhEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QkMsR0FFRCxNQUFNLFlBQVk7SUFDaEI7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNB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