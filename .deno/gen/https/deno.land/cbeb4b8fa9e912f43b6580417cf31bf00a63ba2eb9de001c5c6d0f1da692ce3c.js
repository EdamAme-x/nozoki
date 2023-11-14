import { Context } from './context.ts';
// Based on the code in the MIT licensed `koa-compose` package.
export const compose = (middleware, onError, onNotFound)=>{
    const middlewareLength = middleware.length;
    return (context, next)=>{
        let index = -1;
        return dispatch(0);
        function dispatch(i) {
            if (i <= index) {
                throw new Error('next() called multiple times');
            }
            let handler = middleware[i];
            index = i;
            if (i === middlewareLength && next) handler = next;
            let res;
            let isError = false;
            if (!handler) {
                if (context instanceof Context && context.finalized === false && onNotFound) {
                    res = onNotFound(context);
                }
            } else {
                try {
                    res = handler(context, ()=>{
                        const dispatchRes = dispatch(i + 1);
                        return dispatchRes instanceof Promise ? dispatchRes : Promise.resolve(dispatchRes);
                    });
                } catch (err) {
                    if (err instanceof Error && context instanceof Context && onError) {
                        context.error = err;
                        res = onError(err, context);
                        isError = true;
                    } else {
                        throw err;
                    }
                }
            }
            if (!(res instanceof Promise)) {
                if (res !== undefined && 'response' in res) {
                    res = res['response'];
                }
                if (res && (context.finalized === false || isError)) {
                    context.res = res;
                }
                return context;
            } else {
                return res.then((res)=>{
                    if (res !== undefined && 'response' in res) {
                        res = res['response'];
                    }
                    if (res && context.finalized === false) {
                        context.res = res;
                    }
                    return context;
                }).catch(async (err)=>{
                    if (err instanceof Error && context instanceof Context && onError) {
                        context.error = err;
                        context.res = await onError(err, context);
                        return context;
                    }
                    throw err;
                });
            }
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvY29tcG9zZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHR5cGUgeyBFbnYsIE5vdEZvdW5kSGFuZGxlciwgRXJyb3JIYW5kbGVyIH0gZnJvbSAnLi90eXBlcy50cydcblxuaW50ZXJmYWNlIENvbXBvc2VDb250ZXh0IHtcbiAgZmluYWxpemVkOiBib29sZWFuXG4gIHJlczogdW5rbm93blxufVxuXG4vLyBCYXNlZCBvbiB0aGUgY29kZSBpbiB0aGUgTUlUIGxpY2Vuc2VkIGBrb2EtY29tcG9zZWAgcGFja2FnZS5cbmV4cG9ydCBjb25zdCBjb21wb3NlID0gPEMgZXh0ZW5kcyBDb21wb3NlQ29udGV4dCwgRSBleHRlbmRzIEVudiA9IEVudj4oXG4gIG1pZGRsZXdhcmU6IEZ1bmN0aW9uW10sXG4gIG9uRXJyb3I/OiBFcnJvckhhbmRsZXI8RT4sXG4gIG9uTm90Rm91bmQ/OiBOb3RGb3VuZEhhbmRsZXI8RT5cbikgPT4ge1xuICBjb25zdCBtaWRkbGV3YXJlTGVuZ3RoID0gbWlkZGxld2FyZS5sZW5ndGhcbiAgcmV0dXJuIChjb250ZXh0OiBDLCBuZXh0PzogRnVuY3Rpb24pID0+IHtcbiAgICBsZXQgaW5kZXggPSAtMVxuICAgIHJldHVybiBkaXNwYXRjaCgwKVxuXG4gICAgZnVuY3Rpb24gZGlzcGF0Y2goaTogbnVtYmVyKTogQyB8IFByb21pc2U8Qz4ge1xuICAgICAgaWYgKGkgPD0gaW5kZXgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCduZXh0KCkgY2FsbGVkIG11bHRpcGxlIHRpbWVzJylcbiAgICAgIH1cbiAgICAgIGxldCBoYW5kbGVyID0gbWlkZGxld2FyZVtpXVxuICAgICAgaW5kZXggPSBpXG4gICAgICBpZiAoaSA9PT0gbWlkZGxld2FyZUxlbmd0aCAmJiBuZXh0KSBoYW5kbGVyID0gbmV4dFxuXG4gICAgICBsZXQgcmVzXG4gICAgICBsZXQgaXNFcnJvciA9IGZhbHNlXG5cbiAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICBpZiAoY29udGV4dCBpbnN0YW5jZW9mIENvbnRleHQgJiYgY29udGV4dC5maW5hbGl6ZWQgPT09IGZhbHNlICYmIG9uTm90Rm91bmQpIHtcbiAgICAgICAgICByZXMgPSBvbk5vdEZvdW5kKGNvbnRleHQpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzID0gaGFuZGxlcihjb250ZXh0LCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkaXNwYXRjaFJlcyA9IGRpc3BhdGNoKGkgKyAxKVxuICAgICAgICAgICAgcmV0dXJuIGRpc3BhdGNoUmVzIGluc3RhbmNlb2YgUHJvbWlzZSA/IGRpc3BhdGNoUmVzIDogUHJvbWlzZS5yZXNvbHZlKGRpc3BhdGNoUmVzKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvciAmJiBjb250ZXh0IGluc3RhbmNlb2YgQ29udGV4dCAmJiBvbkVycm9yKSB7XG4gICAgICAgICAgICBjb250ZXh0LmVycm9yID0gZXJyXG4gICAgICAgICAgICByZXMgPSBvbkVycm9yKGVyciwgY29udGV4dClcbiAgICAgICAgICAgIGlzRXJyb3IgPSB0cnVlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGVyclxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIShyZXMgaW5zdGFuY2VvZiBQcm9taXNlKSkge1xuICAgICAgICBpZiAocmVzICE9PSB1bmRlZmluZWQgJiYgJ3Jlc3BvbnNlJyBpbiByZXMpIHtcbiAgICAgICAgICByZXMgPSByZXNbJ3Jlc3BvbnNlJ11cbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzICYmIChjb250ZXh0LmZpbmFsaXplZCA9PT0gZmFsc2UgfHwgaXNFcnJvcikpIHtcbiAgICAgICAgICBjb250ZXh0LnJlcyA9IHJlc1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZXh0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzXG4gICAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgaWYgKHJlcyAhPT0gdW5kZWZpbmVkICYmICdyZXNwb25zZScgaW4gcmVzKSB7XG4gICAgICAgICAgICAgIHJlcyA9IHJlc1sncmVzcG9uc2UnXVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcyAmJiBjb250ZXh0LmZpbmFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgY29udGV4dC5yZXMgPSByZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goYXN5bmMgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yICYmIGNvbnRleHQgaW5zdGFuY2VvZiBDb250ZXh0ICYmIG9uRXJyb3IpIHtcbiAgICAgICAgICAgICAgY29udGV4dC5lcnJvciA9IGVyclxuICAgICAgICAgICAgICBjb250ZXh0LnJlcyA9IGF3YWl0IG9uRXJyb3IoZXJyLCBjb250ZXh0KVxuICAgICAgICAgICAgICByZXR1cm4gY29udGV4dFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLE9BQU8sUUFBUSxlQUFjO0FBUXRDLCtEQUErRDtBQUMvRCxPQUFPLE1BQU0sVUFBVSxDQUNyQixZQUNBLFNBQ0EsYUFDRztJQUNILE1BQU0sbUJBQW1CLFdBQVcsTUFBTTtJQUMxQyxPQUFPLENBQUMsU0FBWSxPQUFvQjtRQUN0QyxJQUFJLFFBQVEsQ0FBQztRQUNiLE9BQU8sU0FBUztRQUVoQixTQUFTLFNBQVMsQ0FBUyxFQUFrQjtZQUMzQyxJQUFJLEtBQUssT0FBTztnQkFDZCxNQUFNLElBQUksTUFBTSxnQ0FBK0I7WUFDakQsQ0FBQztZQUNELElBQUksVUFBVSxVQUFVLENBQUMsRUFBRTtZQUMzQixRQUFRO1lBQ1IsSUFBSSxNQUFNLG9CQUFvQixNQUFNLFVBQVU7WUFFOUMsSUFBSTtZQUNKLElBQUksVUFBVSxLQUFLO1lBRW5CLElBQUksQ0FBQyxTQUFTO2dCQUNaLElBQUksbUJBQW1CLFdBQVcsUUFBUSxTQUFTLEtBQUssS0FBSyxJQUFJLFlBQVk7b0JBQzNFLE1BQU0sV0FBVztnQkFDbkIsQ0FBQztZQUNILE9BQU87Z0JBQ0wsSUFBSTtvQkFDRixNQUFNLFFBQVEsU0FBUyxJQUFNO3dCQUMzQixNQUFNLGNBQWMsU0FBUyxJQUFJO3dCQUNqQyxPQUFPLHVCQUF1QixVQUFVLGNBQWMsUUFBUSxPQUFPLENBQUMsWUFBWTtvQkFDcEY7Z0JBQ0YsRUFBRSxPQUFPLEtBQUs7b0JBQ1osSUFBSSxlQUFlLFNBQVMsbUJBQW1CLFdBQVcsU0FBUzt3QkFDakUsUUFBUSxLQUFLLEdBQUc7d0JBQ2hCLE1BQU0sUUFBUSxLQUFLO3dCQUNuQixVQUFVLElBQUk7b0JBQ2hCLE9BQU87d0JBQ0wsTUFBTSxJQUFHO29CQUNYLENBQUM7Z0JBQ0g7WUFDRixDQUFDO1lBRUQsSUFBSSxDQUFDLENBQUMsZUFBZSxPQUFPLEdBQUc7Z0JBQzdCLElBQUksUUFBUSxhQUFhLGNBQWMsS0FBSztvQkFDMUMsTUFBTSxHQUFHLENBQUMsV0FBVztnQkFDdkIsQ0FBQztnQkFDRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLFNBQVMsS0FBSyxLQUFLLElBQUksT0FBTyxHQUFHO29CQUNuRCxRQUFRLEdBQUcsR0FBRztnQkFDaEIsQ0FBQztnQkFDRCxPQUFPO1lBQ1QsT0FBTztnQkFDTCxPQUFPLElBQ0osSUFBSSxDQUFDLENBQUMsTUFBUTtvQkFDYixJQUFJLFFBQVEsYUFBYSxjQUFjLEtBQUs7d0JBQzFDLE1BQU0sR0FBRyxDQUFDLFdBQVc7b0JBQ3ZCLENBQUM7b0JBQ0QsSUFBSSxPQUFPLFFBQVEsU0FBUyxLQUFLLEtBQUssRUFBRTt3QkFDdEMsUUFBUSxHQUFHLEdBQUc7b0JBQ2hCLENBQUM7b0JBQ0QsT0FBTztnQkFDVCxHQUNDLEtBQUssQ0FBQyxPQUFPLE1BQVE7b0JBQ3BCLElBQUksZUFBZSxTQUFTLG1CQUFtQixXQUFXLFNBQVM7d0JBQ2pFLFFBQVEsS0FBSyxHQUFHO3dCQUNoQixRQUFRLEdBQUcsR0FBRyxNQUFNLFFBQVEsS0FBSzt3QkFDakMsT0FBTztvQkFDVCxDQUFDO29CQUNELE1BQU0sSUFBRztnQkFDWDtZQUNKLENBQUM7UUFDSDtJQUNGO0FBQ0YsRUFBQyJ9