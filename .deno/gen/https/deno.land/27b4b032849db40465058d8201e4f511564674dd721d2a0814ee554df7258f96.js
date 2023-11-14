export class StreamingApi {
    writer;
    encoder;
    writable;
    constructor(writable){
        this.writable = writable;
        this.writer = writable.getWriter();
        this.encoder = new TextEncoder();
    }
    async write(input) {
        try {
            if (typeof input === 'string') {
                input = this.encoder.encode(input);
            }
            await this.writer.write(input);
        } catch (e) {
        // Do nothing. If you want to handle errors, create a stream by yourself.
        }
        return this;
    }
    async writeln(input) {
        await this.write(input + '\n');
        return this;
    }
    sleep(ms) {
        return new Promise((res)=>setTimeout(res, ms));
    }
    async close() {
        try {
            await this.writer.close();
        } catch (e) {
        // Do nothing. If you want to handle errors, create a stream by yourself.
        }
    }
    async pipe(body) {
        this.writer.releaseLock();
        await body.pipeTo(this.writable, {
            preventClose: true
        });
        this.writer = this.writable.getWriter();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL3V0aWxzL3N0cmVhbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgU3RyZWFtaW5nQXBpIHtcbiAgcHJpdmF0ZSB3cml0ZXI6IFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlcjxVaW50OEFycmF5PlxuICBwcml2YXRlIGVuY29kZXI6IFRleHRFbmNvZGVyXG4gIHByaXZhdGUgd3JpdGFibGU6IFdyaXRhYmxlU3RyZWFtXG5cbiAgY29uc3RydWN0b3Iod3JpdGFibGU6IFdyaXRhYmxlU3RyZWFtKSB7XG4gICAgdGhpcy53cml0YWJsZSA9IHdyaXRhYmxlXG4gICAgdGhpcy53cml0ZXIgPSB3cml0YWJsZS5nZXRXcml0ZXIoKVxuICAgIHRoaXMuZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpXG4gIH1cblxuICBhc3luYyB3cml0ZShpbnB1dDogVWludDhBcnJheSB8IHN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBpbnB1dCA9IHRoaXMuZW5jb2Rlci5lbmNvZGUoaW5wdXQpXG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLndyaXRlci53cml0ZShpbnB1dClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBEbyBub3RoaW5nLiBJZiB5b3Ugd2FudCB0byBoYW5kbGUgZXJyb3JzLCBjcmVhdGUgYSBzdHJlYW0gYnkgeW91cnNlbGYuXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhc3luYyB3cml0ZWxuKGlucHV0OiBzdHJpbmcpIHtcbiAgICBhd2FpdCB0aGlzLndyaXRlKGlucHV0ICsgJ1xcbicpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNsZWVwKG1zOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcykgPT4gc2V0VGltZW91dChyZXMsIG1zKSlcbiAgfVxuXG4gIGFzeW5jIGNsb3NlKCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLndyaXRlci5jbG9zZSgpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gRG8gbm90aGluZy4gSWYgeW91IHdhbnQgdG8gaGFuZGxlIGVycm9ycywgY3JlYXRlIGEgc3RyZWFtIGJ5IHlvdXJzZWxmLlxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHBpcGUoYm9keTogUmVhZGFibGVTdHJlYW0pIHtcbiAgICB0aGlzLndyaXRlci5yZWxlYXNlTG9jaygpXG4gICAgYXdhaXQgYm9keS5waXBlVG8odGhpcy53cml0YWJsZSwgeyBwcmV2ZW50Q2xvc2U6IHRydWUgfSlcbiAgICB0aGlzLndyaXRlciA9IHRoaXMud3JpdGFibGUuZ2V0V3JpdGVyKClcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTTtJQUNILE9BQStDO0lBQy9DLFFBQW9CO0lBQ3BCLFNBQXdCO0lBRWhDLFlBQVksUUFBd0IsQ0FBRTtRQUNwQyxJQUFJLENBQUMsUUFBUSxHQUFHO1FBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxTQUFTO1FBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSTtJQUNyQjtJQUVBLE1BQU0sTUFBTSxLQUEwQixFQUFFO1FBQ3RDLElBQUk7WUFDRixJQUFJLE9BQU8sVUFBVSxVQUFVO2dCQUM3QixRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQzlCLENBQUM7WUFDRCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzFCLEVBQUUsT0FBTyxHQUFHO1FBQ1YseUVBQXlFO1FBQzNFO1FBQ0EsT0FBTyxJQUFJO0lBQ2I7SUFFQSxNQUFNLFFBQVEsS0FBYSxFQUFFO1FBQzNCLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRO1FBQ3pCLE9BQU8sSUFBSTtJQUNiO0lBRUEsTUFBTSxFQUFVLEVBQUU7UUFDaEIsT0FBTyxJQUFJLFFBQVEsQ0FBQyxNQUFRLFdBQVcsS0FBSztJQUM5QztJQUVBLE1BQU0sUUFBUTtRQUNaLElBQUk7WUFDRixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztRQUN6QixFQUFFLE9BQU8sR0FBRztRQUNWLHlFQUF5RTtRQUMzRTtJQUNGO0lBRUEsTUFBTSxLQUFLLElBQW9CLEVBQUU7UUFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXO1FBQ3ZCLE1BQU0sS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUFFLGNBQWMsSUFBSTtRQUFDO1FBQ3RELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTO0lBQ3ZDO0FBQ0YsQ0FBQyJ9