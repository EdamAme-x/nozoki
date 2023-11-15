export const decodeBase64Url = (str)=>{
    return decodeBase64(str.replace(/_|-/g, (m)=>({
            _: '/',
            '-': '+'
        })[m] ?? m));
};
export const encodeBase64Url = (buf)=>encodeBase64(buf).replace(/\/|\+/g, (m)=>({
            '/': '_',
            '+': '-'
        })[m] ?? m);
// This approach is written in MDN.
// btoa does not support utf-8 characters. So we need a little bit hack.
export const encodeBase64 = (buf)=>{
    let binary = '';
    const bytes = new Uint8Array(buf);
    for(let i = 0; i < bytes.length; i++){
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};
// atob does not support utf-8 characters. So we need a little bit hack.
export const decodeBase64 = (str)=>{
    const binary = atob(str);
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    const half = binary.length / 2;
    for(let i = 0, j = binary.length - 1; i <= half; i++, j--){
        bytes[i] = binary.charCodeAt(i);
        bytes[j] = binary.charCodeAt(j);
    }
    return bytes;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvdXRpbHMvZW5jb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBkZWNvZGVCYXNlNjRVcmwgPSAoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5ID0+IHtcbiAgcmV0dXJuIGRlY29kZUJhc2U2NChzdHIucmVwbGFjZSgvX3wtL2csIChtKSA9PiAoeyBfOiAnLycsICctJzogJysnIH1bbV0gPz8gbSkpKVxufVxuXG5leHBvcnQgY29uc3QgZW5jb2RlQmFzZTY0VXJsID0gKGJ1ZjogQXJyYXlCdWZmZXJMaWtlKTogc3RyaW5nID0+XG4gIGVuY29kZUJhc2U2NChidWYpLnJlcGxhY2UoL1xcL3xcXCsvZywgKG0pID0+ICh7ICcvJzogJ18nLCAnKyc6ICctJyB9W21dID8/IG0pKVxuXG4vLyBUaGlzIGFwcHJvYWNoIGlzIHdyaXR0ZW4gaW4gTUROLlxuLy8gYnRvYSBkb2VzIG5vdCBzdXBwb3J0IHV0Zi04IGNoYXJhY3RlcnMuIFNvIHdlIG5lZWQgYSBsaXR0bGUgYml0IGhhY2suXG5leHBvcnQgY29uc3QgZW5jb2RlQmFzZTY0ID0gKGJ1ZjogQXJyYXlCdWZmZXJMaWtlKTogc3RyaW5nID0+IHtcbiAgbGV0IGJpbmFyeSA9ICcnXG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pXG4gIH1cbiAgcmV0dXJuIGJ0b2EoYmluYXJ5KVxufVxuXG4vLyBhdG9iIGRvZXMgbm90IHN1cHBvcnQgdXRmLTggY2hhcmFjdGVycy4gU28gd2UgbmVlZCBhIGxpdHRsZSBiaXQgaGFjay5cbmV4cG9ydCBjb25zdCBkZWNvZGVCYXNlNjQgPSAoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5ID0+IHtcbiAgY29uc3QgYmluYXJ5ID0gYXRvYihzdHIpXG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobmV3IEFycmF5QnVmZmVyKGJpbmFyeS5sZW5ndGgpKVxuICBjb25zdCBoYWxmID0gYmluYXJ5Lmxlbmd0aCAvIDJcbiAgZm9yIChsZXQgaSA9IDAsIGogPSBiaW5hcnkubGVuZ3RoIC0gMTsgaSA8PSBoYWxmOyBpKyssIGotLSkge1xuICAgIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSlcbiAgICBieXRlc1tqXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGopXG4gIH1cbiAgcmV0dXJuIGJ5dGVzXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLGtCQUFrQixDQUFDLE1BQTRCO0lBQzFELE9BQU8sYUFBYSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBTyxDQUFBO1lBQUUsR0FBRztZQUFLLEtBQUs7UUFBSSxDQUFBLENBQUMsQ0FBQyxFQUFFLElBQUk7QUFDN0UsRUFBQztBQUVELE9BQU8sTUFBTSxrQkFBa0IsQ0FBQyxNQUM5QixhQUFhLEtBQUssT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFPLENBQUE7WUFBRSxLQUFLO1lBQUssS0FBSztRQUFJLENBQUEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHO0FBRTlFLG1DQUFtQztBQUNuQyx3RUFBd0U7QUFDeEUsT0FBTyxNQUFNLGVBQWUsQ0FBQyxNQUFpQztJQUM1RCxJQUFJLFNBQVM7SUFDYixNQUFNLFFBQVEsSUFBSSxXQUFXO0lBQzdCLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxNQUFNLE1BQU0sRUFBRSxJQUFLO1FBQ3JDLFVBQVUsT0FBTyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDeEM7SUFDQSxPQUFPLEtBQUs7QUFDZCxFQUFDO0FBRUQsd0VBQXdFO0FBQ3hFLE9BQU8sTUFBTSxlQUFlLENBQUMsTUFBNEI7SUFDdkQsTUFBTSxTQUFTLEtBQUs7SUFDcEIsTUFBTSxRQUFRLElBQUksV0FBVyxJQUFJLFlBQVksT0FBTyxNQUFNO0lBQzFELE1BQU0sT0FBTyxPQUFPLE1BQU0sR0FBRztJQUM3QixJQUFLLElBQUksSUFBSSxHQUFHLElBQUksT0FBTyxNQUFNLEdBQUcsR0FBRyxLQUFLLE1BQU0sS0FBSyxHQUFHLENBQUU7UUFDMUQsS0FBSyxDQUFDLEVBQUUsR0FBRyxPQUFPLFVBQVUsQ0FBQztRQUM3QixLQUFLLENBQUMsRUFBRSxHQUFHLE9BQU8sVUFBVSxDQUFDO0lBQy9CO0lBQ0EsT0FBTztBQUNULEVBQUMifQ==