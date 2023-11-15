export const getFilePath = (options)=>{
    let filename = options.filename;
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
    filename = filename.replace(/^\.?\//, '');
    // assets/ => assets
    root = root.replace(/\/$/, '');
    // ./assets/foo.html => assets/foo.html
    let path = root ? root + '/' + filename : filename;
    path = path.replace(/^\.?\//, '');
    return path;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvdXRpbHMvZmlsZXBhdGgudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBGaWxlUGF0aE9wdGlvbnMgPSB7XG4gIGZpbGVuYW1lOiBzdHJpbmdcbiAgcm9vdD86IHN0cmluZ1xuICBkZWZhdWx0RG9jdW1lbnQ/OiBzdHJpbmdcbn1cblxuZXhwb3J0IGNvbnN0IGdldEZpbGVQYXRoID0gKG9wdGlvbnM6IEZpbGVQYXRoT3B0aW9ucyk6IHN0cmluZyA9PiB7XG4gIGxldCBmaWxlbmFtZSA9IG9wdGlvbnMuZmlsZW5hbWVcbiAgbGV0IHJvb3QgPSBvcHRpb25zLnJvb3QgfHwgJydcbiAgY29uc3QgZGVmYXVsdERvY3VtZW50ID0gb3B0aW9ucy5kZWZhdWx0RG9jdW1lbnQgfHwgJ2luZGV4Lmh0bWwnXG5cbiAgaWYgKGZpbGVuYW1lLmVuZHNXaXRoKCcvJykpIHtcbiAgICAvLyAvdG9wLyA9PiAvdG9wL2luZGV4Lmh0bWxcbiAgICBmaWxlbmFtZSA9IGZpbGVuYW1lLmNvbmNhdChkZWZhdWx0RG9jdW1lbnQpXG4gIH0gZWxzZSBpZiAoIWZpbGVuYW1lLm1hdGNoKC9cXC5bYS16QS1aMC05XSskLykpIHtcbiAgICAvLyAvdG9wID0+IC90b3AvaW5kZXguaHRtbFxuICAgIGZpbGVuYW1lID0gZmlsZW5hbWUuY29uY2F0KCcvJyArIGRlZmF1bHREb2N1bWVudClcbiAgfVxuXG4gIC8vIC9mb28uaHRtbCA9PiBmb28uaHRtbFxuICBmaWxlbmFtZSA9IGZpbGVuYW1lLnJlcGxhY2UoL15cXC4/XFwvLywgJycpXG5cbiAgLy8gYXNzZXRzLyA9PiBhc3NldHNcbiAgcm9vdCA9IHJvb3QucmVwbGFjZSgvXFwvJC8sICcnKVxuXG4gIC8vIC4vYXNzZXRzL2Zvby5odG1sID0+IGFzc2V0cy9mb28uaHRtbFxuICBsZXQgcGF0aCA9IHJvb3QgPyByb290ICsgJy8nICsgZmlsZW5hbWUgOiBmaWxlbmFtZVxuICBwYXRoID0gcGF0aC5yZXBsYWNlKC9eXFwuP1xcLy8sICcnKVxuXG4gIHJldHVybiBwYXRoXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUEsT0FBTyxNQUFNLGNBQWMsQ0FBQyxVQUFxQztJQUMvRCxJQUFJLFdBQVcsUUFBUSxRQUFRO0lBQy9CLElBQUksT0FBTyxRQUFRLElBQUksSUFBSTtJQUMzQixNQUFNLGtCQUFrQixRQUFRLGVBQWUsSUFBSTtJQUVuRCxJQUFJLFNBQVMsUUFBUSxDQUFDLE1BQU07UUFDMUIsMkJBQTJCO1FBQzNCLFdBQVcsU0FBUyxNQUFNLENBQUM7SUFDN0IsT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLENBQUMsb0JBQW9CO1FBQzdDLDBCQUEwQjtRQUMxQixXQUFXLFNBQVMsTUFBTSxDQUFDLE1BQU07SUFDbkMsQ0FBQztJQUVELHdCQUF3QjtJQUN4QixXQUFXLFNBQVMsT0FBTyxDQUFDLFVBQVU7SUFFdEMsb0JBQW9CO0lBQ3BCLE9BQU8sS0FBSyxPQUFPLENBQUMsT0FBTztJQUUzQix1Q0FBdUM7SUFDdkMsSUFBSSxPQUFPLE9BQU8sT0FBTyxNQUFNLFdBQVcsUUFBUTtJQUNsRCxPQUFPLEtBQUssT0FBTyxDQUFDLFVBQVU7SUFFOUIsT0FBTztBQUNULEVBQUMifQ==