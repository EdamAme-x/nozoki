export const splitPath = (path)=>{
    const paths = path.split('/');
    if (paths[0] === '') {
        paths.shift();
    }
    return paths;
};
export const splitRoutingPath = (path)=>{
    const groups = [] // [mark, original string]
    ;
    for(let i = 0;;){
        let replaced = false;
        path = path.replace(/\{[^}]+\}/g, (m)=>{
            const mark = `@\\${i}`;
            groups[i] = [
                mark,
                m
            ];
            i++;
            replaced = true;
            return mark;
        });
        if (!replaced) {
            break;
        }
    }
    const paths = path.split('/');
    if (paths[0] === '') {
        paths.shift();
    }
    for(let i = groups.length - 1; i >= 0; i--){
        const [mark] = groups[i];
        for(let j = paths.length - 1; j >= 0; j--){
            if (paths[j].indexOf(mark) !== -1) {
                paths[j] = paths[j].replace(mark, groups[i][1]);
                break;
            }
        }
    }
    return paths;
};
const patternCache = {};
export const getPattern = (label)=>{
    // *            => wildcard
    // :id{[0-9]+}  => ([0-9]+)
    // :id          => (.+)
    //const name = ''
    if (label === '*') {
        return '*';
    }
    const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    if (match) {
        if (!patternCache[label]) {
            if (match[2]) {
                patternCache[label] = [
                    label,
                    match[1],
                    new RegExp('^' + match[2] + '$')
                ];
            } else {
                patternCache[label] = [
                    label,
                    match[1],
                    true
                ];
            }
        }
        return patternCache[label];
    }
    return null;
};
export const getPath = (request)=>{
    const url = request.url;
    const queryIndex = url.indexOf('?', 8);
    return url.slice(url.indexOf('/', 8), queryIndex === -1 ? undefined : queryIndex);
};
export const getPathNoStrict = (request)=>{
    const result = getPath(request);
    // if strict routing is false => `/hello/hey/` and `/hello/hey` are treated the same
    return result.length > 1 && result[result.length - 1] === '/' ? result.slice(0, -1) : result;
};
export const mergePath = (...paths)=>{
    let p = '';
    let endsWithSlash = false;
    for (let path of paths){
        /* ['/hey/','/say'] => ['/hey', '/say'] */ if (p[p.length - 1] === '/') {
            p = p.slice(0, -1);
            endsWithSlash = true;
        }
        /* ['/hey','say'] => ['/hey', '/say'] */ if (path[0] !== '/') {
            path = `/${path}`;
        }
        /* ['/hey/', '/'] => `/hey/` */ if (path === '/' && endsWithSlash) {
            p = `${p}/`;
        } else if (path !== '/') {
            p = `${p}${path}`;
        }
        /* ['/', '/'] => `/` */ if (path === '/' && p === '') {
            p = '/';
        }
    }
    return p;
};
export const checkOptionalParameter = (path)=>{
    /*
   If path is `/api/animals/:type?` it will return:
   [`/api/animals`, `/api/animals/:type`]
   in other cases it will return null
   */ const match = path.match(/^(.+|)(\/\:[^\/]+)\?$/);
    if (!match) return null;
    const base = match[1];
    const optional = base + match[2];
    return [
        base === '' ? '/' : base.replace(/\/$/, ''),
        optional
    ];
};
// Optimized
const _decodeURI = (value)=>{
    if (!/[%+]/.test(value)) {
        return value;
    }
    if (value.indexOf('+') !== -1) {
        value = value.replace(/\+/g, ' ');
    }
    return value.indexOf('%') === -1 ? value : decodeURIComponent_(value);
};
const _getQueryParam = (url, key, multiple)=>{
    let encoded;
    if (!multiple && key && !/[%+]/.test(key)) {
        // optimized for unencoded key
        let keyIndex = url.indexOf(`?${key}`, 8);
        if (keyIndex === -1) {
            keyIndex = url.indexOf(`&${key}`, 8);
        }
        while(keyIndex !== -1){
            const trailingKeyCode = url.charCodeAt(keyIndex + key.length + 1);
            if (trailingKeyCode === 61) {
                const valueIndex = keyIndex + key.length + 2;
                const endIndex = url.indexOf('&', valueIndex);
                return _decodeURI(url.slice(valueIndex, endIndex === -1 ? undefined : endIndex));
            } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
                return '';
            }
            keyIndex = url.indexOf(`&${key}`, keyIndex + 1);
        }
        encoded = /[%+]/.test(url);
        if (!encoded) {
            return undefined;
        }
    // fallback to default routine
    }
    const results = {};
    encoded ??= /[%+]/.test(url);
    let keyIndex = url.indexOf('?', 8);
    while(keyIndex !== -1){
        const nextKeyIndex = url.indexOf('&', keyIndex + 1);
        let valueIndex = url.indexOf('=', keyIndex);
        if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
            valueIndex = -1;
        }
        let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? undefined : nextKeyIndex : valueIndex);
        if (encoded) {
            name = _decodeURI(name);
        }
        keyIndex = nextKeyIndex;
        if (name === '') {
            continue;
        }
        let value;
        if (valueIndex === -1) {
            value = '';
        } else {
            value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? undefined : nextKeyIndex);
            if (encoded) {
                value = _decodeURI(value);
            }
        }
        if (multiple) {
            (results[name] ??= []).push(value);
        } else {
            results[name] ??= value;
        }
    }
    return key ? results[key] : results;
};
export const getQueryParam = _getQueryParam;
export const getQueryParams = (url, key)=>{
    return _getQueryParam(url, key, true);
};
// `decodeURIComponent` is a long name.
// By making it a function, we can use it commonly when minified, reducing the amount of code.
export const decodeURIComponent_ = decodeURIComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvdXRpbHMvdXJsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIFBhdHRlcm4gPSByZWFkb25seSBbc3RyaW5nLCBzdHJpbmcsIFJlZ0V4cCB8IHRydWVdIHwgJyonXG5cbmV4cG9ydCBjb25zdCBzcGxpdFBhdGggPSAocGF0aDogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuICBjb25zdCBwYXRocyA9IHBhdGguc3BsaXQoJy8nKVxuICBpZiAocGF0aHNbMF0gPT09ICcnKSB7XG4gICAgcGF0aHMuc2hpZnQoKVxuICB9XG4gIHJldHVybiBwYXRoc1xufVxuXG5leHBvcnQgY29uc3Qgc3BsaXRSb3V0aW5nUGF0aCA9IChwYXRoOiBzdHJpbmcpOiBzdHJpbmdbXSA9PiB7XG4gIGNvbnN0IGdyb3VwczogW3N0cmluZywgc3RyaW5nXVtdID0gW10gLy8gW21hcmssIG9yaWdpbmFsIHN0cmluZ11cbiAgZm9yIChsZXQgaSA9IDA7IDsgKSB7XG4gICAgbGV0IHJlcGxhY2VkID0gZmFsc2VcbiAgICBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXHtbXn1dK1xcfS9nLCAobSkgPT4ge1xuICAgICAgY29uc3QgbWFyayA9IGBAXFxcXCR7aX1gXG4gICAgICBncm91cHNbaV0gPSBbbWFyaywgbV1cbiAgICAgIGkrK1xuICAgICAgcmVwbGFjZWQgPSB0cnVlXG4gICAgICByZXR1cm4gbWFya1xuICAgIH0pXG4gICAgaWYgKCFyZXBsYWNlZCkge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBjb25zdCBwYXRocyA9IHBhdGguc3BsaXQoJy8nKVxuICBpZiAocGF0aHNbMF0gPT09ICcnKSB7XG4gICAgcGF0aHMuc2hpZnQoKVxuICB9XG4gIGZvciAobGV0IGkgPSBncm91cHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCBbbWFya10gPSBncm91cHNbaV1cbiAgICBmb3IgKGxldCBqID0gcGF0aHMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgIGlmIChwYXRoc1tqXS5pbmRleE9mKG1hcmspICE9PSAtMSkge1xuICAgICAgICBwYXRoc1tqXSA9IHBhdGhzW2pdLnJlcGxhY2UobWFyaywgZ3JvdXBzW2ldWzFdKVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXRoc1xufVxuXG5jb25zdCBwYXR0ZXJuQ2FjaGU6IHsgW2tleTogc3RyaW5nXTogUGF0dGVybiB9ID0ge31cbmV4cG9ydCBjb25zdCBnZXRQYXR0ZXJuID0gKGxhYmVsOiBzdHJpbmcpOiBQYXR0ZXJuIHwgbnVsbCA9PiB7XG4gIC8vICogICAgICAgICAgICA9PiB3aWxkY2FyZFxuICAvLyA6aWR7WzAtOV0rfSAgPT4gKFswLTldKylcbiAgLy8gOmlkICAgICAgICAgID0+ICguKylcbiAgLy9jb25zdCBuYW1lID0gJydcblxuICBpZiAobGFiZWwgPT09ICcqJykge1xuICAgIHJldHVybiAnKidcbiAgfVxuXG4gIGNvbnN0IG1hdGNoID0gbGFiZWwubWF0Y2goL15cXDooW15cXHtcXH1dKykoPzpcXHsoLispXFx9KT8kLylcbiAgaWYgKG1hdGNoKSB7XG4gICAgaWYgKCFwYXR0ZXJuQ2FjaGVbbGFiZWxdKSB7XG4gICAgICBpZiAobWF0Y2hbMl0pIHtcbiAgICAgICAgcGF0dGVybkNhY2hlW2xhYmVsXSA9IFtsYWJlbCwgbWF0Y2hbMV0sIG5ldyBSZWdFeHAoJ14nICsgbWF0Y2hbMl0gKyAnJCcpXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGF0dGVybkNhY2hlW2xhYmVsXSA9IFtsYWJlbCwgbWF0Y2hbMV0sIHRydWVdXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdHRlcm5DYWNoZVtsYWJlbF1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBjb25zdCBnZXRQYXRoID0gKHJlcXVlc3Q6IFJlcXVlc3QpOiBzdHJpbmcgPT4ge1xuICBjb25zdCB1cmwgPSByZXF1ZXN0LnVybFxuICBjb25zdCBxdWVyeUluZGV4ID0gdXJsLmluZGV4T2YoJz8nLCA4KVxuICByZXR1cm4gdXJsLnNsaWNlKHVybC5pbmRleE9mKCcvJywgOCksIHF1ZXJ5SW5kZXggPT09IC0xID8gdW5kZWZpbmVkIDogcXVlcnlJbmRleClcbn1cblxuZXhwb3J0IGNvbnN0IGdldFBhdGhOb1N0cmljdCA9IChyZXF1ZXN0OiBSZXF1ZXN0KTogc3RyaW5nID0+IHtcbiAgY29uc3QgcmVzdWx0ID0gZ2V0UGF0aChyZXF1ZXN0KVxuXG4gIC8vIGlmIHN0cmljdCByb3V0aW5nIGlzIGZhbHNlID0+IGAvaGVsbG8vaGV5L2AgYW5kIGAvaGVsbG8vaGV5YCBhcmUgdHJlYXRlZCB0aGUgc2FtZVxuICByZXR1cm4gcmVzdWx0Lmxlbmd0aCA+IDEgJiYgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSA9PT0gJy8nID8gcmVzdWx0LnNsaWNlKDAsIC0xKSA6IHJlc3VsdFxufVxuXG5leHBvcnQgY29uc3QgbWVyZ2VQYXRoID0gKC4uLnBhdGhzOiBzdHJpbmdbXSk6IHN0cmluZyA9PiB7XG4gIGxldCBwOiBzdHJpbmcgPSAnJ1xuICBsZXQgZW5kc1dpdGhTbGFzaCA9IGZhbHNlXG5cbiAgZm9yIChsZXQgcGF0aCBvZiBwYXRocykge1xuICAgIC8qIFsnL2hleS8nLCcvc2F5J10gPT4gWycvaGV5JywgJy9zYXknXSAqL1xuICAgIGlmIChwW3AubGVuZ3RoIC0gMV0gPT09ICcvJykge1xuICAgICAgcCA9IHAuc2xpY2UoMCwgLTEpXG4gICAgICBlbmRzV2l0aFNsYXNoID0gdHJ1ZVxuICAgIH1cblxuICAgIC8qIFsnL2hleScsJ3NheSddID0+IFsnL2hleScsICcvc2F5J10gKi9cbiAgICBpZiAocGF0aFswXSAhPT0gJy8nKSB7XG4gICAgICBwYXRoID0gYC8ke3BhdGh9YFxuICAgIH1cblxuICAgIC8qIFsnL2hleS8nLCAnLyddID0+IGAvaGV5L2AgKi9cbiAgICBpZiAocGF0aCA9PT0gJy8nICYmIGVuZHNXaXRoU2xhc2gpIHtcbiAgICAgIHAgPSBgJHtwfS9gXG4gICAgfSBlbHNlIGlmIChwYXRoICE9PSAnLycpIHtcbiAgICAgIHAgPSBgJHtwfSR7cGF0aH1gXG4gICAgfVxuXG4gICAgLyogWycvJywgJy8nXSA9PiBgL2AgKi9cbiAgICBpZiAocGF0aCA9PT0gJy8nICYmIHAgPT09ICcnKSB7XG4gICAgICBwID0gJy8nXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBcbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrT3B0aW9uYWxQYXJhbWV0ZXIgPSAocGF0aDogc3RyaW5nKTogc3RyaW5nW10gfCBudWxsID0+IHtcbiAgLypcbiAgIElmIHBhdGggaXMgYC9hcGkvYW5pbWFscy86dHlwZT9gIGl0IHdpbGwgcmV0dXJuOlxuICAgW2AvYXBpL2FuaW1hbHNgLCBgL2FwaS9hbmltYWxzLzp0eXBlYF1cbiAgIGluIG90aGVyIGNhc2VzIGl0IHdpbGwgcmV0dXJuIG51bGxcbiAgICovXG4gIGNvbnN0IG1hdGNoID0gcGF0aC5tYXRjaCgvXiguK3wpKFxcL1xcOlteXFwvXSspXFw/JC8pXG4gIGlmICghbWF0Y2gpIHJldHVybiBudWxsXG5cbiAgY29uc3QgYmFzZSA9IG1hdGNoWzFdXG4gIGNvbnN0IG9wdGlvbmFsID0gYmFzZSArIG1hdGNoWzJdXG4gIHJldHVybiBbYmFzZSA9PT0gJycgPyAnLycgOiBiYXNlLnJlcGxhY2UoL1xcLyQvLCAnJyksIG9wdGlvbmFsXVxufVxuXG4vLyBPcHRpbWl6ZWRcbmNvbnN0IF9kZWNvZGVVUkkgPSAodmFsdWU6IHN0cmluZykgPT4ge1xuICBpZiAoIS9bJStdLy50ZXN0KHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG4gIGlmICh2YWx1ZS5pbmRleE9mKCcrJykgIT09IC0xKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICB9XG4gIHJldHVybiB2YWx1ZS5pbmRleE9mKCclJykgPT09IC0xID8gdmFsdWUgOiBkZWNvZGVVUklDb21wb25lbnRfKHZhbHVlKVxufVxuXG5jb25zdCBfZ2V0UXVlcnlQYXJhbSA9IChcbiAgdXJsOiBzdHJpbmcsXG4gIGtleT86IHN0cmluZyxcbiAgbXVsdGlwbGU/OiBib29sZWFuXG4pOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHwgc3RyaW5nW10gfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPT4ge1xuICBsZXQgZW5jb2RlZFxuXG4gIGlmICghbXVsdGlwbGUgJiYga2V5ICYmICEvWyUrXS8udGVzdChrZXkpKSB7XG4gICAgLy8gb3B0aW1pemVkIGZvciB1bmVuY29kZWQga2V5XG5cbiAgICBsZXQga2V5SW5kZXggPSB1cmwuaW5kZXhPZihgPyR7a2V5fWAsIDgpXG4gICAgaWYgKGtleUluZGV4ID09PSAtMSkge1xuICAgICAga2V5SW5kZXggPSB1cmwuaW5kZXhPZihgJiR7a2V5fWAsIDgpXG4gICAgfVxuICAgIHdoaWxlIChrZXlJbmRleCAhPT0gLTEpIHtcbiAgICAgIGNvbnN0IHRyYWlsaW5nS2V5Q29kZSA9IHVybC5jaGFyQ29kZUF0KGtleUluZGV4ICsga2V5Lmxlbmd0aCArIDEpXG4gICAgICBpZiAodHJhaWxpbmdLZXlDb2RlID09PSA2MSkge1xuICAgICAgICBjb25zdCB2YWx1ZUluZGV4ID0ga2V5SW5kZXggKyBrZXkubGVuZ3RoICsgMlxuICAgICAgICBjb25zdCBlbmRJbmRleCA9IHVybC5pbmRleE9mKCcmJywgdmFsdWVJbmRleClcbiAgICAgICAgcmV0dXJuIF9kZWNvZGVVUkkodXJsLnNsaWNlKHZhbHVlSW5kZXgsIGVuZEluZGV4ID09PSAtMSA/IHVuZGVmaW5lZCA6IGVuZEluZGV4KSlcbiAgICAgIH0gZWxzZSBpZiAodHJhaWxpbmdLZXlDb2RlID09IDM4IHx8IGlzTmFOKHRyYWlsaW5nS2V5Q29kZSkpIHtcbiAgICAgICAgcmV0dXJuICcnXG4gICAgICB9XG4gICAgICBrZXlJbmRleCA9IHVybC5pbmRleE9mKGAmJHtrZXl9YCwga2V5SW5kZXggKyAxKVxuICAgIH1cblxuICAgIGVuY29kZWQgPSAvWyUrXS8udGVzdCh1cmwpXG4gICAgaWYgKCFlbmNvZGVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICAgIC8vIGZhbGxiYWNrIHRvIGRlZmF1bHQgcm91dGluZVxuICB9XG5cbiAgY29uc3QgcmVzdWx0czogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHt9XG4gIGVuY29kZWQgPz89IC9bJStdLy50ZXN0KHVybClcblxuICBsZXQga2V5SW5kZXggPSB1cmwuaW5kZXhPZignPycsIDgpXG4gIHdoaWxlIChrZXlJbmRleCAhPT0gLTEpIHtcbiAgICBjb25zdCBuZXh0S2V5SW5kZXggPSB1cmwuaW5kZXhPZignJicsIGtleUluZGV4ICsgMSlcbiAgICBsZXQgdmFsdWVJbmRleCA9IHVybC5pbmRleE9mKCc9Jywga2V5SW5kZXgpXG4gICAgaWYgKHZhbHVlSW5kZXggPiBuZXh0S2V5SW5kZXggJiYgbmV4dEtleUluZGV4ICE9PSAtMSkge1xuICAgICAgdmFsdWVJbmRleCA9IC0xXG4gICAgfVxuICAgIGxldCBuYW1lID0gdXJsLnNsaWNlKFxuICAgICAga2V5SW5kZXggKyAxLFxuICAgICAgdmFsdWVJbmRleCA9PT0gLTEgPyAobmV4dEtleUluZGV4ID09PSAtMSA/IHVuZGVmaW5lZCA6IG5leHRLZXlJbmRleCkgOiB2YWx1ZUluZGV4XG4gICAgKVxuICAgIGlmIChlbmNvZGVkKSB7XG4gICAgICBuYW1lID0gX2RlY29kZVVSSShuYW1lKVxuICAgIH1cblxuICAgIGtleUluZGV4ID0gbmV4dEtleUluZGV4XG5cbiAgICBpZiAobmFtZSA9PT0gJycpIHtcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgbGV0IHZhbHVlXG4gICAgaWYgKHZhbHVlSW5kZXggPT09IC0xKSB7XG4gICAgICB2YWx1ZSA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gdXJsLnNsaWNlKHZhbHVlSW5kZXggKyAxLCBuZXh0S2V5SW5kZXggPT09IC0xID8gdW5kZWZpbmVkIDogbmV4dEtleUluZGV4KVxuICAgICAgaWYgKGVuY29kZWQpIHtcbiAgICAgICAgdmFsdWUgPSBfZGVjb2RlVVJJKHZhbHVlKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtdWx0aXBsZSkge1xuICAgICAgOygocmVzdWx0c1tuYW1lXSA/Pz0gW10pIGFzIHN0cmluZ1tdKS5wdXNoKHZhbHVlKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRzW25hbWVdID8/PSB2YWx1ZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBrZXkgPyByZXN1bHRzW2tleV0gOiByZXN1bHRzXG59XG5cbmV4cG9ydCBjb25zdCBnZXRRdWVyeVBhcmFtOiAoXG4gIHVybDogc3RyaW5nLFxuICBrZXk/OiBzdHJpbmdcbikgPT4gc3RyaW5nIHwgdW5kZWZpbmVkIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IF9nZXRRdWVyeVBhcmFtIGFzIChcbiAgdXJsOiBzdHJpbmcsXG4gIGtleT86IHN0cmluZ1xuKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG5cbmV4cG9ydCBjb25zdCBnZXRRdWVyeVBhcmFtcyA9IChcbiAgdXJsOiBzdHJpbmcsXG4gIGtleT86IHN0cmluZ1xuKTogc3RyaW5nW10gfCB1bmRlZmluZWQgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPT4ge1xuICByZXR1cm4gX2dldFF1ZXJ5UGFyYW0odXJsLCBrZXksIHRydWUpIGFzIHN0cmluZ1tdIHwgdW5kZWZpbmVkIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+XG59XG5cbi8vIGBkZWNvZGVVUklDb21wb25lbnRgIGlzIGEgbG9uZyBuYW1lLlxuLy8gQnkgbWFraW5nIGl0IGEgZnVuY3Rpb24sIHdlIGNhbiB1c2UgaXQgY29tbW9ubHkgd2hlbiBtaW5pZmllZCwgcmVkdWNpbmcgdGhlIGFtb3VudCBvZiBjb2RlLlxuZXhwb3J0IGNvbnN0IGRlY29kZVVSSUNvbXBvbmVudF8gPSBkZWNvZGVVUklDb21wb25lbnRcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLE1BQU0sWUFBWSxDQUFDLE9BQTJCO0lBQ25ELE1BQU0sUUFBUSxLQUFLLEtBQUssQ0FBQztJQUN6QixJQUFJLEtBQUssQ0FBQyxFQUFFLEtBQUssSUFBSTtRQUNuQixNQUFNLEtBQUs7SUFDYixDQUFDO0lBQ0QsT0FBTztBQUNULEVBQUM7QUFFRCxPQUFPLE1BQU0sbUJBQW1CLENBQUMsT0FBMkI7SUFDMUQsTUFBTSxTQUE2QixFQUFFLENBQUMsMEJBQTBCOztJQUNoRSxJQUFLLElBQUksSUFBSSxJQUFPO1FBQ2xCLElBQUksV0FBVyxLQUFLO1FBQ3BCLE9BQU8sS0FBSyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQU07WUFDdkMsTUFBTSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUN0QixNQUFNLENBQUMsRUFBRSxHQUFHO2dCQUFDO2dCQUFNO2FBQUU7WUFDckI7WUFDQSxXQUFXLElBQUk7WUFDZixPQUFPO1FBQ1Q7UUFDQSxJQUFJLENBQUMsVUFBVTtZQUNiLEtBQUs7UUFDUCxDQUFDO0lBQ0g7SUFFQSxNQUFNLFFBQVEsS0FBSyxLQUFLLENBQUM7SUFDekIsSUFBSSxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUk7UUFDbkIsTUFBTSxLQUFLO0lBQ2IsQ0FBQztJQUNELElBQUssSUFBSSxJQUFJLE9BQU8sTUFBTSxHQUFHLEdBQUcsS0FBSyxHQUFHLElBQUs7UUFDM0MsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsRUFBRTtRQUN4QixJQUFLLElBQUksSUFBSSxNQUFNLE1BQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxJQUFLO1lBQzFDLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7Z0JBQ2pDLEtBQUssQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUs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