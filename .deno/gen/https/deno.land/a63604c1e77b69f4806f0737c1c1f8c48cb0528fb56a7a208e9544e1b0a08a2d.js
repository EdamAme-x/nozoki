import { decodeURIComponent_ } from './url.ts';
const makeSignature = async (value, secret)=>{
    const algorithm = {
        name: 'HMAC',
        hash: 'SHA-256'
    };
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), algorithm, false, [
        'sign',
        'verify'
    ]);
    const signature = await crypto.subtle.sign(algorithm.name, key, encoder.encode(value));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
};
const _parseCookiePairs = (cookie, name)=>{
    const pairs = cookie.split(/;\s*/g);
    const cookiePairs = pairs.map((pairStr)=>pairStr.split(/\s*=\s*([^\s]+)/));
    if (!name) return cookiePairs;
    return cookiePairs.filter((pair)=>pair[0] === name);
};
export const parse = (cookie, name)=>{
    const parsedCookie = {};
    const unsingedCookies = _parseCookiePairs(cookie, name).filter((pair)=>{
        // ignore signed cookies, assuming they always have that commonly accepted format
        if (pair[1].split('.').length === 2) return false;
        return true;
    });
    for (let [key, value] of unsingedCookies){
        value = decodeURIComponent_(value);
        parsedCookie[key] = value;
    }
    return parsedCookie;
};
export const parseSigned = async (cookie, secret, name)=>{
    const parsedCookie = {};
    const signedCookies = _parseCookiePairs(cookie, name).filter((pair)=>{
        // ignore signed cookies, assuming they always have that commonly accepted format
        if (pair[1].split('.').length !== 2) return false;
        return true;
    });
    for (let [key, value] of signedCookies){
        value = decodeURIComponent_(value);
        const signedPair = value.split('.');
        const signatureToCompare = await makeSignature(signedPair[0], secret);
        if (signedPair[1] !== signatureToCompare) {
            // cookie will be undefined when using getCookie
            parsedCookie[key] = false;
            continue;
        }
        parsedCookie[key] = signedPair[0];
    }
    return parsedCookie;
};
const _serialize = (name, value, opt = {})=>{
    let cookie = `${name}=${value}`;
    if (opt && typeof opt.maxAge === 'number' && opt.maxAge >= 0) {
        cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
    }
    if (opt.domain) {
        cookie += '; Domain=' + opt.domain;
    }
    if (opt.path) {
        cookie += '; Path=' + opt.path;
    }
    if (opt.expires) {
        cookie += '; Expires=' + opt.expires.toUTCString();
    }
    if (opt.httpOnly) {
        cookie += '; HttpOnly';
    }
    if (opt.secure) {
        cookie += '; Secure';
    }
    if (opt.sameSite) {
        cookie += `; SameSite=${opt.sameSite}`;
    }
    return cookie;
};
export const serialize = (name, value, opt = {})=>{
    value = encodeURIComponent(value);
    return _serialize(name, value, opt);
};
export const serializeSigned = async (name, value, secret, opt = {})=>{
    const signature = await makeSignature(value, secret);
    value = `${value}.${signature}`;
    value = encodeURIComponent(value);
    return _serialize(name, value, opt);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvdXRpbHMvY29va2llLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlY29kZVVSSUNvbXBvbmVudF8gfSBmcm9tICcuL3VybC50cydcblxuZXhwb3J0IHR5cGUgQ29va2llID0gUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuZXhwb3J0IHR5cGUgU2lnbmVkQ29va2llID0gUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgZmFsc2U+XG5leHBvcnQgdHlwZSBDb29raWVPcHRpb25zID0ge1xuICBkb21haW4/OiBzdHJpbmdcbiAgZXhwaXJlcz86IERhdGVcbiAgaHR0cE9ubHk/OiBib29sZWFuXG4gIG1heEFnZT86IG51bWJlclxuICBwYXRoPzogc3RyaW5nXG4gIHNlY3VyZT86IGJvb2xlYW5cbiAgc2lnbmluZ1NlY3JldD86IHN0cmluZ1xuICBzYW1lU2l0ZT86ICdTdHJpY3QnIHwgJ0xheCcgfCAnTm9uZSdcbn1cblxuY29uc3QgbWFrZVNpZ25hdHVyZSA9IGFzeW5jICh2YWx1ZTogc3RyaW5nLCBzZWNyZXQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IGFsZ29yaXRobSA9IHsgbmFtZTogJ0hNQUMnLCBoYXNoOiAnU0hBLTI1NicgfVxuICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKClcbiAgY29uc3Qga2V5ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoJ3JhdycsIGVuY29kZXIuZW5jb2RlKHNlY3JldCksIGFsZ29yaXRobSwgZmFsc2UsIFtcbiAgICAnc2lnbicsXG4gICAgJ3ZlcmlmeScsXG4gIF0pXG4gIGNvbnN0IHNpZ25hdHVyZSA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuc2lnbihhbGdvcml0aG0ubmFtZSwga2V5LCBlbmNvZGVyLmVuY29kZSh2YWx1ZSkpXG4gIHJldHVybiBidG9hKFN0cmluZy5mcm9tQ2hhckNvZGUoLi4ubmV3IFVpbnQ4QXJyYXkoc2lnbmF0dXJlKSkpXG59XG5cbmNvbnN0IF9wYXJzZUNvb2tpZVBhaXJzID0gKGNvb2tpZTogc3RyaW5nLCBuYW1lPzogc3RyaW5nKTogc3RyaW5nW11bXSA9PiB7XG4gIGNvbnN0IHBhaXJzID0gY29va2llLnNwbGl0KC87XFxzKi9nKVxuICBjb25zdCBjb29raWVQYWlycyA9IHBhaXJzLm1hcCgocGFpclN0cjogc3RyaW5nKSA9PiBwYWlyU3RyLnNwbGl0KC9cXHMqPVxccyooW15cXHNdKykvKSlcbiAgaWYgKCFuYW1lKSByZXR1cm4gY29va2llUGFpcnNcbiAgcmV0dXJuIGNvb2tpZVBhaXJzLmZpbHRlcigocGFpcikgPT4gcGFpclswXSA9PT0gbmFtZSlcbn1cblxuZXhwb3J0IGNvbnN0IHBhcnNlID0gKGNvb2tpZTogc3RyaW5nLCBuYW1lPzogc3RyaW5nKTogQ29va2llID0+IHtcbiAgY29uc3QgcGFyc2VkQ29va2llOiBDb29raWUgPSB7fVxuICBjb25zdCB1bnNpbmdlZENvb2tpZXMgPSBfcGFyc2VDb29raWVQYWlycyhjb29raWUsIG5hbWUpLmZpbHRlcigocGFpcikgPT4ge1xuICAgIC8vIGlnbm9yZSBzaWduZWQgY29va2llcywgYXNzdW1pbmcgdGhleSBhbHdheXMgaGF2ZSB0aGF0IGNvbW1vbmx5IGFjY2VwdGVkIGZvcm1hdFxuICAgIGlmIChwYWlyWzFdLnNwbGl0KCcuJykubGVuZ3RoID09PSAyKSByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuICB9KVxuICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdW5zaW5nZWRDb29raWVzKSB7XG4gICAgdmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnRfKHZhbHVlKVxuICAgIHBhcnNlZENvb2tpZVtrZXldID0gdmFsdWVcbiAgfVxuICByZXR1cm4gcGFyc2VkQ29va2llXG59XG5cbmV4cG9ydCBjb25zdCBwYXJzZVNpZ25lZCA9IGFzeW5jIChcbiAgY29va2llOiBzdHJpbmcsXG4gIHNlY3JldDogc3RyaW5nLFxuICBuYW1lPzogc3RyaW5nXG4pOiBQcm9taXNlPFNpZ25lZENvb2tpZT4gPT4ge1xuICBjb25zdCBwYXJzZWRDb29raWU6IFNpZ25lZENvb2tpZSA9IHt9XG4gIGNvbnN0IHNpZ25lZENvb2tpZXMgPSBfcGFyc2VDb29raWVQYWlycyhjb29raWUsIG5hbWUpLmZpbHRlcigocGFpcikgPT4ge1xuICAgIC8vIGlnbm9yZSBzaWduZWQgY29va2llcywgYXNzdW1pbmcgdGhleSBhbHdheXMgaGF2ZSB0aGF0IGNvbW1vbmx5IGFjY2VwdGVkIGZvcm1hdFxuICAgIGlmIChwYWlyWzFdLnNwbGl0KCcuJykubGVuZ3RoICE9PSAyKSByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuICB9KVxuICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2Ygc2lnbmVkQ29va2llcykge1xuICAgIHZhbHVlID0gZGVjb2RlVVJJQ29tcG9uZW50Xyh2YWx1ZSlcbiAgICBjb25zdCBzaWduZWRQYWlyID0gdmFsdWUuc3BsaXQoJy4nKVxuICAgIGNvbnN0IHNpZ25hdHVyZVRvQ29tcGFyZSA9IGF3YWl0IG1ha2VTaWduYXR1cmUoc2lnbmVkUGFpclswXSwgc2VjcmV0KVxuICAgIGlmIChzaWduZWRQYWlyWzFdICE9PSBzaWduYXR1cmVUb0NvbXBhcmUpIHtcbiAgICAgIC8vIGNvb2tpZSB3aWxsIGJlIHVuZGVmaW5lZCB3aGVuIHVzaW5nIGdldENvb2tpZVxuICAgICAgcGFyc2VkQ29va2llW2tleV0gPSBmYWxzZVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgcGFyc2VkQ29va2llW2tleV0gPSBzaWduZWRQYWlyWzBdXG4gIH1cbiAgcmV0dXJuIHBhcnNlZENvb2tpZVxufVxuXG5jb25zdCBfc2VyaWFsaXplID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0OiBDb29raWVPcHRpb25zID0ge30pOiBzdHJpbmcgPT4ge1xuICBsZXQgY29va2llID0gYCR7bmFtZX09JHt2YWx1ZX1gXG5cbiAgaWYgKG9wdCAmJiB0eXBlb2Ygb3B0Lm1heEFnZSA9PT0gJ251bWJlcicgJiYgb3B0Lm1heEFnZSA+PSAwKSB7XG4gICAgY29va2llICs9IGA7IE1heC1BZ2U9JHtNYXRoLmZsb29yKG9wdC5tYXhBZ2UpfWBcbiAgfVxuXG4gIGlmIChvcHQuZG9tYWluKSB7XG4gICAgY29va2llICs9ICc7IERvbWFpbj0nICsgb3B0LmRvbWFpblxuICB9XG5cbiAgaWYgKG9wdC5wYXRoKSB7XG4gICAgY29va2llICs9ICc7IFBhdGg9JyArIG9wdC5wYXRoXG4gIH1cblxuICBpZiAob3B0LmV4cGlyZXMpIHtcbiAgICBjb29raWUgKz0gJzsgRXhwaXJlcz0nICsgb3B0LmV4cGlyZXMudG9VVENTdHJpbmcoKVxuICB9XG5cbiAgaWYgKG9wdC5odHRwT25seSkge1xuICAgIGNvb2tpZSArPSAnOyBIdHRwT25seSdcbiAgfVxuXG4gIGlmIChvcHQuc2VjdXJlKSB7XG4gICAgY29va2llICs9ICc7IFNlY3VyZSdcbiAgfVxuXG4gIGlmIChvcHQuc2FtZVNpdGUpIHtcbiAgICBjb29raWUgKz0gYDsgU2FtZVNpdGU9JHtvcHQuc2FtZVNpdGV9YFxuICB9XG5cbiAgcmV0dXJuIGNvb2tpZVxufVxuXG5leHBvcnQgY29uc3Qgc2VyaWFsaXplID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0OiBDb29raWVPcHRpb25zID0ge30pOiBzdHJpbmcgPT4ge1xuICB2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSlcbiAgcmV0dXJuIF9zZXJpYWxpemUobmFtZSwgdmFsdWUsIG9wdClcbn1cblxuZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZVNpZ25lZCA9IGFzeW5jIChcbiAgbmFtZTogc3RyaW5nLFxuICB2YWx1ZTogc3RyaW5nLFxuICBzZWNyZXQ6IHN0cmluZyxcbiAgb3B0OiBDb29raWVPcHRpb25zID0ge31cbik6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IHNpZ25hdHVyZSA9IGF3YWl0IG1ha2VTaWduYXR1cmUodmFsdWUsIHNlY3JldClcbiAgdmFsdWUgPSBgJHt2YWx1ZX0uJHtzaWduYXR1cmV9YFxuICB2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSlcbiAgcmV0dXJuIF9zZXJpYWxpemUobmFtZSwgdmFsdWUsIG9wdClcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLG1CQUFtQixRQUFRLFdBQVU7QUFlOUMsTUFBTSxnQkFBZ0IsT0FBTyxPQUFlLFNBQW9DO0lBQzlFLE1BQU0sWUFBWTtRQUFFLE1BQU07UUFBUSxNQUFNO0lBQVU7SUFDbEQsTUFBTSxVQUFVLElBQUk7SUFDcEIsTUFBTSxNQUFNLE1BQU0sT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sUUFBUSxNQUFNLENBQUMsU0FBUyxXQUFXLEtBQUssRUFBRTtRQUN6RjtRQUNBO0tBQ0Q7SUFDRCxNQUFNLFlBQVksTUFBTSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsS0FBSyxRQUFRLE1BQU0sQ0FBQztJQUMvRSxPQUFPLEtBQUssT0FBTyxZQUFZLElBQUksSUFBSSxXQUFXO0FBQ3BEO0FBRUEsTUFBTSxvQkFBb0IsQ0FBQyxRQUFnQixPQUE4QjtJQUN2RSxNQUFNLFFBQVEsT0FBTyxLQUFLLENBQUM7SUFDM0IsTUFBTSxjQUFjLE1BQU0sR0FBRyxDQUFDLENBQUMsVUFBb0IsUUFBUSxLQUFLLENBQUM7SUFDakUsSUFBSSxDQUFDLE1BQU0sT0FBTztJQUNsQixPQUFPLFlBQVksTUFBTSxDQUFDLENBQUMsT0FBUyxJQUFJLENBQUMsRUFBRSxLQUFLO0FBQ2xEO0FBRUEsT0FBTyxNQUFNLFFBQVEsQ0FBQyxRQUFnQixPQUEwQjtJQUM5RCxNQUFNLGVBQXVCLENBQUM7SUFDOUIsTUFBTSxrQkFBa0Isa0JBQWtCLFFBQVEsTUFBTSxNQUFNLENBQUMsQ0FBQyxPQUFTO1FBQ3ZFLGlGQUFpRjtRQUNqRixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssTUFBTSxLQUFLLEdBQUcsT0FBTyxLQUFLO1FBQ2pELE9BQU8sSUFBSTtJQUNiO0lBQ0EsS0FBSyxJQUFJLENBQUMsS0FBSyxNQUFNLElBQUksZ0JBQWlCO1FBQ3hDLFFBQVEsb0JBQW9CO1FBQzVCLFlBQVksQ0FBQyxJQUFJLEdBQUc7SUFDdEI7SUFDQSxPQUFPO0FBQ1QsRUFBQztBQUVELE9BQU8sTUFBTSxjQUFjLE9BQ3pCLFFBQ0EsUUFDQSxPQUMwQjtJQUMxQixNQUFNLGVBQTZCLENBQUM7SUFDcEMsTUFBTSxnQkFBZ0Isa0JBQWtCLFFBQVEsTUFBTSxNQUFNLENBQUMsQ0FBQyxPQUFTO1FBQ3JFLGlGQUFpRjtRQUNqRixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssTUFBTSxLQUFLLEdBQUcsT0FBTyxLQUFLO1FBQ2pELE9BQU8sSUFBSTtJQUNiO0lBQ0EsS0FBSyxJQUFJLENBQUMsS0FBSyxNQUFNLElBQUksY0FBZTtRQUN0QyxRQUFRLG9CQUFvQjtRQUM1QixNQUFNLGFBQWEsTUFBTSxLQUFLLENBQUM7UUFDL0IsTUFBTSxxQkFBcUIsTUFBTSxjQUFjLFVBQVUsQ0FBQyxFQUFFLEVBQUU7UUFDOUQsSUFBSSxVQUFVLENBQUMsRUFBRSxLQUFLLG9CQUFvQjtZQUN4QyxnREFBZ0Q7WUFDaEQsWUFBWSxDQUFDLElBQUksR0FBRyxLQUFLO1lBQ3pCLFFBQVE7UUFDVixDQUFDO1FBQ0QsWUFBWSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsRUFBRTtJQUNuQztJQUNBLE9BQU87QUFDVCxFQUFDO0FBRUQsTUFBTSxhQUFhLENBQUMsTUFBYyxPQUFlLE1BQXFCLENBQUMsQ0FBQyxHQUFhO0lBQ25GLElBQUksU0FBUyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDO0lBRS9CLElBQUksT0FBTyxPQUFPLElBQUksTUFBTSxLQUFLLFlBQVksSUFBSSxNQUFNLElBQUksR0FBRztRQUM1RCxVQUFVLENBQUMsVUFBVSxFQUFFLEtBQUssS0FBSyxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7SUFDakQsQ0FBQztJQUVELElBQUksSUFBSSxNQUFNLEVBQUU7UUFDZCxVQUFVLGNBQWMsSUFBSSxNQUFNO0lBQ3BDLENBQUM7SUFFRCxJQUFJLElBQUksSUFBSSxFQUFFO1FBQ1osVUFBVSxZQUFZLElBQUksSUFBSTtJQUNoQyxDQUFDO0lBRUQsSUFBSSxJQUFJLE9BQU8sRUFBRTtRQUNmLFVBQVUsZUFBZSxJQUFJLE9BQU8sQ0FBQyxXQUFXO0lBQ2xELENBQUM7SUFFRCxJQUFJLElBQUksUUFBUSxFQUFFO1FBQ2hCLFVBQVU7SUFDWixDQUFDO0lBRUQsSUFBSSxJQUFJLE1BQU0sRUFBRTtRQUNkLFVBQVU7SUFDWixDQUFDO0lBRUQsSUFBSSxJQUFJLFFBQVEsRUFBRTtRQUNoQixVQUFVLENBQUMsV0FBVyxFQUFFLElBQUksUUFBUSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELE9BQU87QUFDVDtBQUVBLE9BQU8sTUFBTSxZQUFZLENBQUMsTUFBYyxPQUFlLE1BQXFCLENBQUMsQ0FBQyxHQUFhO0lBQ3pGLFFBQVEsbUJBQW1CO0lBQzNCLE9BQU8sV0FBVyxNQUFNLE9BQU87QUFDakMsRUFBQztBQUVELE9BQU8sTUFBTSxrQkFBa0IsT0FDN0IsTUFDQSxPQUNBLFFBQ0EsTUFBcUIsQ0FBQyxDQUFDLEdBQ0g7SUFDcEIsTUFBTSxZQUFZLE1BQU0sY0FBYyxPQUFPO0lBQzdDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFLFVBQVUsQ0FBQztJQUMvQixRQUFRLG1CQUFtQjtJQUMzQixPQUFPLFdBQVcsTUFBTSxPQUFPO0FBQ2pDLEVBQUMifQ==