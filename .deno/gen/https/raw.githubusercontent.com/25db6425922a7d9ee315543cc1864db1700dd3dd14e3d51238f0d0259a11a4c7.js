import { lookup, path } from "../deps.ts";
export class Response {
    status = 200;
    headers = new Headers();
    body;
    resources = [];
    toHttpResponse() {
        let { status =200 , headers , body =new Uint8Array(0)  } = this;
        if (typeof body === "string") {
            body = new TextEncoder().encode(body);
            if (!headers.has("Content-Type")) {
                headers.append("Content-Type", "text/plain");
            }
        }
        return {
            status,
            headers,
            body
        };
    }
    close() {
        for (const resource of this.resources)resource.close();
    }
    empty(status) {
        this.status = status;
        this.body = "";
    }
    json(json) {
        this.headers.append("Content-Type", "application/json");
        this.body = JSON.stringify(json);
    }
    send(text) {
        this.headers.append("Content-Type", "text/plain");
        this.body = text;
    }
    async file(filePath, transform) {
        // console.log("filepath: ", filePath)
        const extname = path.extname(filePath);
        // console.log("extname: ", extname)
        const contentType = lookup(extname.slice(1)) || "";
        const fileInfo = await Deno.stat(filePath);
        if (!fileInfo.isFile || !contentType) {
            return;
        }
        this.headers.append("Content-Type", contentType);
        if (transform) {
            const bytes = await Deno.readFile(filePath);
            let str = new TextDecoder().decode(bytes);
            str = transform(str);
            this.body = new TextEncoder().encode(str);
        } else {
            const file = await Deno.open(filePath);
            this.resources.push(file);
            this.body = file;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9OTWF0aGFyL2Rlbm8tZXhwcmVzcy9tYXN0ZXIvc3JjL1Jlc3BvbnNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RW5kSGFuZGxlciwgSnNvbn0gZnJvbSBcIi4uL3R5cGVzL2luZGV4LnRzXCJcbmltcG9ydCB7aHR0cCwgbG9va3VwLCBwYXRofSBmcm9tIFwiLi4vZGVwcy50c1wiXG5cbmV4cG9ydCBjbGFzcyBSZXNwb25zZSB7XG4gICAgc3RhdHVzID0gMjAwXG4gICAgaGVhZGVycyA9IG5ldyBIZWFkZXJzKClcbiAgICBib2R5Pzogc3RyaW5nIHwgVWludDhBcnJheSB8IERlbm8uUmVhZGVyXG4gICAgcmVzb3VyY2VzOiBEZW5vLkNsb3NlcltdID0gW11cblxuICAgIHRvSHR0cFJlc3BvbnNlKCk6IGh0dHAuUmVzcG9uc2Uge1xuICAgICAgICBsZXQge3N0YXR1cyA9IDIwMCwgaGVhZGVycywgYm9keSA9IG5ldyBVaW50OEFycmF5KDApfSA9IHRoaXNcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBib2R5ID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGJvZHkpXG4gICAgICAgICAgICBpZiAoIWhlYWRlcnMuaGFzKFwiQ29udGVudC1UeXBlXCIpKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVycy5hcHBlbmQoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3BsYWluXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtzdGF0dXMsIGhlYWRlcnMsIGJvZHl9XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIGZvciAoY29uc3QgcmVzb3VyY2Ugb2YgdGhpcy5yZXNvdXJjZXMpIHJlc291cmNlLmNsb3NlKClcbiAgICB9XG5cbiAgICBlbXB0eShzdGF0dXM6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1c1xuICAgICAgICB0aGlzLmJvZHkgPSBcIlwiXG4gICAgfVxuXG4gICAganNvbihqc29uOiBKc29uKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaGVhZGVycy5hcHBlbmQoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpXG4gICAgICAgIHRoaXMuYm9keSA9IEpTT04uc3RyaW5naWZ5KGpzb24pXG4gICAgfVxuXG4gICAgc2VuZCh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzLmFwcGVuZChcIkNvbnRlbnQtVHlwZVwiLCBcInRleHQvcGxhaW5cIilcbiAgICAgICAgdGhpcy5ib2R5ID0gdGV4dFxuICAgIH1cblxuICAgIGFzeW5jIGZpbGUoXG4gICAgICAgIGZpbGVQYXRoOiBzdHJpbmcsXG4gICAgICAgIHRyYW5zZm9ybT86IChzcmM6IHN0cmluZykgPT4gc3RyaW5nXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZmlsZXBhdGg6IFwiLCBmaWxlUGF0aClcbiAgICAgICAgY29uc3QgZXh0bmFtZTogc3RyaW5nID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKVxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImV4dG5hbWU6IFwiLCBleHRuYW1lKVxuICAgICAgICBjb25zdCBjb250ZW50VHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gbG9va3VwKGV4dG5hbWUuc2xpY2UoMSkpIHx8IFwiXCJcbiAgICAgICAgY29uc3QgZmlsZUluZm8gPSBhd2FpdCBEZW5vLnN0YXQoZmlsZVBhdGgpXG4gICAgICAgIGlmICghZmlsZUluZm8uaXNGaWxlIHx8ICFjb250ZW50VHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oZWFkZXJzLmFwcGVuZChcIkNvbnRlbnQtVHlwZVwiLCBjb250ZW50VHlwZSlcbiAgICAgICAgaWYgKHRyYW5zZm9ybSkge1xuICAgICAgICAgICAgY29uc3QgYnl0ZXMgPSBhd2FpdCBEZW5vLnJlYWRGaWxlKGZpbGVQYXRoKVxuICAgICAgICAgICAgbGV0IHN0ciA9IG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShieXRlcylcbiAgICAgICAgICAgIHN0ciA9IHRyYW5zZm9ybShzdHIpXG4gICAgICAgICAgICB0aGlzLmJvZHkgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc3RyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGF3YWl0IERlbm8ub3BlbihmaWxlUGF0aClcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VzLnB1c2goZmlsZSlcbiAgICAgICAgICAgIHRoaXMuYm9keSA9IGZpbGVcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFjLE1BQU0sRUFBRSxJQUFJLFFBQU8sYUFBWTtBQUU3QyxPQUFPLE1BQU07SUFDVCxTQUFTLElBQUc7SUFDWixVQUFVLElBQUksVUFBUztJQUN2QixLQUF3QztJQUN4QyxZQUEyQixFQUFFLENBQUE7SUFFN0IsaUJBQWdDO1FBQzVCLElBQUksRUFBQyxRQUFTLElBQUcsRUFBRSxRQUFPLEVBQUUsTUFBTyxJQUFJLFdBQVcsR0FBRSxFQUFDLEdBQUcsSUFBSTtRQUM1RCxJQUFJLE9BQU8sU0FBUyxVQUFVO1lBQzFCLE9BQU8sSUFBSSxjQUFjLE1BQU0sQ0FBQztZQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsaUJBQWlCO2dCQUM5QixRQUFRLE1BQU0sQ0FBQyxnQkFBZ0I7WUFDbkMsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPO1lBQUM7WUFBUTtZQUFTO1FBQUk7SUFDakM7SUFFQSxRQUFRO1FBQ0osS0FBSyxNQUFNLFlBQVksSUFBSSxDQUFDLFNBQVMsQ0FBRSxTQUFTLEtBQUs7SUFDekQ7SUFFQSxNQUFNLE1BQWMsRUFBUTtRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHO1FBQ2QsSUFBSSxDQUFDLElBQUksR0FBRztJQUNoQjtJQUVBLEtBQUssSUFBVSxFQUFRO1FBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQjtRQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssU0FBUyxDQUFDO0lBQy9CO0lBRUEsS0FBSyxJQUFZLEVBQVE7UUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUc7SUFDaEI7SUFFQSxNQUFNLEtBQ0YsUUFBZ0IsRUFDaEIsU0FBbUMsRUFDdEI7UUFDYixzQ0FBc0M7UUFDdEMsTUFBTSxVQUFrQixLQUFLLE9BQU8sQ0FBQztRQUNyQyxvQ0FBb0M7UUFDcEMsTUFBTSxjQUFrQyxPQUFPLFFBQVEsS0FBSyxDQUFDLE9BQU87UUFDcEUsTUFBTSxXQUFXLE1BQU0sS0FBSyxJQUFJLENBQUM7UUFDakMsSUFBSSxDQUFDLFNBQVMsTUFBTSxJQUFJLENBQUMsYUFBYTtZQUNsQztRQUNKLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0I7UUFDcEMsSUFBSSxXQUFXO1lBQ1gsTUFBTSxRQUFRLE1BQU0sS0FBSyxRQUFRLENBQUM7WUFDbEMsSUFBSSxNQUFNLElBQUksY0FBYyxNQUFNLENBQUM7WUFDbkMsTUFBTSxVQUFVO1lBQ2hCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxjQUFjLE1BQU0sQ0FBQztRQUN6QyxPQUFPO1lBQ0gsTUFBTSxPQUFPLE1BQU0sS0FBSyxJQUFJLENBQUM7WUFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7WUFDcEIsSUFBSSxDQUFDLElBQUksR0FBRztRQUNoQixDQUFDO0lBQ0w7QUFDSixDQUFDIn0=