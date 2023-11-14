import { raw } from '../helper/html/index.ts';
import { escapeToBuffer, stringBufferToString } from '../utils/html.ts';
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
        } else if (child instanceof Promise) {
            buffer.unshift('', child);
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
        return buffer.length === 1 ? buffer[0] : stringBufferToString(buffer);
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
                const styles = Object.keys(v).map((k)=>{
                    const property = k.replace(/[A-Z]/g, (match)=>`-${match.toLowerCase()}`);
                    return `${property}:${v[k]}`;
                }).join(';');
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
                children = [
                    raw(v.__html)
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
        if (res instanceof Promise) {
            buffer.unshift('', res);
        } else if (res instanceof JSXNode) {
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
    return new JSXFragmentNode('', {}, props.children ? [
        props.children
    ] : []);
};
export const createContext = (defaultValue)=>{
    const values = [
        defaultValue
    ];
    return {
        values,
        Provider (props) {
            values.push(props.value);
            const string = props.children ? (Array.isArray(props.children) ? new JSXFragmentNode('', {}, props.children) : props.children).toString() : '';
            values.pop();
            if (string instanceof Promise) {
                return Promise.resolve().then(async ()=>{
                    values.push(props.value);
                    const awaited = await string;
                    const promiseRes = raw(awaited, awaited.promises);
                    values.pop();
                    return promiseRes;
                });
            } else {
                return raw(string);
            }
        }
    };
};
export const useContext = (context)=>{
    return context.values[context.values.length - 1];
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL2pzeC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByYXcgfSBmcm9tICcuLi9oZWxwZXIvaHRtbC9pbmRleC50cydcbmltcG9ydCB7IGVzY2FwZVRvQnVmZmVyLCBzdHJpbmdCdWZmZXJUb1N0cmluZyB9IGZyb20gJy4uL3V0aWxzL2h0bWwudHMnXG5pbXBvcnQgdHlwZSB7IFN0cmluZ0J1ZmZlciwgSHRtbEVzY2FwZWQsIEh0bWxFc2NhcGVkU3RyaW5nIH0gZnJvbSAnLi4vdXRpbHMvaHRtbC50cydcbmltcG9ydCB0eXBlIHsgSW50cmluc2ljRWxlbWVudHMgYXMgSW50cmluc2ljRWxlbWVudHNEZWZpbmVkIH0gZnJvbSAnLi9pbnRyaW5zaWMtZWxlbWVudHMudHMnXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG50eXBlIFByb3BzID0gUmVjb3JkPHN0cmluZywgYW55PlxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbmFtZXNwYWNlXG4gIG5hbWVzcGFjZSBKU1gge1xuICAgIHR5cGUgRWxlbWVudCA9IEh0bWxFc2NhcGVkU3RyaW5nIHwgUHJvbWlzZTxIdG1sRXNjYXBlZFN0cmluZz5cbiAgICBpbnRlcmZhY2UgRWxlbWVudENoaWxkcmVuQXR0cmlidXRlIHtcbiAgICAgIGNoaWxkcmVuOiBDaGlsZFxuICAgIH1cbiAgICBpbnRlcmZhY2UgSW50cmluc2ljRWxlbWVudHMgZXh0ZW5kcyBJbnRyaW5zaWNFbGVtZW50c0RlZmluZWQge1xuICAgICAgW3RhZ05hbWU6IHN0cmluZ106IFByb3BzXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGVtcHR5VGFncyA9IFtcbiAgJ2FyZWEnLFxuICAnYmFzZScsXG4gICdicicsXG4gICdjb2wnLFxuICAnZW1iZWQnLFxuICAnaHInLFxuICAnaW1nJyxcbiAgJ2lucHV0JyxcbiAgJ2tleWdlbicsXG4gICdsaW5rJyxcbiAgJ21ldGEnLFxuICAncGFyYW0nLFxuICAnc291cmNlJyxcbiAgJ3RyYWNrJyxcbiAgJ3dicicsXG5dXG5jb25zdCBib29sZWFuQXR0cmlidXRlcyA9IFtcbiAgJ2FsbG93ZnVsbHNjcmVlbicsXG4gICdhc3luYycsXG4gICdhdXRvZm9jdXMnLFxuICAnYXV0b3BsYXknLFxuICAnY2hlY2tlZCcsXG4gICdjb250cm9scycsXG4gICdkZWZhdWx0JyxcbiAgJ2RlZmVyJyxcbiAgJ2Rpc2FibGVkJyxcbiAgJ2Zvcm1ub3ZhbGlkYXRlJyxcbiAgJ2hpZGRlbicsXG4gICdpbmVydCcsXG4gICdpc21hcCcsXG4gICdpdGVtc2NvcGUnLFxuICAnbG9vcCcsXG4gICdtdWx0aXBsZScsXG4gICdtdXRlZCcsXG4gICdub21vZHVsZScsXG4gICdub3ZhbGlkYXRlJyxcbiAgJ29wZW4nLFxuICAncGxheXNpbmxpbmUnLFxuICAncmVhZG9ubHknLFxuICAncmVxdWlyZWQnLFxuICAncmV2ZXJzZWQnLFxuICAnc2VsZWN0ZWQnLFxuXVxuXG5jb25zdCBjaGlsZHJlblRvU3RyaW5nVG9CdWZmZXIgPSAoY2hpbGRyZW46IENoaWxkW10sIGJ1ZmZlcjogU3RyaW5nQnVmZmVyKTogdm9pZCA9PiB7XG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICBpZiAodHlwZW9mIGNoaWxkID09PSAnc3RyaW5nJykge1xuICAgICAgZXNjYXBlVG9CdWZmZXIoY2hpbGQsIGJ1ZmZlcilcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjaGlsZCA9PT0gJ2Jvb2xlYW4nIHx8IGNoaWxkID09PSBudWxsIHx8IGNoaWxkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnRpbnVlXG4gICAgfSBlbHNlIGlmIChjaGlsZCBpbnN0YW5jZW9mIEpTWE5vZGUpIHtcbiAgICAgIGNoaWxkLnRvU3RyaW5nVG9CdWZmZXIoYnVmZmVyKVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0eXBlb2YgY2hpbGQgPT09ICdudW1iZXInIHx8XG4gICAgICAoY2hpbGQgYXMgdW5rbm93biBhcyB7IGlzRXNjYXBlZDogYm9vbGVhbiB9KS5pc0VzY2FwZWRcbiAgICApIHtcbiAgICAgIDsoYnVmZmVyWzBdIGFzIHN0cmluZykgKz0gY2hpbGRcbiAgICB9IGVsc2UgaWYgKGNoaWxkIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgYnVmZmVyLnVuc2hpZnQoJycsIGNoaWxkKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBgY2hpbGRgIHR5cGUgaXMgYENoaWxkW11gLCBzbyBzdHJpbmdpZnkgcmVjdXJzaXZlbHlcbiAgICAgIGNoaWxkcmVuVG9TdHJpbmdUb0J1ZmZlcihjaGlsZCwgYnVmZmVyKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgdHlwZSBDaGlsZCA9IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPiB8IG51bWJlciB8IEpTWE5vZGUgfCBDaGlsZFtdXG5leHBvcnQgY2xhc3MgSlNYTm9kZSBpbXBsZW1lbnRzIEh0bWxFc2NhcGVkIHtcbiAgdGFnOiBzdHJpbmcgfCBGdW5jdGlvblxuICBwcm9wczogUHJvcHNcbiAgY2hpbGRyZW46IENoaWxkW11cbiAgaXNFc2NhcGVkOiB0cnVlID0gdHJ1ZSBhcyBjb25zdFxuICBjb25zdHJ1Y3Rvcih0YWc6IHN0cmluZyB8IEZ1bmN0aW9uLCBwcm9wczogUHJvcHMsIGNoaWxkcmVuOiBDaGlsZFtdKSB7XG4gICAgdGhpcy50YWcgPSB0YWdcbiAgICB0aGlzLnByb3BzID0gcHJvcHNcbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW5cbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgYnVmZmVyOiBTdHJpbmdCdWZmZXIgPSBbJyddXG4gICAgdGhpcy50b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcilcbiAgICByZXR1cm4gYnVmZmVyLmxlbmd0aCA9PT0gMSA/IGJ1ZmZlclswXSA6IHN0cmluZ0J1ZmZlclRvU3RyaW5nKGJ1ZmZlcilcbiAgfVxuXG4gIHRvU3RyaW5nVG9CdWZmZXIoYnVmZmVyOiBTdHJpbmdCdWZmZXIpOiB2b2lkIHtcbiAgICBjb25zdCB0YWcgPSB0aGlzLnRhZyBhcyBzdHJpbmdcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHNcbiAgICBsZXQgeyBjaGlsZHJlbiB9ID0gdGhpc1xuXG4gICAgYnVmZmVyWzBdICs9IGA8JHt0YWd9YFxuXG4gICAgY29uc3QgcHJvcHNLZXlzID0gT2JqZWN0LmtleXMocHJvcHMgfHwge30pXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcHJvcHNLZXlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBrZXkgPSBwcm9wc0tleXNbaV1cbiAgICAgIGNvbnN0IHYgPSBwcm9wc1trZXldXG4gICAgICAvLyBvYmplY3QgdG8gc3R5bGUgc3RyaW5nc1xuICAgICAgaWYgKGtleSA9PT0gJ3N0eWxlJyAmJiB0eXBlb2YgdiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gT2JqZWN0LmtleXModilcbiAgICAgICAgICAubWFwKChrKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IGsucmVwbGFjZSgvW0EtWl0vZywgKG1hdGNoKSA9PiBgLSR7bWF0Y2gudG9Mb3dlckNhc2UoKX1gKVxuICAgICAgICAgICAgcmV0dXJuIGAke3Byb3BlcnR5fToke3Zba119YFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmpvaW4oJzsnKVxuICAgICAgICBidWZmZXJbMF0gKz0gYCBzdHlsZT1cIiR7c3R5bGVzfVwiYFxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgYnVmZmVyWzBdICs9IGAgJHtrZXl9PVwiYFxuICAgICAgICBlc2NhcGVUb0J1ZmZlcih2LCBidWZmZXIpXG4gICAgICAgIGJ1ZmZlclswXSArPSAnXCInXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykge1xuICAgICAgICBidWZmZXJbMF0gKz0gYCAke2tleX09XCIke3Z9XCJgXG4gICAgICB9IGVsc2UgaWYgKHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmdcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJyAmJiBib29sZWFuQXR0cmlidXRlcy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgYnVmZmVyWzBdICs9IGAgJHtrZXl9PVwiXCJgXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwnKSB7XG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdGhyb3cgJ0NhbiBvbmx5IHNldCBvbmUgb2YgYGNoaWxkcmVuYCBvciBgcHJvcHMuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUxgLidcbiAgICAgICAgfVxuXG4gICAgICAgIGNoaWxkcmVuID0gW3Jhdyh2Ll9faHRtbCldXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWZmZXJbMF0gKz0gYCAke2tleX09XCJgXG4gICAgICAgIGVzY2FwZVRvQnVmZmVyKHYudG9TdHJpbmcoKSwgYnVmZmVyKVxuICAgICAgICBidWZmZXJbMF0gKz0gJ1wiJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbXB0eVRhZ3MuaW5jbHVkZXModGFnIGFzIHN0cmluZykpIHtcbiAgICAgIGJ1ZmZlclswXSArPSAnLz4nXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBidWZmZXJbMF0gKz0gJz4nXG5cbiAgICBjaGlsZHJlblRvU3RyaW5nVG9CdWZmZXIoY2hpbGRyZW4sIGJ1ZmZlcilcblxuICAgIGJ1ZmZlclswXSArPSBgPC8ke3RhZ30+YFxuICB9XG59XG5cbmNsYXNzIEpTWEZ1bmN0aW9uTm9kZSBleHRlbmRzIEpTWE5vZGUge1xuICB0b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcjogU3RyaW5nQnVmZmVyKTogdm9pZCB7XG4gICAgY29uc3QgeyBjaGlsZHJlbiB9ID0gdGhpc1xuXG4gICAgY29uc3QgcmVzID0gKHRoaXMudGFnIGFzIEZ1bmN0aW9uKS5jYWxsKG51bGwsIHtcbiAgICAgIC4uLnRoaXMucHJvcHMsXG4gICAgICBjaGlsZHJlbjogY2hpbGRyZW4ubGVuZ3RoIDw9IDEgPyBjaGlsZHJlblswXSA6IGNoaWxkcmVuLFxuICAgIH0pXG5cbiAgICBpZiAocmVzIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgYnVmZmVyLnVuc2hpZnQoJycsIHJlcylcbiAgICB9IGVsc2UgaWYgKHJlcyBpbnN0YW5jZW9mIEpTWE5vZGUpIHtcbiAgICAgIHJlcy50b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcilcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXMgPT09ICdudW1iZXInIHx8IChyZXMgYXMgSHRtbEVzY2FwZWQpLmlzRXNjYXBlZCkge1xuICAgICAgYnVmZmVyWzBdICs9IHJlc1xuICAgIH0gZWxzZSB7XG4gICAgICBlc2NhcGVUb0J1ZmZlcihyZXMsIGJ1ZmZlcilcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgSlNYRnJhZ21lbnROb2RlIGV4dGVuZHMgSlNYTm9kZSB7XG4gIHRvU3RyaW5nVG9CdWZmZXIoYnVmZmVyOiBTdHJpbmdCdWZmZXIpOiB2b2lkIHtcbiAgICBjaGlsZHJlblRvU3RyaW5nVG9CdWZmZXIodGhpcy5jaGlsZHJlbiwgYnVmZmVyKVxuICB9XG59XG5cbmV4cG9ydCB7IGpzeEZuIGFzIGpzeCB9XG5jb25zdCBqc3hGbiA9IChcbiAgdGFnOiBzdHJpbmcgfCBGdW5jdGlvbixcbiAgcHJvcHM6IFByb3BzLFxuICAuLi5jaGlsZHJlbjogKHN0cmluZyB8IEh0bWxFc2NhcGVkU3RyaW5nKVtdXG4pOiBKU1hOb2RlID0+IHtcbiAgaWYgKHR5cGVvZiB0YWcgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbmV3IEpTWEZ1bmN0aW9uTm9kZSh0YWcsIHByb3BzLCBjaGlsZHJlbilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IEpTWE5vZGUodGFnLCBwcm9wcywgY2hpbGRyZW4pXG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgRkM8VCA9IFByb3BzPiA9IChcbiAgcHJvcHM6IFQgJiB7IGNoaWxkcmVuPzogQ2hpbGQgfVxuKSA9PiBIdG1sRXNjYXBlZFN0cmluZyB8IFByb21pc2U8SHRtbEVzY2FwZWRTdHJpbmc+XG5cbmNvbnN0IHNoYWxsb3dFcXVhbCA9IChhOiBQcm9wcywgYjogUHJvcHMpOiBib29sZWFuID0+IHtcbiAgaWYgKGEgPT09IGIpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgY29uc3QgYUtleXMgPSBPYmplY3Qua2V5cyhhKVxuICBjb25zdCBiS2V5cyA9IE9iamVjdC5rZXlzKGIpXG4gIGlmIChhS2V5cy5sZW5ndGggIT09IGJLZXlzLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGFLZXlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFbYUtleXNbaV1dICE9PSBiW2FLZXlzW2ldXSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZXhwb3J0IGNvbnN0IG1lbW8gPSA8VD4oXG4gIGNvbXBvbmVudDogRkM8VD4sXG4gIHByb3BzQXJlRXF1YWw6IChwcmV2UHJvcHM6IFJlYWRvbmx5PFQ+LCBuZXh0UHJvcHM6IFJlYWRvbmx5PFQ+KSA9PiBib29sZWFuID0gc2hhbGxvd0VxdWFsXG4pOiBGQzxUPiA9PiB7XG4gIGxldCBjb21wdXRlZCA9IHVuZGVmaW5lZFxuICBsZXQgcHJldlByb3BzOiBUIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkXG4gIHJldHVybiAoKHByb3BzOiBUICYgeyBjaGlsZHJlbj86IENoaWxkIH0pOiBIdG1sRXNjYXBlZFN0cmluZyA9PiB7XG4gICAgaWYgKHByZXZQcm9wcyAmJiAhcHJvcHNBcmVFcXVhbChwcmV2UHJvcHMsIHByb3BzKSkge1xuICAgICAgY29tcHV0ZWQgPSB1bmRlZmluZWRcbiAgICB9XG4gICAgcHJldlByb3BzID0gcHJvcHNcbiAgICByZXR1cm4gKGNvbXB1dGVkIHx8PSBjb21wb25lbnQocHJvcHMpKVxuICB9KSBhcyBGQzxUPlxufVxuXG5leHBvcnQgY29uc3QgRnJhZ21lbnQgPSAocHJvcHM6IHtcbiAga2V5Pzogc3RyaW5nXG4gIGNoaWxkcmVuPzogQ2hpbGQgfCBIdG1sRXNjYXBlZFN0cmluZ1xufSk6IEh0bWxFc2NhcGVkU3RyaW5nID0+IHtcbiAgcmV0dXJuIG5ldyBKU1hGcmFnbWVudE5vZGUoJycsIHt9LCBwcm9wcy5jaGlsZHJlbiA/IFtwcm9wcy5jaGlsZHJlbl0gOiBbXSkgYXMgbmV2ZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb250ZXh0PFQ+IHtcbiAgdmFsdWVzOiBUW11cbiAgUHJvdmlkZXI6IEZDPHsgdmFsdWU6IFQgfT5cbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUNvbnRleHQgPSA8VD4oZGVmYXVsdFZhbHVlOiBUKTogQ29udGV4dDxUPiA9PiB7XG4gIGNvbnN0IHZhbHVlcyA9IFtkZWZhdWx0VmFsdWVdXG4gIHJldHVybiB7XG4gICAgdmFsdWVzLFxuICAgIFByb3ZpZGVyKHByb3BzKTogSHRtbEVzY2FwZWRTdHJpbmcgfCBQcm9taXNlPEh0bWxFc2NhcGVkU3RyaW5nPiB7XG4gICAgICB2YWx1ZXMucHVzaChwcm9wcy52YWx1ZSlcbiAgICAgIGNvbnN0IHN0cmluZyA9IHByb3BzLmNoaWxkcmVuXG4gICAgICAgID8gKEFycmF5LmlzQXJyYXkocHJvcHMuY2hpbGRyZW4pXG4gICAgICAgICAgICA/IG5ldyBKU1hGcmFnbWVudE5vZGUoJycsIHt9LCBwcm9wcy5jaGlsZHJlbilcbiAgICAgICAgICAgIDogcHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICApLnRvU3RyaW5nKClcbiAgICAgICAgOiAnJ1xuICAgICAgdmFsdWVzLnBvcCgpXG5cbiAgICAgIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuPEh0bWxFc2NhcGVkU3RyaW5nPihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgdmFsdWVzLnB1c2gocHJvcHMudmFsdWUpXG4gICAgICAgICAgY29uc3QgYXdhaXRlZCA9IGF3YWl0IHN0cmluZ1xuICAgICAgICAgIGNvbnN0IHByb21pc2VSZXMgPSByYXcoYXdhaXRlZCwgKGF3YWl0ZWQgYXMgSHRtbEVzY2FwZWRTdHJpbmcpLnByb21pc2VzKVxuICAgICAgICAgIHZhbHVlcy5wb3AoKVxuICAgICAgICAgIHJldHVybiBwcm9taXNlUmVzXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmF3KHN0cmluZylcbiAgICAgIH1cbiAgICB9LFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCB1c2VDb250ZXh0ID0gPFQ+KGNvbnRleHQ6IENvbnRleHQ8VD4pOiBUID0+IHtcbiAgcmV0dXJuIGNvbnRleHQudmFsdWVzW2NvbnRleHQudmFsdWVzLmxlbmd0aCAtIDFdXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxHQUFHLFFBQVEsMEJBQXlCO0FBQzdDLFNBQVMsY0FBYyxFQUFFLG9CQUFvQixRQUFRLG1CQUFrQjtBQW9CdkUsTUFBTSxZQUFZO0lBQ2hCO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtDQUNEO0FBQ0QsTUFBTSxvQkFBb0I7SUFDeEI7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7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