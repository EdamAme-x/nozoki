import { sha256 } from './crypto.ts';
export const equal = (a, b)=>{
    if (a === b) {
        return true;
    }
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    const va = new DataView(a);
    const vb = new DataView(b);
    let i = va.byteLength;
    while(i--){
        if (va.getUint8(i) !== vb.getUint8(i)) {
            return false;
        }
    }
    return true;
};
export const timingSafeEqual = async (a, b, hashFunction)=>{
    if (!hashFunction) {
        hashFunction = sha256;
    }
    const sa = await hashFunction(a);
    const sb = await hashFunction(b);
    if (!sa || !sb) {
        return false;
    }
    return sa === sb && a === b;
};
export const bufferToString = (buffer)=>{
    if (buffer instanceof ArrayBuffer) {
        const enc = new TextDecoder('utf-8');
        return enc.decode(buffer);
    }
    return buffer;
};
export const bufferToFormData = (arrayBuffer, contentType)=>{
    const response = new Response(arrayBuffer, {
        headers: {
            'Content-Type': contentType
        }
    });
    return response.formData();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL3V0aWxzL2J1ZmZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzaGEyNTYgfSBmcm9tICcuL2NyeXB0by50cydcblxuZXhwb3J0IGNvbnN0IGVxdWFsID0gKGE6IEFycmF5QnVmZmVyLCBiOiBBcnJheUJ1ZmZlcikgPT4ge1xuICBpZiAoYSA9PT0gYikge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgaWYgKGEuYnl0ZUxlbmd0aCAhPT0gYi5ieXRlTGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjb25zdCB2YSA9IG5ldyBEYXRhVmlldyhhKVxuICBjb25zdCB2YiA9IG5ldyBEYXRhVmlldyhiKVxuXG4gIGxldCBpID0gdmEuYnl0ZUxlbmd0aFxuICB3aGlsZSAoaS0tKSB7XG4gICAgaWYgKHZhLmdldFVpbnQ4KGkpICE9PSB2Yi5nZXRVaW50OChpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZXhwb3J0IGNvbnN0IHRpbWluZ1NhZmVFcXVhbCA9IGFzeW5jIChcbiAgYTogc3RyaW5nIHwgb2JqZWN0IHwgYm9vbGVhbixcbiAgYjogc3RyaW5nIHwgb2JqZWN0IHwgYm9vbGVhbixcbiAgaGFzaEZ1bmN0aW9uPzogRnVuY3Rpb25cbikgPT4ge1xuICBpZiAoIWhhc2hGdW5jdGlvbikge1xuICAgIGhhc2hGdW5jdGlvbiA9IHNoYTI1NlxuICB9XG5cbiAgY29uc3Qgc2EgPSBhd2FpdCBoYXNoRnVuY3Rpb24oYSlcbiAgY29uc3Qgc2IgPSBhd2FpdCBoYXNoRnVuY3Rpb24oYilcblxuICBpZiAoIXNhIHx8ICFzYikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHNhID09PSBzYiAmJiBhID09PSBiXG59XG5cbmV4cG9ydCBjb25zdCBidWZmZXJUb1N0cmluZyA9IChidWZmZXI6IEFycmF5QnVmZmVyKTogc3RyaW5nID0+IHtcbiAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHREZWNvZGVyKCd1dGYtOCcpXG4gICAgcmV0dXJuIGVuYy5kZWNvZGUoYnVmZmVyKVxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZXhwb3J0IGNvbnN0IGJ1ZmZlclRvRm9ybURhdGEgPSAoYXJyYXlCdWZmZXI6IEFycmF5QnVmZmVyLCBjb250ZW50VHlwZTogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKGFycmF5QnVmZmVyLCB7XG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6IGNvbnRlbnRUeXBlLFxuICAgIH0sXG4gIH0pXG4gIHJldHVybiByZXNwb25zZS5mb3JtRGF0YSgpXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxNQUFNLFFBQVEsY0FBYTtBQUVwQyxPQUFPLE1BQU0sUUFBUSxDQUFDLEdBQWdCLElBQW1CO0lBQ3ZELElBQUksTUFBTSxHQUFHO1FBQ1gsT0FBTyxJQUFJO0lBQ2IsQ0FBQztJQUNELElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxVQUFVLEVBQUU7UUFDakMsT0FBTyxLQUFLO0lBQ2QsQ0FBQztJQUVELE1BQU0sS0FBSyxJQUFJLFNBQVM7SUFDeEIsTUFBTSxLQUFLLElBQUksU0FBUztJQUV4QixJQUFJLElBQUksR0FBRyxVQUFVO0lBQ3JCLE1BQU8sSUFBSztRQUNWLElBQUksR0FBRyxRQUFRLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJO1lBQ3JDLE9BQU8sS0FBSztRQUNkLENBQUM7SUFDSDtJQUVBLE9BQU8sSUFBSTtBQUNiLEVBQUM7QUFFRCxPQUFPLE1BQU0sa0JBQWtCLE9BQzdCLEdBQ0EsR0FDQSxlQUNHO0lBQ0gsSUFBSSxDQUFDLGNBQWM7UUFDakIsZUFBZTtJQUNqQixDQUFDO0lBRUQsTUFBTSxLQUFLLE1BQU0sYUFBYTtJQUM5QixNQUFNLEtBQUssTUFBTSxhQUFhO0lBRTlCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUNkLE9BQU8sS0FBSztJQUNkLENBQUM7SUFFRCxPQUFPLE9BQU8sTUFBTSxNQUFNO0FBQzVCLEVBQUM7QUFFRCxPQUFPLE1BQU0saUJBQWlCLENBQUMsU0FBZ0M7SUFDN0QsSUFBSSxrQkFBa0IsYUFBYTtRQUNqQyxNQUFNLE1BQU0sSUFBSSxZQUFZO1FBQzVCLE9BQU8sSUFBSSxNQUFNLENBQUM7SUFDcEIsQ0FBQztJQUNELE9BQU87QUFDVCxFQUFDO0FBRUQsT0FBTyxNQUFNLG1CQUFtQixDQUFDLGFBQTBCLGNBQXdCO0lBQ2pGLE1BQU0sV0FBVyxJQUFJLFNBQVMsYUFBYTtRQUN6QyxTQUFTO1lBQ1AsZ0JBQWdCO1FBQ2xCO0lBQ0Y7SUFDQSxPQUFPLFNBQVMsUUFBUTtBQUMxQixFQUFDIn0=