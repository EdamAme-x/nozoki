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
    // Optimized: RegExp is faster than indexOf() + slice()
    const match = request.url.match(/^https?:\/\/[^/]+(\/[^?]*)/);
    return match ? match[1] : '';
};
export const getQueryStrings = (url)=>{
    const queryIndex = url.indexOf('?', 8);
    return queryIndex === -1 ? '' : '?' + url.slice(queryIndex + 1);
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
    return /%/.test(value) ? decodeURIComponent_(value) : value;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvdXRpbHMvdXJsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIFBhdHRlcm4gPSByZWFkb25seSBbc3RyaW5nLCBzdHJpbmcsIFJlZ0V4cCB8IHRydWVdIHwgJyonXG5cbmV4cG9ydCBjb25zdCBzcGxpdFBhdGggPSAocGF0aDogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuICBjb25zdCBwYXRocyA9IHBhdGguc3BsaXQoJy8nKVxuICBpZiAocGF0aHNbMF0gPT09ICcnKSB7XG4gICAgcGF0aHMuc2hpZnQoKVxuICB9XG4gIHJldHVybiBwYXRoc1xufVxuXG5leHBvcnQgY29uc3Qgc3BsaXRSb3V0aW5nUGF0aCA9IChwYXRoOiBzdHJpbmcpOiBzdHJpbmdbXSA9PiB7XG4gIGNvbnN0IGdyb3VwczogW3N0cmluZywgc3RyaW5nXVtdID0gW10gLy8gW21hcmssIG9yaWdpbmFsIHN0cmluZ11cbiAgZm9yIChsZXQgaSA9IDA7IDsgKSB7XG4gICAgbGV0IHJlcGxhY2VkID0gZmFsc2VcbiAgICBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXHtbXn1dK1xcfS9nLCAobSkgPT4ge1xuICAgICAgY29uc3QgbWFyayA9IGBAXFxcXCR7aX1gXG4gICAgICBncm91cHNbaV0gPSBbbWFyaywgbV1cbiAgICAgIGkrK1xuICAgICAgcmVwbGFjZWQgPSB0cnVlXG4gICAgICByZXR1cm4gbWFya1xuICAgIH0pXG4gICAgaWYgKCFyZXBsYWNlZCkge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBjb25zdCBwYXRocyA9IHBhdGguc3BsaXQoJy8nKVxuICBpZiAocGF0aHNbMF0gPT09ICcnKSB7XG4gICAgcGF0aHMuc2hpZnQoKVxuICB9XG4gIGZvciAobGV0IGkgPSBncm91cHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCBbbWFya10gPSBncm91cHNbaV1cbiAgICBmb3IgKGxldCBqID0gcGF0aHMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgIGlmIChwYXRoc1tqXS5pbmRleE9mKG1hcmspICE9PSAtMSkge1xuICAgICAgICBwYXRoc1tqXSA9IHBhdGhzW2pdLnJlcGxhY2UobWFyaywgZ3JvdXBzW2ldWzFdKVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXRoc1xufVxuXG5jb25zdCBwYXR0ZXJuQ2FjaGU6IHsgW2tleTogc3RyaW5nXTogUGF0dGVybiB9ID0ge31cbmV4cG9ydCBjb25zdCBnZXRQYXR0ZXJuID0gKGxhYmVsOiBzdHJpbmcpOiBQYXR0ZXJuIHwgbnVsbCA9PiB7XG4gIC8vICogICAgICAgICAgICA9PiB3aWxkY2FyZFxuICAvLyA6aWR7WzAtOV0rfSAgPT4gKFswLTldKylcbiAgLy8gOmlkICAgICAgICAgID0+ICguKylcbiAgLy9jb25zdCBuYW1lID0gJydcblxuICBpZiAobGFiZWwgPT09ICcqJykge1xuICAgIHJldHVybiAnKidcbiAgfVxuXG4gIGNvbnN0IG1hdGNoID0gbGFiZWwubWF0Y2goL15cXDooW15cXHtcXH1dKykoPzpcXHsoLispXFx9KT8kLylcbiAgaWYgKG1hdGNoKSB7XG4gICAgaWYgKCFwYXR0ZXJuQ2FjaGVbbGFiZWxdKSB7XG4gICAgICBpZiAobWF0Y2hbMl0pIHtcbiAgICAgICAgcGF0dGVybkNhY2hlW2xhYmVsXSA9IFtsYWJlbCwgbWF0Y2hbMV0sIG5ldyBSZWdFeHAoJ14nICsgbWF0Y2hbMl0gKyAnJCcpXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGF0dGVybkNhY2hlW2xhYmVsXSA9IFtsYWJlbCwgbWF0Y2hbMV0sIHRydWVdXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdHRlcm5DYWNoZVtsYWJlbF1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBjb25zdCBnZXRQYXRoID0gKHJlcXVlc3Q6IFJlcXVlc3QpOiBzdHJpbmcgPT4ge1xuICAvLyBPcHRpbWl6ZWQ6IFJlZ0V4cCBpcyBmYXN0ZXIgdGhhbiBpbmRleE9mKCkgKyBzbGljZSgpXG4gIGNvbnN0IG1hdGNoID0gcmVxdWVzdC51cmwubWF0Y2goL15odHRwcz86XFwvXFwvW14vXSsoXFwvW14/XSopLylcbiAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiAnJ1xufVxuXG5leHBvcnQgY29uc3QgZ2V0UXVlcnlTdHJpbmdzID0gKHVybDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgY29uc3QgcXVlcnlJbmRleCA9IHVybC5pbmRleE9mKCc/JywgOClcbiAgcmV0dXJuIHF1ZXJ5SW5kZXggPT09IC0xID8gJycgOiAnPycgKyB1cmwuc2xpY2UocXVlcnlJbmRleCArIDEpXG59XG5cbmV4cG9ydCBjb25zdCBnZXRQYXRoTm9TdHJpY3QgPSAocmVxdWVzdDogUmVxdWVzdCk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHJlc3VsdCA9IGdldFBhdGgocmVxdWVzdClcblxuICAvLyBpZiBzdHJpY3Qgcm91dGluZyBpcyBmYWxzZSA9PiBgL2hlbGxvL2hleS9gIGFuZCBgL2hlbGxvL2hleWAgYXJlIHRyZWF0ZWQgdGhlIHNhbWVcbiAgcmV0dXJuIHJlc3VsdC5sZW5ndGggPiAxICYmIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gPT09ICcvJyA/IHJlc3VsdC5zbGljZSgwLCAtMSkgOiByZXN1bHRcbn1cblxuZXhwb3J0IGNvbnN0IG1lcmdlUGF0aCA9ICguLi5wYXRoczogc3RyaW5nW10pOiBzdHJpbmcgPT4ge1xuICBsZXQgcDogc3RyaW5nID0gJydcbiAgbGV0IGVuZHNXaXRoU2xhc2ggPSBmYWxzZVxuXG4gIGZvciAobGV0IHBhdGggb2YgcGF0aHMpIHtcbiAgICAvKiBbJy9oZXkvJywnL3NheSddID0+IFsnL2hleScsICcvc2F5J10gKi9cbiAgICBpZiAocFtwLmxlbmd0aCAtIDFdID09PSAnLycpIHtcbiAgICAgIHAgPSBwLnNsaWNlKDAsIC0xKVxuICAgICAgZW5kc1dpdGhTbGFzaCA9IHRydWVcbiAgICB9XG5cbiAgICAvKiBbJy9oZXknLCdzYXknXSA9PiBbJy9oZXknLCAnL3NheSddICovXG4gICAgaWYgKHBhdGhbMF0gIT09ICcvJykge1xuICAgICAgcGF0aCA9IGAvJHtwYXRofWBcbiAgICB9XG5cbiAgICAvKiBbJy9oZXkvJywgJy8nXSA9PiBgL2hleS9gICovXG4gICAgaWYgKHBhdGggPT09ICcvJyAmJiBlbmRzV2l0aFNsYXNoKSB7XG4gICAgICBwID0gYCR7cH0vYFxuICAgIH0gZWxzZSBpZiAocGF0aCAhPT0gJy8nKSB7XG4gICAgICBwID0gYCR7cH0ke3BhdGh9YFxuICAgIH1cblxuICAgIC8qIFsnLycsICcvJ10gPT4gYC9gICovXG4gICAgaWYgKHBhdGggPT09ICcvJyAmJiBwID09PSAnJykge1xuICAgICAgcCA9ICcvJ1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwXG59XG5cbmV4cG9ydCBjb25zdCBjaGVja09wdGlvbmFsUGFyYW1ldGVyID0gKHBhdGg6IHN0cmluZyk6IHN0cmluZ1tdIHwgbnVsbCA9PiB7XG4gIC8qXG4gICBJZiBwYXRoIGlzIGAvYXBpL2FuaW1hbHMvOnR5cGU/YCBpdCB3aWxsIHJldHVybjpcbiAgIFtgL2FwaS9hbmltYWxzYCwgYC9hcGkvYW5pbWFscy86dHlwZWBdXG4gICBpbiBvdGhlciBjYXNlcyBpdCB3aWxsIHJldHVybiBudWxsXG4gICAqL1xuICBjb25zdCBtYXRjaCA9IHBhdGgubWF0Y2goL14oLit8KShcXC9cXDpbXlxcL10rKVxcPyQvKVxuICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGJhc2UgPSBtYXRjaFsxXVxuICBjb25zdCBvcHRpb25hbCA9IGJhc2UgKyBtYXRjaFsyXVxuICByZXR1cm4gW2Jhc2UgPT09ICcnID8gJy8nIDogYmFzZS5yZXBsYWNlKC9cXC8kLywgJycpLCBvcHRpb25hbF1cbn1cblxuLy8gT3B0aW1pemVkXG5jb25zdCBfZGVjb2RlVVJJID0gKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgaWYgKCEvWyUrXS8udGVzdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuICBpZiAodmFsdWUuaW5kZXhPZignKycpICE9PSAtMSkge1xuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFwrL2csICcgJylcbiAgfVxuICByZXR1cm4gLyUvLnRlc3QodmFsdWUpID8gZGVjb2RlVVJJQ29tcG9uZW50Xyh2YWx1ZSkgOiB2YWx1ZVxufVxuXG5jb25zdCBfZ2V0UXVlcnlQYXJhbSA9IChcbiAgdXJsOiBzdHJpbmcsXG4gIGtleT86IHN0cmluZyxcbiAgbXVsdGlwbGU/OiBib29sZWFuXG4pOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHwgc3RyaW5nW10gfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPT4ge1xuICBsZXQgZW5jb2RlZFxuXG4gIGlmICghbXVsdGlwbGUgJiYga2V5ICYmICEvWyUrXS8udGVzdChrZXkpKSB7XG4gICAgLy8gb3B0aW1pemVkIGZvciB1bmVuY29kZWQga2V5XG5cbiAgICBsZXQga2V5SW5kZXggPSB1cmwuaW5kZXhPZihgPyR7a2V5fWAsIDgpXG4gICAgaWYgKGtleUluZGV4ID09PSAtMSkge1xuICAgICAga2V5SW5kZXggPSB1cmwuaW5kZXhPZihgJiR7a2V5fWAsIDgpXG4gICAgfVxuICAgIHdoaWxlIChrZXlJbmRleCAhPT0gLTEpIHtcbiAgICAgIGNvbnN0IHRyYWlsaW5nS2V5Q29kZSA9IHVybC5jaGFyQ29kZUF0KGtleUluZGV4ICsga2V5Lmxlbmd0aCArIDEpXG4gICAgICBpZiAodHJhaWxpbmdLZXlDb2RlID09PSA2MSkge1xuICAgICAgICBjb25zdCB2YWx1ZUluZGV4ID0ga2V5SW5kZXggKyBrZXkubGVuZ3RoICsgMlxuICAgICAgICBjb25zdCBlbmRJbmRleCA9IHVybC5pbmRleE9mKCcmJywgdmFsdWVJbmRleClcbiAgICAgICAgcmV0dXJuIF9kZWNvZGVVUkkodXJsLnNsaWNlKHZhbHVlSW5kZXgsIGVuZEluZGV4ID09PSAtMSA/IHVuZGVmaW5lZCA6IGVuZEluZGV4KSlcbiAgICAgIH0gZWxzZSBpZiAodHJhaWxpbmdLZXlDb2RlID09IDM4IHx8IGlzTmFOKHRyYWlsaW5nS2V5Q29kZSkpIHtcbiAgICAgICAgcmV0dXJuICcnXG4gICAgICB9XG4gICAgICBrZXlJbmRleCA9IHVybC5pbmRleE9mKGAmJHtrZXl9YCwga2V5SW5kZXggKyAxKVxuICAgIH1cblxuICAgIGVuY29kZWQgPSAvWyUrXS8udGVzdCh1cmwpXG4gICAgaWYgKCFlbmNvZGVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICAgIC8vIGZhbGxiYWNrIHRvIGRlZmF1bHQgcm91dGluZVxuICB9XG5cbiAgY29uc3QgcmVzdWx0czogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHt9XG4gIGVuY29kZWQgPz89IC9bJStdLy50ZXN0KHVybClcblxuICBsZXQga2V5SW5kZXggPSB1cmwuaW5kZXhPZignPycsIDgpXG4gIHdoaWxlIChrZXlJbmRleCAhPT0gLTEpIHtcbiAgICBjb25zdCBuZXh0S2V5SW5kZXggPSB1cmwuaW5kZXhPZignJicsIGtleUluZGV4ICsgMSlcbiAgICBsZXQgdmFsdWVJbmRleCA9IHVybC5pbmRleE9mKCc9Jywga2V5SW5kZXgpXG4gICAgaWYgKHZhbHVlSW5kZXggPiBuZXh0S2V5SW5kZXggJiYgbmV4dEtleUluZGV4ICE9PSAtMSkge1xuICAgICAgdmFsdWVJbmRleCA9IC0xXG4gICAgfVxuICAgIGxldCBuYW1lID0gdXJsLnNsaWNlKFxuICAgICAga2V5SW5kZXggKyAxLFxuICAgICAgdmFsdWVJbmRleCA9PT0gLTEgPyAobmV4dEtleUluZGV4ID09PSAtMSA/IHVuZGVmaW5lZCA6IG5leHRLZXlJbmRleCkgOiB2YWx1ZUluZGV4XG4gICAgKVxuICAgIGlmIChlbmNvZGVkKSB7XG4gICAgICBuYW1lID0gX2RlY29kZVVSSShuYW1lKVxuICAgIH1cblxuICAgIGtleUluZGV4ID0gbmV4dEtleUluZGV4XG5cbiAgICBpZiAobmFtZSA9PT0gJycpIHtcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgbGV0IHZhbHVlXG4gICAgaWYgKHZhbHVlSW5kZXggPT09IC0xKSB7XG4gICAgICB2YWx1ZSA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gdXJsLnNsaWNlKHZhbHVlSW5kZXggKyAxLCBuZXh0S2V5SW5kZXggPT09IC0xID8gdW5kZWZpbmVkIDogbmV4dEtleUluZGV4KVxuICAgICAgaWYgKGVuY29kZWQpIHtcbiAgICAgICAgdmFsdWUgPSBfZGVjb2RlVVJJKHZhbHVlKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtdWx0aXBsZSkge1xuICAgICAgOygocmVzdWx0c1tuYW1lXSA/Pz0gW10pIGFzIHN0cmluZ1tdKS5wdXNoKHZhbHVlKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRzW25hbWVdID8/PSB2YWx1ZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBrZXkgPyByZXN1bHRzW2tleV0gOiByZXN1bHRzXG59XG5cbmV4cG9ydCBjb25zdCBnZXRRdWVyeVBhcmFtOiAoXG4gIHVybDogc3RyaW5nLFxuICBrZXk/OiBzdHJpbmdcbikgPT4gc3RyaW5nIHwgdW5kZWZpbmVkIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IF9nZXRRdWVyeVBhcmFtIGFzIChcbiAgdXJsOiBzdHJpbmcsXG4gIGtleT86IHN0cmluZ1xuKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG5cbmV4cG9ydCBjb25zdCBnZXRRdWVyeVBhcmFtcyA9IChcbiAgdXJsOiBzdHJpbmcsXG4gIGtleT86IHN0cmluZ1xuKTogc3RyaW5nW10gfCB1bmRlZmluZWQgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPT4ge1xuICByZXR1cm4gX2dldFF1ZXJ5UGFyYW0odXJsLCBrZXksIHRydWUpIGFzIHN0cmluZ1tdIHwgdW5kZWZpbmVkIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+XG59XG5cbi8vIGBkZWNvZGVVUklDb21wb25lbnRgIGlzIGEgbG9uZyBuYW1lLlxuLy8gQnkgbWFraW5nIGl0IGEgZnVuY3Rpb24sIHdlIGNhbiB1c2UgaXQgY29tbW9ubHkgd2hlbiBtaW5pZmllZCwgcmVkdWNpbmcgdGhlIGFtb3VudCBvZiBjb2RlLlxuZXhwb3J0IGNvbnN0IGRlY29kZVVSSUNvbXBvbmVudF8gPSBkZWNvZGVVUklDb21wb25lbnRcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLE1BQU0sWUFBWSxDQUFDLE9BQTJCO0lBQ25ELE1BQU0sUUFBUSxLQUFLLEtBQUssQ0FBQztJQUN6QixJQUFJLEtBQUssQ0FBQyxFQUFFLEtBQUssSUFBSTtRQUNuQixNQUFNLEtBQUs7SUFDYixDQUFDO0lBQ0QsT0FBTztBQUNULEVBQUM7QUFFRCxPQUFPLE1BQU0sbUJBQW1CLENBQUMsT0FBMkI7SUFDMUQsTUFBTSxTQUE2QixFQUFFLENBQUMsMEJBQTBCOztJQUNoRSxJQUFLLElBQUksSUFBSSxJQUFPO1FBQ2xCLElBQUksV0FBVyxLQUFLO1FBQ3BCLE9BQU8sS0FBSyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQU07WUFDdkMsTUFBTSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUN0QixNQUFNLENBQUMsRUFBRSxHQUFHO2dCQUFDO2dCQUFNO2FBQUU7WUFDckI7WUFDQSxXQUFXLElBQUk7WUFDZixPQUFPO1FBQ1Q7UUFDQSxJQUFJLENBQUMsVUFBVTtZQUNiLEtBQUs7UUFDUCxDQUFDO0lBQ0g7SUFFQSxNQUFNLFFBQVEsS0FBSyxLQUFLLENBQUM7SUFDekIsSUFBSSxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUk7UUFDbkIsTUFBTSxLQUFLO0lBQ2IsQ0FBQztJQUNELElBQUssSUFBSSxJQUFJLE9BQU8sTUFBTSxHQUFHLEdBQUcsS0FBSyxHQUFHLElBQUs7UUFDM0MsTUFBTSxDQUFDLEtBQUssR0FBRyxN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