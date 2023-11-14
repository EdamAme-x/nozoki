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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL3V0aWxzL2VuY29kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZGVjb2RlQmFzZTY0VXJsID0gKHN0cjogc3RyaW5nKTogVWludDhBcnJheSA9PiB7XG4gIHJldHVybiBkZWNvZGVCYXNlNjQoc3RyLnJlcGxhY2UoL198LS9nLCAobSkgPT4gKHsgXzogJy8nLCAnLSc6ICcrJyB9W21dID8/IG0pKSlcbn1cblxuZXhwb3J0IGNvbnN0IGVuY29kZUJhc2U2NFVybCA9IChidWY6IEFycmF5QnVmZmVyTGlrZSk6IHN0cmluZyA9PlxuICBlbmNvZGVCYXNlNjQoYnVmKS5yZXBsYWNlKC9cXC98XFwrL2csIChtKSA9PiAoeyAnLyc6ICdfJywgJysnOiAnLScgfVttXSA/PyBtKSlcblxuLy8gVGhpcyBhcHByb2FjaCBpcyB3cml0dGVuIGluIE1ETi5cbi8vIGJ0b2EgZG9lcyBub3Qgc3VwcG9ydCB1dGYtOCBjaGFyYWN0ZXJzLiBTbyB3ZSBuZWVkIGEgbGl0dGxlIGJpdCBoYWNrLlxuZXhwb3J0IGNvbnN0IGVuY29kZUJhc2U2NCA9IChidWY6IEFycmF5QnVmZmVyTGlrZSk6IHN0cmluZyA9PiB7XG4gIGxldCBiaW5hcnkgPSAnJ1xuICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKVxuICB9XG4gIHJldHVybiBidG9hKGJpbmFyeSlcbn1cblxuLy8gYXRvYiBkb2VzIG5vdCBzdXBwb3J0IHV0Zi04IGNoYXJhY3RlcnMuIFNvIHdlIG5lZWQgYSBsaXR0bGUgYml0IGhhY2suXG5leHBvcnQgY29uc3QgZGVjb2RlQmFzZTY0ID0gKHN0cjogc3RyaW5nKTogVWludDhBcnJheSA9PiB7XG4gIGNvbnN0IGJpbmFyeSA9IGF0b2Ioc3RyKVxuICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KG5ldyBBcnJheUJ1ZmZlcihiaW5hcnkubGVuZ3RoKSlcbiAgY29uc3QgaGFsZiA9IGJpbmFyeS5sZW5ndGggLyAyXG4gIGZvciAobGV0IGkgPSAwLCBqID0gYmluYXJ5Lmxlbmd0aCAtIDE7IGkgPD0gaGFsZjsgaSsrLCBqLS0pIHtcbiAgICBieXRlc1tpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpXG4gICAgYnl0ZXNbal0gPSBiaW5hcnkuY2hhckNvZGVBdChqKVxuICB9XG4gIHJldHVybiBieXRlc1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxrQkFBa0IsQ0FBQyxNQUE0QjtJQUMxRCxPQUFPLGFBQWEsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQU8sQ0FBQTtZQUFFLEdBQUc7WUFBSyxLQUFLO1FBQUksQ0FBQSxDQUFDLENBQUMsRUFBRSxJQUFJO0FBQzdFLEVBQUM7QUFFRCxPQUFPLE1BQU0sa0JBQWtCLENBQUMsTUFDOUIsYUFBYSxLQUFLLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBTyxDQUFBO1lBQUUsS0FBSztZQUFLLEtBQUs7UUFBSSxDQUFBLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRztBQUU5RSxtQ0FBbUM7QUFDbkMsd0VBQXdFO0FBQ3hFLE9BQU8sTUFBTSxlQUFlLENBQUMsTUFBaUM7SUFDNUQsSUFBSSxTQUFTO0lBQ2IsTUFBTSxRQUFRLElBQUksV0FBVztJQUM3QixJQUFLLElBQUksSUFBSSxHQUFHLElBQUksTUFBTSxNQUFNLEVBQUUsSUFBSztRQUNyQyxVQUFVLE9BQU8sWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFO0lBQ3hDO0lBQ0EsT0FBTyxLQUFLO0FBQ2QsRUFBQztBQUVELHdFQUF3RTtBQUN4RSxPQUFPLE1BQU0sZUFBZSxDQUFDLE1BQTRCO0lBQ3ZELE1BQU0sU0FBUyxLQUFLO0lBQ3BCLE1BQU0sUUFBUSxJQUFJLFdBQVcsSUFBSSxZQUFZLE9BQU8sTUFBTTtJQUMxRCxNQUFNLE9BQU8sT0FBTyxNQUFNLEdBQUc7SUFDN0IsSUFBSyxJQUFJLElBQUksR0FBRyxJQUFJLE9BQU8sTUFBTSxHQUFHLEdBQUcsS0FBSyxNQUFNLEtBQUssR0FBRyxDQUFFO1FBQzFELEtBQUssQ0FBQyxFQUFFLEdBQUcsT0FBTyxVQUFVLENBQUM7UUFDN0IsS0FBSyxDQUFDLEVBQUUsR0FBRyxPQUFPLFVBQVUsQ0FBQztJQUMvQjtJQUNBLE9BQU87QUFDVCxFQUFDIn0=