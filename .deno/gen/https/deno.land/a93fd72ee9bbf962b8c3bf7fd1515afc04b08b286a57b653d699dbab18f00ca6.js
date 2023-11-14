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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL3V0aWxzL3VybC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgdHlwZSBQYXR0ZXJuID0gcmVhZG9ubHkgW3N0cmluZywgc3RyaW5nLCBSZWdFeHAgfCB0cnVlXSB8ICcqJ1xuXG5leHBvcnQgY29uc3Qgc3BsaXRQYXRoID0gKHBhdGg6IHN0cmluZyk6IHN0cmluZ1tdID0+IHtcbiAgY29uc3QgcGF0aHMgPSBwYXRoLnNwbGl0KCcvJylcbiAgaWYgKHBhdGhzWzBdID09PSAnJykge1xuICAgIHBhdGhzLnNoaWZ0KClcbiAgfVxuICByZXR1cm4gcGF0aHNcbn1cblxuZXhwb3J0IGNvbnN0IHNwbGl0Um91dGluZ1BhdGggPSAocGF0aDogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuICBjb25zdCBncm91cHM6IFtzdHJpbmcsIHN0cmluZ11bXSA9IFtdIC8vIFttYXJrLCBvcmlnaW5hbCBzdHJpbmddXG4gIGZvciAobGV0IGkgPSAwOyA7ICkge1xuICAgIGxldCByZXBsYWNlZCA9IGZhbHNlXG4gICAgcGF0aCA9IHBhdGgucmVwbGFjZSgvXFx7W159XStcXH0vZywgKG0pID0+IHtcbiAgICAgIGNvbnN0IG1hcmsgPSBgQFxcXFwke2l9YFxuICAgICAgZ3JvdXBzW2ldID0gW21hcmssIG1dXG4gICAgICBpKytcbiAgICAgIHJlcGxhY2VkID0gdHJ1ZVxuICAgICAgcmV0dXJuIG1hcmtcbiAgICB9KVxuICAgIGlmICghcmVwbGFjZWQpIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgY29uc3QgcGF0aHMgPSBwYXRoLnNwbGl0KCcvJylcbiAgaWYgKHBhdGhzWzBdID09PSAnJykge1xuICAgIHBhdGhzLnNoaWZ0KClcbiAgfVxuICBmb3IgKGxldCBpID0gZ3JvdXBzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3QgW21hcmtdID0gZ3JvdXBzW2ldXG4gICAgZm9yIChsZXQgaiA9IHBhdGhzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XG4gICAgICBpZiAocGF0aHNbal0uaW5kZXhPZihtYXJrKSAhPT0gLTEpIHtcbiAgICAgICAgcGF0aHNbal0gPSBwYXRoc1tqXS5yZXBsYWNlKG1hcmssIGdyb3Vwc1tpXVsxXSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGF0aHNcbn1cblxuY29uc3QgcGF0dGVybkNhY2hlOiB7IFtrZXk6IHN0cmluZ106IFBhdHRlcm4gfSA9IHt9XG5leHBvcnQgY29uc3QgZ2V0UGF0dGVybiA9IChsYWJlbDogc3RyaW5nKTogUGF0dGVybiB8IG51bGwgPT4ge1xuICAvLyAqICAgICAgICAgICAgPT4gd2lsZGNhcmRcbiAgLy8gOmlke1swLTldK30gID0+IChbMC05XSspXG4gIC8vIDppZCAgICAgICAgICA9PiAoLispXG4gIC8vY29uc3QgbmFtZSA9ICcnXG5cbiAgaWYgKGxhYmVsID09PSAnKicpIHtcbiAgICByZXR1cm4gJyonXG4gIH1cblxuICBjb25zdCBtYXRjaCA9IGxhYmVsLm1hdGNoKC9eXFw6KFteXFx7XFx9XSspKD86XFx7KC4rKVxcfSk/JC8pXG4gIGlmIChtYXRjaCkge1xuICAgIGlmICghcGF0dGVybkNhY2hlW2xhYmVsXSkge1xuICAgICAgaWYgKG1hdGNoWzJdKSB7XG4gICAgICAgIHBhdHRlcm5DYWNoZVtsYWJlbF0gPSBbbGFiZWwsIG1hdGNoWzFdLCBuZXcgUmVnRXhwKCdeJyArIG1hdGNoWzJdICsgJyQnKV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhdHRlcm5DYWNoZVtsYWJlbF0gPSBbbGFiZWwsIG1hdGNoWzFdLCB0cnVlXVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwYXR0ZXJuQ2FjaGVbbGFiZWxdXG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgY29uc3QgZ2V0UGF0aCA9IChyZXF1ZXN0OiBSZXF1ZXN0KTogc3RyaW5nID0+IHtcbiAgLy8gT3B0aW1pemVkOiBSZWdFeHAgaXMgZmFzdGVyIHRoYW4gaW5kZXhPZigpICsgc2xpY2UoKVxuICBjb25zdCBtYXRjaCA9IHJlcXVlc3QudXJsLm1hdGNoKC9eaHR0cHM/OlxcL1xcL1teL10rKFxcL1teP10qKS8pXG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogJydcbn1cblxuZXhwb3J0IGNvbnN0IGdldFF1ZXJ5U3RyaW5ncyA9ICh1cmw6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHF1ZXJ5SW5kZXggPSB1cmwuaW5kZXhPZignPycsIDgpXG4gIHJldHVybiBxdWVyeUluZGV4ID09PSAtMSA/ICcnIDogJz8nICsgdXJsLnNsaWNlKHF1ZXJ5SW5kZXggKyAxKVxufVxuXG5leHBvcnQgY29uc3QgZ2V0UGF0aE5vU3RyaWN0ID0gKHJlcXVlc3Q6IFJlcXVlc3QpOiBzdHJpbmcgPT4ge1xuICBjb25zdCByZXN1bHQgPSBnZXRQYXRoKHJlcXVlc3QpXG5cbiAgLy8gaWYgc3RyaWN0IHJvdXRpbmcgaXMgZmFsc2UgPT4gYC9oZWxsby9oZXkvYCBhbmQgYC9oZWxsby9oZXlgIGFyZSB0cmVhdGVkIHRoZSBzYW1lXG4gIHJldHVybiByZXN1bHQubGVuZ3RoID4gMSAmJiByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSAnLycgPyByZXN1bHQuc2xpY2UoMCwgLTEpIDogcmVzdWx0XG59XG5cbmV4cG9ydCBjb25zdCBtZXJnZVBhdGggPSAoLi4ucGF0aHM6IHN0cmluZ1tdKTogc3RyaW5nID0+IHtcbiAgbGV0IHA6IHN0cmluZyA9ICcnXG4gIGxldCBlbmRzV2l0aFNsYXNoID0gZmFsc2VcblxuICBmb3IgKGxldCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgLyogWycvaGV5LycsJy9zYXknXSA9PiBbJy9oZXknLCAnL3NheSddICovXG4gICAgaWYgKHBbcC5sZW5ndGggLSAxXSA9PT0gJy8nKSB7XG4gICAgICBwID0gcC5zbGljZSgwLCAtMSlcbiAgICAgIGVuZHNXaXRoU2xhc2ggPSB0cnVlXG4gICAgfVxuXG4gICAgLyogWycvaGV5Jywnc2F5J10gPT4gWycvaGV5JywgJy9zYXknXSAqL1xuICAgIGlmIChwYXRoWzBdICE9PSAnLycpIHtcbiAgICAgIHBhdGggPSBgLyR7cGF0aH1gXG4gICAgfVxuXG4gICAgLyogWycvaGV5LycsICcvJ10gPT4gYC9oZXkvYCAqL1xuICAgIGlmIChwYXRoID09PSAnLycgJiYgZW5kc1dpdGhTbGFzaCkge1xuICAgICAgcCA9IGAke3B9L2BcbiAgICB9IGVsc2UgaWYgKHBhdGggIT09ICcvJykge1xuICAgICAgcCA9IGAke3B9JHtwYXRofWBcbiAgICB9XG5cbiAgICAvKiBbJy8nLCAnLyddID0+IGAvYCAqL1xuICAgIGlmIChwYXRoID09PSAnLycgJiYgcCA9PT0gJycpIHtcbiAgICAgIHAgPSAnLydcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcFxufVxuXG5leHBvcnQgY29uc3QgY2hlY2tPcHRpb25hbFBhcmFtZXRlciA9IChwYXRoOiBzdHJpbmcpOiBzdHJpbmdbXSB8IG51bGwgPT4ge1xuICAvKlxuICAgSWYgcGF0aCBpcyBgL2FwaS9hbmltYWxzLzp0eXBlP2AgaXQgd2lsbCByZXR1cm46XG4gICBbYC9hcGkvYW5pbWFsc2AsIGAvYXBpL2FuaW1hbHMvOnR5cGVgXVxuICAgaW4gb3RoZXIgY2FzZXMgaXQgd2lsbCByZXR1cm4gbnVsbFxuICAgKi9cbiAgY29uc3QgbWF0Y2ggPSBwYXRoLm1hdGNoKC9eKC4rfCkoXFwvXFw6W15cXC9dKylcXD8kLylcbiAgaWYgKCFtYXRjaCkgcmV0dXJuIG51bGxcblxuICBjb25zdCBiYXNlID0gbWF0Y2hbMV1cbiAgY29uc3Qgb3B0aW9uYWwgPSBiYXNlICsgbWF0Y2hbMl1cbiAgcmV0dXJuIFtiYXNlID09PSAnJyA/ICcvJyA6IGJhc2UucmVwbGFjZSgvXFwvJC8sICcnKSwgb3B0aW9uYWxdXG59XG5cbi8vIE9wdGltaXplZFxuY29uc3QgX2RlY29kZVVSSSA9ICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gIGlmICghL1slK10vLnRlc3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cbiAgaWYgKHZhbHVlLmluZGV4T2YoJysnKSAhPT0gLTEpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gIH1cbiAgcmV0dXJuIC8lLy50ZXN0KHZhbHVlKSA/IGRlY29kZVVSSUNvbXBvbmVudF8odmFsdWUpIDogdmFsdWVcbn1cblxuY29uc3QgX2dldFF1ZXJ5UGFyYW0gPSAoXG4gIHVybDogc3RyaW5nLFxuICBrZXk/OiBzdHJpbmcsXG4gIG11bHRpcGxlPzogYm9vbGVhblxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IHN0cmluZ1tdIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0+IHtcbiAgbGV0IGVuY29kZWRcblxuICBpZiAoIW11bHRpcGxlICYmIGtleSAmJiAhL1slK10vLnRlc3Qoa2V5KSkge1xuICAgIC8vIG9wdGltaXplZCBmb3IgdW5lbmNvZGVkIGtleVxuXG4gICAgbGV0IGtleUluZGV4ID0gdXJsLmluZGV4T2YoYD8ke2tleX1gLCA4KVxuICAgIGlmIChrZXlJbmRleCA9PT0gLTEpIHtcbiAgICAgIGtleUluZGV4ID0gdXJsLmluZGV4T2YoYCYke2tleX1gLCA4KVxuICAgIH1cbiAgICB3aGlsZSAoa2V5SW5kZXggIT09IC0xKSB7XG4gICAgICBjb25zdCB0cmFpbGluZ0tleUNvZGUgPSB1cmwuY2hhckNvZGVBdChrZXlJbmRleCArIGtleS5sZW5ndGggKyAxKVxuICAgICAgaWYgKHRyYWlsaW5nS2V5Q29kZSA9PT0gNjEpIHtcbiAgICAgICAgY29uc3QgdmFsdWVJbmRleCA9IGtleUluZGV4ICsga2V5Lmxlbmd0aCArIDJcbiAgICAgICAgY29uc3QgZW5kSW5kZXggPSB1cmwuaW5kZXhPZignJicsIHZhbHVlSW5kZXgpXG4gICAgICAgIHJldHVybiBfZGVjb2RlVVJJKHVybC5zbGljZSh2YWx1ZUluZGV4LCBlbmRJbmRleCA9PT0gLTEgPyB1bmRlZmluZWQgOiBlbmRJbmRleCkpXG4gICAgICB9IGVsc2UgaWYgKHRyYWlsaW5nS2V5Q29kZSA9PSAzOCB8fCBpc05hTih0cmFpbGluZ0tleUNvZGUpKSB7XG4gICAgICAgIHJldHVybiAnJ1xuICAgICAgfVxuICAgICAga2V5SW5kZXggPSB1cmwuaW5kZXhPZihgJiR7a2V5fWAsIGtleUluZGV4ICsgMSlcbiAgICB9XG5cbiAgICBlbmNvZGVkID0gL1slK10vLnRlc3QodXJsKVxuICAgIGlmICghZW5jb2RlZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICAvLyBmYWxsYmFjayB0byBkZWZhdWx0IHJvdXRpbmVcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fVxuICBlbmNvZGVkID8/PSAvWyUrXS8udGVzdCh1cmwpXG5cbiAgbGV0IGtleUluZGV4ID0gdXJsLmluZGV4T2YoJz8nLCA4KVxuICB3aGlsZSAoa2V5SW5kZXggIT09IC0xKSB7XG4gICAgY29uc3QgbmV4dEtleUluZGV4ID0gdXJsLmluZGV4T2YoJyYnLCBrZXlJbmRleCArIDEpXG4gICAgbGV0IHZhbHVlSW5kZXggPSB1cmwuaW5kZXhPZignPScsIGtleUluZGV4KVxuICAgIGlmICh2YWx1ZUluZGV4ID4gbmV4dEtleUluZGV4ICYmIG5leHRLZXlJbmRleCAhPT0gLTEpIHtcbiAgICAgIHZhbHVlSW5kZXggPSAtMVxuICAgIH1cbiAgICBsZXQgbmFtZSA9IHVybC5zbGljZShcbiAgICAgIGtleUluZGV4ICsgMSxcbiAgICAgIHZhbHVlSW5kZXggPT09IC0xID8gKG5leHRLZXlJbmRleCA9PT0gLTEgPyB1bmRlZmluZWQgOiBuZXh0S2V5SW5kZXgpIDogdmFsdWVJbmRleFxuICAgIClcbiAgICBpZiAoZW5jb2RlZCkge1xuICAgICAgbmFtZSA9IF9kZWNvZGVVUkkobmFtZSlcbiAgICB9XG5cbiAgICBrZXlJbmRleCA9IG5leHRLZXlJbmRleFxuXG4gICAgaWYgKG5hbWUgPT09ICcnKSB7XG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGxldCB2YWx1ZVxuICAgIGlmICh2YWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgdmFsdWUgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IHVybC5zbGljZSh2YWx1ZUluZGV4ICsgMSwgbmV4dEtleUluZGV4ID09PSAtMSA/IHVuZGVmaW5lZCA6IG5leHRLZXlJbmRleClcbiAgICAgIGlmIChlbmNvZGVkKSB7XG4gICAgICAgIHZhbHVlID0gX2RlY29kZVVSSSh2YWx1ZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobXVsdGlwbGUpIHtcbiAgICAgIDsoKHJlc3VsdHNbbmFtZV0gPz89IFtdKSBhcyBzdHJpbmdbXSkucHVzaCh2YWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0c1tuYW1lXSA/Pz0gdmFsdWVcbiAgICB9XG4gIH1cblxuICByZXR1cm4ga2V5ID8gcmVzdWx0c1trZXldIDogcmVzdWx0c1xufVxuXG5leHBvcnQgY29uc3QgZ2V0UXVlcnlQYXJhbTogKFxuICB1cmw6IHN0cmluZyxcbiAga2V5Pzogc3RyaW5nXG4pID0+IHN0cmluZyB8IHVuZGVmaW5lZCB8IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSBfZ2V0UXVlcnlQYXJhbSBhcyAoXG4gIHVybDogc3RyaW5nLFxuICBrZXk/OiBzdHJpbmdcbikgPT4gc3RyaW5nIHwgdW5kZWZpbmVkIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuXG5leHBvcnQgY29uc3QgZ2V0UXVlcnlQYXJhbXMgPSAoXG4gIHVybDogc3RyaW5nLFxuICBrZXk/OiBzdHJpbmdcbik6IHN0cmluZ1tdIHwgdW5kZWZpbmVkIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0+IHtcbiAgcmV0dXJuIF9nZXRRdWVyeVBhcmFtKHVybCwga2V5LCB0cnVlKSBhcyBzdHJpbmdbXSB8IHVuZGVmaW5lZCB8IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPlxufVxuXG4vLyBgZGVjb2RlVVJJQ29tcG9uZW50YCBpcyBhIGxvbmcgbmFtZS5cbi8vIEJ5IG1ha2luZyBpdCBhIGZ1bmN0aW9uLCB3ZSBjYW4gdXNlIGl0IGNvbW1vbmx5IHdoZW4gbWluaWZpZWQsIHJlZHVjaW5nIHRoZSBhbW91bnQgb2YgY29kZS5cbmV4cG9ydCBjb25zdCBkZWNvZGVVUklDb21wb25lbnRfID0gZGVjb2RlVVJJQ29tcG9uZW50XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxNQUFNLFlBQVksQ0FBQyxPQUEyQjtJQUNuRCxNQUFNLFFBQVEsS0FBSyxLQUFLLENBQUM7SUFDekIsSUFBSSxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUk7UUFDbkIsTUFBTSxLQUFLO0lBQ2IsQ0FBQztJQUNELE9BQU87QUFDVCxFQUFDO0FBRUQsT0FBTyxNQUFNLG1CQUFtQixDQUFDLE9BQTJCO0lBQzFELE1BQU0sU0FBNkIsRUFBRSxDQUFDLDBCQUEwQjs7SUFDaEUsSUFBSyxJQUFJLElBQUksSUFBTztRQUNsQixJQUFJLFdBQVcsS0FBSztRQUNwQixPQUFPLEtBQUssT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFNO1lBQ3ZDLE1BQU0sT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDdEIsTUFBTSxDQUFDLEVBQUUsR0FBRztnQkFBQztnQkFBTTthQUFFO1lBQ3JCO1lBQ0EsV0FBVyxJQUFJO1lBQ2YsT0FBTztRQUNUO1FBQ0EsSUFBSSxDQUFDLFVBQVU7WUFDYixLQUFLO1FBQ1AsQ0FBQztJQUNIO0lBRUEsTUFBTSxRQUFRLEtBQUssS0FBSyxDQUFDO0lBQ3pCLElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyxJQUFJO1FBQ25CLE1BQU0sS0FBSztJQUNiLENBQUM7SUFDRCxJQUFLLElBQUksSUFBSSxPQUFPLE1BQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxJQUFLO1FBQzNDLE1BQU0sQ0FBQyxLQUFLLEdBQUcs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