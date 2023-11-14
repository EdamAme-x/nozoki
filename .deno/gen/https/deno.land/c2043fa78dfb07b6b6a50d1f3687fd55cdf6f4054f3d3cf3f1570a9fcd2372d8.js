import { raw } from '../helper/html/index.ts';
// The `escapeToBuffer` implementation is based on code from the MIT licensed `react-dom` package.
// https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/server/escapeTextForBrowser.js
const escapeRe = /[&<>'"]/;
export const stringBufferToString = async (buffer)=>{
    let str = '';
    const promises = [];
    for(let i = buffer.length - 1; i >= 0; i--){
        let r = await buffer[i];
        if (typeof r === 'object') {
            promises.push(...r.promises || []);
        }
        r = await (typeof r === 'object' ? r.toString() : r);
        if (typeof r === 'object') {
            promises.push(...r.promises || []);
        }
        str += r;
    }
    return raw(str, promises);
};
export const escapeToBuffer = (str, buffer)=>{
    const match = str.search(escapeRe);
    if (match === -1) {
        buffer[0] += str;
        return;
    }
    let escape;
    let index;
    let lastIndex = 0;
    for(index = match; index < str.length; index++){
        switch(str.charCodeAt(index)){
            case 34:
                escape = '&quot;';
                break;
            case 39:
                escape = '&#39;';
                break;
            case 38:
                escape = '&amp;';
                break;
            case 60:
                escape = '&lt;';
                break;
            case 62:
                escape = '&gt;';
                break;
            default:
                continue;
        }
        buffer[0] += str.substring(lastIndex, index) + escape;
        lastIndex = index + 1;
    }
    buffer[0] += str.substring(lastIndex, index);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL3V0aWxzL2h0bWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHR5cGUgSHRtbEVzY2FwZWQgPSB7IGlzRXNjYXBlZDogdHJ1ZTsgcHJvbWlzZXM/OiBQcm9taXNlPHN0cmluZz5bXSB9XG5leHBvcnQgdHlwZSBIdG1sRXNjYXBlZFN0cmluZyA9IHN0cmluZyAmIEh0bWxFc2NhcGVkXG5leHBvcnQgdHlwZSBTdHJpbmdCdWZmZXIgPSAoc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+KVtdXG5pbXBvcnQgeyByYXcgfSBmcm9tICcuLi9oZWxwZXIvaHRtbC9pbmRleC50cydcblxuLy8gVGhlIGBlc2NhcGVUb0J1ZmZlcmAgaW1wbGVtZW50YXRpb24gaXMgYmFzZWQgb24gY29kZSBmcm9tIHRoZSBNSVQgbGljZW5zZWQgYHJlYWN0LWRvbWAgcGFja2FnZS5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9ibG9iL21haW4vcGFja2FnZXMvcmVhY3QtZG9tLWJpbmRpbmdzL3NyYy9zZXJ2ZXIvZXNjYXBlVGV4dEZvckJyb3dzZXIuanNcblxuY29uc3QgZXNjYXBlUmUgPSAvWyY8PidcIl0vXG5cbmV4cG9ydCBjb25zdCBzdHJpbmdCdWZmZXJUb1N0cmluZyA9IGFzeW5jIChidWZmZXI6IFN0cmluZ0J1ZmZlcik6IFByb21pc2U8SHRtbEVzY2FwZWRTdHJpbmc+ID0+IHtcbiAgbGV0IHN0ciA9ICcnXG4gIGNvbnN0IHByb21pc2VzOiBQcm9taXNlPHN0cmluZz5bXSA9IFtdXG4gIGZvciAobGV0IGkgPSBidWZmZXIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBsZXQgciA9IGF3YWl0IGJ1ZmZlcltpXVxuICAgIGlmICh0eXBlb2YgciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHByb21pc2VzLnB1c2goLi4uKChyIGFzIEh0bWxFc2NhcGVkU3RyaW5nKS5wcm9taXNlcyB8fCBbXSkpXG4gICAgfVxuICAgIHIgPSBhd2FpdCAodHlwZW9mIHIgPT09ICdvYmplY3QnID8gKHIgYXMgSHRtbEVzY2FwZWRTdHJpbmcpLnRvU3RyaW5nKCkgOiByKVxuICAgIGlmICh0eXBlb2YgciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHByb21pc2VzLnB1c2goLi4uKChyIGFzIEh0bWxFc2NhcGVkU3RyaW5nKS5wcm9taXNlcyB8fCBbXSkpXG4gICAgfVxuICAgIHN0ciArPSByXG4gIH1cblxuICByZXR1cm4gcmF3KHN0ciwgcHJvbWlzZXMpXG59XG5cbmV4cG9ydCBjb25zdCBlc2NhcGVUb0J1ZmZlciA9IChzdHI6IHN0cmluZywgYnVmZmVyOiBTdHJpbmdCdWZmZXIpOiB2b2lkID0+IHtcbiAgY29uc3QgbWF0Y2ggPSBzdHIuc2VhcmNoKGVzY2FwZVJlKVxuICBpZiAobWF0Y2ggPT09IC0xKSB7XG4gICAgYnVmZmVyWzBdICs9IHN0clxuICAgIHJldHVyblxuICB9XG5cbiAgbGV0IGVzY2FwZVxuICBsZXQgaW5kZXhcbiAgbGV0IGxhc3RJbmRleCA9IDBcblxuICBmb3IgKGluZGV4ID0gbWF0Y2g7IGluZGV4IDwgc3RyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgIHN3aXRjaCAoc3RyLmNoYXJDb2RlQXQoaW5kZXgpKSB7XG4gICAgICBjYXNlIDM0OiAvLyBcIlxuICAgICAgICBlc2NhcGUgPSAnJnF1b3Q7J1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAzOTogLy8gJ1xuICAgICAgICBlc2NhcGUgPSAnJiMzOTsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDM4OiAvLyAmXG4gICAgICAgIGVzY2FwZSA9ICcmYW1wOydcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgNjA6IC8vIDxcbiAgICAgICAgZXNjYXBlID0gJyZsdDsnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDYyOiAvLyA+XG4gICAgICAgIGVzY2FwZSA9ICcmZ3Q7J1xuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBidWZmZXJbMF0gKz0gc3RyLnN1YnN0cmluZyhsYXN0SW5kZXgsIGluZGV4KSArIGVzY2FwZVxuICAgIGxhc3RJbmRleCA9IGluZGV4ICsgMVxuICB9XG5cbiAgYnVmZmVyWzBdICs9IHN0ci5zdWJzdHJpbmcobGFzdEluZGV4LCBpbmRleClcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxTQUFTLEdBQUcsUUFBUSwwQkFBeUI7QUFFN0Msa0dBQWtHO0FBQ2xHLDZHQUE2RztBQUU3RyxNQUFNLFdBQVc7QUFFakIsT0FBTyxNQUFNLHVCQUF1QixPQUFPLFNBQXFEO0lBQzlGLElBQUksTUFBTTtJQUNWLE1BQU0sV0FBOEIsRUFBRTtJQUN0QyxJQUFLLElBQUksSUFBSSxPQUFPLE1BQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxJQUFLO1FBQzNDLElBQUksSUFBSSxNQUFNLE1BQU0sQ0FBQyxFQUFFO1FBQ3ZCLElBQUksT0FBTyxNQUFNLFVBQVU7WUFDekIsU0FBUyxJQUFJLElBQUssQUFBQyxFQUF3QixRQUFRLElBQUksRUFBRTtRQUMzRCxDQUFDO1FBQ0QsSUFBSSxNQUFNLENBQUMsT0FBTyxNQUFNLFdBQVcsQUFBQyxFQUF3QixRQUFRLEtBQUssQ0FBQztRQUMxRSxJQUFJLE9BQU8sTUFBTSxVQUFVO1lBQ3pCLFNBQVMsSUFBSSxJQUFLLEFBQUMsRUFBd0IsUUFBUSxJQUFJLEVBQUU7UUFDM0QsQ0FBQztRQUNELE9BQU87SUFDVDtJQUVBLE9BQU8sSUFBSSxLQUFLO0FBQ2xCLEVBQUM7QUFFRCxPQUFPLE1BQU0saUJBQWlCLENBQUMsS0FBYSxTQUErQjtJQUN6RSxNQUFNLFFBQVEsSUFBSSxNQUFNLENBQUM7SUFDekIsSUFBSSxVQUFVLENBQUMsR0FBRztRQUNoQixNQUFNLENBQUMsRUFBRSxJQUFJO1FBQ2I7SUFDRixDQUFDO0lBRUQsSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJLFlBQVk7SUFFaEIsSUFBSyxRQUFRLE9BQU8sUUFBUSxJQUFJLE1BQU0sRUFBRSxRQUFTO1FBQy9DLE9BQVEsSUFBSSxVQUFVLENBQUM7WUFDckIsS0FBSztnQkFDSCxTQUFTO2dCQUNULEtBQUs7WUFDUCxLQUFLO2dCQUNILFNBQVM7Z0JBQ1QsS0FBSztZQUNQLEtBQUs7Z0JBQ0gsU0FBUztnQkFDVCxLQUFLO1lBQ1AsS0FBSztnQkFDSCxTQUFTO2dCQUNULEtBQUs7WUFDUCxLQUFLO2dCQUNILFNBQVM7Z0JBQ1QsS0FBSztZQUNQO2dCQUNFLFFBQVE7UUFDWjtRQUVBLE1BQU0sQ0FBQyxFQUFFLElBQUksSUFBSSxTQUFTLENBQUMsV0FBVyxTQUFTO1FBQy9DLFlBQVksUUFBUTtJQUN0QjtJQUVBLE1BQU0sQ0FBQyxFQUFFLElBQUksSUFBSSxTQUFTLENBQUMsV0FBVztBQUN4QyxFQUFDIn0=