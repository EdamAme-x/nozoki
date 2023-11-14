import { getPath } from '../../utils/url.ts';
var LogPrefix;
(function(LogPrefix) {
    LogPrefix["Outgoing"] = '-->';
    LogPrefix["Incoming"] = '<--';
    LogPrefix["Error"] = 'xxx';
})(LogPrefix || (LogPrefix = {}));
const humanize = (times)=>{
    const [delimiter, separator] = [
        ',',
        '.'
    ];
    const orderTimes = times.map((v)=>v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + delimiter));
    return orderTimes.join(separator);
};
const time = (start)=>{
    const delta = Date.now() - start;
    return humanize([
        delta < 1000 ? delta + 'ms' : Math.round(delta / 1000) + 's'
    ]);
};
const colorStatus = (status)=>{
    const out = {
        7: `\x1b[35m${status}\x1b[0m`,
        5: `\x1b[31m${status}\x1b[0m`,
        4: `\x1b[33m${status}\x1b[0m`,
        3: `\x1b[36m${status}\x1b[0m`,
        2: `\x1b[32m${status}\x1b[0m`,
        1: `\x1b[32m${status}\x1b[0m`,
        0: `\x1b[33m${status}\x1b[0m`
    };
    const calculateStatus = status / 100 | 0;
    return out[calculateStatus];
};
function log(fn, prefix, method, path, status = 0, elapsed) {
    const out = prefix === LogPrefix.Incoming ? `  ${prefix} ${method} ${path}` : `  ${prefix} ${method} ${path} ${colorStatus(status)} ${elapsed}`;
    fn(out);
}
export const logger = (fn = console.log)=>{
    return async (c, next)=>{
        const { method  } = c.req;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const path = getPath(c.req.raw);
        log(fn, LogPrefix.Incoming, method, path);
        const start = Date.now();
        await next();
        log(fn, LogPrefix.Outgoing, method, path, c.res.status, time(start));
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvbG9nZ2VyL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi8uLi90eXBlcy50cydcbmltcG9ydCB7IGdldFBhdGggfSBmcm9tICcuLi8uLi91dGlscy91cmwudHMnXG5cbmVudW0gTG9nUHJlZml4IHtcbiAgT3V0Z29pbmcgPSAnLS0+JyxcbiAgSW5jb21pbmcgPSAnPC0tJyxcbiAgRXJyb3IgPSAneHh4Jyxcbn1cblxuY29uc3QgaHVtYW5pemUgPSAodGltZXM6IHN0cmluZ1tdKSA9PiB7XG4gIGNvbnN0IFtkZWxpbWl0ZXIsIHNlcGFyYXRvcl0gPSBbJywnLCAnLiddXG5cbiAgY29uc3Qgb3JkZXJUaW1lcyA9IHRpbWVzLm1hcCgodikgPT4gdi5yZXBsYWNlKC8oXFxkKSg/PShcXGRcXGRcXGQpKyg/IVxcZCkpL2csICckMScgKyBkZWxpbWl0ZXIpKVxuXG4gIHJldHVybiBvcmRlclRpbWVzLmpvaW4oc2VwYXJhdG9yKVxufVxuXG5jb25zdCB0aW1lID0gKHN0YXJ0OiBudW1iZXIpID0+IHtcbiAgY29uc3QgZGVsdGEgPSBEYXRlLm5vdygpIC0gc3RhcnRcbiAgcmV0dXJuIGh1bWFuaXplKFtkZWx0YSA8IDEwMDAgPyBkZWx0YSArICdtcycgOiBNYXRoLnJvdW5kKGRlbHRhIC8gMTAwMCkgKyAncyddKVxufVxuXG5jb25zdCBjb2xvclN0YXR1cyA9IChzdGF0dXM6IG51bWJlcikgPT4ge1xuICBjb25zdCBvdXQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XG4gICAgNzogYFxceDFiWzM1bSR7c3RhdHVzfVxceDFiWzBtYCxcbiAgICA1OiBgXFx4MWJbMzFtJHtzdGF0dXN9XFx4MWJbMG1gLFxuICAgIDQ6IGBcXHgxYlszM20ke3N0YXR1c31cXHgxYlswbWAsXG4gICAgMzogYFxceDFiWzM2bSR7c3RhdHVzfVxceDFiWzBtYCxcbiAgICAyOiBgXFx4MWJbMzJtJHtzdGF0dXN9XFx4MWJbMG1gLFxuICAgIDE6IGBcXHgxYlszMm0ke3N0YXR1c31cXHgxYlswbWAsXG4gICAgMDogYFxceDFiWzMzbSR7c3RhdHVzfVxceDFiWzBtYCxcbiAgfVxuXG4gIGNvbnN0IGNhbGN1bGF0ZVN0YXR1cyA9IChzdGF0dXMgLyAxMDApIHwgMFxuXG4gIHJldHVybiBvdXRbY2FsY3VsYXRlU3RhdHVzXVxufVxuXG50eXBlIFByaW50RnVuYyA9IChzdHI6IHN0cmluZywgLi4ucmVzdDogc3RyaW5nW10pID0+IHZvaWRcblxuZnVuY3Rpb24gbG9nKFxuICBmbjogUHJpbnRGdW5jLFxuICBwcmVmaXg6IHN0cmluZyxcbiAgbWV0aG9kOiBzdHJpbmcsXG4gIHBhdGg6IHN0cmluZyxcbiAgc3RhdHVzOiBudW1iZXIgPSAwLFxuICBlbGFwc2VkPzogc3RyaW5nXG4pIHtcbiAgY29uc3Qgb3V0ID1cbiAgICBwcmVmaXggPT09IExvZ1ByZWZpeC5JbmNvbWluZ1xuICAgICAgPyBgICAke3ByZWZpeH0gJHttZXRob2R9ICR7cGF0aH1gXG4gICAgICA6IGAgICR7cHJlZml4fSAke21ldGhvZH0gJHtwYXRofSAke2NvbG9yU3RhdHVzKHN0YXR1cyl9ICR7ZWxhcHNlZH1gXG4gIGZuKG91dClcbn1cblxuZXhwb3J0IGNvbnN0IGxvZ2dlciA9IChmbjogUHJpbnRGdW5jID0gY29uc29sZS5sb2cpOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIHJldHVybiBhc3luYyAoYywgbmV4dCkgPT4ge1xuICAgIGNvbnN0IHsgbWV0aG9kIH0gPSBjLnJlcVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBjb25zdCBwYXRoID0gZ2V0UGF0aChjLnJlcS5yYXcpXG5cbiAgICBsb2coZm4sIExvZ1ByZWZpeC5JbmNvbWluZywgbWV0aG9kLCBwYXRoKVxuXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG5cbiAgICBhd2FpdCBuZXh0KClcblxuICAgIGxvZyhmbiwgTG9nUHJlZml4Lk91dGdvaW5nLCBtZXRob2QsIHBhdGgsIGMucmVzLnN0YXR1cywgdGltZShzdGFydCkpXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLE9BQU8sUUFBUSxxQkFBb0I7SUFFNUM7VUFBSyxTQUFTO0lBQVQsVUFDSCxjQUFXO0lBRFIsVUFFSCxjQUFXO0lBRlIsVUFHSCxXQUFRO0dBSEwsY0FBQTtBQU1MLE1BQU0sV0FBVyxDQUFDLFFBQW9CO0lBQ3BDLE1BQU0sQ0FBQyxXQUFXLFVBQVUsR0FBRztRQUFDO1FBQUs7S0FBSTtJQUV6QyxNQUFNLGFBQWEsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFNLEVBQUUsT0FBTyxDQUFDLDRCQUE0QixPQUFPO0lBRWpGLE9BQU8sV0FBVyxJQUFJLENBQUM7QUFDekI7QUFFQSxNQUFNLE9BQU8sQ0FBQyxRQUFrQjtJQUM5QixNQUFNLFFBQVEsS0FBSyxHQUFHLEtBQUs7SUFDM0IsT0FBTyxTQUFTO1FBQUMsUUFBUSxPQUFPLFFBQVEsT0FBTyxLQUFLLEtBQUssQ0FBQyxRQUFRLFFBQVEsR0FBRztLQUFDO0FBQ2hGO0FBRUEsTUFBTSxjQUFjLENBQUMsU0FBbUI7SUFDdEMsTUFBTSxNQUFpQztRQUNyQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sT0FBTyxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxPQUFPLENBQUM7UUFDN0IsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLE9BQU8sQ0FBQztRQUM3QixHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sT0FBTyxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxPQUFPLENBQUM7UUFDN0IsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLE9BQU8sQ0FBQztRQUM3QixHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sT0FBTyxDQUFDO0lBQy9CO0lBRUEsTUFBTSxrQkFBa0IsQUFBQyxTQUFTLE1BQU87SUFFekMsT0FBTyxHQUFHLENBQUMsZ0JBQWdCO0FBQzdCO0FBSUEsU0FBUyxJQUNQLEVBQWEsRUFDYixNQUFjLEVBQ2QsTUFBYyxFQUNkLElBQVksRUFDWixTQUFpQixDQUFDLEVBQ2xCLE9BQWdCLEVBQ2hCO0lBQ0EsTUFBTSxNQUNKLFdBQVcsVUFBVSxRQUFRLEdBQ3pCLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUMvQixDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxZQUFZLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQztJQUN2RSxHQUFHO0FBQ0w7QUFFQSxPQUFPLE1BQU0sU0FBUyxDQUFDLEtBQWdCLFFBQVEsR0FBRyxHQUF3QjtJQUN4RSxPQUFPLE9BQU8sR0FBRyxPQUFTO1FBQ3hCLE1BQU0sRUFBRSxPQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUc7UUFDeEIsNkRBQTZEO1FBQzdELE1BQU0sT0FBTyxRQUFRLEVBQUUsR0FBRyxDQUFDLEdBQUc7UUFFOUIsSUFBSSxJQUFJLFVBQVUsUUFBUSxFQUFFLFFBQVE7UUFFcEMsTUFBTSxRQUFRLEtBQUssR0FBRztRQUV0QixNQUFNO1FBRU4sSUFBSSxJQUFJLFVBQVUsUUFBUSxFQUFFLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSztJQUMvRDtBQUNGLEVBQUMifQ==