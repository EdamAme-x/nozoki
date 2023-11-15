import { escapeToBuffer } from '../../utils/html.ts';
export const raw = (value)=>{
    const escapedString = new String(value);
    escapedString.isEscaped = true;
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
                buffer[0] += child;
            } else {
                escapeToBuffer(child.toString(), buffer);
            }
        }
    }
    buffer[0] += strings[strings.length - 1];
    return raw(buffer[0]);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvbWlkZGxld2FyZS9odG1sL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVzY2FwZVRvQnVmZmVyIH0gZnJvbSAnLi4vLi4vdXRpbHMvaHRtbC50cydcbmltcG9ydCB0eXBlIHsgU3RyaW5nQnVmZmVyLCBIdG1sRXNjYXBlZCwgSHRtbEVzY2FwZWRTdHJpbmcgfSBmcm9tICcuLi8uLi91dGlscy9odG1sLnRzJ1xuXG5leHBvcnQgY29uc3QgcmF3ID0gKHZhbHVlOiB1bmtub3duKTogSHRtbEVzY2FwZWRTdHJpbmcgPT4ge1xuICBjb25zdCBlc2NhcGVkU3RyaW5nID0gbmV3IFN0cmluZyh2YWx1ZSkgYXMgSHRtbEVzY2FwZWRTdHJpbmdcbiAgZXNjYXBlZFN0cmluZy5pc0VzY2FwZWQgPSB0cnVlXG5cbiAgcmV0dXJuIGVzY2FwZWRTdHJpbmdcbn1cblxuZXhwb3J0IGNvbnN0IGh0bWwgPSAoc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLnZhbHVlczogdW5rbm93bltdKTogSHRtbEVzY2FwZWRTdHJpbmcgPT4ge1xuICBjb25zdCBidWZmZXI6IFN0cmluZ0J1ZmZlciA9IFsnJ11cblxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gc3RyaW5ncy5sZW5ndGggLSAxOyBpIDwgbGVuOyBpKyspIHtcbiAgICBidWZmZXJbMF0gKz0gc3RyaW5nc1tpXVxuXG4gICAgY29uc3QgY2hpbGRyZW4gPVxuICAgICAgdmFsdWVzW2ldIGluc3RhbmNlb2YgQXJyYXkgPyAodmFsdWVzW2ldIGFzIEFycmF5PHVua25vd24+KS5mbGF0KEluZmluaXR5KSA6IFt2YWx1ZXNbaV1dXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXSBhcyBhbnlcbiAgICAgIGlmICh0eXBlb2YgY2hpbGQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGVzY2FwZVRvQnVmZmVyKGNoaWxkLCBidWZmZXIpXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjaGlsZCA9PT0gJ2Jvb2xlYW4nIHx8IGNoaWxkID09PSBudWxsIHx8IGNoaWxkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICh0eXBlb2YgY2hpbGQgPT09ICdvYmplY3QnICYmIChjaGlsZCBhcyBIdG1sRXNjYXBlZCkuaXNFc2NhcGVkKSB8fFxuICAgICAgICB0eXBlb2YgY2hpbGQgPT09ICdudW1iZXInXG4gICAgICApIHtcbiAgICAgICAgYnVmZmVyWzBdICs9IGNoaWxkXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlc2NhcGVUb0J1ZmZlcihjaGlsZC50b1N0cmluZygpLCBidWZmZXIpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGJ1ZmZlclswXSArPSBzdHJpbmdzW3N0cmluZ3MubGVuZ3RoIC0gMV1cblxuICByZXR1cm4gcmF3KGJ1ZmZlclswXSlcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLGNBQWMsUUFBUSxzQkFBcUI7QUFHcEQsT0FBTyxNQUFNLE1BQU0sQ0FBQyxRQUFzQztJQUN4RCxNQUFNLGdCQUFnQixJQUFJLE9BQU87SUFDakMsY0FBYyxTQUFTLEdBQUcsSUFBSTtJQUU5QixPQUFPO0FBQ1QsRUFBQztBQUVELE9BQU8sTUFBTSxPQUFPLENBQUMsU0FBK0IsR0FBRyxTQUF5QztJQUM5RixNQUFNLFNBQXVCO1FBQUM7S0FBRztJQUVqQyxJQUFLLElBQUksSUFBSSxHQUFHLE1BQU0sUUFBUSxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssSUFBSztRQUN0RCxNQUFNLENBQUMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxFQUFFO1FBRXZCLE1BQU0sV0FDSixNQUFNLENBQUMsRUFBRSxZQUFZLFFBQVEsQUFBQyxNQUFNLENBQUMsRUFBRSxDQUFvQixJQUFJLENBQUMsWUFBWTtZQUFDLE1BQU0sQ0FBQyxFQUFFO1NBQUM7UUFDekYsSUFBSyxJQUFJLElBQUksR0FBRyxNQUFNLFNBQVMsTUFBTSxFQUFFLElBQUksS0FBSyxJQUFLO1lBQ25ELDhEQUE4RDtZQUM5RCxNQUFNLFFBQVEsUUFBUSxDQUFDLEVBQUU7WUFDekIsSUFBSSxPQUFPLFVBQVUsVUFBVTtnQkFDN0IsZUFBZSxPQUFPO1lBQ3hCLE9BQU8sSUFBSSxPQUFPLFVBQVUsYUFBYSxVQUFVLElBQUksSUFBSSxVQUFVLFdBQVc7Z0JBQzlFLFFBQVE7WUFDVixPQUFPLElBQ0wsQUFBQyxPQUFPLFVBQVUsWUFBWSxBQUFDLE1BQXNCLFNBQVMsSUFDOUQsT0FBTyxVQUFVLFVBQ2pCO2dCQUNBLE1BQU0sQ0FBQyxFQUFFLElBQUk7WUFDZixPQUFPO2dCQUNMLGVBQWUsTUFBTSxRQUFRLElBQUk7WUFDbkMsQ0FBQztRQUNIO0lBQ0Y7SUFDQSxNQUFNLENBQUMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxRQUFRLE1BQU0sR0FBRyxFQUFFO0lBRXhDLE9BQU8sSUFBSSxNQUFNLENBQUMsRUFBRTtBQUN0QixFQUFDIn0=