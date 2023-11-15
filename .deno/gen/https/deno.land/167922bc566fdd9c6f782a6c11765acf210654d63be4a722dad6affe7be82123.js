import { escapeToBuffer } from '../../utils/html.ts';
const emptyTags = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];
const booleanAttributes = [
    'allowfullscreen',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'controls',
    'default',
    'defer',
    'disabled',
    'formnovalidate',
    'hidden',
    'inert',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'nomodule',
    'novalidate',
    'open',
    'playsinline',
    'readonly',
    'required',
    'reversed',
    'selected'
];
const childrenToStringToBuffer = (children, buffer)=>{
    for(let i = 0, len = children.length; i < len; i++){
        const child = children[i];
        if (typeof child === 'string') {
            escapeToBuffer(child, buffer);
        } else if (typeof child === 'boolean' || child === null || child === undefined) {
            continue;
        } else if (child instanceof JSXNode) {
            child.toStringToBuffer(buffer);
        } else if (typeof child === 'number' || child.isEscaped) {
            buffer[0] += child;
        } else {
            // `child` type is `Child[]`, so stringify recursively
            childrenToStringToBuffer(child, buffer);
        }
    }
};
export class JSXNode {
    tag;
    props;
    children;
    isEscaped = true;
    constructor(tag, props, children){
        this.tag = tag;
        this.props = props;
        this.children = children;
    }
    toString() {
        const buffer = [
            ''
        ];
        this.toStringToBuffer(buffer);
        return buffer[0];
    }
    toStringToBuffer(buffer) {
        const tag = this.tag;
        const props = this.props;
        let { children  } = this;
        buffer[0] += `<${tag}`;
        const propsKeys = Object.keys(props || {});
        for(let i = 0, len = propsKeys.length; i < len; i++){
            const key = propsKeys[i];
            const v = props[key];
            // object to style strings
            if (key === 'style' && typeof v === 'object') {
                const styles = Object.keys(v).map((k)=>`${k}:${v[k]}`).join(';').replace(/[A-Z]/g, (match)=>`-${match.toLowerCase()}`);
                buffer[0] += ` style="${styles}"`;
            } else if (typeof v === 'string') {
                buffer[0] += ` ${key}="`;
                escapeToBuffer(v, buffer);
                buffer[0] += '"';
            } else if (typeof v === 'number') {
                buffer[0] += ` ${key}="${v}"`;
            } else if (v === null || v === undefined) {
            // Do nothing
            } else if (typeof v === 'boolean' && booleanAttributes.includes(key)) {
                if (v) {
                    buffer[0] += ` ${key}=""`;
                }
            } else if (key === 'dangerouslySetInnerHTML') {
                if (children.length > 0) {
                    throw 'Can only set one of `children` or `props.dangerouslySetInnerHTML`.';
                }
                const escapedString = new String(v.__html);
                escapedString.isEscaped = true;
                children = [
                    escapedString
                ];
            } else {
                buffer[0] += ` ${key}="`;
                escapeToBuffer(v.toString(), buffer);
                buffer[0] += '"';
            }
        }
        if (emptyTags.includes(tag)) {
            buffer[0] += '/>';
            return;
        }
        buffer[0] += '>';
        childrenToStringToBuffer(children, buffer);
        buffer[0] += `</${tag}>`;
    }
}
class JSXFunctionNode extends JSXNode {
    toStringToBuffer(buffer) {
        const { children  } = this;
        const res = this.tag.call(null, {
            ...this.props,
            children: children.length <= 1 ? children[0] : children
        });
        if (res instanceof JSXNode) {
            res.toStringToBuffer(buffer);
        } else if (typeof res === 'number' || res.isEscaped) {
            buffer[0] += res;
        } else {
            escapeToBuffer(res, buffer);
        }
    }
}
class JSXFragmentNode extends JSXNode {
    toStringToBuffer(buffer) {
        childrenToStringToBuffer(this.children, buffer);
    }
}
export { jsxFn as jsx };
const jsxFn = (tag, props, ...children)=>{
    if (typeof tag === 'function') {
        return new JSXFunctionNode(tag, props, children);
    } else {
        return new JSXNode(tag, props, children);
    }
};
const shallowEqual = (a, b)=>{
    if (a === b) {
        return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for(let i = 0, len = aKeys.length; i < len; i++){
        if (a[aKeys[i]] !== b[aKeys[i]]) {
            return false;
        }
    }
    return true;
};
export const memo = (component, propsAreEqual = shallowEqual)=>{
    let computed = undefined;
    let prevProps = undefined;
    return (props)=>{
        if (prevProps && !propsAreEqual(prevProps, props)) {
            computed = undefined;
        }
        prevProps = props;
        return computed ||= component(props);
    };
};
export const Fragment = (props)=>{
    return new JSXFragmentNode('', {}, props.children || []);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvbWlkZGxld2FyZS9qc3gvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXNjYXBlVG9CdWZmZXIgfSBmcm9tICcuLi8uLi91dGlscy9odG1sLnRzJ1xuaW1wb3J0IHR5cGUgeyBTdHJpbmdCdWZmZXIsIEh0bWxFc2NhcGVkLCBIdG1sRXNjYXBlZFN0cmluZyB9IGZyb20gJy4uLy4uL3V0aWxzL2h0bWwudHMnXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG50eXBlIFByb3BzID0gUmVjb3JkPHN0cmluZywgYW55PlxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbmFtZXNwYWNlXG4gIG5hbWVzcGFjZSBKU1gge1xuICAgIHR5cGUgRWxlbWVudCA9IEh0bWxFc2NhcGVkU3RyaW5nXG4gICAgaW50ZXJmYWNlIEVsZW1lbnRDaGlsZHJlbkF0dHJpYnV0ZSB7XG4gICAgICBjaGlsZHJlbjogQ2hpbGRcbiAgICB9XG4gICAgaW50ZXJmYWNlIEludHJpbnNpY0VsZW1lbnRzIHtcbiAgICAgIFt0YWdOYW1lOiBzdHJpbmddOiBQcm9wc1xuICAgIH1cbiAgfVxufVxuXG5jb25zdCBlbXB0eVRhZ3MgPSBbXG4gICdhcmVhJyxcbiAgJ2Jhc2UnLFxuICAnYnInLFxuICAnY29sJyxcbiAgJ2VtYmVkJyxcbiAgJ2hyJyxcbiAgJ2ltZycsXG4gICdpbnB1dCcsXG4gICdrZXlnZW4nLFxuICAnbGluaycsXG4gICdtZXRhJyxcbiAgJ3BhcmFtJyxcbiAgJ3NvdXJjZScsXG4gICd0cmFjaycsXG4gICd3YnInLFxuXVxuY29uc3QgYm9vbGVhbkF0dHJpYnV0ZXMgPSBbXG4gICdhbGxvd2Z1bGxzY3JlZW4nLFxuICAnYXN5bmMnLFxuICAnYXV0b2ZvY3VzJyxcbiAgJ2F1dG9wbGF5JyxcbiAgJ2NoZWNrZWQnLFxuICAnY29udHJvbHMnLFxuICAnZGVmYXVsdCcsXG4gICdkZWZlcicsXG4gICdkaXNhYmxlZCcsXG4gICdmb3Jtbm92YWxpZGF0ZScsXG4gICdoaWRkZW4nLFxuICAnaW5lcnQnLFxuICAnaXNtYXAnLFxuICAnaXRlbXNjb3BlJyxcbiAgJ2xvb3AnLFxuICAnbXVsdGlwbGUnLFxuICAnbXV0ZWQnLFxuICAnbm9tb2R1bGUnLFxuICAnbm92YWxpZGF0ZScsXG4gICdvcGVuJyxcbiAgJ3BsYXlzaW5saW5lJyxcbiAgJ3JlYWRvbmx5JyxcbiAgJ3JlcXVpcmVkJyxcbiAgJ3JldmVyc2VkJyxcbiAgJ3NlbGVjdGVkJyxcbl1cblxuY29uc3QgY2hpbGRyZW5Ub1N0cmluZ1RvQnVmZmVyID0gKGNoaWxkcmVuOiBDaGlsZFtdLCBidWZmZXI6IFN0cmluZ0J1ZmZlcik6IHZvaWQgPT4ge1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgaWYgKHR5cGVvZiBjaGlsZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVzY2FwZVRvQnVmZmVyKGNoaWxkLCBidWZmZXIpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY2hpbGQgPT09ICdib29sZWFuJyB8fCBjaGlsZCA9PT0gbnVsbCB8fCBjaGlsZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb250aW51ZVxuICAgIH0gZWxzZSBpZiAoY2hpbGQgaW5zdGFuY2VvZiBKU1hOb2RlKSB7XG4gICAgICBjaGlsZC50b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcilcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdHlwZW9mIGNoaWxkID09PSAnbnVtYmVyJyB8fFxuICAgICAgKGNoaWxkIGFzIHVua25vd24gYXMgeyBpc0VzY2FwZWQ6IGJvb2xlYW4gfSkuaXNFc2NhcGVkXG4gICAgKSB7XG4gICAgICBidWZmZXJbMF0gKz0gY2hpbGRcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYGNoaWxkYCB0eXBlIGlzIGBDaGlsZFtdYCwgc28gc3RyaW5naWZ5IHJlY3Vyc2l2ZWx5XG4gICAgICBjaGlsZHJlblRvU3RyaW5nVG9CdWZmZXIoY2hpbGQsIGJ1ZmZlcilcbiAgICB9XG4gIH1cbn1cblxudHlwZSBDaGlsZCA9IHN0cmluZyB8IG51bWJlciB8IEpTWE5vZGUgfCBDaGlsZFtdXG5leHBvcnQgY2xhc3MgSlNYTm9kZSBpbXBsZW1lbnRzIEh0bWxFc2NhcGVkIHtcbiAgdGFnOiBzdHJpbmcgfCBGdW5jdGlvblxuICBwcm9wczogUHJvcHNcbiAgY2hpbGRyZW46IENoaWxkW11cbiAgaXNFc2NhcGVkOiB0cnVlID0gdHJ1ZSBhcyBjb25zdFxuICBjb25zdHJ1Y3Rvcih0YWc6IHN0cmluZyB8IEZ1bmN0aW9uLCBwcm9wczogUHJvcHMsIGNoaWxkcmVuOiBDaGlsZFtdKSB7XG4gICAgdGhpcy50YWcgPSB0YWdcbiAgICB0aGlzLnByb3BzID0gcHJvcHNcbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW5cbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgYnVmZmVyOiBTdHJpbmdCdWZmZXIgPSBbJyddXG4gICAgdGhpcy50b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcilcbiAgICByZXR1cm4gYnVmZmVyWzBdXG4gIH1cblxuICB0b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcjogU3RyaW5nQnVmZmVyKTogdm9pZCB7XG4gICAgY29uc3QgdGFnID0gdGhpcy50YWcgYXMgc3RyaW5nXG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzXG4gICAgbGV0IHsgY2hpbGRyZW4gfSA9IHRoaXNcblxuICAgIGJ1ZmZlclswXSArPSBgPCR7dGFnfWBcblxuICAgIGNvbnN0IHByb3BzS2V5cyA9IE9iamVjdC5rZXlzKHByb3BzIHx8IHt9KVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHByb3BzS2V5cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3Qga2V5ID0gcHJvcHNLZXlzW2ldXG4gICAgICBjb25zdCB2ID0gcHJvcHNba2V5XVxuICAgICAgLy8gb2JqZWN0IHRvIHN0eWxlIHN0cmluZ3NcbiAgICAgIGlmIChrZXkgPT09ICdzdHlsZScgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IE9iamVjdC5rZXlzKHYpXG4gICAgICAgICAgLm1hcCgoaykgPT4gYCR7a306JHt2W2tdfWApXG4gICAgICAgICAgLmpvaW4oJzsnKVxuICAgICAgICAgIC5yZXBsYWNlKC9bQS1aXS9nLCAobWF0Y2gpID0+IGAtJHttYXRjaC50b0xvd2VyQ2FzZSgpfWApXG4gICAgICAgIGJ1ZmZlclswXSArPSBgIHN0eWxlPVwiJHtzdHlsZXN9XCJgXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykge1xuICAgICAgICBidWZmZXJbMF0gKz0gYCAke2tleX09XCJgXG4gICAgICAgIGVzY2FwZVRvQnVmZmVyKHYsIGJ1ZmZlcilcbiAgICAgICAgYnVmZmVyWzBdICs9ICdcIidcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGJ1ZmZlclswXSArPSBgICR7a2V5fT1cIiR7dn1cImBcbiAgICAgIH0gZWxzZSBpZiAodiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gRG8gbm90aGluZ1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nICYmIGJvb2xlYW5BdHRyaWJ1dGVzLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICBidWZmZXJbMF0gKz0gYCAke2tleX09XCJcImBcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdkYW5nZXJvdXNseVNldElubmVySFRNTCcpIHtcbiAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB0aHJvdyAnQ2FuIG9ubHkgc2V0IG9uZSBvZiBgY2hpbGRyZW5gIG9yIGBwcm9wcy5kYW5nZXJvdXNseVNldElubmVySFRNTGAuJ1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXNjYXBlZFN0cmluZyA9IG5ldyBTdHJpbmcodi5fX2h0bWwpIGFzIEh0bWxFc2NhcGVkU3RyaW5nXG4gICAgICAgIGVzY2FwZWRTdHJpbmcuaXNFc2NhcGVkID0gdHJ1ZVxuICAgICAgICBjaGlsZHJlbiA9IFtlc2NhcGVkU3RyaW5nXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVmZmVyWzBdICs9IGAgJHtrZXl9PVwiYFxuICAgICAgICBlc2NhcGVUb0J1ZmZlcih2LnRvU3RyaW5nKCksIGJ1ZmZlcilcbiAgICAgICAgYnVmZmVyWzBdICs9ICdcIidcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW1wdHlUYWdzLmluY2x1ZGVzKHRhZyBhcyBzdHJpbmcpKSB7XG4gICAgICBidWZmZXJbMF0gKz0gJy8+J1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgYnVmZmVyWzBdICs9ICc+J1xuXG4gICAgY2hpbGRyZW5Ub1N0cmluZ1RvQnVmZmVyKGNoaWxkcmVuLCBidWZmZXIpXG5cbiAgICBidWZmZXJbMF0gKz0gYDwvJHt0YWd9PmBcbiAgfVxufVxuXG5jbGFzcyBKU1hGdW5jdGlvbk5vZGUgZXh0ZW5kcyBKU1hOb2RlIHtcbiAgdG9TdHJpbmdUb0J1ZmZlcihidWZmZXI6IFN0cmluZ0J1ZmZlcik6IHZvaWQge1xuICAgIGNvbnN0IHsgY2hpbGRyZW4gfSA9IHRoaXNcblxuICAgIGNvbnN0IHJlcyA9ICh0aGlzLnRhZyBhcyBGdW5jdGlvbikuY2FsbChudWxsLCB7XG4gICAgICAuLi50aGlzLnByb3BzLFxuICAgICAgY2hpbGRyZW46IGNoaWxkcmVuLmxlbmd0aCA8PSAxID8gY2hpbGRyZW5bMF0gOiBjaGlsZHJlbixcbiAgICB9KVxuXG4gICAgaWYgKHJlcyBpbnN0YW5jZW9mIEpTWE5vZGUpIHtcbiAgICAgIHJlcy50b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcilcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXMgPT09ICdudW1iZXInIHx8IChyZXMgYXMgSHRtbEVzY2FwZWQpLmlzRXNjYXBlZCkge1xuICAgICAgYnVmZmVyWzBdICs9IHJlc1xuICAgIH0gZWxzZSB7XG4gICAgICBlc2NhcGVUb0J1ZmZlcihyZXMsIGJ1ZmZlcilcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgSlNYRnJhZ21lbnROb2RlIGV4dGVuZHMgSlNYTm9kZSB7XG4gIHRvU3RyaW5nVG9CdWZmZXIoYnVmZmVyOiBTdHJpbmdCdWZmZXIpOiB2b2lkIHtcbiAgICBjaGlsZHJlblRvU3RyaW5nVG9CdWZmZXIodGhpcy5jaGlsZHJlbiwgYnVmZmVyKVxuICB9XG59XG5cbmV4cG9ydCB7IGpzeEZuIGFzIGpzeCB9XG5jb25zdCBqc3hGbiA9IChcbiAgdGFnOiBzdHJpbmcgfCBGdW5jdGlvbixcbiAgcHJvcHM6IFByb3BzLFxuICAuLi5jaGlsZHJlbjogKHN0cmluZyB8IEh0bWxFc2NhcGVkU3RyaW5nKVtdXG4pOiBKU1hOb2RlID0+IHtcbiAgaWYgKHR5cGVvZiB0YWcgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbmV3IEpTWEZ1bmN0aW9uTm9kZSh0YWcsIHByb3BzLCBjaGlsZHJlbilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IEpTWE5vZGUodGFnLCBwcm9wcywgY2hpbGRyZW4pXG4gIH1cbn1cblxudHlwZSBGQzxUID0gUHJvcHM+ID0gKHByb3BzOiBUKSA9PiBIdG1sRXNjYXBlZFN0cmluZ1xuXG5jb25zdCBzaGFsbG93RXF1YWwgPSAoYTogUHJvcHMsIGI6IFByb3BzKTogYm9vbGVhbiA9PiB7XG4gIGlmIChhID09PSBiKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGNvbnN0IGFLZXlzID0gT2JqZWN0LmtleXMoYSlcbiAgY29uc3QgYktleXMgPSBPYmplY3Qua2V5cyhiKVxuICBpZiAoYUtleXMubGVuZ3RoICE9PSBiS2V5cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBhS2V5cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChhW2FLZXlzW2ldXSAhPT0gYlthS2V5c1tpXV0pIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG5cbmV4cG9ydCBjb25zdCBtZW1vID0gPFQ+KFxuICBjb21wb25lbnQ6IEZDPFQ+LFxuICBwcm9wc0FyZUVxdWFsOiAocHJldlByb3BzOiBSZWFkb25seTxUPiwgbmV4dFByb3BzOiBSZWFkb25seTxUPikgPT4gYm9vbGVhbiA9IHNoYWxsb3dFcXVhbFxuKTogRkM8VD4gPT4ge1xuICBsZXQgY29tcHV0ZWQgPSB1bmRlZmluZWRcbiAgbGV0IHByZXZQcm9wczogVCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZFxuICByZXR1cm4gKChwcm9wczogVCk6IEh0bWxFc2NhcGVkU3RyaW5nID0+IHtcbiAgICBpZiAocHJldlByb3BzICYmICFwcm9wc0FyZUVxdWFsKHByZXZQcm9wcywgcHJvcHMpKSB7XG4gICAgICBjb21wdXRlZCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgICBwcmV2UHJvcHMgPSBwcm9wc1xuICAgIHJldHVybiAoY29tcHV0ZWQgfHw9IGNvbXBvbmVudChwcm9wcykpXG4gIH0pIGFzIEZDPFQ+XG59XG5cbmV4cG9ydCBjb25zdCBGcmFnbWVudCA9IChwcm9wczogeyBrZXk/OiBzdHJpbmc7IGNoaWxkcmVuPzogQ2hpbGRbXSB9KTogSlNYTm9kZSA9PiB7XG4gIHJldHVybiBuZXcgSlNYRnJhZ21lbnROb2RlKCcnLCB7fSwgcHJvcHMuY2hpbGRyZW4gfHwgW10pXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxjQUFjLFFBQVEsc0JBQXFCO0FBbUJwRCxNQUFNLFlBQVk7SUFD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