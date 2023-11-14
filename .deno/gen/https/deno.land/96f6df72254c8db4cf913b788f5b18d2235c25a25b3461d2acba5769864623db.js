import { getFilePath } from '../../utils/filepath.ts';
import { getMimeType } from '../../utils/mime.ts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { open  } = Deno;
const DEFAULT_DOCUMENT = 'index.html';
export const serveStatic = (options = {
    root: ''
})=>{
    return async (c, next)=>{
        // Do nothing if Response is already set
        if (c.finalized) {
            await next();
            return;
        }
        const url = new URL(c.req.url);
        const filename = options.path ?? decodeURI(url.pathname);
        let path = getFilePath({
            filename: options.rewriteRequestPath ? options.rewriteRequestPath(filename) : filename,
            root: options.root,
            defaultDocument: DEFAULT_DOCUMENT
        });
        if (!path) return await next();
        path = `./${path}`;
        let file;
        try {
            file = await open(path);
        } catch (e) {
            console.warn(`${e}`);
        }
        if (file) {
            const mimeType = getMimeType(path);
            if (mimeType) {
                c.header('Content-Type', mimeType);
            }
            // Return Response object with stream
            return c.body(file.readable);
        } else {
            console.warn(`Static file: ${path} is not found`);
            await next();
        }
        return;
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL2FkYXB0ZXIvZGVuby9zZXJ2ZS1zdGF0aWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29udGV4dC50cydcbmltcG9ydCB0eXBlIHsgTmV4dCB9IGZyb20gJy4uLy4uL3R5cGVzLnRzJ1xuaW1wb3J0IHsgZ2V0RmlsZVBhdGggfSBmcm9tICcuLi8uLi91dGlscy9maWxlcGF0aC50cydcbmltcG9ydCB7IGdldE1pbWVUeXBlIH0gZnJvbSAnLi4vLi4vdXRpbHMvbWltZS50cydcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuLy8gQHRzLWlnbm9yZVxuY29uc3QgeyBvcGVuIH0gPSBEZW5vXG5cbmV4cG9ydCB0eXBlIFNlcnZlU3RhdGljT3B0aW9ucyA9IHtcbiAgcm9vdD86IHN0cmluZ1xuICBwYXRoPzogc3RyaW5nXG4gIHJld3JpdGVSZXF1ZXN0UGF0aD86IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZ1xufVxuXG5jb25zdCBERUZBVUxUX0RPQ1VNRU5UID0gJ2luZGV4Lmh0bWwnXG5cbmV4cG9ydCBjb25zdCBzZXJ2ZVN0YXRpYyA9IChvcHRpb25zOiBTZXJ2ZVN0YXRpY09wdGlvbnMgPSB7IHJvb3Q6ICcnIH0pID0+IHtcbiAgcmV0dXJuIGFzeW5jIChjOiBDb250ZXh0LCBuZXh0OiBOZXh0KSA9PiB7XG4gICAgLy8gRG8gbm90aGluZyBpZiBSZXNwb25zZSBpcyBhbHJlYWR5IHNldFxuICAgIGlmIChjLmZpbmFsaXplZCkge1xuICAgICAgYXdhaXQgbmV4dCgpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKGMucmVxLnVybClcbiAgICBjb25zdCBmaWxlbmFtZSA9IG9wdGlvbnMucGF0aCA/PyBkZWNvZGVVUkkodXJsLnBhdGhuYW1lKVxuICAgIGxldCBwYXRoID0gZ2V0RmlsZVBhdGgoe1xuICAgICAgZmlsZW5hbWU6IG9wdGlvbnMucmV3cml0ZVJlcXVlc3RQYXRoID8gb3B0aW9ucy5yZXdyaXRlUmVxdWVzdFBhdGgoZmlsZW5hbWUpIDogZmlsZW5hbWUsXG4gICAgICByb290OiBvcHRpb25zLnJvb3QsXG4gICAgICBkZWZhdWx0RG9jdW1lbnQ6IERFRkFVTFRfRE9DVU1FTlQsXG4gICAgfSlcblxuICAgIGlmICghcGF0aCkgcmV0dXJuIGF3YWl0IG5leHQoKVxuXG4gICAgcGF0aCA9IGAuLyR7cGF0aH1gXG5cbiAgICBsZXQgZmlsZVxuXG4gICAgdHJ5IHtcbiAgICAgIGZpbGUgPSBhd2FpdCBvcGVuKHBhdGgpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS53YXJuKGAke2V9YClcbiAgICB9XG5cbiAgICBpZiAoZmlsZSkge1xuICAgICAgY29uc3QgbWltZVR5cGUgPSBnZXRNaW1lVHlwZShwYXRoKVxuICAgICAgaWYgKG1pbWVUeXBlKSB7XG4gICAgICAgIGMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCBtaW1lVHlwZSlcbiAgICAgIH1cbiAgICAgIC8vIFJldHVybiBSZXNwb25zZSBvYmplY3Qgd2l0aCBzdHJlYW1cbiAgICAgIHJldHVybiBjLmJvZHkoZmlsZS5yZWFkYWJsZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKGBTdGF0aWMgZmlsZTogJHtwYXRofSBpcyBub3QgZm91bmRgKVxuICAgICAgYXdhaXQgbmV4dCgpXG4gICAgfVxuICAgIHJldHVyblxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsU0FBUyxXQUFXLFFBQVEsMEJBQXlCO0FBQ3JELFNBQVMsV0FBVyxRQUFRLHNCQUFxQjtBQUVqRCw2REFBNkQ7QUFDN0QsYUFBYTtBQUNiLE1BQU0sRUFBRSxLQUFJLEVBQUUsR0FBRztBQVFqQixNQUFNLG1CQUFtQjtBQUV6QixPQUFPLE1BQU0sY0FBYyxDQUFDLFVBQThCO0lBQUUsTUFBTTtBQUFHLENBQUMsR0FBSztJQUN6RSxPQUFPLE9BQU8sR0FBWSxPQUFlO1FBQ3ZDLHdDQUF3QztRQUN4QyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ2YsTUFBTTtZQUNOO1FBQ0YsQ0FBQztRQUVELE1BQU0sTUFBTSxJQUFJLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRztRQUM3QixNQUFNLFdBQVcsUUFBUSxJQUFJLElBQUksVUFBVSxJQUFJLFFBQVE7UUFDdkQsSUFBSSxPQUFPLFlBQVk7WUFDckIsVUFBVSxRQUFRLGtCQUFrQixHQUFHLFFBQVEsa0JBQWtCLENBQUMsWUFBWSxRQUFRO1lBQ3RGLE1BQU0sUUFBUSxJQUFJO1lBQ2xCLGlCQUFpQjtRQUNuQjtRQUVBLElBQUksQ0FBQyxNQUFNLE9BQU8sTUFBTTtRQUV4QixPQUFPLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQztRQUVsQixJQUFJO1FBRUosSUFBSTtZQUNGLE9BQU8sTUFBTSxLQUFLO1FBQ3BCLEVBQUUsT0FBTyxHQUFHO1lBQ1YsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNyQjtRQUVBLElBQUksTUFBTTtZQUNSLE1BQU0sV0FBVyxZQUFZO1lBQzdCLElBQUksVUFBVTtnQkFDWixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0I7WUFDM0IsQ0FBQztZQUNELHFDQUFxQztZQUNyQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssUUFBUTtRQUM3QixPQUFPO1lBQ0wsUUFBUSxJQUFJLENBQUMsQ0FBQyxhQUFhLEVBQUUsS0FBSyxhQUFhLENBQUM7WUFDaEQsTUFBTTtRQUNSLENBQUM7UUFDRDtJQUNGO0FBQ0YsRUFBQyJ9