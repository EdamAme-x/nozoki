export const compress = (options)=>{
    return async (ctx, next)=>{
        await next();
        const accepted = ctx.req.headers.get('Accept-Encoding');
        const pattern = options?.encoding ?? /gzip|deflate/;
        const match = accepted?.match(pattern);
        if (!accepted || !match || !ctx.res.body) {
            return;
        }
        const encoding = match[0];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const stream = new CompressionStream(encoding);
        ctx.res = new Response(ctx.res.body.pipeThrough(stream), ctx.res);
        ctx.res.headers.set('Content-Encoding', encoding);
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvbWlkZGxld2FyZS9jb21wcmVzcy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5cbnR5cGUgRW5jb2RpbmdUeXBlID0gJ2d6aXAnIHwgJ2RlZmxhdGUnXG5cbmludGVyZmFjZSBDb21wcmVzc2lvbk9wdGlvbnMge1xuICBlbmNvZGluZz86IEVuY29kaW5nVHlwZVxufVxuXG5leHBvcnQgY29uc3QgY29tcHJlc3MgPSAob3B0aW9ucz86IENvbXByZXNzaW9uT3B0aW9ucyk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgcmV0dXJuIGFzeW5jIChjdHgsIG5leHQpID0+IHtcbiAgICBhd2FpdCBuZXh0KClcbiAgICBjb25zdCBhY2NlcHRlZCA9IGN0eC5yZXEuaGVhZGVycy5nZXQoJ0FjY2VwdC1FbmNvZGluZycpXG4gICAgY29uc3QgcGF0dGVybiA9IG9wdGlvbnM/LmVuY29kaW5nID8/IC9nemlwfGRlZmxhdGUvXG4gICAgY29uc3QgbWF0Y2ggPSBhY2NlcHRlZD8ubWF0Y2gocGF0dGVybilcbiAgICBpZiAoIWFjY2VwdGVkIHx8ICFtYXRjaCB8fCAhY3R4LnJlcy5ib2R5KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgZW5jb2RpbmcgPSBtYXRjaFswXVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3Qgc3RyZWFtID0gbmV3IENvbXByZXNzaW9uU3RyZWFtKGVuY29kaW5nIGFzIEVuY29kaW5nVHlwZSlcbiAgICBjdHgucmVzID0gbmV3IFJlc3BvbnNlKGN0eC5yZXMuYm9keS5waXBlVGhyb3VnaChzdHJlYW0pLCBjdHgucmVzKVxuICAgIGN0eC5yZXMuaGVhZGVycy5zZXQoJ0NvbnRlbnQtRW5jb2RpbmcnLCBlbmNvZGluZylcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBLE9BQU8sTUFBTSxXQUFXLENBQUMsVUFBb0Q7SUFDM0UsT0FBTyxPQUFPLEtBQUssT0FBUztRQUMxQixNQUFNO1FBQ04sTUFBTSxXQUFXLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDckMsTUFBTSxVQUFVLFNBQVMsWUFBWTtRQUNyQyxNQUFNLFFBQVEsVUFBVSxNQUFNO1FBQzlCLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksRUFBRTtZQUN4QztRQUNGLENBQUM7UUFDRCxNQUFNLFdBQVcsS0FBSyxDQUFDLEVBQUU7UUFDekIsNkRBQTZEO1FBQzdELGFBQWE7UUFDYixNQUFNLFNBQVMsSUFBSSxrQkFBa0I7UUFDckMsSUFBSSxHQUFHLEdBQUcsSUFBSSxTQUFTLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxJQUFJLEdBQUc7UUFDaEUsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7SUFDMUM7QUFDRixFQUFDIn0=