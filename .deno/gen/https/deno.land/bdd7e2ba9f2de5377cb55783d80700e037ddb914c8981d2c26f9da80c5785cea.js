export const cors = (options)=>{
    const defaults = {
        origin: '*',
        allowMethods: [
            'GET',
            'HEAD',
            'PUT',
            'POST',
            'DELETE',
            'PATCH'
        ],
        allowHeaders: [],
        exposeHeaders: []
    };
    const opts = {
        ...defaults,
        ...options
    };
    const findAllowOrigin = ((optsOrigin)=>{
        if (typeof optsOrigin === 'string') {
            return ()=>optsOrigin;
        } else if (typeof optsOrigin === 'function') {
            return optsOrigin;
        } else {
            return (origin)=>optsOrigin.includes(origin) ? origin : optsOrigin[0];
        }
    })(opts.origin);
    return async (c, next)=>{
        function set(key, value) {
            c.res.headers.set(key, value);
        }
        const allowOrigin = findAllowOrigin(c.req.headers.get('origin') || '');
        if (allowOrigin) {
            set('Access-Control-Allow-Origin', allowOrigin);
        }
        // Suppose the server sends a response with an Access-Control-Allow-Origin value with an explicit origin (rather than the "*" wildcard).
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
        if (opts.origin !== '*') {
            set('Vary', 'Origin');
        }
        if (opts.credentials) {
            set('Access-Control-Allow-Credentials', 'true');
        }
        if (opts.exposeHeaders?.length) {
            set('Access-Control-Expose-Headers', opts.exposeHeaders.join(','));
        }
        if (c.req.method !== 'OPTIONS') {
            await next();
        } else {
            // Preflight
            if (opts.maxAge != null) {
                set('Access-Control-Max-Age', opts.maxAge.toString());
            }
            if (opts.allowMethods?.length) {
                set('Access-Control-Allow-Methods', opts.allowMethods.join(','));
            }
            let headers = opts.allowHeaders;
            if (!headers?.length) {
                const requestHeaders = c.req.headers.get('Access-Control-Request-Headers');
                if (requestHeaders) {
                    headers = requestHeaders.split(/\s*,\s*/);
                }
            }
            if (headers?.length) {
                set('Access-Control-Allow-Headers', headers.join(','));
                c.res.headers.append('Vary', 'Access-Control-Request-Headers');
            }
            c.res.headers.delete('Content-Length');
            c.res.headers.delete('Content-Type');
            return new Response(null, {
                headers: c.res.headers,
                status: 204,
                statusText: c.res.statusText
            });
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvbWlkZGxld2FyZS9jb3JzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi8uLi90eXBlcy50cydcblxudHlwZSBDT1JTT3B0aW9ucyA9IHtcbiAgb3JpZ2luOiBzdHJpbmcgfCBzdHJpbmdbXSB8ICgob3JpZ2luOiBzdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwpXG4gIGFsbG93TWV0aG9kcz86IHN0cmluZ1tdXG4gIGFsbG93SGVhZGVycz86IHN0cmluZ1tdXG4gIG1heEFnZT86IG51bWJlclxuICBjcmVkZW50aWFscz86IGJvb2xlYW5cbiAgZXhwb3NlSGVhZGVycz86IHN0cmluZ1tdXG59XG5cbmV4cG9ydCBjb25zdCBjb3JzID0gKG9wdGlvbnM/OiBDT1JTT3B0aW9ucyk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgY29uc3QgZGVmYXVsdHM6IENPUlNPcHRpb25zID0ge1xuICAgIG9yaWdpbjogJyonLFxuICAgIGFsbG93TWV0aG9kczogWydHRVQnLCAnSEVBRCcsICdQVVQnLCAnUE9TVCcsICdERUxFVEUnLCAnUEFUQ0gnXSxcbiAgICBhbGxvd0hlYWRlcnM6IFtdLFxuICAgIGV4cG9zZUhlYWRlcnM6IFtdLFxuICB9XG4gIGNvbnN0IG9wdHMgPSB7XG4gICAgLi4uZGVmYXVsdHMsXG4gICAgLi4ub3B0aW9ucyxcbiAgfVxuXG4gIGNvbnN0IGZpbmRBbGxvd09yaWdpbiA9ICgob3B0c09yaWdpbikgPT4ge1xuICAgIGlmICh0eXBlb2Ygb3B0c09yaWdpbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiAoKSA9PiBvcHRzT3JpZ2luXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0c09yaWdpbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG9wdHNPcmlnaW5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChvcmlnaW46IHN0cmluZykgPT4gKG9wdHNPcmlnaW4uaW5jbHVkZXMob3JpZ2luKSA/IG9yaWdpbiA6IG9wdHNPcmlnaW5bMF0pXG4gICAgfVxuICB9KShvcHRzLm9yaWdpbilcblxuICByZXR1cm4gYXN5bmMgKGMsIG5leHQpID0+IHtcbiAgICBmdW5jdGlvbiBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgIGMucmVzLmhlYWRlcnMuc2V0KGtleSwgdmFsdWUpXG4gICAgfVxuXG4gICAgY29uc3QgYWxsb3dPcmlnaW4gPSBmaW5kQWxsb3dPcmlnaW4oYy5yZXEuaGVhZGVycy5nZXQoJ29yaWdpbicpIHx8ICcnKVxuICAgIGlmIChhbGxvd09yaWdpbikge1xuICAgICAgc2V0KCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBhbGxvd09yaWdpbilcbiAgICB9XG5cbiAgICAvLyBTdXBwb3NlIHRoZSBzZXJ2ZXIgc2VuZHMgYSByZXNwb25zZSB3aXRoIGFuIEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiB2YWx1ZSB3aXRoIGFuIGV4cGxpY2l0IG9yaWdpbiAocmF0aGVyIHRoYW4gdGhlIFwiKlwiIHdpbGRjYXJkKS5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVFRQL0hlYWRlcnMvQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXG4gICAgaWYgKG9wdHMub3JpZ2luICE9PSAnKicpIHtcbiAgICAgIHNldCgnVmFyeScsICdPcmlnaW4nKVxuICAgIH1cblxuICAgIGlmIChvcHRzLmNyZWRlbnRpYWxzKSB7XG4gICAgICBzZXQoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKVxuICAgIH1cblxuICAgIGlmIChvcHRzLmV4cG9zZUhlYWRlcnM/Lmxlbmd0aCkge1xuICAgICAgc2V0KCdBY2Nlc3MtQ29udHJvbC1FeHBvc2UtSGVhZGVycycsIG9wdHMuZXhwb3NlSGVhZGVycy5qb2luKCcsJykpXG4gICAgfVxuXG4gICAgaWYgKGMucmVxLm1ldGhvZCAhPT0gJ09QVElPTlMnKSB7XG4gICAgICBhd2FpdCBuZXh0KClcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUHJlZmxpZ2h0XG5cbiAgICAgIGlmIChvcHRzLm1heEFnZSAhPSBudWxsKSB7XG4gICAgICAgIHNldCgnQWNjZXNzLUNvbnRyb2wtTWF4LUFnZScsIG9wdHMubWF4QWdlLnRvU3RyaW5nKCkpXG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRzLmFsbG93TWV0aG9kcz8ubGVuZ3RoKSB7XG4gICAgICAgIHNldCgnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsIG9wdHMuYWxsb3dNZXRob2RzLmpvaW4oJywnKSlcbiAgICAgIH1cblxuICAgICAgbGV0IGhlYWRlcnMgPSBvcHRzLmFsbG93SGVhZGVyc1xuICAgICAgaWYgKCFoZWFkZXJzPy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdEhlYWRlcnMgPSBjLnJlcS5oZWFkZXJzLmdldCgnQWNjZXNzLUNvbnRyb2wtUmVxdWVzdC1IZWFkZXJzJylcbiAgICAgICAgaWYgKHJlcXVlc3RIZWFkZXJzKSB7XG4gICAgICAgICAgaGVhZGVycyA9IHJlcXVlc3RIZWFkZXJzLnNwbGl0KC9cXHMqLFxccyovKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaGVhZGVycz8ubGVuZ3RoKSB7XG4gICAgICAgIHNldCgnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsIGhlYWRlcnMuam9pbignLCcpKVxuICAgICAgICBjLnJlcy5oZWFkZXJzLmFwcGVuZCgnVmFyeScsICdBY2Nlc3MtQ29udHJvbC1SZXF1ZXN0LUhlYWRlcnMnKVxuICAgICAgfVxuXG4gICAgICBjLnJlcy5oZWFkZXJzLmRlbGV0ZSgnQ29udGVudC1MZW5ndGgnKVxuICAgICAgYy5yZXMuaGVhZGVycy5kZWxldGUoJ0NvbnRlbnQtVHlwZScpXG5cbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge1xuICAgICAgICBoZWFkZXJzOiBjLnJlcy5oZWFkZXJzLFxuICAgICAgICBzdGF0dXM6IDIwNCxcbiAgICAgICAgc3RhdHVzVGV4dDogYy5yZXMuc3RhdHVzVGV4dCxcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBV0EsT0FBTyxNQUFNLE9BQU8sQ0FBQyxVQUE2QztJQUNoRSxNQUFNLFdBQXdCO1FBQzVCLFFBQVE7UUFDUixjQUFjO1lBQUM7WUFBTztZQUFRO1lBQU87WUFBUTtZQUFVO1NBQVE7UUFDL0QsY0FBYyxFQUFFO1FBQ2hCLGVBQWUsRUFBRTtJQUNuQjtJQUNBLE1BQU0sT0FBTztRQUNYLEdBQUcsUUFBUTtRQUNYLEdBQUcsT0FBTztJQUNaO0lBRUEsTUFBTSxrQkFBa0IsQUFBQyxDQUFBLENBQUMsYUFBZTtRQUN2QyxJQUFJLE9BQU8sZUFBZSxVQUFVO1lBQ2xDLE9BQU8sSUFBTTtRQUNmLE9BQU8sSUFBSSxPQUFPLGVBQWUsWUFBWTtZQUMzQyxPQUFPO1FBQ1QsT0FBTztZQUNMLE9BQU8sQ0FBQyxTQUFvQixXQUFXLFFBQVEsQ0FBQyxVQUFVLFNBQVMsVUFBVSxDQUFDLEVBQUU7UUFDbEYsQ0FBQztJQUNILENBQUEsRUFBRyxLQUFLLE1BQU07SUFFZCxPQUFPLE9BQU8sR0FBRyxPQUFTO1FBQ3hCLFNBQVMsSUFBSSxHQUFXLEVBQUUsS0FBYSxFQUFFO1lBQ3ZDLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSztRQUN6QjtRQUVBLE1BQU0sY0FBYyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhO1FBQ25FLElBQUksYUFBYTtZQUNmLElBQUksK0JBQStCO1FBQ3JDLENBQUM7UUFFRCx3SUFBd0k7UUFDeEksd0ZBQXdGO1FBQ3hGLElBQUksS0FBSyxNQUFNLEtBQUssS0FBSztZQUN2QixJQUFJLFFBQVE7UUFDZCxDQUFDO1FBRUQsSUFBSSxLQUFLLFdBQVcsRUFBRTtZQUNwQixJQUFJLG9DQUFvQztRQUMxQyxDQUFDO1FBRUQsSUFBSSxLQUFLLGFBQWEsRUFBRSxRQUFRO1lBQzlCLElBQUksaUNBQWlDLEtBQUssYUFBYSxDQUFDLElBQUksQ0FBQztRQUMvRCxDQUFDO1FBRUQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEtBQUssV0FBVztZQUM5QixNQUFNO1FBQ1IsT0FBTztZQUNMLFlBQVk7WUFFWixJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksRUFBRTtnQkFDdkIsSUFBSSwwQkFBMEIsS0FBSyxNQUFNLENBQUMsUUFBUTtZQUNwRCxDQUFDO1lBRUQsSUFBSSxLQUFLLFlBQVksRUFBRSxRQUFRO2dCQUM3QixJQUFJLGdDQUFnQyxLQUFLLFlBQVksQ0FBQyxJQUFJLENBQUM7WUFDN0QsQ0FBQztZQUVELElBQUksVUFBVSxLQUFLLFlBQVk7WUFDL0IsSUFBSSxDQUFDLFNBQVMsUUFBUTtnQkFDcEIsTUFBTSxpQkFBaUIsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDekMsSUFBSSxnQkFBZ0I7b0JBQ2xCLFVBQVUsZUFBZSxLQUFLLENBQUM7Z0JBQ2pDLENBQUM7WUFDSCxDQUFDO1lBQ0QsSUFBSSxTQUFTLFFBQVE7Z0JBQ25CLElBQUksZ0NBQWdDLFFBQVEsSUFBSSxDQUFDO2dCQUNqRCxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDL0IsQ0FBQztZQUVELEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDckIsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUVyQixPQUFPLElBQUksU0FBUyxJQUFJLEVBQUU7Z0JBQ3hCLFNBQVMsRUFBRSxHQUFHLENBQUMsT0FBTztnQkFDdEIsUUFBUTtnQkFDUixZQUFZLEVBQUUsR0FBRyxDQUFDLFVBQVU7WUFDOUI7UUFDRixDQUFDO0lBQ0g7QUFDRixFQUFDIn0=