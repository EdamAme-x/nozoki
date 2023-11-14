/*!
 * Ported from: https://github.com/jshttp/mime-types and licensed as:
 *
 * (The MIT License)
 *
 * Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
 * Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
 * Copyright (c) 2020 the Deno authors
 * Copyright (c) 2020 the oak authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */ import { db } from "./db.ts";
import { extname } from "./deps.ts";
const EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
const TEXT_TYPE_REGEXP = /^text\//i;
/** A map of extensions for a given media type */ export const extensions = new Map();
/** A map of the media type for a given extension */ export const types = new Map();
/** Internal function to populate the maps based on the Mime DB */ function populateMaps(extensions, types) {
    const preference = [
        "nginx",
        "apache",
        undefined,
        "iana"
    ];
    for (const type of Object.keys(db)){
        const mime = db[type];
        const exts = mime.extensions;
        if (!exts || !exts.length) {
            continue;
        }
        extensions.set(type, exts);
        for (const ext of exts){
            const current = types.get(ext);
            if (current) {
                const from = preference.indexOf(db[current].source);
                const to = preference.indexOf(mime.source);
                if (current !== "application/octet-stream" && (from > to || from === to && current.substr(0, 12) === "application/")) {
                    continue;
                }
            }
            types.set(ext, type);
        }
    }
}
// Populate the maps upon module load
populateMaps(extensions, types);
/** Given a media type return any default charset string.  Returns `undefined`
 * if not resolvable.
 */ export function charset(type) {
    const m = EXTRACT_TYPE_REGEXP.exec(type);
    if (!m) {
        return undefined;
    }
    const [match] = m;
    const mime = db[match.toLowerCase()];
    if (mime && mime.charset) {
        return mime.charset;
    }
    if (TEXT_TYPE_REGEXP.test(match)) {
        return "UTF-8";
    }
    return undefined;
}
/** Given an extension, lookup the appropriate media type for that extension.
 * Likely you should be using `contentType()` though instead.
 */ export function lookup(path) {
    const extension = extname("x." + path).toLowerCase().substr(1);
    return types.get(extension);
}
/** Given an extension or media type, return the full `Content-Type` header
 * string.  Returns `undefined` if not resolvable.
 */ export function contentType(str) {
    let mime = str.includes("/") ? str : lookup(str);
    if (!mime) {
        return undefined;
    }
    if (!mime.includes("charset")) {
        const cs = charset(mime);
        if (cs) {
            mime += `; charset=${cs.toLowerCase()}`;
        }
    }
    return mime;
}
/** Given a media type, return the most appropriate extension or return
 * `undefined` if there is none.
 */ export function extension(type) {
    const match = EXTRACT_TYPE_REGEXP.exec(type);
    if (!match) {
        return undefined;
    }
    const exts = extensions.get(match[1].toLowerCase());
    if (!exts || !exts.length) {
        return undefined;
    }
    return exts[0];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvbWVkaWFfdHlwZXNAdjIuNy4xL21vZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIFBvcnRlZCBmcm9tOiBodHRwczovL2dpdGh1Yi5jb20vanNodHRwL21pbWUtdHlwZXMgYW5kIGxpY2Vuc2VkIGFzOlxuICpcbiAqIChUaGUgTUlUIExpY2Vuc2UpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0IEpvbmF0aGFuIE9uZyA8bWVAam9uZ2xlYmVycnkuY29tPlxuICogQ29weXJpZ2h0IChjKSAyMDE1IERvdWdsYXMgQ2hyaXN0b3BoZXIgV2lsc29uIDxkb3VnQHNvbWV0aGluZ2RvdWcuY29tPlxuICogQ29weXJpZ2h0IChjKSAyMDIwIHRoZSBEZW5vIGF1dGhvcnNcbiAqIENvcHlyaWdodCAoYykgMjAyMCB0aGUgb2FrIGF1dGhvcnNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuICogJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbiAqIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZXG4gKiBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuICogVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEVcbiAqIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbmltcG9ydCB7IGRiIH0gZnJvbSBcIi4vZGIudHNcIjtcbmltcG9ydCB7IGV4dG5hbWUgfSBmcm9tIFwiLi9kZXBzLnRzXCI7XG5cbmNvbnN0IEVYVFJBQ1RfVFlQRV9SRUdFWFAgPSAvXlxccyooW147XFxzXSopKD86O3xcXHN8JCkvO1xuY29uc3QgVEVYVF9UWVBFX1JFR0VYUCA9IC9edGV4dFxcLy9pO1xuXG4vKiogQSBtYXAgb2YgZXh0ZW5zaW9ucyBmb3IgYSBnaXZlbiBtZWRpYSB0eXBlICovXG5leHBvcnQgY29uc3QgZXh0ZW5zaW9ucyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcblxuLyoqIEEgbWFwIG9mIHRoZSBtZWRpYSB0eXBlIGZvciBhIGdpdmVuIGV4dGVuc2lvbiAqL1xuZXhwb3J0IGNvbnN0IHR5cGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuLyoqIEludGVybmFsIGZ1bmN0aW9uIHRvIHBvcHVsYXRlIHRoZSBtYXBzIGJhc2VkIG9uIHRoZSBNaW1lIERCICovXG5mdW5jdGlvbiBwb3B1bGF0ZU1hcHMoXG4gIGV4dGVuc2lvbnM6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPixcbiAgdHlwZXM6IE1hcDxzdHJpbmcsIHN0cmluZz4sXG4pOiB2b2lkIHtcbiAgY29uc3QgcHJlZmVyZW5jZSA9IFtcIm5naW54XCIsIFwiYXBhY2hlXCIsIHVuZGVmaW5lZCwgXCJpYW5hXCJdO1xuXG4gIGZvciAoY29uc3QgdHlwZSBvZiBPYmplY3Qua2V5cyhkYikpIHtcbiAgICBjb25zdCBtaW1lID0gZGJbdHlwZV07XG4gICAgY29uc3QgZXh0cyA9IG1pbWUuZXh0ZW5zaW9ucztcblxuICAgIGlmICghZXh0cyB8fCAhZXh0cy5sZW5ndGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGV4dGVuc2lvbnMuc2V0KHR5cGUsIGV4dHMpO1xuXG4gICAgZm9yIChjb25zdCBleHQgb2YgZXh0cykge1xuICAgICAgY29uc3QgY3VycmVudCA9IHR5cGVzLmdldChleHQpO1xuICAgICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgICAgY29uc3QgZnJvbSA9IHByZWZlcmVuY2UuaW5kZXhPZihkYltjdXJyZW50XS5zb3VyY2UpO1xuICAgICAgICBjb25zdCB0byA9IHByZWZlcmVuY2UuaW5kZXhPZihtaW1lLnNvdXJjZSk7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGN1cnJlbnQgIT09IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIgJiZcbiAgICAgICAgICAoZnJvbSA+IHRvIHx8XG4gICAgICAgICAgICAoZnJvbSA9PT0gdG8gJiYgY3VycmVudC5zdWJzdHIoMCwgMTIpID09PSBcImFwcGxpY2F0aW9uL1wiKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdHlwZXMuc2V0KGV4dCwgdHlwZSk7XG4gICAgfVxuICB9XG59XG5cbi8vIFBvcHVsYXRlIHRoZSBtYXBzIHVwb24gbW9kdWxlIGxvYWRcbnBvcHVsYXRlTWFwcyhleHRlbnNpb25zLCB0eXBlcyk7XG5cbi8qKiBHaXZlbiBhIG1lZGlhIHR5cGUgcmV0dXJuIGFueSBkZWZhdWx0IGNoYXJzZXQgc3RyaW5nLiAgUmV0dXJucyBgdW5kZWZpbmVkYFxuICogaWYgbm90IHJlc29sdmFibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGFyc2V0KHR5cGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IG0gPSBFWFRSQUNUX1RZUEVfUkVHRVhQLmV4ZWModHlwZSk7XG4gIGlmICghbSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgY29uc3QgW21hdGNoXSA9IG07XG4gIGNvbnN0IG1pbWUgPSBkYlttYXRjaC50b0xvd2VyQ2FzZSgpXTtcblxuICBpZiAobWltZSAmJiBtaW1lLmNoYXJzZXQpIHtcbiAgICByZXR1cm4gbWltZS5jaGFyc2V0O1xuICB9XG5cbiAgaWYgKFRFWFRfVFlQRV9SRUdFWFAudGVzdChtYXRjaCkpIHtcbiAgICByZXR1cm4gXCJVVEYtOFwiO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqIEdpdmVuIGFuIGV4dGVuc2lvbiwgbG9va3VwIHRoZSBhcHByb3ByaWF0ZSBtZWRpYSB0eXBlIGZvciB0aGF0IGV4dGVuc2lvbi5cbiAqIExpa2VseSB5b3Ugc2hvdWxkIGJlIHVzaW5nIGBjb250ZW50VHlwZSgpYCB0aG91Z2ggaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvb2t1cChwYXRoOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBjb25zdCBleHRlbnNpb24gPSBleHRuYW1lKFwieC5cIiArIHBhdGgpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAuc3Vic3RyKDEpO1xuXG4gIHJldHVybiB0eXBlcy5nZXQoZXh0ZW5zaW9uKTtcbn1cblxuLyoqIEdpdmVuIGFuIGV4dGVuc2lvbiBvciBtZWRpYSB0eXBlLCByZXR1cm4gdGhlIGZ1bGwgYENvbnRlbnQtVHlwZWAgaGVhZGVyXG4gKiBzdHJpbmcuICBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vdCByZXNvbHZhYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udGVudFR5cGUoc3RyOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBsZXQgbWltZSA9IHN0ci5pbmNsdWRlcyhcIi9cIikgPyBzdHIgOiBsb29rdXAoc3RyKTtcblxuICBpZiAoIW1pbWUpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKCFtaW1lLmluY2x1ZGVzKFwiY2hhcnNldFwiKSkge1xuICAgIGNvbnN0IGNzID0gY2hhcnNldChtaW1lKTtcbiAgICBpZiAoY3MpIHtcbiAgICAgIG1pbWUgKz0gYDsgY2hhcnNldD0ke2NzLnRvTG93ZXJDYXNlKCl9YDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWltZTtcbn1cblxuLyoqIEdpdmVuIGEgbWVkaWEgdHlwZSwgcmV0dXJuIHRoZSBtb3N0IGFwcHJvcHJpYXRlIGV4dGVuc2lvbiBvciByZXR1cm5cbiAqIGB1bmRlZmluZWRgIGlmIHRoZXJlIGlzIG5vbmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRlbnNpb24odHlwZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgbWF0Y2ggPSBFWFRSQUNUX1RZUEVfUkVHRVhQLmV4ZWModHlwZSk7XG5cbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBjb25zdCBleHRzID0gZXh0ZW5zaW9ucy5nZXQobWF0Y2hbMV0udG9Mb3dlckNhc2UoKSk7XG5cbiAgaWYgKCFleHRzIHx8ICFleHRzLmxlbmd0aCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gZXh0c1swXTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTRCQyxHQUVELFNBQVMsRUFBRSxRQUFRLFVBQVU7QUFDN0IsU0FBUyxPQUFPLFFBQVEsWUFBWTtBQUVwQyxNQUFNLHNCQUFzQjtBQUM1QixNQUFNLG1CQUFtQjtBQUV6QiwrQ0FBK0MsR0FDL0MsT0FBTyxNQUFNLGFBQWEsSUFBSSxNQUF3QjtBQUV0RCxrREFBa0QsR0FDbEQsT0FBTyxNQUFNLFFBQVEsSUFBSSxNQUFzQjtBQUUvQyxnRUFBZ0UsR0FDaEUsU0FBUyxhQUNQLFVBQWlDLEVBQ2pDLEtBQTBCLEVBQ3BCO0lBQ04sTUFBTSxhQUFhO1FBQUM7UUFBUztRQUFVO1FBQVc7S0FBTztJQUV6RCxLQUFLLE1BQU0sUUFBUSxPQUFPLElBQUksQ0FBQyxJQUFLO1FBQ2xDLE1BQU0sT0FBTyxFQUFFLENBQUMsS0FBSztRQUNyQixNQUFNLE9BQU8sS0FBSyxVQUFVO1FBRTVCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxNQUFNLEVBQUU7WUFDekIsUUFBUztRQUNYLENBQUM7UUFFRCxXQUFXLEdBQUcsQ0FBQyxNQUFNO1FBRXJCLEtBQUssTUFBTSxPQUFPLEtBQU07WUFDdEIsTUFBTSxVQUFVLE1BQU0sR0FBRyxDQUFDO1lBQzFCLElBQUksU0FBUztnQkFDWCxNQUFNLE9BQU8sV0FBVyxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNO2dCQUNsRCxNQUFNLEtBQUssV0FBVyxPQUFPLENBQUMsS0FBSyxNQUFNO2dCQUV6QyxJQUNFLFlBQVksOEJBQ1osQ0FBQyxPQUFPLE1BQ0wsU0FBUyxNQUFNLFFBQVEsTUFBTSxDQUFDLEdBQUcsUUFBUSxjQUFlLEdBQzNEO29CQUNBLFFBQVM7Z0JBQ1gsQ0FBQztZQUNILENBQUM7WUFFRCxNQUFNLEdBQUcsQ0FBQyxLQUFLO1FBQ2pCO0lBQ0Y7QUFDRjtBQUVBLHFDQUFxQztBQUNyQyxhQUFhLFlBQVk7QUFFekI7O0NBRUMsR0FDRCxPQUFPLFNBQVMsUUFBUSxJQUFZLEVBQXNCO0lBQ3hELE1BQU0sSUFBSSxvQkFBb0IsSUFBSSxDQUFDO0lBQ25DLElBQUksQ0FBQyxHQUFHO1FBQ04sT0FBTztJQUNULENBQUM7SUFDRCxNQUFNLENBQUMsTUFBTSxHQUFHO0lBQ2hCLE1BQU0sT0FBTyxFQUFFLENBQUMsTUFBTSxXQUFXLEdBQUc7SUFFcEMsSUFBSSxRQUFRLEtBQUssT0FBTyxFQUFFO1FBQ3hCLE9BQU8sS0FBSyxPQUFPO0lBQ3JCLENBQUM7SUFFRCxJQUFJLGlCQUFpQixJQUFJLENBQUMsUUFBUTtRQUNoQyxPQUFPO0lBQ1QsQ0FBQztJQUVELE9BQU87QUFDVCxDQUFDO0FBRUQ7O0NBRUMsR0FDRCxPQUFPLFNBQVMsT0FBTyxJQUFZLEVBQXNCO0lBQ3ZELE1BQU0sWUFBWSxRQUFRLE9BQU8sTUFDOUIsV0FBVyxHQUNYLE1BQU0sQ0FBQztJQUVWLE9BQU8sTUFBTSxHQUFHLENBQUM7QUFDbkIsQ0FBQztBQUVEOztDQUVDLEdBQ0QsT0FBTyxTQUFTLFlBQVksR0FBVyxFQUFzQjtJQUMzRCxJQUFJLE9BQU8sSUFBSSxRQUFRLENBQUMsT0FBTyxNQUFNLE9BQU8sSUFBSTtJQUVoRCxJQUFJLENBQUMsTUFBTTtRQUNULE9BQU87SUFDVCxDQUFDO0lBRUQsSUFBSSxDQUFDLEtBQUssUUFBUSxDQUFDLFlBQVk7UUFDN0IsTUFBTSxLQUFLLFFBQVE7UUFDbkIsSUFBSSxJQUFJO1lBQ04sUUFBUSxDQUFDLFVBQVUsRUFBRSxHQUFHLFdBQVcsR0FBRyxDQUFDO1FBQ3pDLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTztBQUNULENBQUM7QUFFRDs7Q0FFQyxHQUNELE9BQU8sU0FBUyxVQUFVLElBQVksRUFBc0I7SUFDMUQsTUFBTSxRQUFRLG9CQUFvQixJQUFJLENBQUM7SUFFdkMsSUFBSSxDQUFDLE9BQU87UUFDVixPQUFPO0lBQ1QsQ0FBQztJQUVELE1BQU0sT0FBTyxXQUFXLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVc7SUFFaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLE1BQU0sRUFBRTtRQUN6QixPQUFPO0lBQ1QsQ0FBQztJQUVELE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDaEIsQ0FBQyJ9