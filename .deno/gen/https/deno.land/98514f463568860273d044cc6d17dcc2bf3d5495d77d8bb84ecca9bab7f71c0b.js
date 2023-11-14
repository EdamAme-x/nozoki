import { METHOD_NAME_ALL } from '../../router.ts';
import { splitPath, splitRoutingPath, getPattern } from '../../utils/url.ts';
function findParam(node, name) {
    for(let i = 0, len = node.patterns.length; i < len; i++){
        if (typeof node.patterns[i] === 'object' && node.patterns[i][1] === name) {
            return true;
        }
    }
    const nodes = Object.values(node.children);
    for(let i = 0, len = nodes.length; i < len; i++){
        if (findParam(nodes[i], name)) {
            return true;
        }
    }
    return false;
}
export class Node {
    methods;
    children;
    patterns;
    order = 0;
    name;
    handlerSetCache;
    constructor(method, handler, children){
        this.children = children || {};
        this.methods = [];
        this.name = '';
        if (method && handler) {
            const m = {};
            m[method] = {
                handler: handler,
                score: 0,
                name: this.name
            };
            this.methods = [
                m
            ];
        }
        this.patterns = [];
        this.handlerSetCache = {};
    }
    insert(method, path, handler) {
        this.name = `${method} ${path}`;
        this.order = ++this.order;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let curNode = this;
        const parts = splitRoutingPath(path);
        const parentPatterns = [];
        const errorMessage = (name)=>{
            return `Duplicate param name, use another name instead of '${name}' - ${method} ${path} <--- '${name}'`;
        };
        for(let i = 0, len = parts.length; i < len; i++){
            const p = parts[i];
            if (Object.keys(curNode.children).includes(p)) {
                parentPatterns.push(...curNode.patterns);
                curNode = curNode.children[p];
                continue;
            }
            curNode.children[p] = new Node();
            const pattern = getPattern(p);
            if (pattern) {
                if (typeof pattern === 'object') {
                    for(let j = 0, len = parentPatterns.length; j < len; j++){
                        if (typeof parentPatterns[j] === 'object' && parentPatterns[j][1] === pattern[1]) {
                            throw new Error(errorMessage(pattern[1]));
                        }
                    }
                    if (Object.values(curNode.children).some((n)=>findParam(n, pattern[1]))) {
                        throw new Error(errorMessage(pattern[1]));
                    }
                }
                curNode.patterns.push(pattern);
                parentPatterns.push(...curNode.patterns);
            }
            parentPatterns.push(...curNode.patterns);
            curNode = curNode.children[p];
        }
        if (!curNode.methods.length) {
            curNode.methods = [];
        }
        const m = {};
        const handlerSet = {
            handler: handler,
            name: this.name,
            score: this.order
        };
        m[method] = handlerSet;
        curNode.methods.push(m);
        return curNode;
    }
    // getHandlerSets
    gHSets(node, method, wildcard) {
        return node.handlerSetCache[`${method}:${wildcard ? '1' : '0'}`] ||= (()=>{
            const handlerSets = [];
            for(let i = 0, len = node.methods.length; i < len; i++){
                const m = node.methods[i];
                const handlerSet = m[method] || m[METHOD_NAME_ALL];
                if (handlerSet !== undefined) {
                    handlerSets.push(handlerSet);
                }
            }
            return handlerSets;
        })();
    }
    search(method, path) {
        const handlerSets = [];
        const params = {};
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const curNode = this;
        let curNodes = [
            curNode
        ];
        const parts = splitPath(path);
        for(let i = 0, len = parts.length; i < len; i++){
            const part = parts[i];
            const isLast = i === len - 1;
            const tempNodes = [];
            let matched = false;
            for(let j = 0, len2 = curNodes.length; j < len2; j++){
                const node = curNodes[j];
                const nextNode = node.children[part];
                if (nextNode) {
                    if (isLast === true) {
                        // '/hello/*' => match '/hello'
                        if (nextNode.children['*']) {
                            handlerSets.push(...this.gHSets(nextNode.children['*'], method, true));
                        }
                        handlerSets.push(...this.gHSets(nextNode, method));
                        matched = true;
                    } else {
                        tempNodes.push(nextNode);
                    }
                }
                for(let k = 0, len3 = node.patterns.length; k < len3; k++){
                    const pattern = node.patterns[k];
                    // Wildcard
                    // '/hello/*/foo' => match /hello/bar/foo
                    if (pattern === '*') {
                        const astNode = node.children['*'];
                        if (astNode) {
                            handlerSets.push(...this.gHSets(astNode, method));
                            tempNodes.push(astNode);
                        }
                        continue;
                    }
                    if (part === '') continue;
                    // Named match
                    // `/posts/:id` => match /posts/123
                    const [key, name, matcher] = pattern;
                    const child = node.children[key];
                    // `/js/:filename{[a-z]+.js}` => match /js/chunk/123.js
                    const restPathString = parts.slice(i).join('/');
                    if (matcher instanceof RegExp && matcher.test(restPathString)) {
                        handlerSets.push(...this.gHSets(child, method));
                        params[name] = restPathString;
                        continue;
                    }
                    if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
                        if (typeof key === 'string') {
                            if (isLast === true) {
                                handlerSets.push(...this.gHSets(child, method));
                                // `/:id/*` => match `/foo`
                                if (child.children['*']) {
                                    handlerSets.push(...this.gHSets(child.children['*'], method));
                                }
                            } else {
                                tempNodes.push(child);
                            }
                        }
                        // `/book/a`     => no-slug
                        // `/book/:slug` => slug
                        // `/book/b`     => no-slug-b
                        // GET /book/a   ~> no-slug, param['slug'] => undefined
                        // GET /book/foo ~> slug, param['slug'] => foo
                        // GET /book/b   ~> no-slug-b, param['slug'] => b
                        if (typeof name === 'string' && !matched) {
                            params[name] = part;
                        } else {
                            if (node.children[part]) {
                                params[name] = part;
                            }
                        }
                    }
                }
            }
            curNodes = tempNodes;
        }
        const len = handlerSets.length;
        if (len === 0) return null;
        if (len === 1) return {
            handlers: [
                handlerSets[0].handler
            ],
            params
        };
        const handlers = handlerSets.sort((a, b)=>{
            return a.score - b.score;
        }).map((s)=>{
            return s.handler;
        });
        return {
            handlers,
            params
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvcm91dGVyL3RyaWUtcm91dGVyL25vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBSZXN1bHQgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5pbXBvcnQgeyBNRVRIT0RfTkFNRV9BTEwgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5pbXBvcnQgdHlwZSB7IFBhdHRlcm4gfSBmcm9tICcuLi8uLi91dGlscy91cmwudHMnXG5pbXBvcnQgeyBzcGxpdFBhdGgsIHNwbGl0Um91dGluZ1BhdGgsIGdldFBhdHRlcm4gfSBmcm9tICcuLi8uLi91dGlscy91cmwudHMnXG5cbnR5cGUgSGFuZGxlclNldDxUPiA9IHtcbiAgaGFuZGxlcjogVFxuICBzY29yZTogbnVtYmVyXG4gIG5hbWU6IHN0cmluZyAvLyBGb3IgZGVidWdcbn1cblxuZnVuY3Rpb24gZmluZFBhcmFtPFQ+KG5vZGU6IE5vZGU8VD4sIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gbm9kZS5wYXR0ZXJucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmICh0eXBlb2Ygbm9kZS5wYXR0ZXJuc1tpXSA9PT0gJ29iamVjdCcgJiYgbm9kZS5wYXR0ZXJuc1tpXVsxXSA9PT0gbmFtZSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgY29uc3Qgbm9kZXMgPSBPYmplY3QudmFsdWVzKG5vZGUuY2hpbGRyZW4pXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBub2Rlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChmaW5kUGFyYW0obm9kZXNbaV0sIG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZVxufVxuXG5leHBvcnQgY2xhc3MgTm9kZTxUPiB7XG4gIG1ldGhvZHM6IFJlY29yZDxzdHJpbmcsIEhhbmRsZXJTZXQ8VD4+W11cblxuICBjaGlsZHJlbjogUmVjb3JkPHN0cmluZywgTm9kZTxUPj5cbiAgcGF0dGVybnM6IFBhdHRlcm5bXVxuICBvcmRlcjogbnVtYmVyID0gMFxuICBuYW1lOiBzdHJpbmdcbiAgaGFuZGxlclNldENhY2hlOiBSZWNvcmQ8c3RyaW5nLCBIYW5kbGVyU2V0PFQ+W10+XG5cbiAgY29uc3RydWN0b3IobWV0aG9kPzogc3RyaW5nLCBoYW5kbGVyPzogVCwgY2hpbGRyZW4/OiBSZWNvcmQ8c3RyaW5nLCBOb2RlPFQ+Pikge1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbiB8fCB7fVxuICAgIHRoaXMubWV0aG9kcyA9IFtdXG4gICAgdGhpcy5uYW1lID0gJydcbiAgICBpZiAobWV0aG9kICYmIGhhbmRsZXIpIHtcbiAgICAgIGNvbnN0IG06IFJlY29yZDxzdHJpbmcsIEhhbmRsZXJTZXQ8VD4+ID0ge31cbiAgICAgIG1bbWV0aG9kXSA9IHsgaGFuZGxlcjogaGFuZGxlciwgc2NvcmU6IDAsIG5hbWU6IHRoaXMubmFtZSB9XG4gICAgICB0aGlzLm1ldGhvZHMgPSBbbV1cbiAgICB9XG4gICAgdGhpcy5wYXR0ZXJucyA9IFtdXG4gICAgdGhpcy5oYW5kbGVyU2V0Q2FjaGUgPSB7fVxuICB9XG5cbiAgaW5zZXJ0KG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IFQpOiBOb2RlPFQ+IHtcbiAgICB0aGlzLm5hbWUgPSBgJHttZXRob2R9ICR7cGF0aH1gXG4gICAgdGhpcy5vcmRlciA9ICsrdGhpcy5vcmRlclxuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgbGV0IGN1ck5vZGU6IE5vZGU8VD4gPSB0aGlzXG4gICAgY29uc3QgcGFydHMgPSBzcGxpdFJvdXRpbmdQYXRoKHBhdGgpXG5cbiAgICBjb25zdCBwYXJlbnRQYXR0ZXJuczogUGF0dGVybltdID0gW11cbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAobmFtZTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgIHJldHVybiBgRHVwbGljYXRlIHBhcmFtIG5hbWUsIHVzZSBhbm90aGVyIG5hbWUgaW5zdGVhZCBvZiAnJHtuYW1lfScgLSAke21ldGhvZH0gJHtwYXRofSA8LS0tICcke25hbWV9J2BcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcGFydHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHA6IHN0cmluZyA9IHBhcnRzW2ldXG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhjdXJOb2RlLmNoaWxkcmVuKS5pbmNsdWRlcyhwKSkge1xuICAgICAgICBwYXJlbnRQYXR0ZXJucy5wdXNoKC4uLmN1ck5vZGUucGF0dGVybnMpXG4gICAgICAgIGN1ck5vZGUgPSBjdXJOb2RlLmNoaWxkcmVuW3BdXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGN1ck5vZGUuY2hpbGRyZW5bcF0gPSBuZXcgTm9kZSgpXG5cbiAgICAgIGNvbnN0IHBhdHRlcm4gPSBnZXRQYXR0ZXJuKHApXG4gICAgICBpZiAocGF0dGVybikge1xuICAgICAgICBpZiAodHlwZW9mIHBhdHRlcm4gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IDAsIGxlbiA9IHBhcmVudFBhdHRlcm5zLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcmVudFBhdHRlcm5zW2pdID09PSAnb2JqZWN0JyAmJiBwYXJlbnRQYXR0ZXJuc1tqXVsxXSA9PT0gcGF0dGVyblsxXSkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKHBhdHRlcm5bMV0pKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoT2JqZWN0LnZhbHVlcyhjdXJOb2RlLmNoaWxkcmVuKS5zb21lKChuKSA9PiBmaW5kUGFyYW0obiwgcGF0dGVyblsxXSkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKHBhdHRlcm5bMV0pKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjdXJOb2RlLnBhdHRlcm5zLnB1c2gocGF0dGVybilcbiAgICAgICAgcGFyZW50UGF0dGVybnMucHVzaCguLi5jdXJOb2RlLnBhdHRlcm5zKVxuICAgICAgfVxuICAgICAgcGFyZW50UGF0dGVybnMucHVzaCguLi5jdXJOb2RlLnBhdHRlcm5zKVxuICAgICAgY3VyTm9kZSA9IGN1ck5vZGUuY2hpbGRyZW5bcF1cbiAgICB9XG5cbiAgICBpZiAoIWN1ck5vZGUubWV0aG9kcy5sZW5ndGgpIHtcbiAgICAgIGN1ck5vZGUubWV0aG9kcyA9IFtdXG4gICAgfVxuXG4gICAgY29uc3QgbTogUmVjb3JkPHN0cmluZywgSGFuZGxlclNldDxUPj4gPSB7fVxuXG4gICAgY29uc3QgaGFuZGxlclNldDogSGFuZGxlclNldDxUPiA9IHsgaGFuZGxlcjogaGFuZGxlciwgbmFtZTogdGhpcy5uYW1lLCBzY29yZTogdGhpcy5vcmRlciB9XG5cbiAgICBtW21ldGhvZF0gPSBoYW5kbGVyU2V0XG4gICAgY3VyTm9kZS5tZXRob2RzLnB1c2gobSlcblxuICAgIHJldHVybiBjdXJOb2RlXG4gIH1cblxuICAvLyBnZXRIYW5kbGVyU2V0c1xuICBwcml2YXRlIGdIU2V0cyhub2RlOiBOb2RlPFQ+LCBtZXRob2Q6IHN0cmluZywgd2lsZGNhcmQ/OiBib29sZWFuKTogSGFuZGxlclNldDxUPltdIHtcbiAgICByZXR1cm4gKG5vZGUuaGFuZGxlclNldENhY2hlW2Ake21ldGhvZH06JHt3aWxkY2FyZCA/ICcxJyA6ICcwJ31gXSB8fD0gKCgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXJTZXRzOiBIYW5kbGVyU2V0PFQ+W10gPSBbXVxuICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IG5vZGUubWV0aG9kcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjb25zdCBtID0gbm9kZS5tZXRob2RzW2ldXG4gICAgICAgIGNvbnN0IGhhbmRsZXJTZXQgPSBtW21ldGhvZF0gfHwgbVtNRVRIT0RfTkFNRV9BTExdXG4gICAgICAgIGlmIChoYW5kbGVyU2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBoYW5kbGVyU2V0cy5wdXNoKGhhbmRsZXJTZXQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBoYW5kbGVyU2V0c1xuICAgIH0pKCkpXG4gIH1cblxuICBzZWFyY2gobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IFJlc3VsdDxUPiB8IG51bGwge1xuICAgIGNvbnN0IGhhbmRsZXJTZXRzOiBIYW5kbGVyU2V0PFQ+W10gPSBbXVxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICBjb25zdCBjdXJOb2RlOiBOb2RlPFQ+ID0gdGhpc1xuICAgIGxldCBjdXJOb2RlcyA9IFtjdXJOb2RlXVxuICAgIGNvbnN0IHBhcnRzID0gc3BsaXRQYXRoKHBhdGgpXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcGFydHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhcnQ6IHN0cmluZyA9IHBhcnRzW2ldXG4gICAgICBjb25zdCBpc0xhc3QgPSBpID09PSBsZW4gLSAxXG4gICAgICBjb25zdCB0ZW1wTm9kZXM6IE5vZGU8VD5bXSA9IFtdXG4gICAgICBsZXQgbWF0Y2hlZCA9IGZhbHNlXG5cbiAgICAgIGZvciAobGV0IGogPSAwLCBsZW4yID0gY3VyTm9kZXMubGVuZ3RoOyBqIDwgbGVuMjsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBjdXJOb2Rlc1tqXVxuICAgICAgICBjb25zdCBuZXh0Tm9kZSA9IG5vZGUuY2hpbGRyZW5bcGFydF1cblxuICAgICAgICBpZiAobmV4dE5vZGUpIHtcbiAgICAgICAgICBpZiAoaXNMYXN0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAvLyAnL2hlbGxvLyonID0+IG1hdGNoICcvaGVsbG8nXG4gICAgICAgICAgICBpZiAobmV4dE5vZGUuY2hpbGRyZW5bJyonXSkge1xuICAgICAgICAgICAgICBoYW5kbGVyU2V0cy5wdXNoKC4uLnRoaXMuZ0hTZXRzKG5leHROb2RlLmNoaWxkcmVuWycqJ10sIG1ldGhvZCwgdHJ1ZSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoYW5kbGVyU2V0cy5wdXNoKC4uLnRoaXMuZ0hTZXRzKG5leHROb2RlLCBtZXRob2QpKVxuICAgICAgICAgICAgbWF0Y2hlZCA9IHRydWVcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGVtcE5vZGVzLnB1c2gobmV4dE5vZGUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgayA9IDAsIGxlbjMgPSBub2RlLnBhdHRlcm5zLmxlbmd0aDsgayA8IGxlbjM7IGsrKykge1xuICAgICAgICAgIGNvbnN0IHBhdHRlcm4gPSBub2RlLnBhdHRlcm5zW2tdXG5cbiAgICAgICAgICAvLyBXaWxkY2FyZFxuICAgICAgICAgIC8vICcvaGVsbG8vKi9mb28nID0+IG1hdGNoIC9oZWxsby9iYXIvZm9vXG4gICAgICAgICAgaWYgKHBhdHRlcm4gPT09ICcqJykge1xuICAgICAgICAgICAgY29uc3QgYXN0Tm9kZSA9IG5vZGUuY2hpbGRyZW5bJyonXVxuICAgICAgICAgICAgaWYgKGFzdE5vZGUpIHtcbiAgICAgICAgICAgICAgaGFuZGxlclNldHMucHVzaCguLi50aGlzLmdIU2V0cyhhc3ROb2RlLCBtZXRob2QpKVxuICAgICAgICAgICAgICB0ZW1wTm9kZXMucHVzaChhc3ROb2RlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGFydCA9PT0gJycpIGNvbnRpbnVlXG5cbiAgICAgICAgICAvLyBOYW1lZCBtYXRjaFxuICAgICAgICAgIC8vIGAvcG9zdHMvOmlkYCA9PiBtYXRjaCAvcG9zdHMvMTIzXG4gICAgICAgICAgY29uc3QgW2tleSwgbmFtZSwgbWF0Y2hlcl0gPSBwYXR0ZXJuXG5cbiAgICAgICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5ba2V5XVxuXG4gICAgICAgICAgLy8gYC9qcy86ZmlsZW5hbWV7W2Etel0rLmpzfWAgPT4gbWF0Y2ggL2pzL2NodW5rLzEyMy5qc1xuICAgICAgICAgIGNvbnN0IHJlc3RQYXRoU3RyaW5nID0gcGFydHMuc2xpY2UoaSkuam9pbignLycpXG4gICAgICAgICAgaWYgKG1hdGNoZXIgaW5zdGFuY2VvZiBSZWdFeHAgJiYgbWF0Y2hlci50ZXN0KHJlc3RQYXRoU3RyaW5nKSkge1xuICAgICAgICAgICAgaGFuZGxlclNldHMucHVzaCguLi50aGlzLmdIU2V0cyhjaGlsZCwgbWV0aG9kKSlcbiAgICAgICAgICAgIHBhcmFtc1tuYW1lXSA9IHJlc3RQYXRoU3RyaW5nXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtYXRjaGVyID09PSB0cnVlIHx8IChtYXRjaGVyIGluc3RhbmNlb2YgUmVnRXhwICYmIG1hdGNoZXIudGVzdChwYXJ0KSkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBpZiAoaXNMYXN0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlclNldHMucHVzaCguLi50aGlzLmdIU2V0cyhjaGlsZCwgbWV0aG9kKSlcbiAgICAgICAgICAgICAgICAvLyBgLzppZC8qYCA9PiBtYXRjaCBgL2Zvb2BcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuY2hpbGRyZW5bJyonXSkge1xuICAgICAgICAgICAgICAgICAgaGFuZGxlclNldHMucHVzaCguLi50aGlzLmdIU2V0cyhjaGlsZC5jaGlsZHJlblsnKiddLCBtZXRob2QpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wTm9kZXMucHVzaChjaGlsZClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBgL2Jvb2svYWAgICAgID0+IG5vLXNsdWdcbiAgICAgICAgICAgIC8vIGAvYm9vay86c2x1Z2AgPT4gc2x1Z1xuICAgICAgICAgICAgLy8gYC9ib29rL2JgICAgICA9PiBuby1zbHVnLWJcbiAgICAgICAgICAgIC8vIEdFVCAvYm9vay9hICAgfj4gbm8tc2x1ZywgcGFyYW1bJ3NsdWcnXSA9PiB1bmRlZmluZWRcbiAgICAgICAgICAgIC8vIEdFVCAvYm9vay9mb28gfj4gc2x1ZywgcGFyYW1bJ3NsdWcnXSA9PiBmb29cbiAgICAgICAgICAgIC8vIEdFVCAvYm9vay9iICAgfj4gbm8tc2x1Zy1iLCBwYXJhbVsnc2x1ZyddID0+IGJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgJiYgIW1hdGNoZWQpIHtcbiAgICAgICAgICAgICAgcGFyYW1zW25hbWVdID0gcGFydFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5bcGFydF0pIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNbbmFtZV0gPSBwYXJ0XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY3VyTm9kZXMgPSB0ZW1wTm9kZXNcbiAgICB9XG5cbiAgICBjb25zdCBsZW4gPSBoYW5kbGVyU2V0cy5sZW5ndGhcbiAgICBpZiAobGVuID09PSAwKSByZXR1cm4gbnVsbFxuICAgIGlmIChsZW4gPT09IDEpIHJldHVybiB7IGhhbmRsZXJzOiBbaGFuZGxlclNldHNbMF0uaGFuZGxlcl0sIHBhcmFtcyB9XG5cbiAgICBjb25zdCBoYW5kbGVycyA9IGhhbmRsZXJTZXRzXG4gICAgICAuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gYS5zY29yZSAtIGIuc2NvcmVcbiAgICAgIH0pXG4gICAgICAubWFwKChzKSA9PiB7XG4gICAgICAgIHJldHVybiBzLmhhbmRsZXJcbiAgICAgIH0pXG5cbiAgICByZXR1cm4geyBoYW5kbGVycywgcGFyYW1zIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsZUFBZSxRQUFRLGtCQUFpQjtBQUVqRCxTQUFTLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLFFBQVEscUJBQW9CO0FBUTVFLFNBQVMsVUFBYSxJQUFhLEVBQUUsSUFBWSxFQUFXO0lBQzFELElBQUssSUFBSSxJQUFJLEdBQUcsTUFBTSxLQUFLLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLElBQUs7UUFDeEQsSUFBSSxPQUFPLEtBQUssUUFBUSxDQUFDLEVBQUUsS0FBSyxZQUFZLEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssTUFBTTtZQUN4RSxPQUFPLElBQUk7UUFDYixDQUFDO0lBQ0g7SUFDQSxNQUFNLFFBQVEsT0FBTyxNQUFNLENBQUMsS0FBSyxRQUFRO0lBQ3pDLElBQUssSUFBSSxJQUFJLEdBQUcsTUFBTSxNQUFNLE1BQU0sRUFBRSxJQUFJLEtBQUssSUFBSztRQUNoRCxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUUsRUFBRSxPQUFPO1lBQzdCLE9BQU8sSUFBSTtRQUNiLENBQUM7SUFDSDtJQUVBLE9BQU8sS0FBSztBQUNkO0FBRUEsT0FBTyxNQUFNO0lBQ1gsUUFBd0M7SUFFeEMsU0FBaUM7SUFDakMsU0FBbUI7SUFDbkIsUUFBZ0IsRUFBQztJQUNqQixLQUFZO0lBQ1osZ0JBQWdEO0lBRWhELFlBQVksTUFBZSxFQUFFLE9BQVcsRUFBRSxRQUFrQyxDQUFFO1FBQzVFLElBQUksQ0FBQyxR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