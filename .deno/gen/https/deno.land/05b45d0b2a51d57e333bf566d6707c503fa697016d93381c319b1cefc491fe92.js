export const getFilePath = (options)=>{
    let filename = options.filename;
    if (/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(filename)) return;
    let root = options.root || '';
    const defaultDocument = options.defaultDocument || 'index.html';
    if (filename.endsWith('/')) {
        // /top/ => /top/index.html
        filename = filename.concat(defaultDocument);
    } else if (!filename.match(/\.[a-zA-Z0-9]+$/)) {
        // /top => /top/index.html
        filename = filename.concat('/' + defaultDocument);
    }
    // /foo.html => foo.html
    filename = filename.replace(/^\.?[\/\\]/, '');
    // foo\bar.txt => foo/bar.txt
    filename = filename.replace(/\\/, '/');
    // assets/ => assets
    root = root.replace(/\/$/, '');
    // ./assets/foo.html => assets/foo.html
    let path = root ? root + '/' + filename : filename;
    path = path.replace(/^\.?\//, '');
    return path;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL3V0aWxzL2ZpbGVwYXRoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbInR5cGUgRmlsZVBhdGhPcHRpb25zID0ge1xuICBmaWxlbmFtZTogc3RyaW5nXG4gIHJvb3Q/OiBzdHJpbmdcbiAgZGVmYXVsdERvY3VtZW50Pzogc3RyaW5nXG59XG5cbmV4cG9ydCBjb25zdCBnZXRGaWxlUGF0aCA9IChvcHRpb25zOiBGaWxlUGF0aE9wdGlvbnMpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICBsZXQgZmlsZW5hbWUgPSBvcHRpb25zLmZpbGVuYW1lXG4gIGlmICgvKD86XnxbXFwvXFxcXF0pXFwuXFwuKD86JHxbXFwvXFxcXF0pLy50ZXN0KGZpbGVuYW1lKSkgcmV0dXJuXG5cbiAgbGV0IHJvb3QgPSBvcHRpb25zLnJvb3QgfHwgJydcbiAgY29uc3QgZGVmYXVsdERvY3VtZW50ID0gb3B0aW9ucy5kZWZhdWx0RG9jdW1lbnQgfHwgJ2luZGV4Lmh0bWwnXG5cbiAgaWYgKGZpbGVuYW1lLmVuZHNXaXRoKCcvJykpIHtcbiAgICAvLyAvdG9wLyA9PiAvdG9wL2luZGV4Lmh0bWxcbiAgICBmaWxlbmFtZSA9IGZpbGVuYW1lLmNvbmNhdChkZWZhdWx0RG9jdW1lbnQpXG4gIH0gZWxzZSBpZiAoIWZpbGVuYW1lLm1hdGNoKC9cXC5bYS16QS1aMC05XSskLykpIHtcbiAgICAvLyAvdG9wID0+IC90b3AvaW5kZXguaHRtbFxuICAgIGZpbGVuYW1lID0gZmlsZW5hbWUuY29uY2F0KCcvJyArIGRlZmF1bHREb2N1bWVudClcbiAgfVxuXG4gIC8vIC9mb28uaHRtbCA9PiBmb28uaHRtbFxuICBmaWxlbmFtZSA9IGZpbGVuYW1lLnJlcGxhY2UoL15cXC4/W1xcL1xcXFxdLywgJycpXG5cbiAgLy8gZm9vXFxiYXIudHh0ID0+IGZvby9iYXIudHh0XG4gIGZpbGVuYW1lID0gZmlsZW5hbWUucmVwbGFjZSgvXFxcXC8sICcvJylcblxuICAvLyBhc3NldHMvID0+IGFzc2V0c1xuICByb290ID0gcm9vdC5yZXBsYWNlKC9cXC8kLywgJycpXG5cbiAgLy8gLi9hc3NldHMvZm9vLmh0bWwgPT4gYXNzZXRzL2Zvby5odG1sXG4gIGxldCBwYXRoID0gcm9vdCA/IHJvb3QgKyAnLycgKyBmaWxlbmFtZSA6IGZpbGVuYW1lXG4gIHBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC4/XFwvLywgJycpXG5cbiAgcmV0dXJuIHBhdGhcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxPQUFPLE1BQU0sY0FBYyxDQUFDLFVBQWlEO0lBQzNFLElBQUksV0FBVyxRQUFRLFFBQVE7SUFDL0IsSUFBSSwrQkFBK0IsSUFBSSxDQUFDLFdBQVc7SUFFbkQsSUFBSSxPQUFPLFFBQVEsSUFBSSxJQUFJO0lBQzNCLE1BQU0sa0JBQWtCLFFBQVEsZUFBZSxJQUFJO0lBRW5ELElBQUksU0FBUyxRQUFRLENBQUMsTUFBTTtRQUMxQiwyQkFBMkI7UUFDM0IsV0FBVyxTQUFTLE1BQU0sQ0FBQztJQUM3QixPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxvQkFBb0I7UUFDN0MsMEJBQTBCO1FBQzFCLFdBQVcsU0FBUyxNQUFNLENBQUMsTUFBTTtJQUNuQyxDQUFDO0lBRUQsd0JBQXdCO0lBQ3hCLFdBQVcsU0FBUyxPQUFPLENBQUMsY0FBYztJQUUxQyw2QkFBNkI7SUFDN0IsV0FBVyxTQUFTLE9BQU8sQ0FBQyxNQUFNO0lBRWxDLG9CQUFvQjtJQUNwQixPQUFPLEtBQUssT0FBTyxDQUFDLE9BQU87SUFFM0IsdUNBQXVDO0lBQ3ZDLElBQUksT0FBTyxPQUFPLE9BQU8sTUFBTSxXQUFXLFFBQVE7SUFDbEQsT0FBTyxLQUFLLE9BQU8sQ0FBQyxVQUFVO0lBRTlCLE9BQU87QUFDVCxFQUFDIn0=