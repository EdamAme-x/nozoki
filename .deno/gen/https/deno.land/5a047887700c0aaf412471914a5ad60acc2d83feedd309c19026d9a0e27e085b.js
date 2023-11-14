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
export const verify = Jwt.verify;
export const decode = Jwt.decode;
export const sign = Jwt.sign;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvand0L2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEhUVFBFeGNlcHRpb24gfSBmcm9tICcuLi8uLi9odHRwLWV4Y2VwdGlvbi50cydcbmltcG9ydCB0eXBlIHsgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi8uLi90eXBlcy50cydcbmltcG9ydCB7IEp3dCB9IGZyb20gJy4uLy4uL3V0aWxzL2p3dC9pbmRleC50cydcbmltcG9ydCB0eXBlIHsgQWxnb3JpdGhtVHlwZXMgfSBmcm9tICcuLi8uLi91dGlscy9qd3QvdHlwZXMudHMnXG5pbXBvcnQgJy4uLy4uL2NvbnRleHQudHMnXG5cbmRlY2xhcmUgbW9kdWxlICcuLi8uLi9jb250ZXh0LnRzJyB7XG4gIGludGVyZmFjZSBDb250ZXh0VmFyaWFibGVNYXAge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgand0UGF5bG9hZDogYW55XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGp3dCA9IChvcHRpb25zOiB7XG4gIHNlY3JldDogc3RyaW5nXG4gIGNvb2tpZT86IHN0cmluZ1xuICBhbGc/OiBzdHJpbmdcbn0pOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIGlmICghb3B0aW9ucykge1xuICAgIHRocm93IG5ldyBFcnJvcignSldUIGF1dGggbWlkZGxld2FyZSByZXF1aXJlcyBvcHRpb25zIGZvciBcInNlY3JldCcpXG4gIH1cblxuICBpZiAoIWNyeXB0by5zdWJ0bGUgfHwgIWNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXlgIGlzIHVuZGVmaW5lZC4gSldUIGF1dGggbWlkZGxld2FyZSByZXF1aXJlcyBpdC4nKVxuICB9XG5cbiAgcmV0dXJuIGFzeW5jIChjdHgsIG5leHQpID0+IHtcbiAgICBjb25zdCBjcmVkZW50aWFscyA9IGN0eC5yZXEuaGVhZGVycy5nZXQoJ0F1dGhvcml6YXRpb24nKVxuICAgIGxldCB0b2tlblxuICAgIGlmIChjcmVkZW50aWFscykge1xuICAgICAgY29uc3QgcGFydHMgPSBjcmVkZW50aWFscy5zcGxpdCgvXFxzKy8pXG4gICAgICBpZiAocGFydHMubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IG5ldyBSZXNwb25zZSgnVW5hdXRob3JpemVkJywge1xuICAgICAgICAgIHN0YXR1czogNDAxLFxuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdXV1ctQXV0aGVudGljYXRlJzogYEJlYXJlciByZWFsbT1cIiR7Y3R4LnJlcS51cmx9XCIsZXJyb3I9XCJpbnZhbGlkX3JlcXVlc3RcIixlcnJvcl9kZXNjcmlwdGlvbj1cImludmFsaWQgY3JlZGVudGlhbHMgc3RydWN0dXJlXCJgLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICAgIHRocm93IG5ldyBIVFRQRXhjZXB0aW9uKDQwMSwgeyByZXMgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRva2VuID0gcGFydHNbMV1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuY29va2llKSB7XG4gICAgICB0b2tlbiA9IGN0eC5yZXEuY29va2llKG9wdGlvbnMuY29va2llKVxuICAgIH1cblxuICAgIGlmICghdG9rZW4pIHtcbiAgICAgIGNvbnN0IHJlcyA9IG5ldyBSZXNwb25zZSgnVW5hdXRob3JpemVkJywge1xuICAgICAgICBzdGF0dXM6IDQwMSxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdXV1ctQXV0aGVudGljYXRlJzogYEJlYXJlciByZWFsbT1cIiR7Y3R4LnJlcS51cmx9XCIsZXJyb3I9XCJpbnZhbGlkX3JlcXVlc3RcIixlcnJvcl9kZXNjcmlwdGlvbj1cIm5vIGF1dGhvcml6YXRpb24gaW5jbHVkZWQgaW4gcmVxdWVzdFwiYCxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICB0aHJvdyBuZXcgSFRUUEV4Y2VwdGlvbig0MDEsIHsgcmVzIH0pXG4gICAgfVxuXG4gICAgbGV0IHBheWxvYWRcbiAgICBsZXQgbXNnID0gJydcbiAgICB0cnkge1xuICAgICAgcGF5bG9hZCA9IGF3YWl0IEp3dC52ZXJpZnkodG9rZW4sIG9wdGlvbnMuc2VjcmV0LCBvcHRpb25zLmFsZyBhcyBBbGdvcml0aG1UeXBlcylcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBtc2cgPSBgJHtlfWBcbiAgICB9XG4gICAgaWYgKCFwYXlsb2FkKSB7XG4gICAgICBjb25zdCByZXMgPSBuZXcgUmVzcG9uc2UoJ1VuYXV0aG9yaXplZCcsIHtcbiAgICAgICAgc3RhdHVzOiA0MDEsXG4gICAgICAgIHN0YXR1c1RleHQ6IG1zZyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdXV1ctQXV0aGVudGljYXRlJzogYEJlYXJlciByZWFsbT1cIiR7Y3R4LnJlcS51cmx9XCIsZXJyb3I9XCJpbnZhbGlkX3Rva2VuXCIsZXJyb3JfZGVzY3JpcHRpb249XCJ0b2tlbiB2ZXJpZmljYXRpb24gZmFpbHVyZVwiYCxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICB0aHJvdyBuZXcgSFRUUEV4Y2VwdGlvbig0MDEsIHsgcmVzIH0pXG4gICAgfVxuXG4gICAgY3R4LnNldCgnand0UGF5bG9hZCcsIHBheWxvYWQpXG5cbiAgICBhd2FpdCBuZXh0KClcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgdmVyaWZ5ID0gSnd0LnZlcmlmeVxuZXhwb3J0IGNvbnN0IGRlY29kZSA9IEp3dC5kZWNvZGVcbmV4cG9ydCBjb25zdCBzaWduID0gSnd0LnNpZ25cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLGFBQWEsUUFBUSwwQkFBeUI7QUFFdkQsU0FBUyxHQUFHLFFBQVEsMkJBQTBCO0FBRTlDLE9BQU8sbUJBQWtCO0FBU3pCLE9BQU8sTUFBTSxNQUFNLENBQUMsVUFJSztJQUN2QixJQUFJLENBQUMsU0FBUztRQUNaLE1BQU0sSUFBSSxNQUFNLG9EQUFtRDtJQUNyRSxDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxNQUFNLENBQUMsU0FBUyxFQUFFO1FBQzlDLE1BQU0sSUFBSSxNQUFNLDRFQUEyRTtJQUM3RixDQUFDO0lBRUQsT0FBTyxPQUFPLEtBQUssT0FBUztRQUMxQixNQUFNLGNBQWMsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUN4QyxJQUFJO1FBQ0osSUFBSSxhQUFhO1lBQ2YsTUFBTSxRQUFRLFlBQVksS0FBSyxDQUFDO1lBQ2hDLElBQUksTUFBTSxNQUFNLEtBQUssR0FBRztnQkFDdEIsTUFBTSxNQUFNLElBQUksU0FBUyxnQkFBZ0I7b0JBQ3ZDLFFBQVE7b0JBQ1IsU0FBUzt3QkFDUCxvQkFBb0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLDJFQUEyRSxDQUFDO29CQUMvSDtnQkFDRjtnQkFDQSxNQUFNLElBQUksY0FBYyxLQUFLO29CQUFFO2dCQUFJLEdBQUU7WUFDdkMsT0FBTztnQkFDTCxRQUFRLEtBQUssQ0FBQyxFQUFFO1lBQ2xCLENBQUM7UUFDSCxPQUFPLElBQUksUUFBUSxNQUFNLEVBQUU7WUFDekIsUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxNQUFNO1FBQ3ZDLENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTztZQUNWLE1BQU0sTUFBTSxJQUFJLFNBQVMsZ0JBQWdCO2dCQUN2QyxRQUFRO2dCQUNSLFNBQVM7b0JBQ1Asb0JBQW9CLENBQUMsY0FBYyxFQUFFLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxrRkFBa0YsQ0FBQztnQkFDdEk7WUFDRjtZQUNBLE1BQU0sSUFBSSxjQUFjLEtBQUs7Z0JBQUU7WUFBSSxHQUFFO1FBQ3ZDLENBQUM7UUFFRCxJQUFJO1FBQ0osSUFBSSxNQUFNO1FBQ1YsSUFBSTtZQUNGLFVBQVUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLFFBQVEsTUFBTSxFQUFFLFFBQVEsR0FBRztRQUMvRCxFQUFFLE9BQU8sR0FBRztZQUNWLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNkO1FBQ0EsSUFBSSxDQUFDLFNBQVM7WUFDWixNQUFNLE1BQU0sSUFBSSxTQUFTLGdCQUFnQjtnQkFDdkMsUUFBUTtnQkFDUixZQUFZO2dCQUNaLFNBQVM7b0JBQ1Asb0JBQW9CLENBQUMsY0FBYyxFQUFFLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxzRUFBc0UsQ0FBQztnQkFDMUg7WUFDRjtZQUNBLE1BQU0sSUFBSSxjQUFjLEtBQUs7Z0JBQUU7WUFBSSxHQUFFO1FBQ3ZDLENBQUM7UUFFRCxJQUFJLEdBQUcsQ0FBQyxjQUFjO1FBRXRCLE1BQU07SUFDUjtBQUNGLEVBQUM7QUFFRCxPQUFPLE1BQU0sU0FBUyxJQUFJLE1BQU0sQ0FBQTtBQUNoQyxPQUFPLE1BQU0sU0FBUyxJQUFJLE1BQU0sQ0FBQTtBQUNoQyxPQUFPLE1BQU0sT0FBTyxJQUFJLElBQUksQ0FBQSJ9