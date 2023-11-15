import { HTTPException } from '../../http-exception.ts';
import { Jwt } from '../../utils/jwt/index.ts';
import '../../context.ts';
export const jwt = (options)=>{
    if (!options) {
        throw new Error('JWT auth middleware requires options for "secret');
    }
    if (!crypto.subtle || !crypto.subtle.importKey) {
        throw new Error('`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.');
    }
    return async (ctx, next)=>{
        const credentials = ctx.req.headers.get('Authorization');
        let token;
        if (credentials) {
            const parts = credentials.split(/\s+/);
            if (parts.length !== 2) {
                const res = new Response('Unauthorized', {
                    status: 401,
                    headers: {
                        'WWW-Authenticate': `Bearer realm="${ctx.req.url}",error="invalid_request",error_description="invalid credentials structure"`
                    }
                });
                throw new HTTPException(401, {
                    res
                });
            } else {
                token = parts[1];
            }
        } else if (options.cookie) {
            token = ctx.req.cookie(options.cookie);
        }
        if (!token) {
            const res = new Response('Unauthorized', {
                status: 401,
                headers: {
                    'WWW-Authenticate': `Bearer realm="${ctx.req.url}",error="invalid_request",error_description="no authorization included in request"`
                }
            });
            throw new HTTPException(401, {
                res
            });
        }
        let payload;
        let msg = '';
        try {
            payload = await Jwt.verify(token, options.secret, options.alg);
        } catch (e) {
            msg = `${e}`;
        }
        if (!payload) {
            const res = new Response('Unauthorized', {
                status: 401,
                statusText: msg,
                headers: {
                    'WWW-Authenticate': `Bearer realm="${ctx.req.url}",error="invalid_token",error_description="token verification failure"`
                }
            });
            throw new HTTPException(401, {
                res
            });
        }
        ctx.set('jwtPayload', payload);
        await next();
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvbWlkZGxld2FyZS9qd3QvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSFRUUEV4Y2VwdGlvbiB9IGZyb20gJy4uLy4uL2h0dHAtZXhjZXB0aW9uLnRzJ1xuaW1wb3J0IHR5cGUgeyBNaWRkbGV3YXJlSGFuZGxlciB9IGZyb20gJy4uLy4uL3R5cGVzLnRzJ1xuaW1wb3J0IHsgSnd0IH0gZnJvbSAnLi4vLi4vdXRpbHMvand0L2luZGV4LnRzJ1xuaW1wb3J0IHR5cGUgeyBBbGdvcml0aG1UeXBlcyB9IGZyb20gJy4uLy4uL3V0aWxzL2p3dC90eXBlcy50cydcbmltcG9ydCAnLi4vLi4vY29udGV4dC50cydcblxuZGVjbGFyZSBtb2R1bGUgJy4uLy4uL2NvbnRleHQudHMnIHtcbiAgaW50ZXJmYWNlIENvbnRleHRWYXJpYWJsZU1hcCB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBqd3RQYXlsb2FkOiBhbnlcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgand0ID0gKG9wdGlvbnM6IHtcbiAgc2VjcmV0OiBzdHJpbmdcbiAgY29va2llPzogc3RyaW5nXG4gIGFsZz86IHN0cmluZ1xufSk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdKV1QgYXV0aCBtaWRkbGV3YXJlIHJlcXVpcmVzIG9wdGlvbnMgZm9yIFwic2VjcmV0JylcbiAgfVxuXG4gIGlmICghY3J5cHRvLnN1YnRsZSB8fCAhY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2BjcnlwdG8uc3VidGxlLmltcG9ydEtleWAgaXMgdW5kZWZpbmVkLiBKV1QgYXV0aCBtaWRkbGV3YXJlIHJlcXVpcmVzIGl0LicpXG4gIH1cblxuICByZXR1cm4gYXN5bmMgKGN0eCwgbmV4dCkgPT4ge1xuICAgIGNvbnN0IGNyZWRlbnRpYWxzID0gY3R4LnJlcS5oZWFkZXJzLmdldCgnQXV0aG9yaXphdGlvbicpXG4gICAgbGV0IHRva2VuXG4gICAgaWYgKGNyZWRlbnRpYWxzKSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IGNyZWRlbnRpYWxzLnNwbGl0KC9cXHMrLylcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKCdVbmF1dGhvcml6ZWQnLCB7XG4gICAgICAgICAgc3RhdHVzOiA0MDEsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ1dXVy1BdXRoZW50aWNhdGUnOiBgQmVhcmVyIHJlYWxtPVwiJHtjdHgucmVxLnVybH1cIixlcnJvcj1cImludmFsaWRfcmVxdWVzdFwiLGVycm9yX2Rlc2NyaXB0aW9uPVwiaW52YWxpZCBjcmVkZW50aWFscyBzdHJ1Y3R1cmVcImAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICAgdGhyb3cgbmV3IEhUVFBFeGNlcHRpb24oNDAxLCB7IHJlcyB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9rZW4gPSBwYXJ0c1sxXVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5jb29raWUpIHtcbiAgICAgIHRva2VuID0gY3R4LnJlcS5jb29raWUob3B0aW9ucy5jb29raWUpXG4gICAgfVxuXG4gICAgaWYgKCF0b2tlbikge1xuICAgICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKCdVbmF1dGhvcml6ZWQnLCB7XG4gICAgICAgIHN0YXR1czogNDAxLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1dXVy1BdXRoZW50aWNhdGUnOiBgQmVhcmVyIHJlYWxtPVwiJHtjdHgucmVxLnVybH1cIixlcnJvcj1cImludmFsaWRfcmVxdWVzdFwiLGVycm9yX2Rlc2NyaXB0aW9uPVwibm8gYXV0aG9yaXphdGlvbiBpbmNsdWRlZCBpbiByZXF1ZXN0XCJgLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIHRocm93IG5ldyBIVFRQRXhjZXB0aW9uKDQwMSwgeyByZXMgfSlcbiAgICB9XG5cbiAgICBsZXQgcGF5bG9hZFxuICAgIGxldCBtc2cgPSAnJ1xuICAgIHRyeSB7XG4gICAgICBwYXlsb2FkID0gYXdhaXQgSnd0LnZlcmlmeSh0b2tlbiwgb3B0aW9ucy5zZWNyZXQsIG9wdGlvbnMuYWxnIGFzIEFsZ29yaXRobVR5cGVzKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG1zZyA9IGAke2V9YFxuICAgIH1cbiAgICBpZiAoIXBheWxvYWQpIHtcbiAgICAgIGNvbnN0IHJlcyA9IG5ldyBSZXNwb25zZSgnVW5hdXRob3JpemVkJywge1xuICAgICAgICBzdGF0dXM6IDQwMSxcbiAgICAgICAgc3RhdHVzVGV4dDogbXNnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1dXVy1BdXRoZW50aWNhdGUnOiBgQmVhcmVyIHJlYWxtPVwiJHtjdHgucmVxLnVybH1cIixlcnJvcj1cImludmFsaWRfdG9rZW5cIixlcnJvcl9kZXNjcmlwdGlvbj1cInRva2VuIHZlcmlmaWNhdGlvbiBmYWlsdXJlXCJgLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIHRocm93IG5ldyBIVFRQRXhjZXB0aW9uKDQwMSwgeyByZXMgfSlcbiAgICB9XG5cbiAgICBjdHguc2V0KCdqd3RQYXlsb2FkJywgcGF5bG9hZClcblxuICAgIGF3YWl0IG5leHQoKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxhQUFhLFFBQVEsMEJBQXlCO0FBRXZELFNBQVMsR0FBRyxRQUFRLDJCQUEwQjtBQUU5QyxPQUFPLG1CQUFrQjtBQVN6QixPQUFPLE1BQU0sTUFBTSxDQUFDLFVBSUs7SUFDdkIsSUFBSSxDQUFDLFNBQVM7UUFDWixNQUFNLElBQUksTUFBTSxvREFBbUQ7SUFDckUsQ0FBQztJQUVELElBQUksQ0FBQyxPQUFPLE1BQU0sSUFBSSxDQUFDLE9BQU8sTUFBTSxDQUFDLFNBQVMsRUFBRTtRQUM5QyxNQUFNLElBQUksTUFBTSw0RUFBMkU7SUFDN0YsQ0FBQztJQUVELE9BQU8sT0FBTyxLQUFLLE9BQVM7UUFDMUIsTUFBTSxjQUFjLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDeEMsSUFBSTtRQUNKLElBQUksYUFBYTtZQUNmLE1BQU0sUUFBUSxZQUFZLEtBQUssQ0FBQztZQUNoQyxJQUFJLE1BQU0sTUFBTSxLQUFLLEdBQUc7Z0JBQ3RCLE1BQU0sTUFBTSxJQUFJLFNBQVMsZ0JBQWdCO29CQUN2QyxRQUFRO29CQUNSLFNBQVM7d0JBQ1Asb0JBQW9CLENBQUMsY0FBYyxFQUFFLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQywyRUFBMkUsQ0FBQztvQkFDL0g7Z0JBQ0Y7Z0JBQ0EsTUFBTSxJQUFJLGNBQWMsS0FBSztvQkFBRTtnQkFBSSxHQUFFO1lBQ3ZDLE9BQU87Z0JBQ0wsUUFBUSxLQUFLLENBQUMsRUFBRTtZQUNsQixDQUFDO1FBQ0gsT0FBTyxJQUFJLFFBQVEsTUFBTSxFQUFFO1lBQ3pCLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsTUFBTTtRQUN2QyxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU87WUFDVixNQUFNLE1BQU0sSUFBSSxTQUFTLGdCQUFnQjtnQkFDdkMsUUFBUTtnQkFDUixTQUFTO29CQUNQLG9CQUFvQixDQUFDLGNBQWMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsa0ZBQWtGLENBQUM7Z0JBQ3RJO1lBQ0Y7WUFDQSxNQUFNLElBQUksY0FBYyxLQUFLO2dCQUFFO1lBQUksR0FBRTtRQUN2QyxDQUFDO1FBRUQsSUFBSTtRQUNKLElBQUksTUFBTTtRQUNWLElBQUk7WUFDRixVQUFVLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxRQUFRLE1BQU0sRUFBRSxRQUFRLEdBQUc7UUFDL0QsRUFBRSxPQUFPLEdBQUc7WUFDVixNQUFNLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDZDtRQUNBLElBQUksQ0FBQyxTQUFTO1lBQ1osTUFBTSxNQUFNLElBQUksU0FBUyxnQkFBZ0I7Z0JBQ3ZDLFFBQVE7Z0JBQ1IsWUFBWTtnQkFDWixTQUFTO29CQUNQLG9CQUFvQixDQUFDLGNBQWMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsc0VBQXNFLENBQUM7Z0JBQzFIO1lBQ0Y7WUFDQSxNQUFNLElBQUksY0FBYyxLQUFLO2dCQUFFO1lBQUksR0FBRTtRQUN2QyxDQUFDO1FBRUQsSUFBSSxHQUFHLENBQUMsY0FBYztRQUV0QixNQUFNO0lBQ1I7QUFDRixFQUFDIn0=