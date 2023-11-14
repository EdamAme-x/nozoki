import { Node } from './node.ts';
export class Trie {
    context = {
        varIndex: 0
    };
    root = new Node();
    insert(path, index, pathErrorCheckOnly) {
        const paramMap = [];
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
        /**
     *  - pattern (:label, :label{0-9]+}, ...)
     *  - /* wildcard
     *  - character
     */ const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
        for(let i = groups.length - 1; i >= 0; i--){
            const [mark] = groups[i];
            for(let j = tokens.length - 1; j >= 0; j--){
                if (tokens[j].indexOf(mark) !== -1) {
                    tokens[j] = tokens[j].replace(mark, groups[i][1]);
                    break;
                }
            }
        }
        this.root.insert(tokens, index, paramMap, this.context, pathErrorCheckOnly);
        return paramMap;
    }
    buildRegExp() {
        let regexp = this.root.buildRegExpStr();
        if (regexp === '') {
            return [
                /^$/,
                [],
                []
            ] // never match
            ;
        }
        let captureIndex = 0;
        const indexReplacementMap = [];
        const paramReplacementMap = [];
        regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex)=>{
            if (typeof handlerIndex !== 'undefined') {
                indexReplacementMap[++captureIndex] = Number(handlerIndex);
                return '$()';
            }
            if (typeof paramIndex !== 'undefined') {
                paramReplacementMap[Number(paramIndex)] = ++captureIndex;
                return '';
            }
            return '';
        });
        return [
            new RegExp(`^${regexp}`),
            indexReplacementMap,
            paramReplacementMap
        ];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvcm91dGVyL3JlZy1leHAtcm91dGVyL3RyaWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQYXJhbU1hcCwgQ29udGV4dCB9IGZyb20gJy4vbm9kZS50cydcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuL25vZGUudHMnXG5cbmV4cG9ydCB0eXBlIHsgUGFyYW1NYXAgfSBmcm9tICcuL25vZGUudHMnXG5leHBvcnQgdHlwZSBSZXBsYWNlbWVudE1hcCA9IG51bWJlcltdXG5cbmV4cG9ydCBjbGFzcyBUcmllIHtcbiAgY29udGV4dDogQ29udGV4dCA9IHsgdmFySW5kZXg6IDAgfVxuICByb290OiBOb2RlID0gbmV3IE5vZGUoKVxuXG4gIGluc2VydChwYXRoOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIHBhdGhFcnJvckNoZWNrT25seTogYm9vbGVhbik6IFBhcmFtTWFwIHtcbiAgICBjb25zdCBwYXJhbU1hcDogUGFyYW1NYXAgPSBbXVxuXG4gICAgY29uc3QgZ3JvdXBzOiBbc3RyaW5nLCBzdHJpbmddW10gPSBbXSAvLyBbbWFyaywgb3JpZ2luYWwgc3RyaW5nXVxuICAgIGZvciAobGV0IGkgPSAwOyA7ICkge1xuICAgICAgbGV0IHJlcGxhY2VkID0gZmFsc2VcbiAgICAgIHBhdGggPSBwYXRoLnJlcGxhY2UoL1xce1tefV0rXFx9L2csIChtKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcmsgPSBgQFxcXFwke2l9YFxuICAgICAgICBncm91cHNbaV0gPSBbbWFyaywgbV1cbiAgICAgICAgaSsrXG4gICAgICAgIHJlcGxhY2VkID0gdHJ1ZVxuICAgICAgICByZXR1cm4gbWFya1xuICAgICAgfSlcbiAgICAgIGlmICghcmVwbGFjZWQpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAgLSBwYXR0ZXJuICg6bGFiZWwsIDpsYWJlbHswLTldK30sIC4uLilcbiAgICAgKiAgLSAvKiB3aWxkY2FyZFxuICAgICAqICAtIGNoYXJhY3RlclxuICAgICAqL1xuICAgIGNvbnN0IHRva2VucyA9IHBhdGgubWF0Y2goLyg/OjpbXlxcL10rKXwoPzpcXC9cXCokKXwuL2cpIHx8IFtdXG4gICAgZm9yIChsZXQgaSA9IGdyb3Vwcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgW21hcmtdID0gZ3JvdXBzW2ldXG4gICAgICBmb3IgKGxldCBqID0gdG9rZW5zLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XG4gICAgICAgIGlmICh0b2tlbnNbal0uaW5kZXhPZihtYXJrKSAhPT0gLTEpIHtcbiAgICAgICAgICB0b2tlbnNbal0gPSB0b2tlbnNbal0ucmVwbGFjZShtYXJrLCBncm91cHNbaV1bMV0pXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucm9vdC5pbnNlcnQodG9rZW5zLCBpbmRleCwgcGFyYW1NYXAsIHRoaXMuY29udGV4dCwgcGF0aEVycm9yQ2hlY2tPbmx5KVxuXG4gICAgcmV0dXJuIHBhcmFtTWFwXG4gIH1cblxuICBidWlsZFJlZ0V4cCgpOiBbUmVnRXhwLCBSZXBsYWNlbWVudE1hcCwgUmVwbGFjZW1lbnRNYXBdIHtcbiAgICBsZXQgcmVnZXhwID0gdGhpcy5yb290LmJ1aWxkUmVnRXhwU3RyKClcbiAgICBpZiAocmVnZXhwID09PSAnJykge1xuICAgICAgcmV0dXJuIFsvXiQvLCBbXSwgW11dIC8vIG5ldmVyIG1hdGNoXG4gICAgfVxuXG4gICAgbGV0IGNhcHR1cmVJbmRleCA9IDBcbiAgICBjb25zdCBpbmRleFJlcGxhY2VtZW50TWFwOiBSZXBsYWNlbWVudE1hcCA9IFtdXG4gICAgY29uc3QgcGFyYW1SZXBsYWNlbWVudE1hcDogUmVwbGFjZW1lbnRNYXAgPSBbXVxuXG4gICAgcmVnZXhwID0gcmVnZXhwLnJlcGxhY2UoLyMoXFxkKyl8QChcXGQrKXxcXC5cXCpcXCQvZywgKF8sIGhhbmRsZXJJbmRleCwgcGFyYW1JbmRleCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBoYW5kbGVySW5kZXggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGluZGV4UmVwbGFjZW1lbnRNYXBbKytjYXB0dXJlSW5kZXhdID0gTnVtYmVyKGhhbmRsZXJJbmRleClcbiAgICAgICAgcmV0dXJuICckKCknXG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhcmFtSW5kZXggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHBhcmFtUmVwbGFjZW1lbnRNYXBbTnVtYmVyKHBhcmFtSW5kZXgpXSA9ICsrY2FwdHVyZUluZGV4XG4gICAgICAgIHJldHVybiAnJ1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJydcbiAgICB9KVxuXG4gICAgcmV0dXJuIFtuZXcgUmVnRXhwKGBeJHtyZWdleHB9YCksIGluZGV4UmVwbGFjZW1lbnRNYXAsIHBhcmFtUmVwbGFjZW1lbnRNYXBdXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLElBQUksUUFBUSxZQUFXO0FBS2hDLE9BQU8sTUFBTTtJQUNYLFVBQW1CO1FBQUUsVUFBVTtJQUFFLEVBQUM7SUFDbEMsT0FBYSxJQUFJLE9BQU07SUFFdkIsT0FBTyxJQUFZLEVBQUUsS0FBYSxFQUFFLGtCQUEyQixFQUFZO1FBQ3pFLE1BQU0sV0FBcUIsRUFBRTtRQUU3QixNQUFNLFNBQTZCLEVBQUUsQ0FBQywwQkFBMEI7O1FBQ2hFLElBQUssSUFBSSxJQUFJLElBQU87WUFDbEIsSUFBSSxXQUFXLEtBQUs7WUFDcEIsT0FBTyxLQUFLLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBTTtnQkFDdkMsTUFBTSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDdEIsTUFBTSxDQUFDLEVBQUUsR0FBRztvQkFBQztvQkFBTTtpQkFBRTtnQkFDckI7Z0JBQ0EsV0FBVyxJQUFJO2dCQUNmLE9BQU87WUFDVDtZQUNBLElBQUksQ0FBQyxVQUFVO2dCQUNiLEtBQUs7WUFDUCxDQUFDO1FBQ0g7UUFFQTs7OztLQUlDLEdBQ0QsTUFBTSxTQUFTLEtBQUssS0FBSyxDQUFDLCtCQUErQixFQUFFO1FBQzNELElBQUssSUFBSSxJQUFJLE9BQU8sTUFBTSxHQUFHLEdBQUcsS0FBSyxHQUFHLElBQUs7WUFDM0MsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsRUFBRTtZQUN4QixJQUFLLElBQUksSUFBSSxPQUFPLE1BQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxJQUFLO2dCQUMzQyxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO29CQUNsQyxNQUFNLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUNoRCxLQUFLO2dCQUNQLENBQUM7WUFDSDtRQUNGO1FBRUEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxPQUFPLFVBQVUsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUV4RCxPQUFPO0lBQ1Q7SUFFQSxjQUF3RDtRQUN0RCxJQUFJLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjO1FBQ3JDLElBQUksV0FBVyxJQUFJO1lBQ2pCLE9BQU87Z0JBQUM7Z0JBQU0sRUFBRTtnQkFBRSxFQUFFO2FBQUMsQ0FBQyxjQUFjOztRQUN0QyxDQUFDO1FBRUQsSUFBSSxlQUFlO1FBQ25CLE1BQU0sc0JBQXNDLEVBQUU7UUFDOUMsTUFBTSxzQkFBc0MsRUFBRTtRQUU5QyxTQUFTLE9BQU8sT0FBTyxDQUFDLHlCQUF5QixDQUFDLEdBQUcsY0FBYyxhQUFlO1lBQ2hGLElBQUksT0FBTyxpQkFBaUIsYUFBYTtnQkFDdkMsbUJBQW1CLENBQUMsRUFBRSxhQUFhLEdBQUcsT0FBTztnQkFDN0MsT0FBTztZQUNULENBQUM7WUFDRCxJQUFJLE9BQU8sZUFBZSxhQUFhO2dCQUNyQyxtQkFBbUIsQ0FBQyxPQUFPLFlBQVksR0FBRyxFQUFFO2dCQUM1QyxPQUFPO1lBQ1QsQ0FBQztZQUVELE9BQU87UUFDVDtRQUVBLE9BQU87WUFBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDO1lBQUc7WUFBcUI7U0FBb0I7SUFDN0U7QUFDRixDQUFDIn0=