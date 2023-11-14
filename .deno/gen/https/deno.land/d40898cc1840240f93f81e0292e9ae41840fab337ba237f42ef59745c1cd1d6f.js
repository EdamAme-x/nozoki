import { HonoBase } from './hono-base.ts';
import { RegExpRouter } from './router/reg-exp-router/index.ts';
import { SmartRouter } from './router/smart-router/index.ts';
import { TrieRouter } from './router/trie-router/index.ts';
export class Hono extends HonoBase {
    constructor(init = {}){
        super(init);
        this.router = init.router ?? new SmartRouter({
            routers: [
                new RegExpRouter(),
                new TrieRouter()
            ]
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvaG9uby50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIb25vQmFzZSB9IGZyb20gJy4vaG9uby1iYXNlLnRzJ1xuaW1wb3J0IHsgUmVnRXhwUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXIvcmVnLWV4cC1yb3V0ZXIvaW5kZXgudHMnXG5pbXBvcnQgeyBTbWFydFJvdXRlciB9IGZyb20gJy4vcm91dGVyL3NtYXJ0LXJvdXRlci9pbmRleC50cydcbmltcG9ydCB7IFRyaWVSb3V0ZXIgfSBmcm9tICcuL3JvdXRlci90cmllLXJvdXRlci9pbmRleC50cydcbmltcG9ydCB0eXBlIHsgRW52IH0gZnJvbSAnLi90eXBlcy50cydcblxuZXhwb3J0IGNsYXNzIEhvbm88RSBleHRlbmRzIEVudiA9IEVudiwgUyA9IHt9LCBCYXNlUGF0aCBleHRlbmRzIHN0cmluZyA9ICcvJz4gZXh0ZW5kcyBIb25vQmFzZTxcbiAgRSxcbiAgUyxcbiAgQmFzZVBhdGhcbj4ge1xuICBjb25zdHJ1Y3Rvcihpbml0OiBQYXJ0aWFsPFBpY2s8SG9ubywgJ3JvdXRlcicgfCAnZ2V0UGF0aCc+ICYgeyBzdHJpY3Q6IGJvb2xlYW4gfT4gPSB7fSkge1xuICAgIHN1cGVyKGluaXQpXG4gICAgdGhpcy5yb3V0ZXIgPVxuICAgICAgaW5pdC5yb3V0ZXIgPz9cbiAgICAgIG5ldyBTbWFydFJvdXRlcih7XG4gICAgICAgIHJvdXRlcnM6IFtuZXcgUmVnRXhwUm91dGVyKCksIG5ldyBUcmllUm91dGVyKCldLFxuICAgICAgfSlcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsUUFBUSxRQUFRLGlCQUFnQjtBQUN6QyxTQUFTLFlBQVksUUFBUSxtQ0FBa0M7QUFDL0QsU0FBUyxXQUFXLFFBQVEsaUNBQWdDO0FBQzVELFNBQVMsVUFBVSxRQUFRLGdDQUErQjtBQUcxRCxPQUFPLE1BQU0sYUFBeUU7SUFLcEYsWUFBWSxPQUF3RSxDQUFDLENBQUMsQ0FBRTtRQUN0RixLQUFLLENBQUM7UUFDTixJQUFJLENBQUMsTUFBTSxHQUNULEtBQUssTUFBTSxJQUNYLElBQUksWUFBWTtZQUNkLFNBQVM7Z0JBQUMsSUFBSTtnQkFBZ0IsSUFBSTthQUFhO1FBQ2pEO0lBQ0o7QUFDRixDQUFDIn0=