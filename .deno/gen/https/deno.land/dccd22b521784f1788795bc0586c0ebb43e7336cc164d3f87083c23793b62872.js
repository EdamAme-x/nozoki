export const cache = (options)=>{
    if (options.wait === undefined) {
        options.wait = false;
    }
    const addHeader = (response)=>{
        if (options.cacheControl) response.headers.set('Cache-Control', options.cacheControl);
    };
    return async (c, next)=>{
        const key = c.req.url;
        const cache = await caches.open(options.cacheName);
        const response = await cache.match(key);
        if (!response) {
            await next();
            if (!c.res.ok) {
                return;
            }
            addHeader(c.res);
            const response = c.res.clone();
            if (options.wait) {
                await cache.put(key, response);
            } else {
                c.executionCtx.waitUntil(cache.put(key, response));
            }
        } else {
            return new Response(response.body, response);
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvY2FjaGUvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBNaWRkbGV3YXJlSGFuZGxlciB9IGZyb20gJy4uLy4uL3R5cGVzLnRzJ1xuXG5leHBvcnQgY29uc3QgY2FjaGUgPSAob3B0aW9uczoge1xuICBjYWNoZU5hbWU6IHN0cmluZ1xuICB3YWl0PzogYm9vbGVhblxuICBjYWNoZUNvbnRyb2w/OiBzdHJpbmdcbn0pOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIGlmIChvcHRpb25zLndhaXQgPT09IHVuZGVmaW5lZCkge1xuICAgIG9wdGlvbnMud2FpdCA9IGZhbHNlXG4gIH1cblxuICBjb25zdCBhZGRIZWFkZXIgPSAocmVzcG9uc2U6IFJlc3BvbnNlKSA9PiB7XG4gICAgaWYgKG9wdGlvbnMuY2FjaGVDb250cm9sKSByZXNwb25zZS5oZWFkZXJzLnNldCgnQ2FjaGUtQ29udHJvbCcsIG9wdGlvbnMuY2FjaGVDb250cm9sKVxuICB9XG5cbiAgcmV0dXJuIGFzeW5jIChjLCBuZXh0KSA9PiB7XG4gICAgY29uc3Qga2V5ID0gYy5yZXEudXJsXG4gICAgY29uc3QgY2FjaGUgPSBhd2FpdCBjYWNoZXMub3BlbihvcHRpb25zLmNhY2hlTmFtZSlcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNhY2hlLm1hdGNoKGtleSlcbiAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICBhd2FpdCBuZXh0KClcbiAgICAgIGlmICghYy5yZXMub2spIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBhZGRIZWFkZXIoYy5yZXMpXG4gICAgICBjb25zdCByZXNwb25zZSA9IGMucmVzLmNsb25lKClcbiAgICAgIGlmIChvcHRpb25zLndhaXQpIHtcbiAgICAgICAgYXdhaXQgY2FjaGUucHV0KGtleSwgcmVzcG9uc2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjLmV4ZWN1dGlvbkN0eC53YWl0VW50aWwoY2FjaGUucHV0KGtleSwgcmVzcG9uc2UpKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHJlc3BvbnNlLmJvZHksIHJlc3BvbnNlKVxuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sTUFBTSxRQUFRLENBQUMsVUFJRztJQUN2QixJQUFJLFFBQVEsSUFBSSxLQUFLLFdBQVc7UUFDOUIsUUFBUSxJQUFJLEdBQUcsS0FBSztJQUN0QixDQUFDO0lBRUQsTUFBTSxZQUFZLENBQUMsV0FBdUI7UUFDeEMsSUFBSSxRQUFRLFlBQVksRUFBRSxTQUFTLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLFFBQVEsWUFBWTtJQUN0RjtJQUVBLE9BQU8sT0FBTyxHQUFHLE9BQVM7UUFDeEIsTUFBTSxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUc7UUFDckIsTUFBTSxRQUFRLE1BQU0sT0FBTyxJQUFJLENBQUMsUUFBUSxTQUFTO1FBQ2pELE1BQU0sV0FBVyxNQUFNLE1BQU0sS0FBSyxDQUFDO1FBQ25DLElBQUksQ0FBQyxVQUFVO1lBQ2IsTUFBTTtZQUNOLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2I7WUFDRixDQUFDO1lBQ0QsVUFBVSxFQUFFLEdBQUc7WUFDZixNQUFNLFdBQVcsRUFBRSxHQUFHLENBQUMsS0FBSztZQUM1QixJQUFJLFFBQVEsSUFBSSxFQUFFO2dCQUNoQixNQUFNLE1BQU0sR0FBRyxDQUFDLEtBQUs7WUFDdkIsT0FBTztnQkFDTCxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSztZQUMxQyxDQUFDO1FBQ0gsT0FBTztZQUNMLE9BQU8sSUFBSSxTQUFTLFNBQVMsSUFBSSxFQUFFO1FBQ3JDLENBQUM7SUFDSDtBQUNGLEVBQUMifQ==