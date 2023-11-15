import { getFilePath } from '../../utils/filepath.ts';
import { getMimeType } from '../../utils/mime.ts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { readFile  } = Deno;
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
        path = `./${path}`;
        let content;
        try {
            content = await readFile(path);
        } catch (e) {
            console.warn(`${e}`);
        }
        if (content) {
            const mimeType = getMimeType(path);
            if (mimeType) {
                c.header('Content-Type', mimeType);
            }
            // Return Response object
            return c.body(content);
        } else {
            console.warn(`Static file: ${path} is not found`);
            await next();
        }
        return;
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvYWRhcHRlci9kZW5vL3NlcnZlLXN0YXRpYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbnRleHQgfSBmcm9tICcuLi8uLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHR5cGUgeyBOZXh0IH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5pbXBvcnQgeyBnZXRGaWxlUGF0aCB9IGZyb20gJy4uLy4uL3V0aWxzL2ZpbGVwYXRoLnRzJ1xuaW1wb3J0IHsgZ2V0TWltZVR5cGUgfSBmcm9tICcuLi8uLi91dGlscy9taW1lLnRzJ1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4vLyBAdHMtaWdub3JlXG5jb25zdCB7IHJlYWRGaWxlIH0gPSBEZW5vXG5cbmV4cG9ydCB0eXBlIFNlcnZlU3RhdGljT3B0aW9ucyA9IHtcbiAgcm9vdD86IHN0cmluZ1xuICBwYXRoPzogc3RyaW5nXG4gIHJld3JpdGVSZXF1ZXN0UGF0aD86IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZ1xufVxuXG5jb25zdCBERUZBVUxUX0RPQ1VNRU5UID0gJ2luZGV4Lmh0bWwnXG5cbmV4cG9ydCBjb25zdCBzZXJ2ZVN0YXRpYyA9IChvcHRpb25zOiBTZXJ2ZVN0YXRpY09wdGlvbnMgPSB7IHJvb3Q6ICcnIH0pID0+IHtcbiAgcmV0dXJuIGFzeW5jIChjOiBDb250ZXh0LCBuZXh0OiBOZXh0KSA9PiB7XG4gICAgLy8gRG8gbm90aGluZyBpZiBSZXNwb25zZSBpcyBhbHJlYWR5IHNldFxuICAgIGlmIChjLmZpbmFsaXplZCkge1xuICAgICAgYXdhaXQgbmV4dCgpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKGMucmVxLnVybClcbiAgICBjb25zdCBmaWxlbmFtZSA9IG9wdGlvbnMucGF0aCA/PyBkZWNvZGVVUkkodXJsLnBhdGhuYW1lKVxuICAgIGxldCBwYXRoID0gZ2V0RmlsZVBhdGgoe1xuICAgICAgZmlsZW5hbWU6IG9wdGlvbnMucmV3cml0ZVJlcXVlc3RQYXRoID8gb3B0aW9ucy5yZXdyaXRlUmVxdWVzdFBhdGgoZmlsZW5hbWUpIDogZmlsZW5hbWUsXG4gICAgICByb290OiBvcHRpb25zLnJvb3QsXG4gICAgICBkZWZhdWx0RG9jdW1lbnQ6IERFRkFVTFRfRE9DVU1FTlQsXG4gICAgfSlcblxuICAgIHBhdGggPSBgLi8ke3BhdGh9YFxuXG4gICAgbGV0IGNvbnRlbnRcblxuICAgIHRyeSB7XG4gICAgICBjb250ZW50ID0gYXdhaXQgcmVhZEZpbGUocGF0aClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYCR7ZX1gKVxuICAgIH1cblxuICAgIGlmIChjb250ZW50KSB7XG4gICAgICBjb25zdCBtaW1lVHlwZSA9IGdldE1pbWVUeXBlKHBhdGgpXG4gICAgICBpZiAobWltZVR5cGUpIHtcbiAgICAgICAgYy5oZWFkZXIoJ0NvbnRlbnQtVHlwZScsIG1pbWVUeXBlKVxuICAgICAgfVxuICAgICAgLy8gUmV0dXJuIFJlc3BvbnNlIG9iamVjdFxuICAgICAgcmV0dXJuIGMuYm9keShjb250ZW50KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oYFN0YXRpYyBmaWxlOiAke3BhdGh9IGlzIG5vdCBmb3VuZGApXG4gICAgICBhd2FpdCBuZXh0KClcbiAgICB9XG4gICAgcmV0dXJuXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLFdBQVcsUUFBUSwwQkFBeUI7QUFDckQsU0FBUyxXQUFXLFFBQVEsc0JBQXFCO0FBRWpELDZEQUE2RDtBQUM3RCxhQUFhO0FBQ2IsTUFBTSxFQUFFLFNBQVEsRUFBRSxHQUFHO0FBUXJCLE1BQU0sbUJBQW1CO0FBRXpCLE9BQU8sTUFBTSxjQUFjLENBQUMsVUFBOEI7SUFBRSxNQUFNO0FBQUcsQ0FBQyxHQUFLO0lBQ3pFLE9BQU8sT0FBTyxHQUFZLE9BQWU7UUFDdkMsd0NBQXdDO1FBQ3hDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDZixNQUFNO1lBQ047UUFDRixDQUFDO1FBRUQsTUFBTSxNQUFNLElBQUksSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHO1FBQzdCLE1BQU0sV0FBVyxRQUFRLElBQUksSUFBSSxVQUFVLElBQUksUUFBUTtRQUN2RCxJQUFJLE9BQU8sWUFBWTtZQUNyQixVQUFVLFFBQVEsa0JBQWtCLEdBQUcsUUFBUSxrQkFBa0IsQ0FBQyxZQUFZLFFBQVE7WUFDdEYsTUFBTSxRQUFRLElBQUk7WUFDbEIsaUJBQWlCO1FBQ25CO1FBRUEsT0FBTyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUM7UUFFbEIsSUFBSTtRQUVKLElBQUk7WUFDRixVQUFVLE1BQU0sU0FBUztRQUMzQixFQUFFLE9BQU8sR0FBRztZQUNWLFFBQVEsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDckI7UUFFQSxJQUFJLFNBQVM7WUFDWCxNQUFNLFdBQVcsWUFBWTtZQUM3QixJQUFJLFVBQVU7Z0JBQ1osRUFBRSxNQUFNLENBQUMsZ0JBQWdCO1lBQzNCLENBQUM7WUFDRCx5QkFBeUI7WUFDekIsT0FBTyxFQUFFLElBQUksQ0FBQztRQUNoQixPQUFPO1lBQ0wsUUFBUSxJQUFJLENBQUMsQ0FBQyxhQUFhLEVBQUUsS0FBSyxhQUFhLENBQUM7WUFDaEQsTUFBTTtRQUNSLENBQUM7UUFDRDtJQUNGO0FBQ0YsRUFBQyJ9