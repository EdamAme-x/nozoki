import { parse, serialize } from '../../utils/cookie.ts';
export const getCookie = (c, key)=>{
    const cookie = c.req.raw.headers.get('Cookie');
    if (typeof key === 'string') {
        if (!cookie) return undefined;
        const obj = parse(cookie);
        return obj[key];
    }
    if (!cookie) return {};
    const obj = parse(cookie);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return obj;
};
export const setCookie = (c, name, value, opt)=>{
    const cookie = serialize(name, value, opt);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvbWlkZGxld2FyZS9jb29raWUvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29udGV4dC50cydcbmltcG9ydCB7IHBhcnNlLCBzZXJpYWxpemUgfSBmcm9tICcuLi8uLi91dGlscy9jb29raWUudHMnXG5pbXBvcnQgdHlwZSB7IENvb2tpZU9wdGlvbnMsIENvb2tpZSB9IGZyb20gJy4uLy4uL3V0aWxzL2Nvb2tpZS50cydcblxuaW50ZXJmYWNlIEdldENvb2tpZSB7XG4gIChjOiBDb250ZXh0LCBrZXk6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICAoYzogQ29udGV4dCk6IENvb2tpZVxufVxuXG5leHBvcnQgY29uc3QgZ2V0Q29va2llOiBHZXRDb29raWUgPSAoYywga2V5PykgPT4ge1xuICBjb25zdCBjb29raWUgPSBjLnJlcS5yYXcuaGVhZGVycy5nZXQoJ0Nvb2tpZScpXG4gIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgIGlmICghY29va2llKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3Qgb2JqID0gcGFyc2UoY29va2llKVxuICAgIHJldHVybiBvYmpba2V5XVxuICB9XG4gIGlmICghY29va2llKSByZXR1cm4ge31cbiAgY29uc3Qgb2JqID0gcGFyc2UoY29va2llKVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICByZXR1cm4gb2JqIGFzIGFueVxufVxuXG5leHBvcnQgY29uc3Qgc2V0Q29va2llID0gKGM6IENvbnRleHQsIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0PzogQ29va2llT3B0aW9ucyk6IHZvaWQgPT4ge1xuICBjb25zdCBjb29raWUgPSBzZXJpYWxpemUobmFtZSwgdmFsdWUsIG9wdClcbiAgYy5oZWFkZXIoJ3NldC1jb29raWUnLCBjb29raWUsIHsgYXBwZW5kOiB0cnVlIH0pXG59XG5cbmV4cG9ydCBjb25zdCBkZWxldGVDb29raWUgPSAoYzogQ29udGV4dCwgbmFtZTogc3RyaW5nLCBvcHQ/OiBDb29raWVPcHRpb25zKTogdm9pZCA9PiB7XG4gIHNldENvb2tpZShjLCBuYW1lLCAnJywgeyAuLi5vcHQsIG1heEFnZTogMCB9KVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsS0FBSyxFQUFFLFNBQVMsUUFBUSx3QkFBdUI7QUFReEQsT0FBTyxNQUFNLFlBQXVCLENBQUMsR0FBRyxNQUFTO0lBQy9DLE1BQU0sU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUNyQyxJQUFJLE9BQU8sUUFBUSxVQUFVO1FBQzNCLElBQUksQ0FBQyxRQUFRLE9BQU87UUFDcEIsTUFBTSxNQUFNLE1BQU07UUFDbEIsT0FBTyxHQUFHLENBQUMsSUFBSTtJQUNqQixDQUFDO0lBQ0QsSUFBSSxDQUFDLFFBQVEsT0FBTyxDQUFDO0lBQ3JCLE1BQU0sTUFBTSxNQUFNO0lBQ2xCLDhEQUE4RDtJQUM5RCxPQUFPO0FBQ1QsRUFBQztBQUVELE9BQU8sTUFBTSxZQUFZLENBQUMsR0FBWSxNQUFjLE9BQWUsTUFBOEI7SUFDL0YsTUFBTSxTQUFTLFVBQVUsTUFBTSxPQUFPO0lBQ3RDLEVBQUUsTUFBTSxDQUFDLGNBQWMsUUFBUTtRQUFFLFFBQVEsSUFBSTtJQUFDO0FBQ2hELEVBQUM7QUFFRCxPQUFPLE1BQU0sZUFBZSxDQUFDLEdBQVksTUFBYyxNQUE4QjtJQUNuRixVQUFVLEdBQUcsTUFBTSxJQUFJO1FBQUUsR0FBRyxHQUFHO1FBQUUsUUFBUTtJQUFFO0FBQzdDLEVBQUMifQ==