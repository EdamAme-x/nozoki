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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvbWlkZGxld2FyZS9iYXNpYy1hdXRoL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEhUVFBFeGNlcHRpb24gfSBmcm9tICcuLi8uLi9odHRwLWV4Y2VwdGlvbi50cydcbmltcG9ydCB0eXBlIHsgSG9ub1JlcXVlc3QgfSBmcm9tICcuLi8uLi9yZXF1ZXN0LnRzJ1xuaW1wb3J0IHR5cGUgeyBNaWRkbGV3YXJlSGFuZGxlciB9IGZyb20gJy4uLy4uL3R5cGVzLnRzJ1xuaW1wb3J0IHsgdGltaW5nU2FmZUVxdWFsIH0gZnJvbSAnLi4vLi4vdXRpbHMvYnVmZmVyLnRzJ1xuaW1wb3J0IHsgZGVjb2RlQmFzZTY0IH0gZnJvbSAnLi4vLi4vdXRpbHMvZW5jb2RlLnRzJ1xuXG5jb25zdCBDUkVERU5USUFMU19SRUdFWFAgPSAvXiAqKD86W0JiXVtBYV1bU3NdW0lpXVtDY10pICsoW0EtWmEtejAtOS5ffisvLV0rPSopICokL1xuY29uc3QgVVNFUl9QQVNTX1JFR0VYUCA9IC9eKFteOl0qKTooLiopJC9cbmNvbnN0IHV0ZjhEZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKClcbmNvbnN0IGF1dGggPSAocmVxOiBIb25vUmVxdWVzdCkgPT4ge1xuICBjb25zdCBtYXRjaCA9IENSRURFTlRJQUxTX1JFR0VYUC5leGVjKHJlcS5oZWFkZXJzLmdldCgnQXV0aG9yaXphdGlvbicpIHx8ICcnKVxuICBpZiAoIW1hdGNoKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgbGV0IHVzZXJQYXNzID0gdW5kZWZpbmVkXG4gIC8vIElmIGFuIGludmFsaWQgc3RyaW5nIGlzIHBhc3NlZCB0byBhdG9iKCksIGl0IHRocm93cyBhIGBET01FeGNlcHRpb25gLlxuICB0cnkge1xuICAgIHVzZXJQYXNzID0gVVNFUl9QQVNTX1JFR0VYUC5leGVjKHV0ZjhEZWNvZGVyLmRlY29kZShkZWNvZGVCYXNlNjQobWF0Y2hbMV0pKSlcbiAgfSBjYXRjaCB7fSAvLyBEbyBub3RoaW5nXG5cbiAgaWYgKCF1c2VyUGFzcykge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIHJldHVybiB7IHVzZXJuYW1lOiB1c2VyUGFzc1sxXSwgcGFzc3dvcmQ6IHVzZXJQYXNzWzJdIH1cbn1cblxuZXhwb3J0IGNvbnN0IGJhc2ljQXV0aCA9IChcbiAgb3B0aW9uczogeyB1c2VybmFtZTogc3RyaW5nOyBwYXNzd29yZDogc3RyaW5nOyByZWFsbT86IHN0cmluZzsgaGFzaEZ1bmN0aW9uPzogRnVuY3Rpb24gfSxcbiAgLi4udXNlcnM6IHsgdXNlcm5hbWU6IHN0cmluZzsgcGFzc3dvcmQ6IHN0cmluZyB9W11cbik6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiYXNpYyBhdXRoIG1pZGRsZXdhcmUgcmVxdWlyZXMgb3B0aW9ucyBmb3IgXCJ1c2VybmFtZSBhbmQgcGFzc3dvcmRcIicpXG4gIH1cblxuICBpZiAoIW9wdGlvbnMucmVhbG0pIHtcbiAgICBvcHRpb25zLnJlYWxtID0gJ1NlY3VyZSBBcmVhJ1xuICB9XG4gIHVzZXJzLnVuc2hpZnQoeyB1c2VybmFtZTogb3B0aW9ucy51c2VybmFtZSwgcGFzc3dvcmQ6IG9wdGlvbnMucGFzc3dvcmQgfSlcblxuICByZXR1cm4gYXN5bmMgKGN0eCwgbmV4dCkgPT4ge1xuICAgIGNvbnN0IHJlcXVlc3RVc2VyID0gYXV0aChjdHgucmVxKVxuICAgIGlmIChyZXF1ZXN0VXNlcikge1xuICAgICAgZm9yIChjb25zdCB1c2VyIG9mIHVzZXJzKSB7XG4gICAgICAgIGNvbnN0IHVzZXJuYW1lRXF1YWwgPSBhd2FpdCB0aW1pbmdTYWZlRXF1YWwoXG4gICAgICAgICAgdXNlci51c2VybmFtZSxcbiAgICAgICAgICByZXF1ZXN0VXNlci51c2VybmFtZSxcbiAgICAgICAgICBvcHRpb25zLmhhc2hGdW5jdGlvblxuICAgICAgICApXG4gICAgICAgIGNvbnN0IHBhc3N3b3JkRXF1YWwgPSBhd2FpdCB0aW1pbmdTYWZlRXF1YWwoXG4gICAgICAgICAgdXNlci5wYXNzd29yZCxcbiAgICAgICAgICByZXF1ZXN0VXNlci5wYXNzd29yZCxcbiAgICAgICAgICBvcHRpb25zLmhhc2hGdW5jdGlvblxuICAgICAgICApXG4gICAgICAgIGlmICh1c2VybmFtZUVxdWFsICYmIHBhc3N3b3JkRXF1YWwpIHtcbiAgICAgICAgICBhd2FpdCBuZXh0KClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXMgPSBuZXcgUmVzcG9uc2UoJ1VuYXV0aG9yaXplZCcsIHtcbiAgICAgIHN0YXR1czogNDAxLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnV1dXLUF1dGhlbnRpY2F0ZSc6ICdCYXNpYyByZWFsbT1cIicgKyBvcHRpb25zLnJlYWxtPy5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykgKyAnXCInLFxuICAgICAgfSxcbiAgICB9KVxuICAgIHRocm93IG5ldyBIVFRQRXhjZXB0aW9uKDQwMSwgeyByZXMgfSlcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsYUFBYSxRQUFRLDBCQUF5QjtBQUd2RCxTQUFTLGVBQWUsUUFBUSx3QkFBdUI7QUFDdkQsU0FBUyxZQUFZLFFBQVEsd0JBQXVCO0FBRXBELE1BQU0scUJBQXFCO0FBQzNCLE1BQU0sbUJBQW1CO0FBQ3pCLE1BQU0sY0FBYyxJQUFJO0FBQ3hCLE1BQU0sT0FBTyxDQUFDLE1BQXFCO0lBQ2pDLE1BQU0sUUFBUSxtQkFBbUIsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7SUFDMUUsSUFBSSxDQUFDLE9BQU87UUFDVixPQUFPO0lBQ1QsQ0FBQztJQUVELElBQUksV0FBVztJQUNmLHdFQUF3RTtJQUN4RSxJQUFJO1FBQ0YsV0FBVyxpQkFBaUIsSUFBSSxDQUFDLFlBQVksTUFBTSxDQUFDLGFBQWEsS0FBSyxDQUFDLEVBQUU7SUFDM0UsRUFBRSxPQUFNLENBQUMsRUFBRSxhQUFhO0lBRXhCLElBQUksQ0FBQyxVQUFVO1FBQ2IsT0FBTztJQUNULENBQUM7SUFFRCxPQUFPO1FBQUUsVUFBVSxRQUFRLENBQUMsRUFBRTtRQUFFLFVBQVUsUUFBUSxDQUFDLEVBQUU7SUFBQztBQUN4RDtBQUVBLE9BQU8sTUFBTSxZQUFZLENBQ3ZCLFNBQ0EsR0FBRyxRQUNtQjtJQUN0QixJQUFJLENBQUMsU0FBUztRQUNaLE1BQU0sSUFBSSxNQUFNLHNFQUFxRTtJQUN2RixDQUFDO0lBRUQsSUFBSSxDQUFDLFFBQVEsS0FBSyxFQUFFO1FBQ2xCLFFBQVEsS0FBSyxHQUFHO0lBQ2xCLENBQUM7SUFDRCxNQUFNLE9BQU8sQ0FBQztRQUFFLFVBQVUsUUFBUSxRQUFRO1FBQUUsVUFBVSxRQUFRLFFBQVE7SUFBQztJQUV2RSxPQUFPLE9BQU8sS0FBSyxPQUFTO1FBQzFCLE1BQU0sY0FBYyxLQUFLLElBQUksR0FBRztRQUNoQyxJQUFJLGFBQWE7WUFDZixLQUFLLE1BQU0sUUFBUSxNQUFPO2dCQUN4QixNQUFNLGdCQUFnQixNQUFNLGdCQUMxQixLQUFLLFFBQVEsRUFDYixZQUFZLFFBQVEsRUFDcEIsUUFBUSxZQUFZO2dCQUV0QixNQUFNLGdCQUFnQixNQUFNLGdCQUMxQixLQUFLLFFBQVEsRUFDYixZQUFZLFFBQVEsRUFDcEIsUUFBUSxZQUFZO2dCQUV0QixJQUFJLGlCQUFpQixlQUFlO29CQUNsQyxNQUFNO29CQUNOO2dCQUNGLENBQUM7WUFDSDtRQUNGLENBQUM7UUFDRCxNQUFNLE1BQU0sSUFBSSxTQUFTLGdCQUFnQjtZQUN2QyxRQUFRO1lBQ1IsU0FBUztnQkFDUCxvQkFBb0Isa0JBQWtCLFFBQVEsS0FBSyxFQUFFLFFBQVEsTUFBTSxTQUFTO1lBQzlFO1FBQ0Y7UUFDQSxNQUFNLElBQUksY0FBYyxLQUFLO1lBQUU7UUFBSSxHQUFFO0lBQ3ZDO0FBQ0YsRUFBQyJ9