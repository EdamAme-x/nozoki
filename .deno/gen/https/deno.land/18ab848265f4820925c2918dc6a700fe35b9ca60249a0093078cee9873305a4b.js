export const sha256 = async (data)=>{
    const algorithm = {
        name: 'SHA-256',
        alias: 'sha256'
    };
    const hash = await createHash(data, algorithm);
    return hash;
};
export const sha1 = async (data)=>{
    const algorithm = {
        name: 'SHA-1',
        alias: 'sha1'
    };
    const hash = await createHash(data, algorithm);
    return hash;
};
export const md5 = async (data)=>{
    const algorithm = {
        name: 'MD5',
        alias: 'md5'
    };
    const hash = await createHash(data, algorithm);
    return hash;
};
export const createHash = async (data, algorithm)=>{
    let sourceBuffer;
    if (data instanceof ReadableStream) {
        let body = '';
        const reader = data.getReader();
        await reader?.read().then(async (chuck)=>{
            const value = await createHash(chuck.value || '', algorithm);
            body += value;
        });
        return body;
    }
    if (ArrayBuffer.isView(data) || data instanceof ArrayBuffer) {
        sourceBuffer = data;
    } else {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }
        sourceBuffer = new TextEncoder().encode(String(data));
    }
    if (crypto && crypto.subtle) {
        const buffer = await crypto.subtle.digest({
            name: algorithm.name
        }, sourceBuffer);
        const hash = Array.prototype.map.call(new Uint8Array(buffer), (x)=>('00' + x.toString(16)).slice(-2)).join('');
        return hash;
    }
    return null;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL3V0aWxzL2NyeXB0by50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJ0eXBlIEFsZ29yaXRobSA9IHtcbiAgbmFtZTogc3RyaW5nXG4gIGFsaWFzOiBzdHJpbmdcbn1cblxudHlwZSBEYXRhID0gc3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlciB8IG9iamVjdCB8IEFycmF5QnVmZmVyVmlldyB8IEFycmF5QnVmZmVyIHwgUmVhZGFibGVTdHJlYW1cblxuZXhwb3J0IGNvbnN0IHNoYTI1NiA9IGFzeW5jIChkYXRhOiBEYXRhKSA9PiB7XG4gIGNvbnN0IGFsZ29yaXRobTogQWxnb3JpdGhtID0geyBuYW1lOiAnU0hBLTI1NicsIGFsaWFzOiAnc2hhMjU2JyB9XG4gIGNvbnN0IGhhc2ggPSBhd2FpdCBjcmVhdGVIYXNoKGRhdGEsIGFsZ29yaXRobSlcbiAgcmV0dXJuIGhhc2hcbn1cblxuZXhwb3J0IGNvbnN0IHNoYTEgPSBhc3luYyAoZGF0YTogRGF0YSkgPT4ge1xuICBjb25zdCBhbGdvcml0aG06IEFsZ29yaXRobSA9IHsgbmFtZTogJ1NIQS0xJywgYWxpYXM6ICdzaGExJyB9XG4gIGNvbnN0IGhhc2ggPSBhd2FpdCBjcmVhdGVIYXNoKGRhdGEsIGFsZ29yaXRobSlcbiAgcmV0dXJuIGhhc2hcbn1cblxuZXhwb3J0IGNvbnN0IG1kNSA9IGFzeW5jIChkYXRhOiBEYXRhKSA9PiB7XG4gIGNvbnN0IGFsZ29yaXRobTogQWxnb3JpdGhtID0geyBuYW1lOiAnTUQ1JywgYWxpYXM6ICdtZDUnIH1cbiAgY29uc3QgaGFzaCA9IGF3YWl0IGNyZWF0ZUhhc2goZGF0YSwgYWxnb3JpdGhtKVxuICByZXR1cm4gaGFzaFxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlSGFzaCA9IGFzeW5jIChkYXRhOiBEYXRhLCBhbGdvcml0aG06IEFsZ29yaXRobSk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4gPT4ge1xuICBsZXQgc291cmNlQnVmZmVyOiBBcnJheUJ1ZmZlclZpZXcgfCBBcnJheUJ1ZmZlclxuXG4gIGlmIChkYXRhIGluc3RhbmNlb2YgUmVhZGFibGVTdHJlYW0pIHtcbiAgICBsZXQgYm9keSA9ICcnXG4gICAgY29uc3QgcmVhZGVyID0gZGF0YS5nZXRSZWFkZXIoKVxuICAgIGF3YWl0IHJlYWRlcj8ucmVhZCgpLnRoZW4oYXN5bmMgKGNodWNrKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IGNyZWF0ZUhhc2goY2h1Y2sudmFsdWUgfHwgJycsIGFsZ29yaXRobSlcbiAgICAgIGJvZHkgKz0gdmFsdWVcbiAgICB9KVxuICAgIHJldHVybiBib2R5XG4gIH1cbiAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSB8fCBkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICBzb3VyY2VCdWZmZXIgPSBkYXRhXG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xuICAgICAgZGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpXG4gICAgfVxuICAgIHNvdXJjZUJ1ZmZlciA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShTdHJpbmcoZGF0YSkpXG4gIH1cblxuICBpZiAoY3J5cHRvICYmIGNyeXB0by5zdWJ0bGUpIHtcbiAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdChcbiAgICAgIHtcbiAgICAgICAgbmFtZTogYWxnb3JpdGhtLm5hbWUsXG4gICAgICB9LFxuICAgICAgc291cmNlQnVmZmVyIGFzIEFycmF5QnVmZmVyXG4gICAgKVxuICAgIGNvbnN0IGhhc2ggPSBBcnJheS5wcm90b3R5cGUubWFwXG4gICAgICAuY2FsbChuZXcgVWludDhBcnJheShidWZmZXIpLCAoeCkgPT4gKCcwMCcgKyB4LnRvU3RyaW5nKDE2KSkuc2xpY2UoLTIpKVxuICAgICAgLmpvaW4oJycpXG4gICAgcmV0dXJuIGhhc2hcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLE9BQU8sTUFBTSxTQUFTLE9BQU8sT0FBZTtJQUMxQyxNQUFNLFlBQXVCO1FBQUUsTUFBTTtRQUFXLE9BQU87SUFBUztJQUNoRSxNQUFNLE9BQU8sTUFBTSxXQUFXLE1BQU07SUFDcEMsT0FBTztBQUNULEVBQUM7QUFFRCxPQUFPLE1BQU0sT0FBTyxPQUFPLE9BQWU7SUFDeEMsTUFBTSxZQUF1QjtRQUFFLE1BQU07UUFBUyxPQUFPO0lBQU87SUFDNUQsTUFBTSxPQUFPLE1BQU0sV0FBVyxNQUFNO0lBQ3BDLE9BQU87QUFDVCxFQUFDO0FBRUQsT0FBTyxNQUFNLE1BQU0sT0FBTyxPQUFlO0lBQ3ZDLE1BQU0sWUFBdUI7UUFBRSxNQUFNO1FBQU8sT0FBTztJQUFNO0lBQ3pELE1BQU0sT0FBTyxNQUFNLFdBQVcsTUFBTTtJQUNwQyxPQUFPO0FBQ1QsRUFBQztBQUVELE9BQU8sTUFBTSxhQUFhLE9BQU8sTUFBWSxZQUFpRDtJQUM1RixJQUFJO0lBRUosSUFBSSxnQkFBZ0IsZ0JBQWdCO1FBQ2xDLElBQUksT0FBTztRQUNYLE1BQU0sU0FBUyxLQUFLLFNBQVM7UUFDN0IsTUFBTSxRQUFRLE9BQU8sSUFBSSxDQUFDLE9BQU8sUUFBVTtZQUN6QyxNQUFNLFFBQVEsTUFBTSxXQUFXLE1BQU0sS0FBSyxJQUFJLElBQUk7WUFDbEQsUUFBUTtRQUNWO1FBQ0EsT0FBTztJQUNULENBQUM7SUFDRCxJQUFJLFlBQVksTUFBTSxDQUFDLFNBQVMsZ0JBQWdCLGFBQWE7UUFDM0QsZUFBZTtJQUNqQixPQUFPO1FBQ0wsSUFBSSxPQUFPLFNBQVMsVUFBVTtZQUM1QixPQUFPLEtBQUssU0FBUyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxlQUFlLElBQUksY0FBYyxNQUFNLENBQUMsT0FBTztJQUNqRCxDQUFDO0lBRUQsSUFBSSxVQUFVLE9BQU8sTUFBTSxFQUFFO1FBQzNCLE1BQU0sU0FBUyxNQUFNLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FDdkM7WUFDRSxNQUFNLFVBQVUsSUFBSTtRQUN0QixHQUNBO1FBRUYsTUFBTSxPQUFPLE1BQU0sU0FBUyxDQUFDLEdBQUcsQ0FDN0IsSUFBSSxDQUFDLElBQUksV0FBVyxTQUFTLENBQUMsSUFBTSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQ25FLElBQUksQ0FBQztRQUNSLE9BQU87SUFDVCxDQUFDO0lBQ0QsT0FBTyxJQUFJO0FBQ2IsRUFBQyJ9