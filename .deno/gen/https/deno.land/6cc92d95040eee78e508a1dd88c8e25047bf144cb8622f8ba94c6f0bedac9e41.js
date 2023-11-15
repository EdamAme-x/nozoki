export const prettyJSON = (options = {
    space: 2
})=>{
    return async (c, next)=>{
        const pretty = c.req.query('pretty') || c.req.query('pretty') === '' ? true : false;
        c.pretty(pretty, options.space);
        await next();
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvbWlkZGxld2FyZS9wcmV0dHktanNvbi9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5cbnR5cGUgcHJldHR5T3B0aW9ucyA9IHtcbiAgc3BhY2U6IG51bWJlclxufVxuXG5leHBvcnQgY29uc3QgcHJldHR5SlNPTiA9IChvcHRpb25zOiBwcmV0dHlPcHRpb25zID0geyBzcGFjZTogMiB9KTogTWlkZGxld2FyZUhhbmRsZXIgPT4ge1xuICByZXR1cm4gYXN5bmMgKGMsIG5leHQpID0+IHtcbiAgICBjb25zdCBwcmV0dHkgPSBjLnJlcS5xdWVyeSgncHJldHR5JykgfHwgYy5yZXEucXVlcnkoJ3ByZXR0eScpID09PSAnJyA/IHRydWUgOiBmYWxzZVxuICAgIGMucHJldHR5KHByZXR0eSwgb3B0aW9ucy5zcGFjZSlcbiAgICBhd2FpdCBuZXh0KClcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE9BQU8sTUFBTSxhQUFhLENBQUMsVUFBeUI7SUFBRSxPQUFPO0FBQUUsQ0FBQyxHQUF3QjtJQUN0RixPQUFPLE9BQU8sR0FBRyxPQUFTO1FBQ3hCLE1BQU0sU0FBUyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxLQUFLLElBQUksR0FBRyxLQUFLO1FBQ25GLEVBQUUsTUFBTSxDQUFDLFFBQVEsUUFBUSxLQUFLO1FBQzlCLE1BQU07SUFDUjtBQUNGLEVBQUMifQ==