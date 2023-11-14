import { parse, parseSigned, serialize, serializeSigned } from '../../utils/cookie.ts';
export const getCookie = (c, key)=>{
    const cookie = c.req.raw.headers.get('Cookie');
    if (typeof key === 'string') {
        if (!cookie) return undefined;
        const obj = parse(cookie, key);
        return obj[key];
    }
    if (!cookie) return {};
    const obj = parse(cookie);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return obj;
};
export const getSignedCookie = async (c, secret, key)=>{
    const cookie = c.req.raw.headers.get('Cookie');
    if (typeof key === 'string') {
        if (!cookie) return undefined;
        const obj = await parseSigned(cookie, secret, key);
        return obj[key];
    }
    if (!cookie) return {};
    const obj = await parseSigned(cookie, secret);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return obj;
};
export const setCookie = (c, name, value, opt)=>{
    const cookie = serialize(name, value, opt);
    c.header('set-cookie', cookie, {
        append: true
    });
};
export const setSignedCookie = async (c, name, value, secret, opt)=>{
    const cookie = await serializeSigned(name, value, secret, opt);
    c.header('set-cookie', cookie, {
        append: true
    });
};
export const deleteCookie = (c, name, opt)=>{
    setCookie(c, name, '', {
        ...opt,
        maxAge: 0
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL2hlbHBlci9jb29raWUvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29udGV4dC50cydcbmltcG9ydCB7IHBhcnNlLCBwYXJzZVNpZ25lZCwgc2VyaWFsaXplLCBzZXJpYWxpemVTaWduZWQgfSBmcm9tICcuLi8uLi91dGlscy9jb29raWUudHMnXG5pbXBvcnQgdHlwZSB7IENvb2tpZU9wdGlvbnMsIENvb2tpZSwgU2lnbmVkQ29va2llIH0gZnJvbSAnLi4vLi4vdXRpbHMvY29va2llLnRzJ1xuXG5pbnRlcmZhY2UgR2V0Q29va2llIHtcbiAgKGM6IENvbnRleHQsIGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIChjOiBDb250ZXh0KTogQ29va2llXG59XG5cbmludGVyZmFjZSBHZXRTaWduZWRDb29raWUge1xuICAoYzogQ29udGV4dCwgc2VjcmV0OiBzdHJpbmcgfCBCdWZmZXJTb3VyY2UsIGtleTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQgfCBmYWxzZT5cbiAgKGM6IENvbnRleHQsIHNlY3JldDogc3RyaW5nKTogUHJvbWlzZTxTaWduZWRDb29raWU+XG59XG5cbmV4cG9ydCBjb25zdCBnZXRDb29raWU6IEdldENvb2tpZSA9IChjLCBrZXk/KSA9PiB7XG4gIGNvbnN0IGNvb2tpZSA9IGMucmVxLnJhdy5oZWFkZXJzLmdldCgnQ29va2llJylcbiAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKCFjb29raWUpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBvYmogPSBwYXJzZShjb29raWUsIGtleSlcbiAgICByZXR1cm4gb2JqW2tleV1cbiAgfVxuICBpZiAoIWNvb2tpZSkgcmV0dXJuIHt9XG4gIGNvbnN0IG9iaiA9IHBhcnNlKGNvb2tpZSlcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgcmV0dXJuIG9iaiBhcyBhbnlcbn1cblxuZXhwb3J0IGNvbnN0IGdldFNpZ25lZENvb2tpZTogR2V0U2lnbmVkQ29va2llID0gYXN5bmMgKGMsIHNlY3JldCwga2V5PykgPT4ge1xuICBjb25zdCBjb29raWUgPSBjLnJlcS5yYXcuaGVhZGVycy5nZXQoJ0Nvb2tpZScpXG4gIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgIGlmICghY29va2llKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3Qgb2JqID0gYXdhaXQgcGFyc2VTaWduZWQoY29va2llLCBzZWNyZXQsIGtleSlcbiAgICByZXR1cm4gb2JqW2tleV1cbiAgfVxuICBpZiAoIWNvb2tpZSkgcmV0dXJuIHt9XG4gIGNvbnN0IG9iaiA9IGF3YWl0IHBhcnNlU2lnbmVkKGNvb2tpZSwgc2VjcmV0KVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICByZXR1cm4gb2JqIGFzIGFueVxufVxuXG5leHBvcnQgY29uc3Qgc2V0Q29va2llID0gKGM6IENvbnRleHQsIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0PzogQ29va2llT3B0aW9ucyk6IHZvaWQgPT4ge1xuICBjb25zdCBjb29raWUgPSBzZXJpYWxpemUobmFtZSwgdmFsdWUsIG9wdClcbiAgYy5oZWFkZXIoJ3NldC1jb29raWUnLCBjb29raWUsIHsgYXBwZW5kOiB0cnVlIH0pXG59XG5cbmV4cG9ydCBjb25zdCBzZXRTaWduZWRDb29raWUgPSBhc3luYyAoXG4gIGM6IENvbnRleHQsXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IHN0cmluZyxcbiAgc2VjcmV0OiBzdHJpbmcgfCBCdWZmZXJTb3VyY2UsXG4gIG9wdD86IENvb2tpZU9wdGlvbnNcbik6IFByb21pc2U8dm9pZD4gPT4ge1xuICBjb25zdCBjb29raWUgPSBhd2FpdCBzZXJpYWxpemVTaWduZWQobmFtZSwgdmFsdWUsIHNlY3JldCwgb3B0KVxuICBjLmhlYWRlcignc2V0LWNvb2tpZScsIGNvb2tpZSwgeyBhcHBlbmQ6IHRydWUgfSlcbn1cblxuZXhwb3J0IGNvbnN0IGRlbGV0ZUNvb2tpZSA9IChjOiBDb250ZXh0LCBuYW1lOiBzdHJpbmcsIG9wdD86IENvb2tpZU9wdGlvbnMpOiB2b2lkID0+IHtcbiAgc2V0Q29va2llKGMsIG5hbWUsICcnLCB7IC4uLm9wdCwgbWF4QWdlOiAwIH0pXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBUyxLQUFLLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxlQUFlLFFBQVEsd0JBQXVCO0FBYXRGLE9BQU8sTUFBTSxZQUF1QixDQUFDLEdBQUcsTUFBUztJQUMvQyxNQUFNLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7SUFDckMsSUFBSSxPQUFPLFFBQVEsVUFBVTtRQUMzQixJQUFJLENBQUMsUUFBUSxPQUFPO1FBQ3BCLE1BQU0sTUFBTSxNQUFNLFFBQVE7UUFDMUIsT0FBTyxHQUFHLENBQUMsSUFBSTtJQUNqQixDQUFDO0lBQ0QsSUFBSSxDQUFDLFFBQVEsT0FBTyxDQUFDO0lBQ3JCLE1BQU0sTUFBTSxNQUFNO0lBQ2xCLDhEQUE4RDtJQUM5RCxPQUFPO0FBQ1QsRUFBQztBQUVELE9BQU8sTUFBTSxrQkFBbUMsT0FBTyxHQUFHLFFBQVEsTUFBUztJQUN6RSxNQUFNLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7SUFDckMsSUFBSSxPQUFPLFFBQVEsVUFBVTtRQUMzQixJQUFJLENBQUMsUUFBUSxPQUFPO1FBQ3BCLE1BQU0sTUFBTSxNQUFNLFlBQVksUUFBUSxRQUFRO1FBQzlDLE9BQU8sR0FBRyxDQUFDLElBQUk7SUFDakIsQ0FBQztJQUNELElBQUksQ0FBQyxRQUFRLE9BQU8sQ0FBQztJQUNyQixNQUFNLE1BQU0sTUFBTSxZQUFZLFFBQVE7SUFDdEMsOERBQThEO0lBQzlELE9BQU87QUFDVCxFQUFDO0FBRUQsT0FBTyxNQUFNLFlBQVksQ0FBQyxHQUFZLE1BQWMsT0FBZSxNQUE4QjtJQUMvRixNQUFNLFNBQVMsVUFBVSxNQUFNLE9BQU87SUFDdEMsRUFBRSxNQUFNLENBQUMsY0FBYyxRQUFRO1FBQUUsUUFBUSxJQUFJO0lBQUM7QUFDaEQsRUFBQztBQUVELE9BQU8sTUFBTSxrQkFBa0IsT0FDN0IsR0FDQSxNQUNBLE9BQ0EsUUFDQSxNQUNrQjtJQUNsQixNQUFNLFNBQVMsTUFBTSxnQkFBZ0IsTUFBTSxPQUFPLFFBQVE7SUFDMUQsRUFBRSxNQUFNLENBQUMsY0FBYyxRQUFRO1FBQUUsUUFBUSxJQUFJO0lBQUM7QUFDaEQsRUFBQztBQUVELE9BQU8sTUFBTSxlQUFlLENBQUMsR0FBWSxNQUFjLE1BQThCO0lBQ25GLFVBQVUsR0FBRyxNQUFNLElBQUk7UUFBRSxHQUFHLEdBQUc7UUFBRSxRQUFRO0lBQUU7QUFDN0MsRUFBQyJ9