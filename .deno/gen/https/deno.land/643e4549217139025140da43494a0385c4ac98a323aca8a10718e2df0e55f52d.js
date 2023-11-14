import { METHOD_NAME_ALL, UnsupportedPathError } from '../../router.ts';
const splitPathRe = /\/(:\w+(?:{[^}]+})?)|\/[^\/\?]+|(\?)/g;
const splitByStarRe = /\*/;
export class LinearRouter {
    name = 'LinearRouter';
    routes = [];
    add(method, path, handler) {
        if (path.charCodeAt(path.length - 1) === 63) {
            // /path/to/:label? means /path/to/:label or /path/to
            this.routes.push([
                method,
                path.slice(0, -1),
                handler
            ]);
            this.routes.push([
                method,
                path.replace(/\/[^/]+$/, ''),
                handler
            ]);
        } else {
            this.routes.push([
                method,
                path,
                handler
            ]);
        }
    }
    match(method, path) {
        const handlers = [];
        const params = {};
        ROUTES_LOOP: for(let i = 0; i < this.routes.length; i++){
            const [routeMethod, routePath, handler] = this.routes[i];
            if (routeMethod !== method && routeMethod !== METHOD_NAME_ALL) {
                continue;
            }
            if (routePath === '*' || routePath === '/*') {
                handlers.push(handler);
                continue;
            }
            const hasStar = routePath.indexOf('*') !== -1;
            const hasLabel = routePath.indexOf(':') !== -1;
            if (!hasStar && !hasLabel) {
                if (routePath === path || routePath + '/' === path) {
                    handlers.push(handler);
                }
            } else if (hasStar && !hasLabel) {
                const endsWithStar = routePath.charCodeAt(routePath.length - 1) === 42;
                const parts = (endsWithStar ? routePath.slice(0, -2) : routePath).split(splitByStarRe);
                const lastIndex = parts.length - 1;
                for(let j = 0, pos = 0; j < parts.length; j++){
                    const part = parts[j];
                    const index = path.indexOf(part, pos);
                    if (index !== pos) {
                        continue ROUTES_LOOP;
                    }
                    pos += part.length;
                    if (j === lastIndex) {
                        if (!endsWithStar && pos !== path.length && !(pos === path.length - 1 && path.charCodeAt(pos) === 47)) {
                            continue ROUTES_LOOP;
                        }
                    } else {
                        const index = path.indexOf('/', pos);
                        if (index === -1) {
                            continue ROUTES_LOOP;
                        }
                        pos = index;
                    }
                }
                handlers.push(handler);
            } else if (hasLabel && !hasStar) {
                const localParams = {};
                const parts = routePath.match(splitPathRe);
                const lastIndex = parts.length - 1;
                for(let j = 0, pos = 0; j < parts.length; j++){
                    if (pos === -1 || pos >= path.length) {
                        continue ROUTES_LOOP;
                    }
                    const part = parts[j];
                    if (part.charCodeAt(1) === 58) {
                        // /:label
                        let name = part.slice(2);
                        let value;
                        if (name.charCodeAt(name.length - 1) === 125) {
                            // :label{pattern}
                            const openBracePos = name.indexOf('{');
                            const pattern = name.slice(openBracePos + 1, -1);
                            const restPath = path.slice(pos + 1);
                            const match = new RegExp(pattern, 'd').exec(restPath);
                            if (!match || match.indices[0][0] !== 0 || match.indices[0][1] === 0) {
                                continue ROUTES_LOOP;
                            }
                            name = name.slice(0, openBracePos);
                            value = restPath.slice(...match.indices[0]);
                            pos += match.indices[0][1] + 1;
                        } else {
                            let endValuePos = path.indexOf('/', pos + 1);
                            if (endValuePos === -1) {
                                if (pos + 1 === path.length) {
                                    continue ROUTES_LOOP;
                                }
                                endValuePos = path.length;
                            }
                            value = path.slice(pos + 1, endValuePos);
                            pos = endValuePos;
                        }
                        if (params[name] && params[name] !== value || localParams[name] && localParams[name] !== value) {
                            throw new Error('Duplicate param name');
                        }
                        localParams[name] = value;
                    } else {
                        const index = path.indexOf(part, pos);
                        if (index !== pos) {
                            continue ROUTES_LOOP;
                        }
                        pos += part.length;
                    }
                    if (j === lastIndex) {
                        if (pos !== path.length && !(pos === path.length - 1 && path.charCodeAt(pos) === 47)) {
                            continue ROUTES_LOOP;
                        }
                    }
                }
                Object.assign(params, localParams);
                handlers.push(handler);
            } else if (hasLabel && hasStar) {
                throw new UnsupportedPathError();
            }
        }
        return handlers.length ? {
            handlers,
            params
        } : null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvcm91dGVyL2xpbmVhci1yb3V0ZXIvcm91dGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUm91dGVyLCBSZXN1bHQgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5pbXBvcnQgeyBNRVRIT0RfTkFNRV9BTEwsIFVuc3VwcG9ydGVkUGF0aEVycm9yIH0gZnJvbSAnLi4vLi4vcm91dGVyLnRzJ1xuXG50eXBlIFJlZ0V4cE1hdGNoQXJyYXlXaXRoSW5kaWNlcyA9IFJlZ0V4cE1hdGNoQXJyYXkgJiB7IGluZGljZXM6IFtudW1iZXIsIG51bWJlcl1bXSB9XG5cbmNvbnN0IHNwbGl0UGF0aFJlID0gL1xcLyg6XFx3Kyg/OntbXn1dK30pPyl8XFwvW15cXC9cXD9dK3woXFw/KS9nXG5jb25zdCBzcGxpdEJ5U3RhclJlID0gL1xcKi9cbmV4cG9ydCBjbGFzcyBMaW5lYXJSb3V0ZXI8VD4gaW1wbGVtZW50cyBSb3V0ZXI8VD4ge1xuICBuYW1lOiBzdHJpbmcgPSAnTGluZWFyUm91dGVyJ1xuICByb3V0ZXM6IFtzdHJpbmcsIHN0cmluZywgVF1bXSA9IFtdXG5cbiAgYWRkKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IFQpIHtcbiAgICBpZiAocGF0aC5jaGFyQ29kZUF0KHBhdGgubGVuZ3RoIC0gMSkgPT09IDYzKSB7XG4gICAgICAvLyAvcGF0aC90by86bGFiZWw/IG1lYW5zIC9wYXRoL3RvLzpsYWJlbCBvciAvcGF0aC90b1xuICAgICAgdGhpcy5yb3V0ZXMucHVzaChbbWV0aG9kLCBwYXRoLnNsaWNlKDAsIC0xKSwgaGFuZGxlcl0pXG4gICAgICB0aGlzLnJvdXRlcy5wdXNoKFttZXRob2QsIHBhdGgucmVwbGFjZSgvXFwvW14vXSskLywgJycpLCBoYW5kbGVyXSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yb3V0ZXMucHVzaChbbWV0aG9kLCBwYXRoLCBoYW5kbGVyXSlcbiAgICB9XG4gIH1cblxuICBtYXRjaChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nKTogUmVzdWx0PFQ+IHwgbnVsbCB7XG4gICAgY29uc3QgaGFuZGxlcnM6IFRbXSA9IFtdXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge31cbiAgICBST1VURVNfTE9PUDogZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJvdXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgW3JvdXRlTWV0aG9kLCByb3V0ZVBhdGgsIGhhbmRsZXJdID0gdGhpcy5yb3V0ZXNbaV1cbiAgICAgIGlmIChyb3V0ZU1ldGhvZCAhPT0gbWV0aG9kICYmIHJvdXRlTWV0aG9kICE9PSBNRVRIT0RfTkFNRV9BTEwpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmIChyb3V0ZVBhdGggPT09ICcqJyB8fCByb3V0ZVBhdGggPT09ICcvKicpIHtcbiAgICAgICAgaGFuZGxlcnMucHVzaChoYW5kbGVyKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBoYXNTdGFyID0gcm91dGVQYXRoLmluZGV4T2YoJyonKSAhPT0gLTFcbiAgICAgIGNvbnN0IGhhc0xhYmVsID0gcm91dGVQYXRoLmluZGV4T2YoJzonKSAhPT0gLTFcbiAgICAgIGlmICghaGFzU3RhciAmJiAhaGFzTGFiZWwpIHtcbiAgICAgICAgaWYgKHJvdXRlUGF0aCA9PT0gcGF0aCB8fCByb3V0ZVBhdGggKyAnLycgPT09IHBhdGgpIHtcbiAgICAgICAgICBoYW5kbGVycy5wdXNoKGhhbmRsZXIpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaGFzU3RhciAmJiAhaGFzTGFiZWwpIHtcbiAgICAgICAgY29uc3QgZW5kc1dpdGhTdGFyID0gcm91dGVQYXRoLmNoYXJDb2RlQXQocm91dGVQYXRoLmxlbmd0aCAtIDEpID09PSA0MlxuICAgICAgICBjb25zdCBwYXJ0cyA9IChlbmRzV2l0aFN0YXIgPyByb3V0ZVBhdGguc2xpY2UoMCwgLTIpIDogcm91dGVQYXRoKS5zcGxpdChzcGxpdEJ5U3RhclJlKVxuXG4gICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHBhcnRzLmxlbmd0aCAtIDFcbiAgICAgICAgZm9yIChsZXQgaiA9IDAsIHBvcyA9IDA7IGogPCBwYXJ0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGNvbnN0IHBhcnQgPSBwYXJ0c1tqXVxuICAgICAgICAgIGNvbnN0IGluZGV4ID0gcGF0aC5pbmRleE9mKHBhcnQsIHBvcylcbiAgICAgICAgICBpZiAoaW5kZXggIT09IHBvcykge1xuICAgICAgICAgICAgY29udGludWUgUk9VVEVTX0xPT1BcbiAgICAgICAgICB9XG4gICAgICAgICAgcG9zICs9IHBhcnQubGVuZ3RoXG4gICAgICAgICAgaWYgKGogPT09IGxhc3RJbmRleCkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAhZW5kc1dpdGhTdGFyICYmXG4gICAgICAgICAgICAgIHBvcyAhPT0gcGF0aC5sZW5ndGggJiZcbiAgICAgICAgICAgICAgIShwb3MgPT09IHBhdGgubGVuZ3RoIC0gMSAmJiBwYXRoLmNoYXJDb2RlQXQocG9zKSA9PT0gNDcpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgY29udGludWUgUk9VVEVTX0xPT1BcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBwYXRoLmluZGV4T2YoJy8nLCBwb3MpXG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlIFJPVVRFU19MT09QXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3MgPSBpbmRleFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVycy5wdXNoKGhhbmRsZXIpXG4gICAgICB9IGVsc2UgaWYgKGhhc0xhYmVsICYmICFoYXNTdGFyKSB7XG4gICAgICAgIGNvbnN0IGxvY2FsUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge31cbiAgICAgICAgY29uc3QgcGFydHMgPSByb3V0ZVBhdGgubWF0Y2goc3BsaXRQYXRoUmUpIGFzIHN0cmluZ1tdXG5cbiAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gcGFydHMubGVuZ3RoIC0gMVxuICAgICAgICBmb3IgKGxldCBqID0gMCwgcG9zID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKHBvcyA9PT0gLTEgfHwgcG9zID49IHBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb250aW51ZSBST1VURVNfTE9PUFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHBhcnQgPSBwYXJ0c1tqXVxuICAgICAgICAgIGlmIChwYXJ0LmNoYXJDb2RlQXQoMSkgPT09IDU4KSB7XG4gICAgICAgICAgICAvLyAvOmxhYmVsXG4gICAgICAgICAgICBsZXQgbmFtZSA9IHBhcnQuc2xpY2UoMilcbiAgICAgICAgICAgIGxldCB2YWx1ZVxuXG4gICAgICAgICAgICBpZiAobmFtZS5jaGFyQ29kZUF0KG5hbWUubGVuZ3RoIC0gMSkgPT09IDEyNSkge1xuICAgICAgICAgICAgICAvLyA6bGFiZWx7cGF0dGVybn1cbiAgICAgICAgICAgICAgY29uc3Qgb3BlbkJyYWNlUG9zID0gbmFtZS5pbmRleE9mKCd7JylcbiAgICAgICAgICAgICAgY29uc3QgcGF0dGVybiA9IG5hbWUuc2xpY2Uob3BlbkJyYWNlUG9zICsgMSwgLTEpXG4gICAgICAgICAgICAgIGNvbnN0IHJlc3RQYXRoID0gcGF0aC5zbGljZShwb3MgKyAxKVxuICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IG5ldyBSZWdFeHAocGF0dGVybiwgJ2QnKS5leGVjKHJlc3RQYXRoKSBhcyBSZWdFeHBNYXRjaEFycmF5V2l0aEluZGljZXNcbiAgICAgICAgICAgICAgaWYgKCFtYXRjaCB8fCBtYXRjaC5pbmRpY2VzWzBdWzBdICE9PSAwIHx8IG1hdGNoLmluZGljZXNbMF1bMV0gPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZSBST1VURVNfTE9PUFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKDAsIG9wZW5CcmFjZVBvcylcbiAgICAgICAgICAgICAgdmFsdWUgPSByZXN0UGF0aC5zbGljZSguLi5tYXRjaC5pbmRpY2VzWzBdKVxuICAgICAgICAgICAgICBwb3MgKz0gbWF0Y2guaW5kaWNlc1swXVsxXSArIDFcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGxldCBlbmRWYWx1ZVBvcyA9IHBhdGguaW5kZXhPZignLycsIHBvcyArIDEpXG4gICAgICAgICAgICAgIGlmIChlbmRWYWx1ZVBvcyA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAocG9zICsgMSA9PT0gcGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIFJPVVRFU19MT09QXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVuZFZhbHVlUG9zID0gcGF0aC5sZW5ndGhcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2YWx1ZSA9IHBhdGguc2xpY2UocG9zICsgMSwgZW5kVmFsdWVQb3MpXG4gICAgICAgICAgICAgIHBvcyA9IGVuZFZhbHVlUG9zXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgKHBhcmFtc1tuYW1lXSAmJiBwYXJhbXNbbmFtZV0gIT09IHZhbHVlKSB8fFxuICAgICAgICAgICAgICAobG9jYWxQYXJhbXNbbmFtZV0gJiYgbG9jYWxQYXJhbXNbbmFtZV0gIT09IHZhbHVlKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRHVwbGljYXRlIHBhcmFtIG5hbWUnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9jYWxQYXJhbXNbbmFtZV0gPSB2YWx1ZSBhcyBzdHJpbmdcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBwYXRoLmluZGV4T2YocGFydCwgcG9zKVxuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSBwb3MpIHtcbiAgICAgICAgICAgICAgY29udGludWUgUk9VVEVTX0xPT1BcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvcyArPSBwYXJ0Lmxlbmd0aFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChqID09PSBsYXN0SW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChwb3MgIT09IHBhdGgubGVuZ3RoICYmICEocG9zID09PSBwYXRoLmxlbmd0aCAtIDEgJiYgcGF0aC5jaGFyQ29kZUF0KHBvcykgPT09IDQ3KSkge1xuICAgICAgICAgICAgICBjb250aW51ZSBST1VURVNfTE9PUFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuYXNzaWduKHBhcmFtcywgbG9jYWxQYXJhbXMpXG4gICAgICAgIGhhbmRsZXJzLnB1c2goaGFuZGxlcilcbiAgICAgIH0gZWxzZSBpZiAoaGFzTGFiZWwgJiYgaGFzU3Rhcikge1xuICAgICAgICB0aHJvdyBuZXcgVW5zdXBwb3J0ZWRQYXRoRXJyb3IoKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaGFuZGxlcnMubGVuZ3RoXG4gICAgICA/IHtcbiAgICAgICAgICBoYW5kbGVycyxcbiAgICAgICAgICBwYXJhbXMsXG4gICAgICAgIH1cbiAgICAgIDogbnVsbFxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBUyxlQUFlLEVBQUUsb0JBQW9CLFFBQVEsa0JBQWlCO0FBSXZFLE1BQU0sY0FBYztBQUNwQixNQUFNLGdCQUFnQjtBQUN0QixPQUFPLE1BQU07SUFDWCxPQUFlLGVBQWM7SUFDN0IsU0FBZ0MsRUFBRSxDQUFBO0lBRWxDLElBQUks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