// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
const encoder = new TextEncoder();
function getTypeName(value) {
    const type = typeof value;
    if (type !== "object") {
        return type;
    } else if (value === null) {
        return "null";
    } else {
        return value?.constructor?.name ?? "object";
    }
}
export function validateBinaryLike(source) {
    if (typeof source === "string") {
        return encoder.encode(source);
    } else if (source instanceof Uint8Array) {
        return source;
    } else if (source instanceof ArrayBuffer) {
        return new Uint8Array(source);
    }
    throw new TypeError(`The input must be a Uint8Array, a string, or an ArrayBuffer. Received a value of the type ${getTypeName(source)}.`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwNi4wL2VuY29kaW5nL191dGlsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcblxuZnVuY3Rpb24gZ2V0VHlwZU5hbWUodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICBpZiAodHlwZSAhPT0gXCJvYmplY3RcIikge1xuICAgIHJldHVybiB0eXBlO1xuICB9IGVsc2UgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFwibnVsbFwiO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWx1ZT8uY29uc3RydWN0b3I/Lm5hbWUgPz8gXCJvYmplY3RcIjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVCaW5hcnlMaWtlKHNvdXJjZTogdW5rbm93bik6IFVpbnQ4QXJyYXkge1xuICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiBlbmNvZGVyLmVuY29kZShzb3VyY2UpO1xuICB9IGVsc2UgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICByZXR1cm4gc291cmNlO1xuICB9IGVsc2UgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHNvdXJjZSk7XG4gIH1cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICBgVGhlIGlucHV0IG11c3QgYmUgYSBVaW50OEFycmF5LCBhIHN0cmluZywgb3IgYW4gQXJyYXlCdWZmZXIuIFJlY2VpdmVkIGEgdmFsdWUgb2YgdGhlIHR5cGUgJHtcbiAgICAgIGdldFR5cGVOYW1lKHNvdXJjZSlcbiAgICB9LmAsXG4gICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLE1BQU0sVUFBVSxJQUFJO0FBRXBCLFNBQVMsWUFBWSxLQUFjLEVBQVU7SUFDM0MsTUFBTSxPQUFPLE9BQU87SUFDcEIsSUFBSSxTQUFTLFVBQVU7UUFDckIsT0FBTztJQUNULE9BQU8sSUFBSSxVQUFVLElBQUksRUFBRTtRQUN6QixPQUFPO0lBQ1QsT0FBTztRQUNMLE9BQU8sT0FBTyxhQUFhLFFBQVE7SUFDckMsQ0FBQztBQUNIO0FBRUEsT0FBTyxTQUFTLG1CQUFtQixNQUFlLEVBQWM7SUFDOUQsSUFBSSxPQUFPLFdBQVcsVUFBVTtRQUM5QixPQUFPLFFBQVEsTUFBTSxDQUFDO0lBQ3hCLE9BQU8sSUFBSSxrQkFBa0IsWUFBWTtRQUN2QyxPQUFPO0lBQ1QsT0FBTyxJQUFJLGtCQUFrQixhQUFhO1FBQ3hDLE9BQU8sSUFBSSxXQUFXO0lBQ3hCLENBQUM7SUFDRCxNQUFNLElBQUksVUFDUixDQUFDLDBGQUEwRixFQUN6RixZQUFZLFFBQ2IsQ0FBQyxDQUFDLEVBQ0g7QUFDSixDQUFDIn0=