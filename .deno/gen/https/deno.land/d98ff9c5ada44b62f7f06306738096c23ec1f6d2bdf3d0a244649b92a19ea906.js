const ENCODING_TYPES = [
    'gzip',
    'deflate'
];
export const compress = (options)=>{
    return async (ctx, next)=>{
        await next();
        const accepted = ctx.req.headers.get('Accept-Encoding');
        const encoding = options?.encoding ?? ENCODING_TYPES.find((encoding)=>accepted?.includes(encoding));
        if (!encoding || !ctx.res.body) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const stream = new CompressionStream(encoding);
        ctx.res = new Response(ctx.res.body.pipeThrough(stream), ctx.res);
        ctx.res.headers.delete('Content-Length');
        ctx.res.headers.set('Content-Encoding', encoding);
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvY29tcHJlc3MvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBNaWRkbGV3YXJlSGFuZGxlciB9IGZyb20gJy4uLy4uL3R5cGVzLnRzJ1xuXG5jb25zdCBFTkNPRElOR19UWVBFUyA9IFsnZ3ppcCcsICdkZWZsYXRlJ10gYXMgY29uc3RcblxuaW50ZXJmYWNlIENvbXByZXNzaW9uT3B0aW9ucyB7XG4gIGVuY29kaW5nPzogdHlwZW9mIEVOQ09ESU5HX1RZUEVTW251bWJlcl1cbn1cblxuZXhwb3J0IGNvbnN0IGNvbXByZXNzID0gKG9wdGlvbnM/OiBDb21wcmVzc2lvbk9wdGlvbnMpOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIHJldHVybiBhc3luYyAoY3R4LCBuZXh0KSA9PiB7XG4gICAgYXdhaXQgbmV4dCgpXG4gICAgY29uc3QgYWNjZXB0ZWQgPSBjdHgucmVxLmhlYWRlcnMuZ2V0KCdBY2NlcHQtRW5jb2RpbmcnKVxuICAgIGNvbnN0IGVuY29kaW5nID1cbiAgICAgIG9wdGlvbnM/LmVuY29kaW5nID8/IEVOQ09ESU5HX1RZUEVTLmZpbmQoKGVuY29kaW5nKSA9PiBhY2NlcHRlZD8uaW5jbHVkZXMoZW5jb2RpbmcpKVxuICAgIGlmICghZW5jb2RpbmcgfHwgIWN0eC5yZXMuYm9keSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3Qgc3RyZWFtID0gbmV3IENvbXByZXNzaW9uU3RyZWFtKGVuY29kaW5nKVxuICAgIGN0eC5yZXMgPSBuZXcgUmVzcG9uc2UoY3R4LnJlcy5ib2R5LnBpcGVUaHJvdWdoKHN0cmVhbSksIGN0eC5yZXMpXG4gICAgY3R4LnJlcy5oZWFkZXJzLmRlbGV0ZSgnQ29udGVudC1MZW5ndGgnKVxuICAgIGN0eC5yZXMuaGVhZGVycy5zZXQoJ0NvbnRlbnQtRW5jb2RpbmcnLCBlbmNvZGluZylcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0saUJBQWlCO0lBQUM7SUFBUTtDQUFVO0FBTTFDLE9BQU8sTUFBTSxXQUFXLENBQUMsVUFBb0Q7SUFDM0UsT0FBTyxPQUFPLEtBQUssT0FBUztRQUMxQixNQUFNO1FBQ04sTUFBTSxXQUFXLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDckMsTUFBTSxXQUNKLFNBQVMsWUFBWSxlQUFlLElBQUksQ0FBQyxDQUFDLFdBQWEsVUFBVSxTQUFTO1FBQzVFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO1lBQzlCO1FBQ0YsQ0FBQztRQUNELDZEQUE2RDtRQUM3RCxhQUFhO1FBQ2IsTUFBTSxTQUFTLElBQUksa0JBQWtCO1FBQ3JDLElBQUksR0FBRyxHQUFHLElBQUksU0FBUyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxHQUFHO1FBQ2hFLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDdkIsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7SUFDMUM7QUFDRixFQUFDIn0=