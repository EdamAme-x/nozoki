// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { html, raw } from '../../helper/html/index.ts';
import { jsx, createContext, useContext } from '../../jsx/index.ts';
import { renderToReadableStream } from '../../jsx/streaming.ts';
export const RequestContext = createContext(null);
const createRenderer = (c, component, options)=>(children, props)=>{
        const docType = typeof options?.docType === 'string' ? options.docType : options?.docType === true ? '<!DOCTYPE html>' : '';
        /* eslint-disable @typescript-eslint/no-explicit-any */ const body = html`${raw(docType)}${jsx(RequestContext.Provider, {
            value: c
        }, component ? component({
            children,
            ...props || {}
        }) : children)}`;
        if (options?.stream) {
            return c.body(renderToReadableStream(body), {
                headers: options.stream === true ? {
                    'Transfer-Encoding': 'chunked',
                    'Content-Type': 'text/html; charset=UTF-8'
                } : options.stream
            });
        } else {
            return c.html(body);
        }
    };
export const jsxRenderer = (component, options)=>(c, next)=>{
        /* eslint-disable @typescript-eslint/no-explicit-any */ c.setRenderer(createRenderer(c, component, options));
        return next();
    };
export const useRequestContext = ()=>{
    const c = useContext(RequestContext);
    if (!c) {
        throw new Error('RequestContext is not provided.');
    }
    return c;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvanN4LXJlbmRlcmVyL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ29udGV4dCwgUmVuZGVyZXIgfSBmcm9tICcuLi8uLi9jb250ZXh0LnRzJ1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuaW1wb3J0IHsgaHRtbCwgcmF3IH0gZnJvbSAnLi4vLi4vaGVscGVyL2h0bWwvaW5kZXgudHMnXG5pbXBvcnQgeyBqc3gsIGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQgfSBmcm9tICcuLi8uLi9qc3gvaW5kZXgudHMnXG5pbXBvcnQgdHlwZSB7IEZDLCBKU1hOb2RlIH0gZnJvbSAnLi4vLi4vanN4L2luZGV4LnRzJ1xuaW1wb3J0IHsgcmVuZGVyVG9SZWFkYWJsZVN0cmVhbSB9IGZyb20gJy4uLy4uL2pzeC9zdHJlYW1pbmcudHMnXG5pbXBvcnQgdHlwZSB7IEVudiwgSW5wdXQsIE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5cbmV4cG9ydCBjb25zdCBSZXF1ZXN0Q29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8Q29udGV4dCB8IG51bGw+KG51bGwpXG5cbnR5cGUgUHJvcHNGb3JSZW5kZXJlciA9IFsuLi5SZXF1aXJlZDxQYXJhbWV0ZXJzPFJlbmRlcmVyPj5dIGV4dGVuZHMgW3Vua25vd24sIGluZmVyIFByb3BzXVxuICA/IFByb3BzXG4gIDogdW5rbm93blxuXG50eXBlIFJlbmRlcmVyT3B0aW9ucyA9IHtcbiAgZG9jVHlwZT86IGJvb2xlYW4gfCBzdHJpbmdcbiAgc3RyZWFtPzogYm9vbGVhbiB8IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbn1cblxuY29uc3QgY3JlYXRlUmVuZGVyZXIgPVxuICAoYzogQ29udGV4dCwgY29tcG9uZW50PzogRkM8UHJvcHNGb3JSZW5kZXJlcj4sIG9wdGlvbnM/OiBSZW5kZXJlck9wdGlvbnMpID0+XG4gIChjaGlsZHJlbjogSlNYTm9kZSwgcHJvcHM6IFByb3BzRm9yUmVuZGVyZXIpID0+IHtcbiAgICBjb25zdCBkb2NUeXBlID1cbiAgICAgIHR5cGVvZiBvcHRpb25zPy5kb2NUeXBlID09PSAnc3RyaW5nJ1xuICAgICAgICA/IG9wdGlvbnMuZG9jVHlwZVxuICAgICAgICA6IG9wdGlvbnM/LmRvY1R5cGUgPT09IHRydWVcbiAgICAgICAgPyAnPCFET0NUWVBFIGh0bWw+J1xuICAgICAgICA6ICcnXG4gICAgLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xuICAgIGNvbnN0IGJvZHkgPSBodG1sYCR7cmF3KGRvY1R5cGUpfSR7anN4KFxuICAgICAgUmVxdWVzdENvbnRleHQuUHJvdmlkZXIsXG4gICAgICB7IHZhbHVlOiBjIH0sXG4gICAgICAoY29tcG9uZW50ID8gY29tcG9uZW50KHsgY2hpbGRyZW4sIC4uLihwcm9wcyB8fCB7fSkgfSkgOiBjaGlsZHJlbikgYXMgYW55XG4gICAgKX1gXG5cbiAgICBpZiAob3B0aW9ucz8uc3RyZWFtKSB7XG4gICAgICByZXR1cm4gYy5ib2R5KHJlbmRlclRvUmVhZGFibGVTdHJlYW0oYm9keSksIHtcbiAgICAgICAgaGVhZGVyczpcbiAgICAgICAgICBvcHRpb25zLnN0cmVhbSA9PT0gdHJ1ZVxuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgJ1RyYW5zZmVyLUVuY29kaW5nJzogJ2NodW5rZWQnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAndGV4dC9odG1sOyBjaGFyc2V0PVVURi04JyxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBvcHRpb25zLnN0cmVhbSxcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjLmh0bWwoYm9keSlcbiAgICB9XG4gIH1cblxuZXhwb3J0IGNvbnN0IGpzeFJlbmRlcmVyID1cbiAgKGNvbXBvbmVudD86IEZDPFByb3BzRm9yUmVuZGVyZXI+LCBvcHRpb25zPzogUmVuZGVyZXJPcHRpb25zKTogTWlkZGxld2FyZUhhbmRsZXIgPT5cbiAgKGMsIG5leHQpID0+IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG4gICAgYy5zZXRSZW5kZXJlcihjcmVhdGVSZW5kZXJlcihjLCBjb21wb25lbnQsIG9wdGlvbnMpIGFzIGFueSlcbiAgICByZXR1cm4gbmV4dCgpXG4gIH1cblxuZXhwb3J0IGNvbnN0IHVzZVJlcXVlc3RDb250ZXh0ID0gPFxuICBFIGV4dGVuZHMgRW52ID0gYW55LFxuICBQIGV4dGVuZHMgc3RyaW5nID0gYW55LFxuICBJIGV4dGVuZHMgSW5wdXQgPSB7fVxuPigpOiBDb250ZXh0PEUsIFAsIEk+ID0+IHtcbiAgY29uc3QgYyA9IHVzZUNvbnRleHQoUmVxdWVzdENvbnRleHQpXG4gIGlmICghYykge1xuICAgIHRocm93IG5ldyBFcnJvcignUmVxdWVzdENvbnRleHQgaXMgbm90IHByb3ZpZGVkLicpXG4gIH1cbiAgcmV0dXJuIGNcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSw2REFBNkQ7QUFDN0QsU0FBUyxJQUFJLEVBQUUsR0FBRyxRQUFRLDZCQUE0QjtBQUN0RCxTQUFTLEdBQUcsRUFBRSxhQUFhLEVBQUUsVUFBVSxRQUFRLHFCQUFvQjtBQUVuRSxTQUFTLHNCQUFzQixRQUFRLHlCQUF3QjtBQUcvRCxPQUFPLE1BQU0saUJBQWlCLGNBQThCLElBQUksRUFBQztBQVdqRSxNQUFNLGlCQUNKLENBQUMsR0FBWSxXQUFrQyxVQUMvQyxDQUFDLFVBQW1CLFFBQTRCO1FBQzlDLE1BQU0sVUFDSixPQUFPLFNBQVMsWUFBWSxXQUN4QixRQUFRLE9BQU8sR0FDZixTQUFTLFlBQVksSUFBSSxHQUN6QixvQkFDQSxFQUFFO1FBQ1IscURBQXFELEdBQ3JELE1BQU0sT0FBTyxJQUFJLENBQUMsRUFBRSxJQUFJLFNBQVMsRUFBRSxJQUNqQyxlQUFlLFFBQVEsRUFDdkI7WUFBRSxPQUFPO1FBQUUsR0FDVixZQUFZLFVBQVU7WUFBRTtZQUFVLEdBQUksU0FBUyxDQUFDLENBQUM7UUFBRSxLQUFLLFFBQVEsRUFDakUsQ0FBQztRQUVILElBQUksU0FBUyxRQUFRO1lBQ25CLE9BQU8sRUFBRSxJQUFJLENBQUMsdUJBQXVCLE9BQU87Z0JBQzFDLFNBQ0UsUUFBUSxNQUFNLEtBQUssSUFBSSxHQUNuQjtvQkFDRSxxQkFBcUI7b0JBQ3JCLGdCQUFnQjtnQkFDbEIsSUFDQSxRQUFRLE1BQU07WUFDdEI7UUFDRixPQUFPO1lBQ0wsT0FBTyxFQUFFLElBQUksQ0FBQztRQUNoQixDQUFDO0lBQ0g7QUFFRixPQUFPLE1BQU0sY0FDWCxDQUFDLFdBQWtDLFVBQ25DLENBQUMsR0FBRyxPQUFTO1FBQ1gscURBQXFELEdBQ3JELEVBQUUsV0FBVyxDQUFDLGVBQWUsR0FBRyxXQUFXO1FBQzNDLE9BQU87SUFDVCxFQUFDO0FBRUgsT0FBTyxNQUFNLG9CQUFvQixJQUlSO0lBQ3ZCLE1BQU0sSUFBSSxXQUFXO0lBQ3JCLElBQUksQ0FBQyxHQUFHO1FBQ04sTUFBTSxJQUFJLE1BQU0sbUNBQWtDO0lBQ3BELENBQUM7SUFDRCxPQUFPO0FBQ1QsRUFBQyJ9