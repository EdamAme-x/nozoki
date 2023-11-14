import { decodeURIComponent_ } from './url.ts';
const algorithm = {
    name: 'HMAC',
    hash: 'SHA-256'
};
const getCryptoKey = async (secret)=>{
    const secretBuf = typeof secret === 'string' ? new TextEncoder().encode(secret) : secret;
    return await crypto.subtle.importKey('raw', secretBuf, algorithm, false, [
        'sign',
        'verify'
    ]);
};
const makeSignature = async (value, secret)=>{
    const key = await getCryptoKey(secret);
    const signature = await crypto.subtle.sign(algorithm.name, key, new TextEncoder().encode(value));
    // the returned base64 encoded signature will always be 44 characters long and end with one or two equal signs
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
};
const verifySignature = async (base64Signature, value, secret)=>{
    try {
        const signatureBinStr = atob(base64Signature);
        const signature = new Uint8Array(signatureBinStr.length);
        for(let i = 0; i < signatureBinStr.length; i++)signature[i] = signatureBinStr.charCodeAt(i);
        return await crypto.subtle.verify(algorithm, secret, signature, new TextEncoder().encode(value));
    } catch (e) {
        return false;
    }
};
// all alphanumeric chars and all of _!#$%&'*.^`|~+-
// (see: https://datatracker.ietf.org/doc/html/rfc6265#section-4.1.1)
const validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
// all ASCII chars 32-126 except 34, 59, and 92 (i.e. space to tilde but not double quote, semicolon, or backslash)
// (see: https://datatracker.ietf.org/doc/html/rfc6265#section-4.1.1)
//
// note: the spec also prohibits comma and space, but we allow both since they are very common in the real world
// (see: https://github.com/golang/go/issues/7243)
const validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
export const parse = (cookie, name)=>{
    const pairs = cookie.trim().split(';');
    return pairs.reduce((parsedCookie, pairStr)=>{
        pairStr = pairStr.trim();
        const valueStartPos = pairStr.indexOf('=');
        if (valueStartPos === -1) return parsedCookie;
        const cookieName = pairStr.substring(0, valueStartPos).trim();
        if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) return parsedCookie;
        let cookieValue = pairStr.substring(valueStartPos + 1).trim();
        if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) cookieValue = cookieValue.slice(1, -1);
        if (validCookieValueRegEx.test(cookieValue)) parsedCookie[cookieName] = decodeURIComponent_(cookieValue);
        return parsedCookie;
    }, {});
};
export const parseSigned = async (cookie, secret, name)=>{
    const parsedCookie = {};
    const secretKey = await getCryptoKey(secret);
    for (const [key, value] of Object.entries(parse(cookie, name))){
        const signatureStartPos = value.lastIndexOf('.');
        if (signatureStartPos < 1) continue;
        const signedValue = value.substring(0, signatureStartPos);
        const signature = value.substring(signatureStartPos + 1);
        if (signature.length !== 44 || !signature.endsWith('=')) continue;
        const isVerified = await verifySignature(signature, signedValue, secretKey);
        parsedCookie[key] = isVerified ? signedValue : false;
    }
    return parsedCookie;
};
const _serialize = (name, value, opt = {})=>{
    let cookie = `${name}=${value}`;
    if (opt && typeof opt.maxAge === 'number' && opt.maxAge >= 0) {
        cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
    }
    if (opt.domain) {
        cookie += `; Domain=${opt.domain}`;
    }
    if (opt.path) {
        cookie += `; Path=${opt.path}`;
    }
    if (opt.expires) {
        cookie += `; Expires=${opt.expires.toUTCString()}`;
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
    if (opt.partitioned) {
        cookie += '; Partitioned';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL3V0aWxzL2Nvb2tpZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWNvZGVVUklDb21wb25lbnRfIH0gZnJvbSAnLi91cmwudHMnXG5cbmV4cG9ydCB0eXBlIENvb2tpZSA9IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbmV4cG9ydCB0eXBlIFNpZ25lZENvb2tpZSA9IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IGZhbHNlPlxuZXhwb3J0IHR5cGUgQ29va2llT3B0aW9ucyA9IHtcbiAgZG9tYWluPzogc3RyaW5nXG4gIGV4cGlyZXM/OiBEYXRlXG4gIGh0dHBPbmx5PzogYm9vbGVhblxuICBtYXhBZ2U/OiBudW1iZXJcbiAgcGF0aD86IHN0cmluZ1xuICBzZWN1cmU/OiBib29sZWFuXG4gIHNpZ25pbmdTZWNyZXQ/OiBzdHJpbmdcbiAgc2FtZVNpdGU/OiAnU3RyaWN0JyB8ICdMYXgnIHwgJ05vbmUnXG4gIHBhcnRpdGlvbmVkPzogYm9vbGVhblxufVxuXG5jb25zdCBhbGdvcml0aG0gPSB7IG5hbWU6ICdITUFDJywgaGFzaDogJ1NIQS0yNTYnIH1cblxuY29uc3QgZ2V0Q3J5cHRvS2V5ID0gYXN5bmMgKHNlY3JldDogc3RyaW5nIHwgQnVmZmVyU291cmNlKTogUHJvbWlzZTxDcnlwdG9LZXk+ID0+IHtcbiAgY29uc3Qgc2VjcmV0QnVmID0gdHlwZW9mIHNlY3JldCA9PT0gJ3N0cmluZycgPyBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VjcmV0KSA6IHNlY3JldFxuICByZXR1cm4gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoJ3JhdycsIHNlY3JldEJ1ZiwgYWxnb3JpdGhtLCBmYWxzZSwgWydzaWduJywgJ3ZlcmlmeSddKVxufVxuXG5jb25zdCBtYWtlU2lnbmF0dXJlID0gYXN5bmMgKHZhbHVlOiBzdHJpbmcsIHNlY3JldDogc3RyaW5nIHwgQnVmZmVyU291cmNlKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgY29uc3Qga2V5ID0gYXdhaXQgZ2V0Q3J5cHRvS2V5KHNlY3JldClcbiAgY29uc3Qgc2lnbmF0dXJlID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5zaWduKGFsZ29yaXRobS5uYW1lLCBrZXksIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSh2YWx1ZSkpXG4gIC8vIHRoZSByZXR1cm5lZCBiYXNlNjQgZW5jb2RlZCBzaWduYXR1cmUgd2lsbCBhbHdheXMgYmUgNDQgY2hhcmFjdGVycyBsb25nIGFuZCBlbmQgd2l0aCBvbmUgb3IgdHdvIGVxdWFsIHNpZ25zXG4gIHJldHVybiBidG9hKFN0cmluZy5mcm9tQ2hhckNvZGUoLi4ubmV3IFVpbnQ4QXJyYXkoc2lnbmF0dXJlKSkpXG59XG5cbmNvbnN0IHZlcmlmeVNpZ25hdHVyZSA9IGFzeW5jIChcbiAgYmFzZTY0U2lnbmF0dXJlOiBzdHJpbmcsXG4gIHZhbHVlOiBzdHJpbmcsXG4gIHNlY3JldDogQ3J5cHRvS2V5XG4pOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzaWduYXR1cmVCaW5TdHIgPSBhdG9iKGJhc2U2NFNpZ25hdHVyZSlcbiAgICBjb25zdCBzaWduYXR1cmUgPSBuZXcgVWludDhBcnJheShzaWduYXR1cmVCaW5TdHIubGVuZ3RoKVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2lnbmF0dXJlQmluU3RyLmxlbmd0aDsgaSsrKSBzaWduYXR1cmVbaV0gPSBzaWduYXR1cmVCaW5TdHIuY2hhckNvZGVBdChpKVxuICAgIHJldHVybiBhd2FpdCBjcnlwdG8uc3VidGxlLnZlcmlmeShhbGdvcml0aG0sIHNlY3JldCwgc2lnbmF0dXJlLCBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodmFsdWUpKVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuLy8gYWxsIGFscGhhbnVtZXJpYyBjaGFycyBhbmQgYWxsIG9mIF8hIyQlJicqLl5gfH4rLVxuLy8gKHNlZTogaHR0cHM6Ly9kYXRhdHJhY2tlci5pZXRmLm9yZy9kb2MvaHRtbC9yZmM2MjY1I3NlY3Rpb24tNC4xLjEpXG5jb25zdCB2YWxpZENvb2tpZU5hbWVSZWdFeCA9IC9eW1xcdyEjJCUmJyouXmB8fistXSskL1xuXG4vLyBhbGwgQVNDSUkgY2hhcnMgMzItMTI2IGV4Y2VwdCAzNCwgNTksIGFuZCA5MiAoaS5lLiBzcGFjZSB0byB0aWxkZSBidXQgbm90IGRvdWJsZSBxdW90ZSwgc2VtaWNvbG9uLCBvciBiYWNrc2xhc2gpXG4vLyAoc2VlOiBodHRwczovL2RhdGF0cmFja2VyLmlldGYub3JnL2RvYy9odG1sL3JmYzYyNjUjc2VjdGlvbi00LjEuMSlcbi8vXG4vLyBub3RlOiB0aGUgc3BlYyBhbHNvIHByb2hpYml0cyBjb21tYSBhbmQgc3BhY2UsIGJ1dCB3ZSBhbGxvdyBib3RoIHNpbmNlIHRoZXkgYXJlIHZlcnkgY29tbW9uIGluIHRoZSByZWFsIHdvcmxkXG4vLyAoc2VlOiBodHRwczovL2dpdGh1Yi5jb20vZ29sYW5nL2dvL2lzc3Vlcy83MjQzKVxuY29uc3QgdmFsaWRDb29raWVWYWx1ZVJlZ0V4ID0gL15bICEjLTo8LVtcXF0tfl0qJC9cblxuZXhwb3J0IGNvbnN0IHBhcnNlID0gKGNvb2tpZTogc3RyaW5nLCBuYW1lPzogc3RyaW5nKTogQ29va2llID0+IHtcbiAgY29uc3QgcGFpcnMgPSBjb29raWUudHJpbSgpLnNwbGl0KCc7JylcbiAgcmV0dXJuIHBhaXJzLnJlZHVjZSgocGFyc2VkQ29va2llLCBwYWlyU3RyKSA9PiB7XG4gICAgcGFpclN0ciA9IHBhaXJTdHIudHJpbSgpXG4gICAgY29uc3QgdmFsdWVTdGFydFBvcyA9IHBhaXJTdHIuaW5kZXhPZignPScpXG4gICAgaWYgKHZhbHVlU3RhcnRQb3MgPT09IC0xKSByZXR1cm4gcGFyc2VkQ29va2llXG5cbiAgICBjb25zdCBjb29raWVOYW1lID0gcGFpclN0ci5zdWJzdHJpbmcoMCwgdmFsdWVTdGFydFBvcykudHJpbSgpXG4gICAgaWYgKChuYW1lICYmIG5hbWUgIT09IGNvb2tpZU5hbWUpIHx8ICF2YWxpZENvb2tpZU5hbWVSZWdFeC50ZXN0KGNvb2tpZU5hbWUpKSByZXR1cm4gcGFyc2VkQ29va2llXG5cbiAgICBsZXQgY29va2llVmFsdWUgPSBwYWlyU3RyLnN1YnN0cmluZyh2YWx1ZVN0YXJ0UG9zICsgMSkudHJpbSgpXG4gICAgaWYgKGNvb2tpZVZhbHVlLnN0YXJ0c1dpdGgoJ1wiJykgJiYgY29va2llVmFsdWUuZW5kc1dpdGgoJ1wiJykpXG4gICAgICBjb29raWVWYWx1ZSA9IGNvb2tpZVZhbHVlLnNsaWNlKDEsIC0xKVxuICAgIGlmICh2YWxpZENvb2tpZVZhbHVlUmVnRXgudGVzdChjb29raWVWYWx1ZSkpXG4gICAgICBwYXJzZWRDb29raWVbY29va2llTmFtZV0gPSBkZWNvZGVVUklDb21wb25lbnRfKGNvb2tpZVZhbHVlKVxuXG4gICAgcmV0dXJuIHBhcnNlZENvb2tpZVxuICB9LCB7fSBhcyBDb29raWUpXG59XG5cbmV4cG9ydCBjb25zdCBwYXJzZVNpZ25lZCA9IGFzeW5jIChcbiAgY29va2llOiBzdHJpbmcsXG4gIHNlY3JldDogc3RyaW5nIHwgQnVmZmVyU291cmNlLFxuICBuYW1lPzogc3RyaW5nXG4pOiBQcm9taXNlPFNpZ25lZENvb2tpZT4gPT4ge1xuICBjb25zdCBwYXJzZWRDb29raWU6IFNpZ25lZENvb2tpZSA9IHt9XG4gIGNvbnN0IHNlY3JldEtleSA9IGF3YWl0IGdldENyeXB0b0tleShzZWNyZXQpXG5cbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocGFyc2UoY29va2llLCBuYW1lKSkpIHtcbiAgICBjb25zdCBzaWduYXR1cmVTdGFydFBvcyA9IHZhbHVlLmxhc3RJbmRleE9mKCcuJylcbiAgICBpZiAoc2lnbmF0dXJlU3RhcnRQb3MgPCAxKSBjb250aW51ZVxuXG4gICAgY29uc3Qgc2lnbmVkVmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgc2lnbmF0dXJlU3RhcnRQb3MpXG4gICAgY29uc3Qgc2lnbmF0dXJlID0gdmFsdWUuc3Vic3RyaW5nKHNpZ25hdHVyZVN0YXJ0UG9zICsgMSlcbiAgICBpZiAoc2lnbmF0dXJlLmxlbmd0aCAhPT0gNDQgfHwgIXNpZ25hdHVyZS5lbmRzV2l0aCgnPScpKSBjb250aW51ZVxuXG4gICAgY29uc3QgaXNWZXJpZmllZCA9IGF3YWl0IHZlcmlmeVNpZ25hdHVyZShzaWduYXR1cmUsIHNpZ25lZFZhbHVlLCBzZWNyZXRLZXkpXG4gICAgcGFyc2VkQ29va2llW2tleV0gPSBpc1ZlcmlmaWVkID8gc2lnbmVkVmFsdWUgOiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHBhcnNlZENvb2tpZVxufVxuXG5jb25zdCBfc2VyaWFsaXplID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0OiBDb29raWVPcHRpb25zID0ge30pOiBzdHJpbmcgPT4ge1xuICBsZXQgY29va2llID0gYCR7bmFtZX09JHt2YWx1ZX1gXG5cbiAgaWYgKG9wdCAmJiB0eXBlb2Ygb3B0Lm1heEFnZSA9PT0gJ251bWJlcicgJiYgb3B0Lm1heEFnZSA+PSAwKSB7XG4gICAgY29va2llICs9IGA7IE1heC1BZ2U9JHtNYXRoLmZsb29yKG9wdC5tYXhBZ2UpfWBcbiAgfVxuXG4gIGlmIChvcHQuZG9tYWluKSB7XG4gICAgY29va2llICs9IGA7IERvbWFpbj0ke29wdC5kb21haW59YFxuICB9XG5cbiAgaWYgKG9wdC5wYXRoKSB7XG4gICAgY29va2llICs9IGA7IFBhdGg9JHtvcHQucGF0aH1gXG4gIH1cblxuICBpZiAob3B0LmV4cGlyZXMpIHtcbiAgICBjb29raWUgKz0gYDsgRXhwaXJlcz0ke29wdC5leHBpcmVzLnRvVVRDU3RyaW5nKCl9YFxuICB9XG5cbiAgaWYgKG9wdC5odHRwT25seSkge1xuICAgIGNvb2tpZSArPSAnOyBIdHRwT25seSdcbiAgfVxuXG4gIGlmIChvcHQuc2VjdXJlKSB7XG4gICAgY29va2llICs9ICc7IFNlY3VyZSdcbiAgfVxuXG4gIGlmIChvcHQuc2FtZVNpdGUpIHtcbiAgICBjb29raWUgKz0gYDsgU2FtZVNpdGU9JHtvcHQuc2FtZVNpdGV9YFxuICB9XG5cbiAgaWYgKG9wdC5wYXJ0aXRpb25lZCkge1xuICAgIGNvb2tpZSArPSAnOyBQYXJ0aXRpb25lZCdcbiAgfVxuXG4gIHJldHVybiBjb29raWVcbn1cblxuZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZSA9IChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG9wdDogQ29va2llT3B0aW9ucyA9IHt9KTogc3RyaW5nID0+IHtcbiAgdmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpXG4gIHJldHVybiBfc2VyaWFsaXplKG5hbWUsIHZhbHVlLCBvcHQpXG59XG5cbmV4cG9ydCBjb25zdCBzZXJpYWxpemVTaWduZWQgPSBhc3luYyAoXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IHN0cmluZyxcbiAgc2VjcmV0OiBzdHJpbmcgfCBCdWZmZXJTb3VyY2UsXG4gIG9wdDogQ29va2llT3B0aW9ucyA9IHt9XG4pOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBtYWtlU2lnbmF0dXJlKHZhbHVlLCBzZWNyZXQpXG4gIHZhbHVlID0gYCR7dmFsdWV9LiR7c2lnbmF0dXJlfWBcbiAgdmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpXG4gIHJldHVybiBfc2VyaWFsaXplKG5hbWUsIHZhbHVlLCBvcHQpXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxtQkFBbUIsUUFBUSxXQUFVO0FBZ0I5QyxNQUFNLFlBQVk7SUFBRSxNQUFNO0lBQVEsTUFBTTtBQUFVO0FBRWxELE1BQU0sZUFBZSxPQUFPLFNBQXNEO0lBQ2hGLE1BQU0sWUFBWSxPQUFPLFdBQVcsV0FBVyxJQUFJLGNBQWMsTUFBTSxDQUFDLFVBQVUsTUFBTTtJQUN4RixPQUFPLE1BQU0sT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sV0FBVyxXQUFX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