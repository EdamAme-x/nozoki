export class Request {
    raw;
    get method() {
        return this.raw.method;
    }
    get url() {
        return this.raw.url;
    }
    get headers() {
        return this.raw.headers;
    }
    get body() {
        return this.raw.r.buf;
    }
    path;
    search;
    query;
    params;
    data;
    error;
    extra;
    constructor(raw){
        this.raw = raw;
        this.extra = {};
        const url = new URL("http://a.b" + raw.url);
        this.path = url.pathname;
        this.search = url.search;
        const query = {};
        for (const [k, v] of new URLSearchParams(url.search)){
            if (Array.isArray(query[k])) query[k] = [
                ...query[k],
                v
            ];
            else if (typeof query[k] === "string") query[k] = [
                query[k],
                v
            ];
            else query[k] = v;
        }
        this.query = query;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9OTWF0aGFyL2Rlbm8tZXhwcmVzcy9tYXN0ZXIvc3JjL1JlcXVlc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNZXRob2QsIFBhcmFtcywgUXVlcnl9IGZyb20gXCIuLi90eXBlcy9pbmRleC50c1wiXG5cbmV4cG9ydCBjbGFzcyBSZXF1ZXN0IHtcbiAgICBnZXQgbWV0aG9kKCk6IE1ldGhvZCB7XG4gICAgICByZXR1cm4gdGhpcy5yYXcubWV0aG9kO1xuICAgIH1cblxuICAgIGdldCB1cmwoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLnJhdy51cmw7XG4gICAgfVxuXG4gICAgZ2V0IGhlYWRlcnMoKTogSGVhZGVycyB7XG4gICAgICByZXR1cm4gdGhpcy5yYXcuaGVhZGVycztcbiAgICB9XG5cbiAgICBnZXQgYm9keSgpOiBVaW50OEFycmF5IHtcbiAgICAgIHJldHVybiB0aGlzLnJhdy5yLmJ1ZjtcbiAgICB9XG5cbiAgICBwYXRoOiBzdHJpbmc7XG4gICAgc2VhcmNoOiBzdHJpbmc7XG4gICAgcXVlcnk6IFF1ZXJ5O1xuICAgIHBhcmFtcyE6IFBhcmFtcztcbiAgICBkYXRhOiBhbnk7XG4gICAgZXJyb3I/OiBFcnJvcjtcbiAgICBleHRyYTogYW55ID0ge307XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgcmF3OiBhbnkpIHtcbiAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoXCJodHRwOi8vYS5iXCIgKyByYXcudXJsKTtcbiAgICAgIHRoaXMucGF0aCA9IHVybC5wYXRobmFtZTtcbiAgICAgIHRoaXMuc2VhcmNoID0gdXJsLnNlYXJjaDtcbiAgICAgIGNvbnN0IHF1ZXJ5OiBRdWVyeSA9IHt9O1xuICAgICAgZm9yIChjb25zdCBbaywgdl0gb2YgbmV3IFVSTFNlYXJjaFBhcmFtcyh1cmwuc2VhcmNoKSBhcyBhbnkpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocXVlcnlba10pKSBxdWVyeVtrXSA9IFsuLi5xdWVyeVtrXSwgdl07XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBxdWVyeVtrXSA9PT0gXCJzdHJpbmdcIikgcXVlcnlba10gPSBbcXVlcnlba10sIHZdO1xuICAgICAgICBlbHNlIHF1ZXJ5W2tdID0gdjtcbiAgICAgIH1cbiAgICAgIHRoaXMucXVlcnkgPSBxdWVyeTtcbiAgICB9XG4gIH1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLE1BQU07SUF5QlU7SUF4Qm5CLElBQUksU0FBaUI7UUFDbkIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU07SUFDeEI7SUFFQSxJQUFJLE1BQWM7UUFDaEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUc7SUFDckI7SUFFQSxJQUFJLFVBQW1CO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPO0lBQ3pCO0lBRUEsSUFBSSxPQUFtQjtRQUNyQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUc7SUFDdkI7SUFFQSxLQUFhO0lBQ2IsT0FBZTtJQUNmLE1BQWE7SUFDYixPQUFnQjtJQUNoQixLQUFVO0lBQ1YsTUFBYztJQUNkLE1BQWdCO0lBRWhCLFlBQW1CLElBQVU7bUJBQVY7YUFGbkIsUUFBYSxDQUFDO1FBR1osTUFBTSxNQUFNLElBQUksSUFBSSxlQUFlLElBQUksR0FBRztRQUMxQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksUUFBUTtRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTTtRQUN4QixNQUFNLFFBQWUsQ0FBQztRQUN0QixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLGdCQUFnQixJQUFJLE1BQU0sRUFBVTtZQUMzRCxJQUFJLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsR0FBRzttQkFBSSxLQUFLLENBQUMsRUFBRTtnQkFBRTthQUFFO2lCQUNuRCxJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUUsS0FBSyxVQUFVLEtBQUssQ0FBQyxFQUFFLEdBQUc7Z0JBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQUU7YUFBRTtpQkFDMUQsS0FBSyxDQUFDLEVBQUUsR0FBRztRQUNsQjtRQUNBLElBQUksQ0FBQyxLQUFLLEdBQUc7SUFDZjtBQUNGLENBQUMifQ==