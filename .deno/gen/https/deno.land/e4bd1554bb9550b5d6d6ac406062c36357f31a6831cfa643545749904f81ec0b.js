/* eslint-disable @typescript-eslint/ban-ts-comment */ import { UnsupportedPathError } from '../../router.ts';
export class SmartRouter {
    name = 'SmartRouter';
    routers = [];
    routes = [];
    constructor(init){
        Object.assign(this, init);
    }
    add(method, path, handler) {
        if (!this.routes) {
            throw new Error('Can not add a route since the matcher is already built.');
        }
        this.routes.push([
            method,
            path,
            handler
        ]);
    }
    match(method, path) {
        if (!this.routes) {
            throw new Error('Fatal error');
        }
        const { routers , routes  } = this;
        const len = routers.length;
        let i = 0;
        let res;
        for(; i < len; i++){
            const router = routers[i];
            try {
                routes.forEach((args)=>{
                    router.add(...args);
                });
                res = router.match(method, path);
            } catch (e) {
                if (e instanceof UnsupportedPathError) {
                    continue;
                }
                throw e;
            }
            this.match = router.match.bind(router);
            this.routers = [
                router
            ];
            this.routes = undefined;
            break;
        }
        if (i === len) {
            // not found
            throw new Error('Fatal error');
        }
        // e.g. "SmartRouter + RegExpRouter"
        this.name = `SmartRouter + ${this.activeRouter.name}`;
        return res || null;
    }
    get activeRouter() {
        if (this.routes || this.routers.length !== 1) {
            throw new Error('No active router has been determined yet.');
        }
        return this.routers[0];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvcm91dGVyL3NtYXJ0LXJvdXRlci9yb3V0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50ICovXG5pbXBvcnQgdHlwZSB7IFJvdXRlciwgUmVzdWx0IH0gZnJvbSAnLi4vLi4vcm91dGVyLnRzJ1xuaW1wb3J0IHsgVW5zdXBwb3J0ZWRQYXRoRXJyb3IgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5cbmV4cG9ydCBjbGFzcyBTbWFydFJvdXRlcjxUPiBpbXBsZW1lbnRzIFJvdXRlcjxUPiB7XG4gIG5hbWU6IHN0cmluZyA9ICdTbWFydFJvdXRlcidcbiAgcm91dGVyczogUm91dGVyPFQ+W10gPSBbXVxuICByb3V0ZXM/OiBbc3RyaW5nLCBzdHJpbmcsIFRdW10gPSBbXVxuXG4gIGNvbnN0cnVjdG9yKGluaXQ6IFBpY2s8U21hcnRSb3V0ZXI8VD4sICdyb3V0ZXJzJz4pIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIGluaXQpXG4gIH1cblxuICBhZGQobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgaGFuZGxlcjogVCkge1xuICAgIGlmICghdGhpcy5yb3V0ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBhZGQgYSByb3V0ZSBzaW5jZSB0aGUgbWF0Y2hlciBpcyBhbHJlYWR5IGJ1aWx0LicpXG4gICAgfVxuXG4gICAgdGhpcy5yb3V0ZXMucHVzaChbbWV0aG9kLCBwYXRoLCBoYW5kbGVyXSlcbiAgfVxuXG4gIG1hdGNoKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpOiBSZXN1bHQ8VD4gfCBudWxsIHtcbiAgICBpZiAoIXRoaXMucm91dGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhdGFsIGVycm9yJylcbiAgICB9XG5cbiAgICBjb25zdCB7IHJvdXRlcnMsIHJvdXRlcyB9ID0gdGhpc1xuICAgIGNvbnN0IGxlbiA9IHJvdXRlcnMubGVuZ3RoXG4gICAgbGV0IGkgPSAwXG4gICAgbGV0IHJlc1xuICAgIGZvciAoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHJvdXRlciA9IHJvdXRlcnNbaV1cbiAgICAgIHRyeSB7XG4gICAgICAgIHJvdXRlcy5mb3JFYWNoKChhcmdzKSA9PiB7XG4gICAgICAgICAgcm91dGVyLmFkZCguLi5hcmdzKVxuICAgICAgICB9KVxuICAgICAgICByZXMgPSByb3V0ZXIubWF0Y2gobWV0aG9kLCBwYXRoKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFVuc3VwcG9ydGVkUGF0aEVycm9yKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlXG4gICAgICB9XG5cbiAgICAgIHRoaXMubWF0Y2ggPSByb3V0ZXIubWF0Y2guYmluZChyb3V0ZXIpXG4gICAgICB0aGlzLnJvdXRlcnMgPSBbcm91dGVyXVxuICAgICAgdGhpcy5yb3V0ZXMgPSB1bmRlZmluZWRcbiAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgaWYgKGkgPT09IGxlbikge1xuICAgICAgLy8gbm90IGZvdW5kXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhdGFsIGVycm9yJylcbiAgICB9XG5cbiAgICAvLyBlLmcuIFwiU21hcnRSb3V0ZXIgKyBSZWdFeHBSb3V0ZXJcIlxuICAgIHRoaXMubmFtZSA9IGBTbWFydFJvdXRlciArICR7dGhpcy5hY3RpdmVSb3V0ZXIubmFtZX1gXG5cbiAgICByZXR1cm4gcmVzIHx8IG51bGxcbiAgfVxuXG4gIGdldCBhY3RpdmVSb3V0ZXIoKSB7XG4gICAgaWYgKHRoaXMucm91dGVzIHx8IHRoaXMucm91dGVycy5sZW5ndGggIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gYWN0aXZlIHJvdXRlciBoYXMgYmVlbiBkZXRlcm1pbmVkIHlldC4nKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnJvdXRlcnNbMF1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLG9EQUFvRCxHQUVwRCxTQUFTLG9CQUFvQixRQUFRLGtCQUFpQjtBQUV0RCxPQUFPLE1BQU07SUFDWCxPQUFlLGNBQWE7SUFDNUIsVUFBdUIsRUFBRSxDQUFBO0lBQ3pCLFNBQWlDLEVBQUUsQ0FBQTtJQUVuQyxZQUFZLElBQXFDLENBQUU7UUFDakQsT0FBTyxNQUFNLENBQUMsSUFBSSxFQUFFO0lBQ3RCO0lBRUEsSUFBSSxNQUFjLEVBQUUsSUFBWSxFQUFFLE9BQVUsRUFBRTtRQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQixNQUFNLElBQUksTUFBTSwyREFBMEQ7UUFDNUUsQ0FBQztRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQUM7WUFBUTtZQUFNO1NBQVE7SUFDMUM7SUFFQSxNQUFNLE1BQWMsRUFBRSxJQUFZLEVBQW9CO1FBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxNQUFNLGVBQWM7UUFDaEMsQ0FBQztRQUVELE1BQU0sRUFBRSxRQUFPLEVBQUUsT0FBTSxFQUFFLEdBQUcsSUFBSTtRQUNoQyxNQUFNLE1BQU0sUUFBUSxNQUFNO1FBQzFCLElBQUksSUFBSTtRQUNSLElBQUk7UUFDSixNQUFPLElBQUksS0FBSyxJQUFLO1lBQ25CLE1BQU0sU0FBUyxPQUFPLENBQUMsRUFBRTtZQUN6QixJQUFJO2dCQUNGLE9BQU8sT0FBTyxDQUFDLENBQUMsT0FBUztvQkFDdkIsT0FBTyxHQUFHLElBQUk7Z0JBQ2hCO2dCQUNBLE1BQU0sT0FBTyxLQUFLLENBQUMsUUFBUTtZQUM3QixFQUFFLE9BQU8sR0FBRztnQkFDVixJQUFJLGFBQWEsc0JBQXNCO29CQUNyQyxRQUFRO2dCQUNWLENBQUM7Z0JBQ0QsTUFBTSxFQUFDO1lBQ1Q7WUFFQSxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHO2dCQUFDO2FBQU87WUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNkLEtBQUs7UUFDUDtRQUVBLElBQUksTUFBTSxLQUFLO1lBQ2IsWUFBWTtZQUNaLE1BQU0sSUFBSSxNQUFNLGVBQWM7UUFDaEMsQ0FBQztRQUVELG9DQUFvQztRQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFckQsT0FBTyxPQUFPLElBQUk7SUFDcEI7SUFFQSxJQUFJLGVBQWU7UUFDakIsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLEdBQUc7WUFDNUMsTUFBTSxJQUFJLE1BQU0sNkNBQTRDO1FBQzlELENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtJQUN4QjtBQUNGLENBQUMifQ==