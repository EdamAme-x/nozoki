import { checkOptionalParameter } from '../../utils/url.ts';
import { Node } from './node.ts';
export class TrieRouter {
    name = 'TrieRouter';
    node;
    constructor(){
        this.node = new Node();
    }
    add(method, path, handler) {
        const results = checkOptionalParameter(path);
        if (results) {
            for (const p of results){
                this.node.insert(method, p, handler);
            }
            return;
        }
        this.node.insert(method, path, handler);
    }
    match(method, path) {
        return this.node.search(method, path);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvcm91dGVyL3RyaWUtcm91dGVyL3JvdXRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlc3VsdCwgUm91dGVyIH0gZnJvbSAnLi4vLi4vcm91dGVyLnRzJ1xuaW1wb3J0IHsgY2hlY2tPcHRpb25hbFBhcmFtZXRlciB9IGZyb20gJy4uLy4uL3V0aWxzL3VybC50cydcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuL25vZGUudHMnXG5cbmV4cG9ydCBjbGFzcyBUcmllUm91dGVyPFQ+IGltcGxlbWVudHMgUm91dGVyPFQ+IHtcbiAgbmFtZTogc3RyaW5nID0gJ1RyaWVSb3V0ZXInXG4gIG5vZGU6IE5vZGU8VD5cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm5vZGUgPSBuZXcgTm9kZSgpXG4gIH1cblxuICBhZGQobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgaGFuZGxlcjogVCkge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBjaGVja09wdGlvbmFsUGFyYW1ldGVyKHBhdGgpXG4gICAgaWYgKHJlc3VsdHMpIHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiByZXN1bHRzKSB7XG4gICAgICAgIHRoaXMubm9kZS5pbnNlcnQobWV0aG9kLCBwLCBoYW5kbGVyKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5ub2RlLmluc2VydChtZXRob2QsIHBhdGgsIGhhbmRsZXIpXG4gIH1cblxuICBtYXRjaChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nKTogUmVzdWx0PFQ+IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMubm9kZS5zZWFyY2gobWV0aG9kLCBwYXRoKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBUyxzQkFBc0IsUUFBUSxxQkFBb0I7QUFDM0QsU0FBUyxJQUFJLFFBQVEsWUFBVztBQUVoQyxPQUFPLE1BQU07SUFDWCxPQUFlLGFBQVk7SUFDM0IsS0FBYTtJQUViLGFBQWM7UUFDWixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUk7SUFDbEI7SUFFQSxJQUFJLE1BQWMsRUFBRSxJQUFZLEVBQUUsT0FBVSxFQUFFO1FBQzVDLE1BQU0sVUFBVSx1QkFBdUI7UUFDdkMsSUFBSSxTQUFTO1lBQ1gsS0FBSyxNQUFNLEtBQUssUUFBUztnQkFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHO1lBQzlCO1lBQ0E7UUFDRixDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxNQUFNO0lBQ2pDO0lBRUEsTUFBTSxNQUFjLEVBQUUsSUFBWSxFQUFvQjtRQUNwRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7SUFDbEM7QUFDRixDQUFDIn0=