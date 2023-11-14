import { encodeBase64Url, decodeBase64Url } from '../../utils/encode.ts';
import { JwtTokenIssuedAt } from './types.ts';
import { JwtTokenInvalid, JwtTokenNotBefore, JwtTokenExpired, JwtTokenSignatureMismatched, JwtAlgorithmNotImplemented } from './types.ts';
var CryptoKeyFormat;
(function(CryptoKeyFormat) {
    CryptoKeyFormat["RAW"] = 'raw';
    CryptoKeyFormat["PKCS8"] = 'pkcs8';
    CryptoKeyFormat["SPKI"] = 'spki';
    CryptoKeyFormat["JWK"] = 'jwk';
})(CryptoKeyFormat || (CryptoKeyFormat = {}));
var CryptoKeyUsage;
(function(CryptoKeyUsage) {
    CryptoKeyUsage["Ecrypt"] = 'encrypt';
    CryptoKeyUsage["Decrypt"] = 'decrypt';
    CryptoKeyUsage["Sign"] = 'sign';
    CryptoKeyUsage["Verify"] = 'verify';
    CryptoKeyUsage["Deriverkey"] = 'deriveKey';
    CryptoKeyUsage["DeriveBits"] = 'deriveBits';
    CryptoKeyUsage["WrapKey"] = 'wrapKey';
    CryptoKeyUsage["UnwrapKey"] = 'unwrapKey';
})(CryptoKeyUsage || (CryptoKeyUsage = {}));
const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();
const encodeJwtPart = (part)=>encodeBase64Url(utf8Encoder.encode(JSON.stringify(part))).replace(/=/g, '');
const encodeSignaturePart = (buf)=>encodeBase64Url(buf).replace(/=/g, '');
const decodeJwtPart = (part)=>JSON.parse(utf8Decoder.decode(decodeBase64Url(part)));
const param = (name)=>{
    switch(name.toUpperCase()){
        case 'HS256':
            return {
                name: 'HMAC',
                hash: {
                    name: 'SHA-256'
                }
            };
        case 'HS384':
            return {
                name: 'HMAC',
                hash: {
                    name: 'SHA-384'
                }
            };
        case 'HS512':
            return {
                name: 'HMAC',
                hash: {
                    name: 'SHA-512'
                }
            };
        default:
            throw new JwtAlgorithmNotImplemented(name);
    }
};
const signing = async (data, secret, alg = 'HS256')=>{
    if (!crypto.subtle || !crypto.subtle.importKey) {
        throw new Error('`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.');
    }
    const utf8Encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(CryptoKeyFormat.RAW, utf8Encoder.encode(secret), param(alg), false, [
        CryptoKeyUsage.Sign
    ]);
    return await crypto.subtle.sign(param(alg), cryptoKey, utf8Encoder.encode(data));
};
export const sign = async (payload, secret, alg = 'HS256')=>{
    const encodedPayload = encodeJwtPart(payload);
    const encodedHeader = encodeJwtPart({
        alg,
        typ: 'JWT'
    });
    const partialToken = `${encodedHeader}.${encodedPayload}`;
    const signaturePart = await signing(partialToken, secret, alg);
    const signature = encodeSignaturePart(signaturePart);
    return `${partialToken}.${signature}`;
};
export const verify = async (token, secret, alg = 'HS256')=>{
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        throw new JwtTokenInvalid(token);
    }
    const { payload  } = decode(token);
    const now = Math.floor(Date.now() / 1000);
    if (payload.nbf && payload.nbf > now) {
        throw new JwtTokenNotBefore(token);
    }
    if (payload.exp && payload.exp <= now) {
        throw new JwtTokenExpired(token);
    }
    if (payload.iat && now < payload.iat) {
        throw new JwtTokenIssuedAt(now, payload.iat);
    }
    const signaturePart = tokenParts.slice(0, 2).join('.');
    const signature = await signing(signaturePart, secret, alg);
    const encodedSignature = encodeSignaturePart(signature);
    if (encodedSignature !== tokenParts[2]) {
        throw new JwtTokenSignatureMismatched(token);
    }
    return payload;
};
// eslint-disable-next-line
export const decode = (token)=>{
    try {
        const [h, p] = token.split('.');
        const header = decodeJwtPart(h);
        const payload = decodeJwtPart(p);
        return {
            header,
            payload
        };
    } catch (e) {
        throw new JwtTokenInvalid(token);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL3V0aWxzL2p3dC9qd3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZW5jb2RlQmFzZTY0VXJsLCBkZWNvZGVCYXNlNjRVcmwgfSBmcm9tICcuLi8uLi91dGlscy9lbmNvZGUudHMnXG5pbXBvcnQgdHlwZSB7IEFsZ29yaXRobVR5cGVzIH0gZnJvbSAnLi90eXBlcy50cydcbmltcG9ydCB7IEp3dFRva2VuSXNzdWVkQXQgfSBmcm9tICcuL3R5cGVzLnRzJ1xuaW1wb3J0IHtcbiAgSnd0VG9rZW5JbnZhbGlkLFxuICBKd3RUb2tlbk5vdEJlZm9yZSxcbiAgSnd0VG9rZW5FeHBpcmVkLFxuICBKd3RUb2tlblNpZ25hdHVyZU1pc21hdGNoZWQsXG4gIEp3dEFsZ29yaXRobU5vdEltcGxlbWVudGVkLFxufSBmcm9tICcuL3R5cGVzLnRzJ1xuXG5pbnRlcmZhY2UgQWxnb3JpdGhtUGFyYW1zIHtcbiAgbmFtZTogc3RyaW5nXG4gIG5hbWVkQ3VydmU/OiBzdHJpbmdcbiAgaGFzaD86IHtcbiAgICBuYW1lOiBzdHJpbmdcbiAgfVxufVxuXG5lbnVtIENyeXB0b0tleUZvcm1hdCB7XG4gIFJBVyA9ICdyYXcnLFxuICBQS0NTOCA9ICdwa2NzOCcsXG4gIFNQS0kgPSAnc3BraScsXG4gIEpXSyA9ICdqd2snLFxufVxuXG5lbnVtIENyeXB0b0tleVVzYWdlIHtcbiAgRWNyeXB0ID0gJ2VuY3J5cHQnLFxuICBEZWNyeXB0ID0gJ2RlY3J5cHQnLFxuICBTaWduID0gJ3NpZ24nLFxuICBWZXJpZnkgPSAndmVyaWZ5JyxcbiAgRGVyaXZlcmtleSA9ICdkZXJpdmVLZXknLFxuICBEZXJpdmVCaXRzID0gJ2Rlcml2ZUJpdHMnLFxuICBXcmFwS2V5ID0gJ3dyYXBLZXknLFxuICBVbndyYXBLZXkgPSAndW53cmFwS2V5Jyxcbn1cblxudHlwZSBBbGdvcml0aG1UeXBlTmFtZSA9IGtleW9mIHR5cGVvZiBBbGdvcml0aG1UeXBlc1xuXG5jb25zdCB1dGY4RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpXG5jb25zdCB1dGY4RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpXG5cbmNvbnN0IGVuY29kZUp3dFBhcnQgPSAocGFydDogdW5rbm93bik6IHN0cmluZyA9PlxuICBlbmNvZGVCYXNlNjRVcmwodXRmOEVuY29kZXIuZW5jb2RlKEpTT04uc3RyaW5naWZ5KHBhcnQpKSkucmVwbGFjZSgvPS9nLCAnJylcbmNvbnN0IGVuY29kZVNpZ25hdHVyZVBhcnQgPSAoYnVmOiBBcnJheUJ1ZmZlckxpa2UpOiBzdHJpbmcgPT4gZW5jb2RlQmFzZTY0VXJsKGJ1ZikucmVwbGFjZSgvPS9nLCAnJylcblxuY29uc3QgZGVjb2RlSnd0UGFydCA9IChwYXJ0OiBzdHJpbmcpOiB1bmtub3duID0+XG4gIEpTT04ucGFyc2UodXRmOERlY29kZXIuZGVjb2RlKGRlY29kZUJhc2U2NFVybChwYXJ0KSkpXG5cbmNvbnN0IHBhcmFtID0gKG5hbWU6IEFsZ29yaXRobVR5cGVOYW1lKTogQWxnb3JpdGhtUGFyYW1zID0+IHtcbiAgc3dpdGNoIChuYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICBjYXNlICdIUzI1Nic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiAnSE1BQycsXG4gICAgICAgIGhhc2g6IHtcbiAgICAgICAgICBuYW1lOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgY2FzZSAnSFMzODQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogJ0hNQUMnLFxuICAgICAgICBoYXNoOiB7XG4gICAgICAgICAgbmFtZTogJ1NIQS0zODQnLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIGNhc2UgJ0hTNTEyJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6ICdITUFDJyxcbiAgICAgICAgaGFzaDoge1xuICAgICAgICAgIG5hbWU6ICdTSEEtNTEyJyxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEp3dEFsZ29yaXRobU5vdEltcGxlbWVudGVkKG5hbWUpXG4gIH1cbn1cblxuY29uc3Qgc2lnbmluZyA9IGFzeW5jIChcbiAgZGF0YTogc3RyaW5nLFxuICBzZWNyZXQ6IHN0cmluZyxcbiAgYWxnOiBBbGdvcml0aG1UeXBlTmFtZSA9ICdIUzI1Nidcbik6IFByb21pc2U8QXJyYXlCdWZmZXI+ID0+IHtcbiAgaWYgKCFjcnlwdG8uc3VidGxlIHx8ICFjcnlwdG8uc3VidGxlLmltcG9ydEtleSkge1xuICAgIHRocm93IG5ldyBFcnJvcignYGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5YCBpcyB1bmRlZmluZWQuIEpXVCBhdXRoIG1pZGRsZXdhcmUgcmVxdWlyZXMgaXQuJylcbiAgfVxuXG4gIGNvbnN0IHV0ZjhFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKClcbiAgY29uc3QgY3J5cHRvS2V5ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgQ3J5cHRvS2V5Rm9ybWF0LlJBVyxcbiAgICB1dGY4RW5jb2Rlci5lbmNvZGUoc2VjcmV0KSxcbiAgICBwYXJhbShhbGcpLFxuICAgIGZhbHNlLFxuICAgIFtDcnlwdG9LZXlVc2FnZS5TaWduXVxuICApXG4gIHJldHVybiBhd2FpdCBjcnlwdG8uc3VidGxlLnNpZ24ocGFyYW0oYWxnKSwgY3J5cHRvS2V5LCB1dGY4RW5jb2Rlci5lbmNvZGUoZGF0YSkpXG59XG5cbmV4cG9ydCBjb25zdCBzaWduID0gYXN5bmMgKFxuICBwYXlsb2FkOiB1bmtub3duLFxuICBzZWNyZXQ6IHN0cmluZyxcbiAgYWxnOiBBbGdvcml0aG1UeXBlTmFtZSA9ICdIUzI1Nidcbik6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IGVuY29kZWRQYXlsb2FkID0gZW5jb2RlSnd0UGFydChwYXlsb2FkKVxuICBjb25zdCBlbmNvZGVkSGVhZGVyID0gZW5jb2RlSnd0UGFydCh7IGFsZywgdHlwOiAnSldUJyB9KVxuXG4gIGNvbnN0IHBhcnRpYWxUb2tlbiA9IGAke2VuY29kZWRIZWFkZXJ9LiR7ZW5jb2RlZFBheWxvYWR9YFxuXG4gIGNvbnN0IHNpZ25hdHVyZVBhcnQgPSBhd2FpdCBzaWduaW5nKHBhcnRpYWxUb2tlbiwgc2VjcmV0LCBhbGcpXG4gIGNvbnN0IHNpZ25hdHVyZSA9IGVuY29kZVNpZ25hdHVyZVBhcnQoc2lnbmF0dXJlUGFydClcblxuICByZXR1cm4gYCR7cGFydGlhbFRva2VufS4ke3NpZ25hdHVyZX1gXG59XG5cbmV4cG9ydCBjb25zdCB2ZXJpZnkgPSBhc3luYyAoXG4gIHRva2VuOiBzdHJpbmcsXG4gIHNlY3JldDogc3RyaW5nLFxuICBhbGc6IEFsZ29yaXRobVR5cGVOYW1lID0gJ0hTMjU2J1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgY29uc3QgdG9rZW5QYXJ0cyA9IHRva2VuLnNwbGl0KCcuJylcbiAgaWYgKHRva2VuUGFydHMubGVuZ3RoICE9PSAzKSB7XG4gICAgdGhyb3cgbmV3IEp3dFRva2VuSW52YWxpZCh0b2tlbilcbiAgfVxuXG4gIGNvbnN0IHsgcGF5bG9hZCB9ID0gZGVjb2RlKHRva2VuKVxuICBjb25zdCBub3cgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxuICBpZiAocGF5bG9hZC5uYmYgJiYgcGF5bG9hZC5uYmYgPiBub3cpIHtcbiAgICB0aHJvdyBuZXcgSnd0VG9rZW5Ob3RCZWZvcmUodG9rZW4pXG4gIH1cbiAgaWYgKHBheWxvYWQuZXhwICYmIHBheWxvYWQuZXhwIDw9IG5vdykge1xuICAgIHRocm93IG5ldyBKd3RUb2tlbkV4cGlyZWQodG9rZW4pXG4gIH1cbiAgaWYgKHBheWxvYWQuaWF0ICYmIG5vdyA8IHBheWxvYWQuaWF0KSB7XG4gICAgdGhyb3cgbmV3IEp3dFRva2VuSXNzdWVkQXQobm93LCBwYXlsb2FkLmlhdClcbiAgfVxuXG4gIGNvbnN0IHNpZ25hdHVyZVBhcnQgPSB0b2tlblBhcnRzLnNsaWNlKDAsIDIpLmpvaW4oJy4nKVxuICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBzaWduaW5nKHNpZ25hdHVyZVBhcnQsIHNlY3JldCwgYWxnKVxuICBjb25zdCBlbmNvZGVkU2lnbmF0dXJlID0gZW5jb2RlU2lnbmF0dXJlUGFydChzaWduYXR1cmUpXG4gIGlmIChlbmNvZGVkU2lnbmF0dXJlICE9PSB0b2tlblBhcnRzWzJdKSB7XG4gICAgdGhyb3cgbmV3IEp3dFRva2VuU2lnbmF0dXJlTWlzbWF0Y2hlZCh0b2tlbilcbiAgfVxuXG4gIHJldHVybiBwYXlsb2FkXG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuZXhwb3J0IGNvbnN0IGRlY29kZSA9ICh0b2tlbjogc3RyaW5nKTogeyBoZWFkZXI6IGFueTsgcGF5bG9hZDogYW55IH0gPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IFtoLCBwXSA9IHRva2VuLnNwbGl0KCcuJylcbiAgICBjb25zdCBoZWFkZXIgPSBkZWNvZGVKd3RQYXJ0KGgpXG4gICAgY29uc3QgcGF5bG9hZCA9IGRlY29kZUp3dFBhcnQocClcbiAgICByZXR1cm4ge1xuICAgICAgaGVhZGVyLFxuICAgICAgcGF5bG9hZCxcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgSnd0VG9rZW5JbnZhbGlkKHRva2VuKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxlQUFlLEVBQUUsZUFBZSxRQUFRLHdCQUF1QjtBQUV4RSxTQUFTLGdCQUFnQixRQUFRLGFBQVk7QUFDN0MsU0FDRSxlQUFlLEVBQ2YsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZiwyQkFBMkIsRUFDM0IsMEJBQTBCLFFBQ3JCLGFBQVk7SUFVbkI7VUFBSyxlQUFlO0lBQWYsZ0JBQ0gsU0FBTTtJQURILGdCQUVILFdBQVE7SUFGTCxnQkFHSCxVQUFPO0lBSEosZ0JBSUgsU0FBTTtHQUpI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