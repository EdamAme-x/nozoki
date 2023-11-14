import '../../context.ts';
const getTime = ()=>{
    try {
        return performance.now();
    } catch  {}
    return Date.now();
};
export const timing = (config)=>{
    const options = {
        ...{
            total: true,
            enabled: true,
            totalDescription: 'Total Response Time',
            autoEnd: true,
            crossOrigin: false
        },
        ...config
    };
    return async (c, next)=>{
        const headers = [];
        const timers = new Map();
        c.set('metric', {
            headers,
            timers
        });
        if (options.total) {
            startTime(c, 'total', options.totalDescription);
        }
        await next();
        if (options.total) {
            endTime(c, 'total');
        }
        if (options.autoEnd) {
            timers.forEach((_, key)=>endTime(c, key));
        }
        const enabled = typeof options.enabled === 'function' ? options.enabled(c) : options.enabled;
        if (enabled) {
            c.res.headers.append('Server-Timing', headers.join(','));
            if (options.crossOrigin) {
                c.res.headers.append('Timing-Allow-Origin', typeof options.crossOrigin === 'string' ? options.crossOrigin : '*');
            }
        }
    };
};
export const setMetric = (c, name, valueDescription, description, precision)=>{
    const metrics = c.get('metric');
    if (!metrics) {
        console.warn('Metrics not initialized! Please add the `timing()` middleware to this route!');
        return;
    }
    if (typeof valueDescription === 'number') {
        const dur = valueDescription.toFixed(precision || 1);
        const metric = description ? `${name};dur=${dur};desc="${description}"` : `${name};dur=${dur}`;
        metrics.headers.push(metric);
    } else {
        // Value-less metric
        const metric = valueDescription ? `${name};desc="${valueDescription}"` : `${name}`;
        metrics.headers.push(metric);
    }
};
export const startTime = (c, name, description)=>{
    const metrics = c.get('metric');
    if (!metrics) {
        console.warn('Metrics not initialized! Please add the `timing()` middleware to this route!');
        return;
    }
    metrics.timers.set(name, {
        description,
        start: getTime()
    });
};
export const endTime = (c, name, precision)=>{
    const metrics = c.get('metric');
    if (!metrics) {
        console.warn('Metrics not initialized! Please add the `timing()` middleware to this route!');
        return;
    }
    const timer = metrics.timers.get(name);
    if (!timer) {
        console.warn(`Timer "${name}" does not exist!`);
        return;
    }
    const { description , start  } = timer;
    const duration = getTime() - start;
    setMetric(c, name, duration, description, precision);
    metrics.timers.delete(name);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvdGltaW5nL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ29udGV4dCB9IGZyb20gJy4uLy4uL2NvbnRleHQudHMnXG5pbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5pbXBvcnQgJy4uLy4uL2NvbnRleHQudHMnXG5cbmRlY2xhcmUgbW9kdWxlICcuLi8uLi9jb250ZXh0LnRzJyB7XG4gIGludGVyZmFjZSBDb250ZXh0VmFyaWFibGVNYXAge1xuICAgIG1ldHJpYz86IHtcbiAgICAgIGhlYWRlcnM6IHN0cmluZ1tdXG4gICAgICB0aW1lcnM6IE1hcDxzdHJpbmcsIFRpbWVyPlxuICAgIH1cbiAgfVxufVxuXG5pbnRlcmZhY2UgVGltZXIge1xuICBkZXNjcmlwdGlvbj86IHN0cmluZ1xuICBzdGFydDogbnVtYmVyXG59XG5cbmludGVyZmFjZSBUaW1pbmdPcHRpb25zIHtcbiAgdG90YWw6IGJvb2xlYW5cbiAgZW5hYmxlZDogYm9vbGVhbiB8ICgoYzogQ29udGV4dCkgPT4gYm9vbGVhbilcbiAgdG90YWxEZXNjcmlwdGlvbjogc3RyaW5nXG4gIGF1dG9FbmQ6IGJvb2xlYW5cbiAgY3Jvc3NPcmlnaW46IGJvb2xlYW4gfCBzdHJpbmdcbn1cblxuY29uc3QgZ2V0VGltZSA9ICgpID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KClcbiAgfSBjYXRjaCB7fVxuICByZXR1cm4gRGF0ZS5ub3coKVxufVxuXG5leHBvcnQgY29uc3QgdGltaW5nID0gKGNvbmZpZz86IFBhcnRpYWw8VGltaW5nT3B0aW9ucz4pOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIGNvbnN0IG9wdGlvbnM6IFRpbWluZ09wdGlvbnMgPSB7XG4gICAgLi4ue1xuICAgICAgdG90YWw6IHRydWUsXG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgdG90YWxEZXNjcmlwdGlvbjogJ1RvdGFsIFJlc3BvbnNlIFRpbWUnLFxuICAgICAgYXV0b0VuZDogdHJ1ZSxcbiAgICAgIGNyb3NzT3JpZ2luOiBmYWxzZSxcbiAgICB9LFxuICAgIC4uLmNvbmZpZyxcbiAgfVxuICByZXR1cm4gYXN5bmMgKGMsIG5leHQpID0+IHtcbiAgICBjb25zdCBoZWFkZXJzOiBzdHJpbmdbXSA9IFtdXG4gICAgY29uc3QgdGltZXJzID0gbmV3IE1hcDxzdHJpbmcsIFRpbWVyPigpXG4gICAgYy5zZXQoJ21ldHJpYycsIHsgaGVhZGVycywgdGltZXJzIH0pXG5cbiAgICBpZiAob3B0aW9ucy50b3RhbCkge1xuICAgICAgc3RhcnRUaW1lKGMsICd0b3RhbCcsIG9wdGlvbnMudG90YWxEZXNjcmlwdGlvbilcbiAgICB9XG4gICAgYXdhaXQgbmV4dCgpXG5cbiAgICBpZiAob3B0aW9ucy50b3RhbCkge1xuICAgICAgZW5kVGltZShjLCAndG90YWwnKVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmF1dG9FbmQpIHtcbiAgICAgIHRpbWVycy5mb3JFYWNoKChfLCBrZXkpID0+IGVuZFRpbWUoYywga2V5KSlcbiAgICB9XG5cbiAgICBjb25zdCBlbmFibGVkID0gdHlwZW9mIG9wdGlvbnMuZW5hYmxlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMuZW5hYmxlZChjKSA6IG9wdGlvbnMuZW5hYmxlZFxuXG4gICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgIGMucmVzLmhlYWRlcnMuYXBwZW5kKCdTZXJ2ZXItVGltaW5nJywgaGVhZGVycy5qb2luKCcsJykpXG4gICAgICBpZiAob3B0aW9ucy5jcm9zc09yaWdpbikge1xuICAgICAgICBjLnJlcy5oZWFkZXJzLmFwcGVuZChcbiAgICAgICAgICAnVGltaW5nLUFsbG93LU9yaWdpbicsXG4gICAgICAgICAgdHlwZW9mIG9wdGlvbnMuY3Jvc3NPcmlnaW4gPT09ICdzdHJpbmcnID8gb3B0aW9ucy5jcm9zc09yaWdpbiA6ICcqJ1xuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmludGVyZmFjZSBTZXRNZXRyaWMge1xuICAoYzogQ29udGV4dCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyLCBkZXNjcmlwdGlvbj86IHN0cmluZywgcHJlY2lzaW9uPzogbnVtYmVyKTogdm9pZFxuXG4gIChjOiBDb250ZXh0LCBuYW1lOiBzdHJpbmcsIGRlc2NyaXB0aW9uPzogc3RyaW5nKTogdm9pZFxufVxuXG5leHBvcnQgY29uc3Qgc2V0TWV0cmljOiBTZXRNZXRyaWMgPSAoXG4gIGM6IENvbnRleHQsXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWVEZXNjcmlwdGlvbjogbnVtYmVyIHwgc3RyaW5nIHwgdW5kZWZpbmVkLFxuICBkZXNjcmlwdGlvbj86IHN0cmluZyxcbiAgcHJlY2lzaW9uPzogbnVtYmVyXG4pID0+IHtcbiAgY29uc3QgbWV0cmljcyA9IGMuZ2V0KCdtZXRyaWMnKVxuICBpZiAoIW1ldHJpY3MpIHtcbiAgICBjb25zb2xlLndhcm4oJ01ldHJpY3Mgbm90IGluaXRpYWxpemVkISBQbGVhc2UgYWRkIHRoZSBgdGltaW5nKClgIG1pZGRsZXdhcmUgdG8gdGhpcyByb3V0ZSEnKVxuICAgIHJldHVyblxuICB9XG4gIGlmICh0eXBlb2YgdmFsdWVEZXNjcmlwdGlvbiA9PT0gJ251bWJlcicpIHtcbiAgICBjb25zdCBkdXIgPSB2YWx1ZURlc2NyaXB0aW9uLnRvRml4ZWQocHJlY2lzaW9uIHx8IDEpXG5cbiAgICBjb25zdCBtZXRyaWMgPSBkZXNjcmlwdGlvbiA/IGAke25hbWV9O2R1cj0ke2R1cn07ZGVzYz1cIiR7ZGVzY3JpcHRpb259XCJgIDogYCR7bmFtZX07ZHVyPSR7ZHVyfWBcblxuICAgIG1ldHJpY3MuaGVhZGVycy5wdXNoKG1ldHJpYylcbiAgfSBlbHNlIHtcbiAgICAvLyBWYWx1ZS1sZXNzIG1ldHJpY1xuICAgIGNvbnN0IG1ldHJpYyA9IHZhbHVlRGVzY3JpcHRpb24gPyBgJHtuYW1lfTtkZXNjPVwiJHt2YWx1ZURlc2NyaXB0aW9ufVwiYCA6IGAke25hbWV9YFxuXG4gICAgbWV0cmljcy5oZWFkZXJzLnB1c2gobWV0cmljKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBzdGFydFRpbWUgPSAoYzogQ29udGV4dCwgbmFtZTogc3RyaW5nLCBkZXNjcmlwdGlvbj86IHN0cmluZykgPT4ge1xuICBjb25zdCBtZXRyaWNzID0gYy5nZXQoJ21ldHJpYycpXG4gIGlmICghbWV0cmljcykge1xuICAgIGNvbnNvbGUud2FybignTWV0cmljcyBub3QgaW5pdGlhbGl6ZWQhIFBsZWFzZSBhZGQgdGhlIGB0aW1pbmcoKWAgbWlkZGxld2FyZSB0byB0aGlzIHJvdXRlIScpXG4gICAgcmV0dXJuXG4gIH1cbiAgbWV0cmljcy50aW1lcnMuc2V0KG5hbWUsIHsgZGVzY3JpcHRpb24sIHN0YXJ0OiBnZXRUaW1lKCkgfSlcbn1cblxuZXhwb3J0IGNvbnN0IGVuZFRpbWUgPSAoYzogQ29udGV4dCwgbmFtZTogc3RyaW5nLCBwcmVjaXNpb24/OiBudW1iZXIpID0+IHtcbiAgY29uc3QgbWV0cmljcyA9IGMuZ2V0KCdtZXRyaWMnKVxuICBpZiAoIW1ldHJpY3MpIHtcbiAgICBjb25zb2xlLndhcm4oJ01ldHJpY3Mgbm90IGluaXRpYWxpemVkISBQbGVhc2UgYWRkIHRoZSBgdGltaW5nKClgIG1pZGRsZXdhcmUgdG8gdGhpcyByb3V0ZSEnKVxuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IHRpbWVyID0gbWV0cmljcy50aW1lcnMuZ2V0KG5hbWUpXG4gIGlmICghdGltZXIpIHtcbiAgICBjb25zb2xlLndhcm4oYFRpbWVyIFwiJHtuYW1lfVwiIGRvZXMgbm90IGV4aXN0IWApXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgeyBkZXNjcmlwdGlvbiwgc3RhcnQgfSA9IHRpbWVyXG5cbiAgY29uc3QgZHVyYXRpb24gPSBnZXRUaW1lKCkgLSBzdGFydFxuXG4gIHNldE1ldHJpYyhjLCBuYW1lLCBkdXJhdGlvbiwgZGVzY3JpcHRpb24sIHByZWNpc2lvbilcbiAgbWV0cmljcy50aW1lcnMuZGVsZXRlKG5hbWUpXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxtQkFBa0I7QUF3QnpCLE1BQU0sVUFBVSxJQUFNO0lBQ3BCLElBQUk7UUFDRixPQUFPLFlBQVksR0FBRztJQUN4QixFQUFFLE9BQU0sQ0FBQztJQUNULE9BQU8sS0FBSyxHQUFHO0FBQ2pCO0FBRUEsT0FBTyxNQUFNLFNBQVMsQ0FBQyxTQUF1RDtJQUM1RSxNQUFNLFVBQXlCO1FBQzdCLEdBQUc7WUFDRCxPQUFPLElBQUk7WUFDWCxTQUFTLElBQUk7WUFDYixrQkFBa0I7WUFDbEIsU0FBUyxJQUFJO1lBQ2IsYUFBYSxLQUFLO1FBQ3BCLENBQUM7UUFDRCxHQUFHLE1BQU07SUFDWDtJQUNBLE9BQU8sT0FBTyxHQUFHLE9BQVM7UUFDeEIsTUFBTSxVQUFvQixFQUFFO1FBQzVCLE1BQU0sU0FBUyxJQUFJO1FBQ25CLEVBQUUsR0FBRyxDQUFDLFVBQVU7WUFBRTtZQUFTO1FBQU87UUFFbEMsSUFBSSxRQUFRLEtBQUssRUFBRTtZQUNqQixVQUFVLEdBQUcsU0FBUyxRQUFRLGdCQUFnQjtRQUNoRCxDQUFDO1FBQ0QsTUFBTTtRQUVOLElBQUksUUFBUSxLQUFLLEVBQUU7WUFDakIsUUFBUSxHQUFHO1FBQ2IsQ0FBQztRQUVELElBQUksUUFBUSxPQUFPLEVBQUU7WUFDbkIsT0FBTyxPQUFPLENBQUMsQ0FBQyxHQUFHLE1BQVEsUUFBUSxHQUFHO1FBQ3hDLENBQUM7UUFFRCxNQUFNLFVBQVUsT0FBTyxRQUFRLE9BQU8sS0FBSyxhQUFhLFFBQVEsT0FBTyxDQUFDLEtBQUssUUFBUSxPQUFPO1FBRTVGLElBQUksU0FBUztZQUNYLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLFFBQVEsSUFBSSxDQUFDO1lBQ25ELElBQUksUUFBUSxXQUFXLEVBQUU7Z0JBQ3ZCLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQ2xCLHVCQUNBLE9BQU8sUUFBUSxXQUFXLEtBQUssV0FBVyxRQUFRLFdBQVcsR0FBRyxHQUFHO1lBRXZFLENBQUM7UUFDSCxDQUFDO0lBQ0g7QUFDRixFQUFDO0FBUUQsT0FBTyxNQUFNLFlBQXVCLENBQ2xDLEdBQ0EsTUFDQSxrQkFDQSxhQUNBLFlBQ0c7SUFDSCxNQUFNLFVBQVUsRUFBRSxHQUFHLENBQUM7SUFDdEIsSUFBSSxDQUFDLFNBQVM7UUFDWixRQUFRLElBQUksQ0FBQztRQUNiO0lBQ0YsQ0FBQztJQUNELElBQUksT0FBTyxxQkFBcUIsVUFBVTtRQUN4QyxNQUFNLE1BQU0saUJBQWlCLE9BQU8sQ0FBQyxhQUFhO1FBRWxELE1BQU0sU0FBUyxjQUFjLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRSxJQUFJLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRSxJQUFJLENBQUM7UUFFOUYsUUFBUSxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3ZCLE9BQU87UUFDTCxvQkFBb0I7UUFDcEIsTUFBTSxTQUFTLG1CQUFtQixDQUFDLEVBQUUsS0FBSyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUM7UUFFbEYsUUFBUSxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7QUFDSCxFQUFDO0FBRUQsT0FBTyxNQUFNLFlBQVksQ0FBQyxHQUFZLE1BQWMsY0FBeUI7SUFDM0UsTUFBTSxVQUFVLEVBQUUsR0FBRyxDQUFDO0lBQ3RCLElBQUksQ0FBQyxTQUFTO1FBQ1osUUFBUSxJQUFJLENBQUM7UUFDYjtJQUNGLENBQUM7SUFDRCxRQUFRLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTTtRQUFFO1FBQWEsT0FBTztJQUFVO0FBQzNELEVBQUM7QUFFRCxPQUFPLE1BQU0sVUFBVSxDQUFDLEdBQVksTUFBYyxZQUF1QjtJQUN2RSxNQUFNLFVBQVUsRUFBRSxHQUFHLENBQUM7SUFDdEIsSUFBSSxDQUFDLFNBQVM7UUFDWixRQUFRLElBQUksQ0FBQztRQUNiO0lBQ0YsQ0FBQztJQUNELE1BQU0sUUFBUSxRQUFRLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDakMsSUFBSSxDQUFDLE9BQU87UUFDVixRQUFRLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLGlCQUFpQixDQUFDO1FBQzlDO0lBQ0YsQ0FBQztJQUNELE1BQU0sRUFBRSxZQUFXLEVBQUUsTUFBSyxFQUFFLEdBQUc7SUFFL0IsTUFBTSxXQUFXLFlBQVk7SUFFN0IsVUFBVSxHQUFHLE1BQU0sVUFBVSxhQUFhO0lBQzFDLFFBQVEsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN4QixFQUFDIn0=