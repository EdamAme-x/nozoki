export class HTTPException extends Error {
    res;
    status;
    constructor(status = 500, options){
        super(options?.message);
        this.res = options?.res;
        this.status = status;
    }
    getResponse() {
        if (this.res) {
            return this.res;
        }
        return new Response(this.message, {
            status: this.status
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvaHR0cC1leGNlcHRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBTdGF0dXNDb2RlIH0gZnJvbSAnLi91dGlscy9odHRwLXN0YXR1cy50cydcblxudHlwZSBIVFRQRXhjZXB0aW9uT3B0aW9ucyA9IHtcbiAgcmVzPzogUmVzcG9uc2VcbiAgbWVzc2FnZT86IHN0cmluZ1xufVxuXG5leHBvcnQgY2xhc3MgSFRUUEV4Y2VwdGlvbiBleHRlbmRzIEVycm9yIHtcbiAgcmVhZG9ubHkgcmVzPzogUmVzcG9uc2VcbiAgcmVhZG9ubHkgc3RhdHVzOiBTdGF0dXNDb2RlXG4gIGNvbnN0cnVjdG9yKHN0YXR1czogU3RhdHVzQ29kZSA9IDUwMCwgb3B0aW9ucz86IEhUVFBFeGNlcHRpb25PcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucz8ubWVzc2FnZSlcbiAgICB0aGlzLnJlcyA9IG9wdGlvbnM/LnJlc1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzXG4gIH1cbiAgZ2V0UmVzcG9uc2UoKTogUmVzcG9uc2Uge1xuICAgIGlmICh0aGlzLnJlcykge1xuICAgICAgcmV0dXJuIHRoaXMucmVzXG4gICAgfVxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5tZXNzYWdlLCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgIH0pXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQSxPQUFPLE1BQU0sc0JBQXNCO0lBQ3hCLElBQWM7SUFDZCxPQUFrQjtJQUMzQixZQUFZLFNBQXFCLEdBQUcsRUFBRSxPQUE4QixDQUFFO1FBQ3BFLEtBQUssQ0FBQyxTQUFTO1FBQ2YsSUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFTO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUc7SUFDaEI7SUFDQSxjQUF3QjtRQUN0QixJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDWixPQUFPLElBQUksQ0FBQyxHQUFHO1FBQ2pCLENBQUM7UUFDRCxPQUFPLElBQUksU0FBUyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hDLFFBQVEsSUFBSSxDQUFDLE1BQU07UUFDckI7SUFDRjtBQUNGLENBQUMifQ==