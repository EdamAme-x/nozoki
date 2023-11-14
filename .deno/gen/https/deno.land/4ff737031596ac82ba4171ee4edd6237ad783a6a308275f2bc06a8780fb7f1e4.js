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
        const allowOrigin = findAllowOrigin(c.req.header('origin') || '');
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
                const requestHeaders = c.req.header('Access-Control-Request-Headers');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvY29ycy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5cbnR5cGUgQ09SU09wdGlvbnMgPSB7XG4gIG9yaWdpbjogc3RyaW5nIHwgc3RyaW5nW10gfCAoKG9yaWdpbjogc3RyaW5nKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsKVxuICBhbGxvd01ldGhvZHM/OiBzdHJpbmdbXVxuICBhbGxvd0hlYWRlcnM/OiBzdHJpbmdbXVxuICBtYXhBZ2U/OiBudW1iZXJcbiAgY3JlZGVudGlhbHM/OiBib29sZWFuXG4gIGV4cG9zZUhlYWRlcnM/OiBzdHJpbmdbXVxufVxuXG5leHBvcnQgY29uc3QgY29ycyA9IChvcHRpb25zPzogQ09SU09wdGlvbnMpOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIGNvbnN0IGRlZmF1bHRzOiBDT1JTT3B0aW9ucyA9IHtcbiAgICBvcmlnaW46ICcqJyxcbiAgICBhbGxvd01ldGhvZHM6IFsnR0VUJywgJ0hFQUQnLCAnUFVUJywgJ1BPU1QnLCAnREVMRVRFJywgJ1BBVENIJ10sXG4gICAgYWxsb3dIZWFkZXJzOiBbXSxcbiAgICBleHBvc2VIZWFkZXJzOiBbXSxcbiAgfVxuICBjb25zdCBvcHRzID0ge1xuICAgIC4uLmRlZmF1bHRzLFxuICAgIC4uLm9wdGlvbnMsXG4gIH1cblxuICBjb25zdCBmaW5kQWxsb3dPcmlnaW4gPSAoKG9wdHNPcmlnaW4pID0+IHtcbiAgICBpZiAodHlwZW9mIG9wdHNPcmlnaW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gKCkgPT4gb3B0c09yaWdpblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdHNPcmlnaW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBvcHRzT3JpZ2luXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAob3JpZ2luOiBzdHJpbmcpID0+IChvcHRzT3JpZ2luLmluY2x1ZGVzKG9yaWdpbikgPyBvcmlnaW4gOiBvcHRzT3JpZ2luWzBdKVxuICAgIH1cbiAgfSkob3B0cy5vcmlnaW4pXG5cbiAgcmV0dXJuIGFzeW5jIChjLCBuZXh0KSA9PiB7XG4gICAgZnVuY3Rpb24gc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgICBjLnJlcy5oZWFkZXJzLnNldChrZXksIHZhbHVlKVxuICAgIH1cblxuICAgIGNvbnN0IGFsbG93T3JpZ2luID0gZmluZEFsbG93T3JpZ2luKGMucmVxLmhlYWRlcignb3JpZ2luJykgfHwgJycpXG4gICAgaWYgKGFsbG93T3JpZ2luKSB7XG4gICAgICBzZXQoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIGFsbG93T3JpZ2luKVxuICAgIH1cblxuICAgIC8vIFN1cHBvc2UgdGhlIHNlcnZlciBzZW5kcyBhIHJlc3BvbnNlIHdpdGggYW4gQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luIHZhbHVlIHdpdGggYW4gZXhwbGljaXQgb3JpZ2luIChyYXRoZXIgdGhhbiB0aGUgXCIqXCIgd2lsZGNhcmQpLlxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0hUVFAvSGVhZGVycy9BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cbiAgICBpZiAob3B0cy5vcmlnaW4gIT09ICcqJykge1xuICAgICAgc2V0KCdWYXJ5JywgJ09yaWdpbicpXG4gICAgfVxuXG4gICAgaWYgKG9wdHMuY3JlZGVudGlhbHMpIHtcbiAgICAgIHNldCgnQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpXG4gICAgfVxuXG4gICAgaWYgKG9wdHMuZXhwb3NlSGVhZGVycz8ubGVuZ3RoKSB7XG4gICAgICBzZXQoJ0FjY2Vzcy1Db250cm9sLUV4cG9zZS1IZWFkZXJzJywgb3B0cy5leHBvc2VIZWFkZXJzLmpvaW4oJywnKSlcbiAgICB9XG5cbiAgICBpZiAoYy5yZXEubWV0aG9kICE9PSAnT1BUSU9OUycpIHtcbiAgICAgIGF3YWl0IG5leHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBQcmVmbGlnaHRcblxuICAgICAgaWYgKG9wdHMubWF4QWdlICE9IG51bGwpIHtcbiAgICAgICAgc2V0KCdBY2Nlc3MtQ29udHJvbC1NYXgtQWdlJywgb3B0cy5tYXhBZ2UudG9TdHJpbmcoKSlcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMuYWxsb3dNZXRob2RzPy5sZW5ndGgpIHtcbiAgICAgICAgc2V0KCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgb3B0cy5hbGxvd01ldGhvZHMuam9pbignLCcpKVxuICAgICAgfVxuXG4gICAgICBsZXQgaGVhZGVycyA9IG9wdHMuYWxsb3dIZWFkZXJzXG4gICAgICBpZiAoIWhlYWRlcnM/Lmxlbmd0aCkge1xuICAgICAgICBjb25zdCByZXF1ZXN0SGVhZGVycyA9IGMucmVxLmhlYWRlcignQWNjZXNzLUNvbnRyb2wtUmVxdWVzdC1IZWFkZXJzJylcbiAgICAgICAgaWYgKHJlcXVlc3RIZWFkZXJzKSB7XG4gICAgICAgICAgaGVhZGVycyA9IHJlcXVlc3RIZWFkZXJzLnNwbGl0KC9cXHMqLFxccyovKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaGVhZGVycz8ubGVuZ3RoKSB7XG4gICAgICAgIHNldCgnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsIGhlYWRlcnMuam9pbignLCcpKVxuICAgICAgICBjLnJlcy5oZWFkZXJzLmFwcGVuZCgnVmFyeScsICdBY2Nlc3MtQ29udHJvbC1SZXF1ZXN0LUhlYWRlcnMnKVxuICAgICAgfVxuXG4gICAgICBjLnJlcy5oZWFkZXJzLmRlbGV0ZSgnQ29udGVudC1MZW5ndGgnKVxuICAgICAgYy5yZXMuaGVhZGVycy5kZWxldGUoJ0NvbnRlbnQtVHlwZScpXG5cbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge1xuICAgICAgICBoZWFkZXJzOiBjLnJlcy5oZWFkZXJzLFxuICAgICAgICBzdGF0dXM6IDIwNCxcbiAgICAgICAgc3RhdHVzVGV4dDogYy5yZXMuc3RhdHVzVGV4dCxcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBV0EsT0FBTyxNQUFNLE9BQU8sQ0FBQyxVQUE2QztJQUNoRSxNQUFNLFdBQXdCO1FBQzVCLFFBQVE7UUFDUixjQUFjO1lBQUM7WUFBTztZQUFRO1lBQU87WUFBUTtZQUFVO1NBQVE7UUFDL0QsY0FBYyxFQUFFO1FBQ2hCLGVBQWUsRUFBRTtJQUNuQjtJQUNBLE1BQU0sT0FBTztRQUNYLEdBQUcsUUFBUTtRQUNYLEdBQUcsT0FBTztJQUNaO0lBRUEsTUFBTSxrQkFBa0IsQUFBQyxDQUFBLENBQUMsYUFBZTtRQUN2QyxJQUFJLE9BQU8sZUFBZSxVQUFVO1lBQ2xDLE9BQU8sSUFBTTtRQUNmLE9BQU8sSUFBSSxPQUFPLGVBQWUsWUFBWTtZQUMzQyxPQUFPO1FBQ1QsT0FBTztZQUNMLE9BQU8sQ0FBQyxTQUFvQixXQUFXLFFBQVEsQ0FBQyxVQUFVLFNBQVMsVUFBVSxDQUFDLEVBQUU7UUFDbEYsQ0FBQztJQUNILENBQUEsRUFBRyxLQUFLLE1BQU07SUFFZCxPQUFPLE9BQU8sR0FBRyxPQUFTO1FBQ3hCLFNBQVMsSUFBSSxHQUFXLEVBQUUsS0FBYSxFQUFFO1lBQ3ZDLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSztRQUN6QjtRQUVBLE1BQU0sY0FBYyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWE7UUFDOUQsSUFBSSxhQUFhO1lBQ2YsSUFBSSwrQkFBK0I7UUFDckMsQ0FBQztRQUVELHdJQUF3STtRQUN4SSx3RkFBd0Y7UUFDeEYsSUFBSSxLQUFLLE1BQU0sS0FBSyxLQUFLO1lBQ3ZCLElBQUksUUFBUTtRQUNkLENBQUM7UUFFRCxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQ3BCLElBQUksb0NBQW9DO1FBQzFDLENBQUM7UUFFRCxJQUFJLEtBQUssYUFBYSxFQUFFLFFBQVE7WUFDOUIsSUFBSSxpQ0FBaUMsS0FBSyxhQUFhLENBQUMsSUFBSSxDQUFDO1FBQy9ELENBQUM7UUFFRCxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sS0FBSyxXQUFXO1lBQzlCLE1BQU07UUFDUixPQUFPO1lBQ0wsWUFBWTtZQUVaLElBQUksS0FBSyxNQUFNLElBQUksSUFBSSxFQUFFO2dCQUN2QixJQUFJLDBCQUEwQixLQUFLLE1BQU0sQ0FBQyxRQUFRO1lBQ3BELENBQUM7WUFFRCxJQUFJLEtBQUssWUFBWSxFQUFFLFFBQVE7Z0JBQzdCLElBQUksZ0NBQWdDLEtBQUssWUFBWSxDQUFDLElBQUksQ0FBQztZQUM3RCxDQUFDO1lBRUQsSUFBSSxVQUFVLEtBQUssWUFBWTtZQUMvQixJQUFJLENBQUMsU0FBUyxRQUFRO2dCQUNwQixNQUFNLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQ3BDLElBQUksZ0JBQWdCO29CQUNsQixVQUFVLGVBQWUsS0FBSyxDQUFDO2dCQUNqQyxDQUFDO1lBQ0gsQ0FBQztZQUNELElBQUksU0FBUyxRQUFRO2dCQUNuQixJQUFJLGdDQUFnQyxRQUFRLElBQUksQ0FBQztnQkFDakQsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRO1lBQy9CLENBQUM7WUFFRCxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ3JCLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFFckIsT0FBTyxJQUFJLFNBQVMsSUFBSSxFQUFFO2dCQUN4QixTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU87Z0JBQ3RCLFFBQVE7Z0JBQ1IsWUFBWSxFQUFFLEdBQUcsQ0FBQyxVQUFVO1lBQzlCO1FBQ0YsQ0FBQztJQUNIO0FBQ0YsRUFBQyJ9