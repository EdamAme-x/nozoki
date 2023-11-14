import { HTTPException } from '../../http-exception.ts';
import { timingSafeEqual } from '../../utils/buffer.ts';
import { decodeBase64 } from '../../utils/encode.ts';
const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;
const USER_PASS_REGEXP = /^([^:]*):(.*)$/;
const utf8Decoder = new TextDecoder();
const auth = (req)=>{
    const match = CREDENTIALS_REGEXP.exec(req.headers.get('Authorization') || '');
    if (!match) {
        return undefined;
    }
    let userPass = undefined;
    // If an invalid string is passed to atob(), it throws a `DOMException`.
    try {
        userPass = USER_PASS_REGEXP.exec(utf8Decoder.decode(decodeBase64(match[1])));
    } catch  {} // Do nothing
    if (!userPass) {
        return undefined;
    }
    return {
        username: userPass[1],
        password: userPass[2]
    };
};
export const basicAuth = (options, ...users)=>{
    if (!options) {
        throw new Error('basic auth middleware requires options for "username and password"');
    }
    if (!options.realm) {
        options.realm = 'Secure Area';
    }
    users.unshift({
        username: options.username,
        password: options.password
    });
    return async (ctx, next)=>{
        const requestUser = auth(ctx.req);
        if (requestUser) {
            for (const user of users){
                const usernameEqual = await timingSafeEqual(user.username, requestUser.username, options.hashFunction);
                const passwordEqual = await timingSafeEqual(user.password, requestUser.password, options.hashFunction);
                if (usernameEqual && passwordEqual) {
                    await next();
                    return;
                }
            }
        }
        const res = new Response('Unauthorized', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="' + options.realm?.replace(/"/g, '\\"') + '"'
            }
        });
        throw new HTTPException(401, {
            res
        });
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvYmFzaWMtYXV0aC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIVFRQRXhjZXB0aW9uIH0gZnJvbSAnLi4vLi4vaHR0cC1leGNlcHRpb24udHMnXG5pbXBvcnQgdHlwZSB7IEhvbm9SZXF1ZXN0IH0gZnJvbSAnLi4vLi4vcmVxdWVzdC50cydcbmltcG9ydCB0eXBlIHsgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi8uLi90eXBlcy50cydcbmltcG9ydCB7IHRpbWluZ1NhZmVFcXVhbCB9IGZyb20gJy4uLy4uL3V0aWxzL2J1ZmZlci50cydcbmltcG9ydCB7IGRlY29kZUJhc2U2NCB9IGZyb20gJy4uLy4uL3V0aWxzL2VuY29kZS50cydcblxuY29uc3QgQ1JFREVOVElBTFNfUkVHRVhQID0gL14gKig/OltCYl1bQWFdW1NzXVtJaV1bQ2NdKSArKFtBLVphLXowLTkuX34rLy1dKz0qKSAqJC9cbmNvbnN0IFVTRVJfUEFTU19SRUdFWFAgPSAvXihbXjpdKik6KC4qKSQvXG5jb25zdCB1dGY4RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpXG5jb25zdCBhdXRoID0gKHJlcTogSG9ub1JlcXVlc3QpID0+IHtcbiAgY29uc3QgbWF0Y2ggPSBDUkVERU5USUFMU19SRUdFWFAuZXhlYyhyZXEuaGVhZGVycy5nZXQoJ0F1dGhvcml6YXRpb24nKSB8fCAnJylcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGxldCB1c2VyUGFzcyA9IHVuZGVmaW5lZFxuICAvLyBJZiBhbiBpbnZhbGlkIHN0cmluZyBpcyBwYXNzZWQgdG8gYXRvYigpLCBpdCB0aHJvd3MgYSBgRE9NRXhjZXB0aW9uYC5cbiAgdHJ5IHtcbiAgICB1c2VyUGFzcyA9IFVTRVJfUEFTU19SRUdFWFAuZXhlYyh1dGY4RGVjb2Rlci5kZWNvZGUoZGVjb2RlQmFzZTY0KG1hdGNoWzFdKSkpXG4gIH0gY2F0Y2gge30gLy8gRG8gbm90aGluZ1xuXG4gIGlmICghdXNlclBhc3MpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICByZXR1cm4geyB1c2VybmFtZTogdXNlclBhc3NbMV0sIHBhc3N3b3JkOiB1c2VyUGFzc1syXSB9XG59XG5cbmV4cG9ydCBjb25zdCBiYXNpY0F1dGggPSAoXG4gIG9wdGlvbnM6IHsgdXNlcm5hbWU6IHN0cmluZzsgcGFzc3dvcmQ6IHN0cmluZzsgcmVhbG0/OiBzdHJpbmc7IGhhc2hGdW5jdGlvbj86IEZ1bmN0aW9uIH0sXG4gIC4uLnVzZXJzOiB7IHVzZXJuYW1lOiBzdHJpbmc7IHBhc3N3b3JkOiBzdHJpbmcgfVtdXG4pOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIGlmICghb3B0aW9ucykge1xuICAgIHRocm93IG5ldyBFcnJvcignYmFzaWMgYXV0aCBtaWRkbGV3YXJlIHJlcXVpcmVzIG9wdGlvbnMgZm9yIFwidXNlcm5hbWUgYW5kIHBhc3N3b3JkXCInKVxuICB9XG5cbiAgaWYgKCFvcHRpb25zLnJlYWxtKSB7XG4gICAgb3B0aW9ucy5yZWFsbSA9ICdTZWN1cmUgQXJlYSdcbiAgfVxuICB1c2Vycy51bnNoaWZ0KHsgdXNlcm5hbWU6IG9wdGlvbnMudXNlcm5hbWUsIHBhc3N3b3JkOiBvcHRpb25zLnBhc3N3b3JkIH0pXG5cbiAgcmV0dXJuIGFzeW5jIChjdHgsIG5leHQpID0+IHtcbiAgICBjb25zdCByZXF1ZXN0VXNlciA9IGF1dGgoY3R4LnJlcSlcbiAgICBpZiAocmVxdWVzdFVzZXIpIHtcbiAgICAgIGZvciAoY29uc3QgdXNlciBvZiB1c2Vycykge1xuICAgICAgICBjb25zdCB1c2VybmFtZUVxdWFsID0gYXdhaXQgdGltaW5nU2FmZUVxdWFsKFxuICAgICAgICAgIHVzZXIudXNlcm5hbWUsXG4gICAgICAgICAgcmVxdWVzdFVzZXIudXNlcm5hbWUsXG4gICAgICAgICAgb3B0aW9ucy5oYXNoRnVuY3Rpb25cbiAgICAgICAgKVxuICAgICAgICBjb25zdCBwYXNzd29yZEVxdWFsID0gYXdhaXQgdGltaW5nU2FmZUVxdWFsKFxuICAgICAgICAgIHVzZXIucGFzc3dvcmQsXG4gICAgICAgICAgcmVxdWVzdFVzZXIucGFzc3dvcmQsXG4gICAgICAgICAgb3B0aW9ucy5oYXNoRnVuY3Rpb25cbiAgICAgICAgKVxuICAgICAgICBpZiAodXNlcm5hbWVFcXVhbCAmJiBwYXNzd29yZEVxdWFsKSB7XG4gICAgICAgICAgYXdhaXQgbmV4dCgpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKCdVbmF1dGhvcml6ZWQnLCB7XG4gICAgICBzdGF0dXM6IDQwMSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ1dXVy1BdXRoZW50aWNhdGUnOiAnQmFzaWMgcmVhbG09XCInICsgb3B0aW9ucy5yZWFsbT8ucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpICsgJ1wiJyxcbiAgICAgIH0sXG4gICAgfSlcbiAgICB0aHJvdyBuZXcgSFRUUEV4Y2VwdGlvbig0MDEsIHsgcmVzIH0pXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLGFBQWEsUUFBUSwwQkFBeUI7QUFHdkQsU0FBUyxlQUFlLFFBQVEsd0JBQXVCO0FBQ3ZELFNBQVMsWUFBWSxRQUFRLHdCQUF1QjtBQUVwRCxNQUFNLHFCQUFxQjtBQUMzQixNQUFNLG1CQUFtQjtBQUN6QixNQUFNLGNBQWMsSUFBSTtBQUN4QixNQUFNLE9BQU8sQ0FBQyxNQUFxQjtJQUNqQyxNQUFNLFFBQVEsbUJBQW1CLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CO0lBQzFFLElBQUksQ0FBQyxPQUFPO1FBQ1YsT0FBTztJQUNULENBQUM7SUFFRCxJQUFJLFdBQVc7SUFDZix3RUFBd0U7SUFDeEUsSUFBSTtRQUNGLFdBQVcsaUJBQWlCLElBQUksQ0FBQyxZQUFZLE1BQU0sQ0FBQyxhQUFhLEtBQUssQ0FBQyxFQUFFO0lBQzNFLEVBQUUsT0FBTSxDQUFDLEVBQUUsYUFBYTtJQUV4QixJQUFJLENBQUMsVUFBVTtRQUNiLE9BQU87SUFDVCxDQUFDO0lBRUQsT0FBTztRQUFFLFVBQVUsUUFBUSxDQUFDLEVBQUU7UUFBRSxVQUFVLFFBQVEsQ0FBQyxFQUFFO0lBQUM7QUFDeEQ7QUFFQSxPQUFPLE1BQU0sWUFBWSxDQUN2QixTQUNBLEdBQUcsUUFDbUI7SUFDdEIsSUFBSSxDQUFDLFNBQVM7UUFDWixNQUFNLElBQUksTUFBTSxzRUFBcUU7SUFDdkYsQ0FBQztJQUVELElBQUksQ0FBQyxRQUFRLEtBQUssRUFBRTtRQUNsQixRQUFRLEtBQUssR0FBRztJQUNsQixDQUFDO0lBQ0QsTUFBTSxPQUFPLENBQUM7UUFBRSxVQUFVLFFBQVEsUUFBUTtRQUFFLFVBQVUsUUFBUSxRQUFRO0lBQUM7SUFFdkUsT0FBTyxPQUFPLEtBQUssT0FBUztRQUMxQixNQUFNLGNBQWMsS0FBSyxJQUFJLEdBQUc7UUFDaEMsSUFBSSxhQUFhO1lBQ2YsS0FBSyxNQUFNLFFBQVEsTUFBTztnQkFDeEIsTUFBTSxnQkFBZ0IsTUFBTSxnQkFDMUIsS0FBSyxRQUFRLEVBQ2IsWUFBWSxRQUFRLEVBQ3BCLFFBQVEsWUFBWTtnQkFFdEIsTUFBTSxnQkFBZ0IsTUFBTSxnQkFDMUIsS0FBSyxRQUFRLEVBQ2IsWUFBWSxRQUFRLEVBQ3BCLFFBQVEsWUFBWTtnQkFFdEIsSUFBSSxpQkFBaUIsZUFBZTtvQkFDbEMsTUFBTTtvQkFDTjtnQkFDRixDQUFDO1lBQ0g7UUFDRixDQUFDO1FBQ0QsTUFBTSxNQUFNLElBQUksU0FBUyxnQkFBZ0I7WUFDdkMsUUFBUTtZQUNSLFNBQVM7Z0JBQ1Asb0JBQW9CLGtCQUFrQixRQUFRLEtBQUssRUFBRSxRQUFRLE1BQU0sU0FBUztZQUM5RTtRQUNGO1FBQ0EsTUFBTSxJQUFJLGNBQWMsS0FBSztZQUFFO1FBQUksR0FBRTtJQUN2QztBQUNGLEVBQUMifQ==