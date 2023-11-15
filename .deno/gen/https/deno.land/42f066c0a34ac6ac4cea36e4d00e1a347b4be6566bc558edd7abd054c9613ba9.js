import { HTTPException } from '../../http-exception.ts';
import { timingSafeEqual } from '../../utils/buffer.ts';
const TOKEN_STRINGS = '[A-Za-z0-9._~+/-]+=*';
const PREFIX = 'Bearer';
export const bearerAuth = (options)=>{
    if (!options.token) {
        throw new Error('bearer auth middleware requires options for "token"');
    }
    if (!options.realm) {
        options.realm = '';
    }
    if (!options.prefix) {
        options.prefix = PREFIX;
    }
    const realm = options.realm?.replace(/"/g, '\\"');
    return async (c, next)=>{
        const headerToken = c.req.headers.get('Authorization');
        if (!headerToken) {
            // No Authorization header
            const res = new Response('Unauthorized', {
                status: 401,
                headers: {
                    'WWW-Authenticate': `${options.prefix} realm="` + realm + '"'
                }
            });
            throw new HTTPException(401, {
                res
            });
        } else {
            const regexp = new RegExp('^' + options.prefix + ' +(' + TOKEN_STRINGS + ') *$');
            const match = regexp.exec(headerToken);
            if (!match) {
                // Invalid Request
                const res = new Response('Bad Request', {
                    status: 400,
                    headers: {
                        'WWW-Authenticate': `${options.prefix} error="invalid_request"`
                    }
                });
                throw new HTTPException(400, {
                    res
                });
            } else {
                const equal = await timingSafeEqual(options.token, match[1], options.hashFunction);
                if (!equal) {
                    // Invalid Token
                    const res = new Response('Unauthorized', {
                        status: 401,
                        headers: {
                            'WWW-Authenticate': `${options.prefix} error="invalid_token"`
                        }
                    });
                    throw new HTTPException(401, {
                        res
                    });
                }
            }
        }
        await next();
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvbWlkZGxld2FyZS9iZWFyZXItYXV0aC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIVFRQRXhjZXB0aW9uIH0gZnJvbSAnLi4vLi4vaHR0cC1leGNlcHRpb24udHMnXG5pbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5pbXBvcnQgeyB0aW1pbmdTYWZlRXF1YWwgfSBmcm9tICcuLi8uLi91dGlscy9idWZmZXIudHMnXG5cbmNvbnN0IFRPS0VOX1NUUklOR1MgPSAnW0EtWmEtejAtOS5ffisvLV0rPSonXG5jb25zdCBQUkVGSVggPSAnQmVhcmVyJ1xuXG5leHBvcnQgY29uc3QgYmVhcmVyQXV0aCA9IChvcHRpb25zOiB7XG4gIHRva2VuOiBzdHJpbmdcbiAgcmVhbG0/OiBzdHJpbmdcbiAgcHJlZml4Pzogc3RyaW5nXG4gIGhhc2hGdW5jdGlvbj86IEZ1bmN0aW9uXG59KTogTWlkZGxld2FyZUhhbmRsZXIgPT4ge1xuICBpZiAoIW9wdGlvbnMudG9rZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JlYXJlciBhdXRoIG1pZGRsZXdhcmUgcmVxdWlyZXMgb3B0aW9ucyBmb3IgXCJ0b2tlblwiJylcbiAgfVxuICBpZiAoIW9wdGlvbnMucmVhbG0pIHtcbiAgICBvcHRpb25zLnJlYWxtID0gJydcbiAgfVxuICBpZiAoIW9wdGlvbnMucHJlZml4KSB7XG4gICAgb3B0aW9ucy5wcmVmaXggPSBQUkVGSVhcbiAgfVxuXG4gIGNvbnN0IHJlYWxtID0gb3B0aW9ucy5yZWFsbT8ucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpXG5cbiAgcmV0dXJuIGFzeW5jIChjLCBuZXh0KSA9PiB7XG4gICAgY29uc3QgaGVhZGVyVG9rZW4gPSBjLnJlcS5oZWFkZXJzLmdldCgnQXV0aG9yaXphdGlvbicpXG5cbiAgICBpZiAoIWhlYWRlclRva2VuKSB7XG4gICAgICAvLyBObyBBdXRob3JpemF0aW9uIGhlYWRlclxuICAgICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKCdVbmF1dGhvcml6ZWQnLCB7XG4gICAgICAgIHN0YXR1czogNDAxLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1dXVy1BdXRoZW50aWNhdGUnOiBgJHtvcHRpb25zLnByZWZpeH0gcmVhbG09XCJgICsgcmVhbG0gKyAnXCInLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIHRocm93IG5ldyBIVFRQRXhjZXB0aW9uKDQwMSwgeyByZXMgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcmVnZXhwID0gbmV3IFJlZ0V4cCgnXicgKyBvcHRpb25zLnByZWZpeCArICcgKygnICsgVE9LRU5fU1RSSU5HUyArICcpICokJylcbiAgICAgIGNvbnN0IG1hdGNoID0gcmVnZXhwLmV4ZWMoaGVhZGVyVG9rZW4pXG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIC8vIEludmFsaWQgUmVxdWVzdFxuICAgICAgICBjb25zdCByZXMgPSBuZXcgUmVzcG9uc2UoJ0JhZCBSZXF1ZXN0Jywge1xuICAgICAgICAgIHN0YXR1czogNDAwLFxuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdXV1ctQXV0aGVudGljYXRlJzogYCR7b3B0aW9ucy5wcmVmaXh9IGVycm9yPVwiaW52YWxpZF9yZXF1ZXN0XCJgLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICAgIHRocm93IG5ldyBIVFRQRXhjZXB0aW9uKDQwMCwgeyByZXMgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGVxdWFsID0gYXdhaXQgdGltaW5nU2FmZUVxdWFsKG9wdGlvbnMudG9rZW4sIG1hdGNoWzFdLCBvcHRpb25zLmhhc2hGdW5jdGlvbilcbiAgICAgICAgaWYgKCFlcXVhbCkge1xuICAgICAgICAgIC8vIEludmFsaWQgVG9rZW5cbiAgICAgICAgICBjb25zdCByZXMgPSBuZXcgUmVzcG9uc2UoJ1VuYXV0aG9yaXplZCcsIHtcbiAgICAgICAgICAgIHN0YXR1czogNDAxLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAnV1dXLUF1dGhlbnRpY2F0ZSc6IGAke29wdGlvbnMucHJlZml4fSBlcnJvcj1cImludmFsaWRfdG9rZW5cImAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pXG4gICAgICAgICAgdGhyb3cgbmV3IEhUVFBFeGNlcHRpb24oNDAxLCB7IHJlcyB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGF3YWl0IG5leHQoKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxhQUFhLFFBQVEsMEJBQXlCO0FBRXZELFNBQVMsZUFBZSxRQUFRLHdCQUF1QjtBQUV2RCxNQUFNLGdCQUFnQjtBQUN0QixNQUFNLFNBQVM7QUFFZixPQUFPLE1BQU0sYUFBYSxDQUFDLFVBS0Y7SUFDdkIsSUFBSSxDQUFDLFFBQVEsS0FBSyxFQUFFO1FBQ2xCLE1BQU0sSUFBSSxNQUFNLHVEQUFzRDtJQUN4RSxDQUFDO0lBQ0QsSUFBSSxDQUFDLFFBQVEsS0FBSyxFQUFFO1FBQ2xCLFFBQVEsS0FBSyxHQUFHO0lBQ2xCLENBQUM7SUFDRCxJQUFJLENBQUMsUUFBUSxNQUFNLEVBQUU7UUFDbkIsUUFBUSxNQUFNLEdBQUc7SUFDbkIsQ0FBQztJQUVELE1BQU0sUUFBUSxRQUFRLEtBQUssRUFBRSxRQUFRLE1BQU07SUFFM0MsT0FBTyxPQUFPLEdBQUcsT0FBUztRQUN4QixNQUFNLGNBQWMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUV0QyxJQUFJLENBQUMsYUFBYTtZQUNoQiwwQkFBMEI7WUFDMUIsTUFBTSxNQUFNLElBQUksU0FBUyxnQkFBZ0I7Z0JBQ3ZDLFFBQVE7Z0JBQ1IsU0FBUztvQkFDUCxvQkFBb0IsQ0FBQyxFQUFFLFFBQVEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFFBQVE7Z0JBQzVEO1lBQ0Y7WUFDQSxNQUFNLElBQUksY0FBYyxLQUFLO2dCQUFFO1lBQUksR0FBRTtRQUN2QyxPQUFPO1lBQ0wsTUFBTSxTQUFTLElBQUksT0FBTyxNQUFNLFFBQVEsTUFBTSxHQUFHLFFBQVEsZ0JBQWdCO1lBQ3pFLE1BQU0sUUFBUSxPQUFPLElBQUksQ0FBQztZQUMxQixJQUFJLENBQUMsT0FBTztnQkFDVixrQkFBa0I7Z0JBQ2xCLE1BQU0sTUFBTSxJQUFJLFNBQVMsZUFBZTtvQkFDdEMsUUFBUTtvQkFDUixTQUFTO3dCQUNQLG9CQUFvQixDQUFDLEVBQUUsUUFBUSxNQUFNLENBQUMsd0JBQXdCLENBQUM7b0JBQ2pFO2dCQUNGO2dCQUNBLE1BQU0sSUFBSSxjQUFjLEtBQUs7b0JBQUU7Z0JBQUksR0FBRTtZQUN2QyxPQUFPO2dCQUNMLE1BQU0sUUFBUSxNQUFNLGdCQUFnQixRQUFRLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLFFBQVEsWUFBWTtnQkFDakYsSUFBSSxDQUFDLE9BQU87b0JBQ1YsZ0JBQWdCO29CQUNoQixNQUFNLE1BQU0sSUFBSSxTQUFTLGdCQUFnQjt3QkFDdkMsUUFBUTt3QkFDUixTQUFTOzRCQUNQLG9CQUFvQixDQUFDLEVBQUUsUUFBUSxNQUFNLENBQUMsc0JBQXNCLENBQUM7d0JBQy9EO29CQUNGO29CQUNBLE1BQU0sSUFBSSxjQUFjLEtBQUs7d0JBQUU7b0JBQUksR0FBRTtnQkFDdkMsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTTtJQUNSO0FBQ0YsRUFBQyJ9