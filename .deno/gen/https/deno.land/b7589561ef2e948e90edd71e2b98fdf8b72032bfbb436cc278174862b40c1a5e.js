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
        const headerToken = c.req.header('Authorization');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvYmVhcmVyLWF1dGgvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSFRUUEV4Y2VwdGlvbiB9IGZyb20gJy4uLy4uL2h0dHAtZXhjZXB0aW9uLnRzJ1xuaW1wb3J0IHR5cGUgeyBNaWRkbGV3YXJlSGFuZGxlciB9IGZyb20gJy4uLy4uL3R5cGVzLnRzJ1xuaW1wb3J0IHsgdGltaW5nU2FmZUVxdWFsIH0gZnJvbSAnLi4vLi4vdXRpbHMvYnVmZmVyLnRzJ1xuXG5jb25zdCBUT0tFTl9TVFJJTkdTID0gJ1tBLVphLXowLTkuX34rLy1dKz0qJ1xuY29uc3QgUFJFRklYID0gJ0JlYXJlcidcblxuZXhwb3J0IGNvbnN0IGJlYXJlckF1dGggPSAob3B0aW9uczoge1xuICB0b2tlbjogc3RyaW5nXG4gIHJlYWxtPzogc3RyaW5nXG4gIHByZWZpeD86IHN0cmluZ1xuICBoYXNoRnVuY3Rpb24/OiBGdW5jdGlvblxufSk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgaWYgKCFvcHRpb25zLnRva2VuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiZWFyZXIgYXV0aCBtaWRkbGV3YXJlIHJlcXVpcmVzIG9wdGlvbnMgZm9yIFwidG9rZW5cIicpXG4gIH1cbiAgaWYgKCFvcHRpb25zLnJlYWxtKSB7XG4gICAgb3B0aW9ucy5yZWFsbSA9ICcnXG4gIH1cbiAgaWYgKCFvcHRpb25zLnByZWZpeCkge1xuICAgIG9wdGlvbnMucHJlZml4ID0gUFJFRklYXG4gIH1cblxuICBjb25zdCByZWFsbSA9IG9wdGlvbnMucmVhbG0/LnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxuXG4gIHJldHVybiBhc3luYyAoYywgbmV4dCkgPT4ge1xuICAgIGNvbnN0IGhlYWRlclRva2VuID0gYy5yZXEuaGVhZGVyKCdBdXRob3JpemF0aW9uJylcblxuICAgIGlmICghaGVhZGVyVG9rZW4pIHtcbiAgICAgIC8vIE5vIEF1dGhvcml6YXRpb24gaGVhZGVyXG4gICAgICBjb25zdCByZXMgPSBuZXcgUmVzcG9uc2UoJ1VuYXV0aG9yaXplZCcsIHtcbiAgICAgICAgc3RhdHVzOiA0MDEsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnV1dXLUF1dGhlbnRpY2F0ZSc6IGAke29wdGlvbnMucHJlZml4fSByZWFsbT1cImAgKyByZWFsbSArICdcIicsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICAgdGhyb3cgbmV3IEhUVFBFeGNlcHRpb24oNDAxLCB7IHJlcyB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByZWdleHAgPSBuZXcgUmVnRXhwKCdeJyArIG9wdGlvbnMucHJlZml4ICsgJyArKCcgKyBUT0tFTl9TVFJJTkdTICsgJykgKiQnKVxuICAgICAgY29uc3QgbWF0Y2ggPSByZWdleHAuZXhlYyhoZWFkZXJUb2tlbilcbiAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgLy8gSW52YWxpZCBSZXF1ZXN0XG4gICAgICAgIGNvbnN0IHJlcyA9IG5ldyBSZXNwb25zZSgnQmFkIFJlcXVlc3QnLCB7XG4gICAgICAgICAgc3RhdHVzOiA0MDAsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ1dXVy1BdXRoZW50aWNhdGUnOiBgJHtvcHRpb25zLnByZWZpeH0gZXJyb3I9XCJpbnZhbGlkX3JlcXVlc3RcImAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICAgdGhyb3cgbmV3IEhUVFBFeGNlcHRpb24oNDAwLCB7IHJlcyB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXF1YWwgPSBhd2FpdCB0aW1pbmdTYWZlRXF1YWwob3B0aW9ucy50b2tlbiwgbWF0Y2hbMV0sIG9wdGlvbnMuaGFzaEZ1bmN0aW9uKVxuICAgICAgICBpZiAoIWVxdWFsKSB7XG4gICAgICAgICAgLy8gSW52YWxpZCBUb2tlblxuICAgICAgICAgIGNvbnN0IHJlcyA9IG5ldyBSZXNwb25zZSgnVW5hdXRob3JpemVkJywge1xuICAgICAgICAgICAgc3RhdHVzOiA0MDEsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICdXV1ctQXV0aGVudGljYXRlJzogYCR7b3B0aW9ucy5wcmVmaXh9IGVycm9yPVwiaW52YWxpZF90b2tlblwiYCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSlcbiAgICAgICAgICB0aHJvdyBuZXcgSFRUUEV4Y2VwdGlvbig0MDEsIHsgcmVzIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgYXdhaXQgbmV4dCgpXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLGFBQWEsUUFBUSwwQkFBeUI7QUFFdkQsU0FBUyxlQUFlLFFBQVEsd0JBQXVCO0FBRXZELE1BQU0sZ0JBQWdCO0FBQ3RCLE1BQU0sU0FBUztBQUVmLE9BQU8sTUFBTSxhQUFhLENBQUMsVUFLRjtJQUN2QixJQUFJLENBQUMsUUFBUSxLQUFLLEVBQUU7UUFDbEIsTUFBTSxJQUFJLE1BQU0sdURBQXNEO0lBQ3hFLENBQUM7SUFDRCxJQUFJLENBQUMsUUFBUSxLQUFLLEVBQUU7UUFDbEIsUUFBUSxLQUFLLEdBQUc7SUFDbEIsQ0FBQztJQUNELElBQUksQ0FBQyxRQUFRLE1BQU0sRUFBRTtRQUNuQixRQUFRLE1BQU0sR0FBRztJQUNuQixDQUFDO0lBRUQsTUFBTSxRQUFRLFFBQVEsS0FBSyxFQUFFLFFBQVEsTUFBTTtJQUUzQyxPQUFPLE9BQU8sR0FBRyxPQUFTO1FBQ3hCLE1BQU0sY0FBYyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFFakMsSUFBSSxDQUFDLGFBQWE7WUFDaEIsMEJBQTBCO1lBQzFCLE1BQU0sTUFBTSxJQUFJLFNBQVMsZ0JBQWdCO2dCQUN2QyxRQUFRO2dCQUNSLFNBQVM7b0JBQ1Asb0JBQW9CLENBQUMsRUFBRSxRQUFRLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxRQUFRO2dCQUM1RDtZQUNGO1lBQ0EsTUFBTSxJQUFJLGNBQWMsS0FBSztnQkFBRTtZQUFJLEdBQUU7UUFDdkMsT0FBTztZQUNMLE1BQU0sU0FBUyxJQUFJLE9BQU8sTUFBTSxRQUFRLE1BQU0sR0FBRyxRQUFRLGdCQUFnQjtZQUN6RSxNQUFNLFFBQVEsT0FBTyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU87Z0JBQ1Ysa0JBQWtCO2dCQUNsQixNQUFNLE1BQU0sSUFBSSxTQUFTLGVBQWU7b0JBQ3RDLFFBQVE7b0JBQ1IsU0FBUzt3QkFDUCxvQkFBb0IsQ0FBQyxFQUFFLFFBQVEsTUFBTSxDQUFDLHdCQUF3QixDQUFDO29CQUNqRTtnQkFDRjtnQkFDQSxNQUFNLElBQUksY0FBYyxLQUFLO29CQUFFO2dCQUFJLEdBQUU7WUFDdkMsT0FBTztnQkFDTCxNQUFNLFFBQVEsTUFBTSxnQkFBZ0IsUUFBUSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxRQUFRLFlBQVk7Z0JBQ2pGLElBQUksQ0FBQyxPQUFPO29CQUNWLGdCQUFnQjtvQkFDaEIsTUFBTSxNQUFNLElBQUksU0FBUyxnQkFBZ0I7d0JBQ3ZDLFFBQVE7d0JBQ1IsU0FBUzs0QkFDUCxvQkFBb0IsQ0FBQyxFQUFFLFFBQVEsTUFBTSxDQUFDLHNCQUFzQixDQUFDO3dCQUMvRDtvQkFDRjtvQkFDQSxNQUFNLElBQUksY0FBYyxLQUFLO3dCQUFFO29CQUFJLEdBQUU7Z0JBQ3ZDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU07SUFDUjtBQUNGLEVBQUMifQ==