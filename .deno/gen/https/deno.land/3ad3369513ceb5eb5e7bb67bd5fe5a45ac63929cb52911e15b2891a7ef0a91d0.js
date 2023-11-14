import { escapeToBuffer, stringBufferToString } from '../../utils/html.ts';
export const raw = (value, promises)=>{
    const escapedString = new String(value);
    escapedString.isEscaped = true;
    escapedString.promises = promises;
    return escapedString;
};
export const html = (strings, ...values)=>{
    const buffer = [
        ''
    ];
    for(let i = 0, len = strings.length - 1; i < len; i++){
        buffer[0] += strings[i];
        const children = values[i] instanceof Array ? values[i].flat(Infinity) : [
            values[i]
        ];
        for(let i = 0, len = children.length; i < len; i++){
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const child = children[i];
            if (typeof child === 'string') {
                escapeToBuffer(child, buffer);
            } else if (typeof child === 'boolean' || child === null || child === undefined) {
                continue;
            } else if (typeof child === 'object' && child.isEscaped || typeof child === 'number') {
                const tmp = child.toString();
                if (tmp instanceof Promise) {
                    buffer.unshift('', tmp);
                } else {
                    buffer[0] += tmp;
                }
            } else {
                escapeToBuffer(child.toString(), buffer);
            }
        }
    }
    buffer[0] += strings[strings.length - 1];
    return buffer.length === 1 ? raw(buffer[0]) : stringBufferToString(buffer);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL2hlbHBlci9odG1sL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVzY2FwZVRvQnVmZmVyLCBzdHJpbmdCdWZmZXJUb1N0cmluZyB9IGZyb20gJy4uLy4uL3V0aWxzL2h0bWwudHMnXG5pbXBvcnQgdHlwZSB7IFN0cmluZ0J1ZmZlciwgSHRtbEVzY2FwZWQsIEh0bWxFc2NhcGVkU3RyaW5nIH0gZnJvbSAnLi4vLi4vdXRpbHMvaHRtbC50cydcblxuZXhwb3J0IGNvbnN0IHJhdyA9ICh2YWx1ZTogdW5rbm93biwgcHJvbWlzZXM/OiBQcm9taXNlPHN0cmluZz5bXSk6IEh0bWxFc2NhcGVkU3RyaW5nID0+IHtcbiAgY29uc3QgZXNjYXBlZFN0cmluZyA9IG5ldyBTdHJpbmcodmFsdWUpIGFzIEh0bWxFc2NhcGVkU3RyaW5nXG4gIGVzY2FwZWRTdHJpbmcuaXNFc2NhcGVkID0gdHJ1ZVxuICBlc2NhcGVkU3RyaW5nLnByb21pc2VzID0gcHJvbWlzZXNcblxuICByZXR1cm4gZXNjYXBlZFN0cmluZ1xufVxuXG5leHBvcnQgY29uc3QgaHRtbCA9IChcbiAgc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXksXG4gIC4uLnZhbHVlczogdW5rbm93bltdXG4pOiBIdG1sRXNjYXBlZFN0cmluZyB8IFByb21pc2U8SHRtbEVzY2FwZWRTdHJpbmc+ID0+IHtcbiAgY29uc3QgYnVmZmVyOiBTdHJpbmdCdWZmZXIgPSBbJyddXG5cbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHN0cmluZ3MubGVuZ3RoIC0gMTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgYnVmZmVyWzBdICs9IHN0cmluZ3NbaV1cblxuICAgIGNvbnN0IGNoaWxkcmVuID1cbiAgICAgIHZhbHVlc1tpXSBpbnN0YW5jZW9mIEFycmF5ID8gKHZhbHVlc1tpXSBhcyBBcnJheTx1bmtub3duPikuZmxhdChJbmZpbml0eSkgOiBbdmFsdWVzW2ldXVxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV0gYXMgYW55XG4gICAgICBpZiAodHlwZW9mIGNoaWxkID09PSAnc3RyaW5nJykge1xuICAgICAgICBlc2NhcGVUb0J1ZmZlcihjaGlsZCwgYnVmZmVyKVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2hpbGQgPT09ICdib29sZWFuJyB8fCBjaGlsZCA9PT0gbnVsbCB8fCBjaGlsZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAodHlwZW9mIGNoaWxkID09PSAnb2JqZWN0JyAmJiAoY2hpbGQgYXMgSHRtbEVzY2FwZWQpLmlzRXNjYXBlZCkgfHxcbiAgICAgICAgdHlwZW9mIGNoaWxkID09PSAnbnVtYmVyJ1xuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHRtcCA9IGNoaWxkLnRvU3RyaW5nKClcbiAgICAgICAgaWYgKHRtcCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICBidWZmZXIudW5zaGlmdCgnJywgdG1wKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJ1ZmZlclswXSArPSB0bXBcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXNjYXBlVG9CdWZmZXIoY2hpbGQudG9TdHJpbmcoKSwgYnVmZmVyKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBidWZmZXJbMF0gKz0gc3RyaW5nc1tzdHJpbmdzLmxlbmd0aCAtIDFdXG5cbiAgcmV0dXJuIGJ1ZmZlci5sZW5ndGggPT09IDEgPyByYXcoYnVmZmVyWzBdKSA6IHN0cmluZ0J1ZmZlclRvU3RyaW5nKGJ1ZmZlcilcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLGNBQWMsRUFBRSxvQkFBb0IsUUFBUSxzQkFBcUI7QUFHMUUsT0FBTyxNQUFNLE1BQU0sQ0FBQyxPQUFnQixXQUFvRDtJQUN0RixNQUFNLGdCQUFnQixJQUFJLE9BQU87SUFDakMsY0FBYyxTQUFTLEdBQUcsSUFBSTtJQUM5QixjQUFjLFFBQVEsR0FBRztJQUV6QixPQUFPO0FBQ1QsRUFBQztBQUVELE9BQU8sTUFBTSxPQUFPLENBQ2xCLFNBQ0EsR0FBRyxTQUNnRDtJQUNuRCxNQUFNLFNBQXVCO1FBQUM7S0FBRztJQUVqQyxJQUFLLElBQUksSUFBSSxHQUFHLE1BQU0sUUFBUSxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssSUFBSztRQUN0RCxNQUFNLENBQUMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxFQUFFO1FBRXZCLE1BQU0sV0FDSixNQUFNLENBQUMsRUFBRSxZQUFZLFFBQVEsQUFBQyxNQUFNLENBQUMsRUFBRSxDQUFvQixJQUFJLENBQUMsWUFBWTtZQUFDLE1BQU0sQ0FBQyxFQUFFO1NBQUM7UUFDekYsSUFBSyxJQUFJLElBQUksR0FBRyxNQUFNLFNBQVMsTUFBTSxFQUFFLElBQUksS0FBSyxJQUFLO1lBQ25ELDhEQUE4RDtZQUM5RCxNQUFNLFFBQVEsUUFBUSxDQUFDLEVBQUU7WUFDekIsSUFBSSxPQUFPLFVBQVUsVUFBVTtnQkFDN0IsZUFBZSxPQUFPO1lBQ3hCLE9BQU8sSUFBSSxPQUFPLFVBQVUsYUFBYSxVQUFVLElBQUksSUFBSSxVQUFVLFdBQVc7Z0JBQzlFLFFBQVE7WUFDVixPQUFPLElBQ0wsQUFBQyxPQUFPLFVBQVUsWUFBWSxBQUFDLE1BQXNCLFNBQVMsSUFDOUQsT0FBTyxVQUFVLFVBQ2pCO2dCQUNBLE1BQU0sTUFBTSxNQUFNLFFBQVE7Z0JBQzFCLElBQUksZUFBZSxTQUFTO29CQUMxQixPQUFPLE9BQU8sQ0FBQyxJQUFJO2dCQUNyQixPQUFPO29CQUNMLE1BQU0sQ0FBQyxFQUFFLElBQUk7Z0JBQ2YsQ0FBQztZQUNILE9BQU87Z0JBQ0wsZUFBZSxNQUFNLFFBQVEsSUFBSTtZQUNuQyxDQUFDO1FBQ0g7SUFDRjtJQUNBLE1BQU0sQ0FBQyxFQUFFLElBQUksT0FBTyxDQUFDLFFBQVEsTUFBTSxHQUFHLEVBQUU7SUFFeEMsT0FBTyxPQUFPLE1BQU0sS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLEVBQUUsSUFBSSxxQkFBcUIsT0FBTztBQUM1RSxFQUFDIn0=