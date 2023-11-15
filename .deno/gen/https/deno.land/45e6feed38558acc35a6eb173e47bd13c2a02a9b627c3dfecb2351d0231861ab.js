import { encodeBase64Url, decodeBase64Url } from '../../utils/encode.ts';
import { AlgorithmTypes, JwtTokenIssuedAt } from './types.ts';
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
const signing = async (data, secret, alg = AlgorithmTypes.HS256)=>{
    if (!crypto.subtle || !crypto.subtle.importKey) {
        throw new Error('`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.');
    }
    const utf8Encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(CryptoKeyFormat.RAW, utf8Encoder.encode(secret), param(alg), false, [
        CryptoKeyUsage.Sign
    ]);
    return await crypto.subtle.sign(param(alg), cryptoKey, utf8Encoder.encode(data));
};
export const sign = async (payload, secret, alg = AlgorithmTypes.HS256)=>{
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
export const verify = async (token, secret, alg = AlgorithmTypes.HS256)=>{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvdXRpbHMvand0L2p3dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBlbmNvZGVCYXNlNjRVcmwsIGRlY29kZUJhc2U2NFVybCB9IGZyb20gJy4uLy4uL3V0aWxzL2VuY29kZS50cydcbmltcG9ydCB7IEFsZ29yaXRobVR5cGVzLCBKd3RUb2tlbklzc3VlZEF0IH0gZnJvbSAnLi90eXBlcy50cydcbmltcG9ydCB7XG4gIEp3dFRva2VuSW52YWxpZCxcbiAgSnd0VG9rZW5Ob3RCZWZvcmUsXG4gIEp3dFRva2VuRXhwaXJlZCxcbiAgSnd0VG9rZW5TaWduYXR1cmVNaXNtYXRjaGVkLFxuICBKd3RBbGdvcml0aG1Ob3RJbXBsZW1lbnRlZCxcbn0gZnJvbSAnLi90eXBlcy50cydcblxuaW50ZXJmYWNlIEFsZ29yaXRobVBhcmFtcyB7XG4gIG5hbWU6IHN0cmluZ1xuICBuYW1lZEN1cnZlPzogc3RyaW5nXG4gIGhhc2g/OiB7XG4gICAgbmFtZTogc3RyaW5nXG4gIH1cbn1cblxuZW51bSBDcnlwdG9LZXlGb3JtYXQge1xuICBSQVcgPSAncmF3JyxcbiAgUEtDUzggPSAncGtjczgnLFxuICBTUEtJID0gJ3Nwa2knLFxuICBKV0sgPSAnandrJyxcbn1cblxuZW51bSBDcnlwdG9LZXlVc2FnZSB7XG4gIEVjcnlwdCA9ICdlbmNyeXB0JyxcbiAgRGVjcnlwdCA9ICdkZWNyeXB0JyxcbiAgU2lnbiA9ICdzaWduJyxcbiAgVmVyaWZ5ID0gJ3ZlcmlmeScsXG4gIERlcml2ZXJrZXkgPSAnZGVyaXZlS2V5JyxcbiAgRGVyaXZlQml0cyA9ICdkZXJpdmVCaXRzJyxcbiAgV3JhcEtleSA9ICd3cmFwS2V5JyxcbiAgVW53cmFwS2V5ID0gJ3Vud3JhcEtleScsXG59XG5cbmNvbnN0IHV0ZjhFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKClcbmNvbnN0IHV0ZjhEZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKClcblxuY29uc3QgZW5jb2RlSnd0UGFydCA9IChwYXJ0OiB1bmtub3duKTogc3RyaW5nID0+XG4gIGVuY29kZUJhc2U2NFVybCh1dGY4RW5jb2Rlci5lbmNvZGUoSlNPTi5zdHJpbmdpZnkocGFydCkpKS5yZXBsYWNlKC89L2csICcnKVxuY29uc3QgZW5jb2RlU2lnbmF0dXJlUGFydCA9IChidWY6IEFycmF5QnVmZmVyTGlrZSk6IHN0cmluZyA9PiBlbmNvZGVCYXNlNjRVcmwoYnVmKS5yZXBsYWNlKC89L2csICcnKVxuXG5jb25zdCBkZWNvZGVKd3RQYXJ0ID0gKHBhcnQ6IHN0cmluZyk6IHVua25vd24gPT5cbiAgSlNPTi5wYXJzZSh1dGY4RGVjb2Rlci5kZWNvZGUoZGVjb2RlQmFzZTY0VXJsKHBhcnQpKSlcblxuY29uc3QgcGFyYW0gPSAobmFtZTogQWxnb3JpdGhtVHlwZXMpOiBBbGdvcml0aG1QYXJhbXMgPT4ge1xuICBzd2l0Y2ggKG5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgIGNhc2UgJ0hTMjU2JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6ICdITUFDJyxcbiAgICAgICAgaGFzaDoge1xuICAgICAgICAgIG5hbWU6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICBjYXNlICdIUzM4NCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiAnSE1BQycsXG4gICAgICAgIGhhc2g6IHtcbiAgICAgICAgICBuYW1lOiAnU0hBLTM4NCcsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgY2FzZSAnSFM1MTInOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogJ0hNQUMnLFxuICAgICAgICBoYXNoOiB7XG4gICAgICAgICAgbmFtZTogJ1NIQS01MTInLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgSnd0QWxnb3JpdGhtTm90SW1wbGVtZW50ZWQobmFtZSlcbiAgfVxufVxuXG5jb25zdCBzaWduaW5nID0gYXN5bmMgKFxuICBkYXRhOiBzdHJpbmcsXG4gIHNlY3JldDogc3RyaW5nLFxuICBhbGc6IEFsZ29yaXRobVR5cGVzID0gQWxnb3JpdGhtVHlwZXMuSFMyNTZcbik6IFByb21pc2U8QXJyYXlCdWZmZXI+ID0+IHtcbiAgaWYgKCFjcnlwdG8uc3VidGxlIHx8ICFjcnlwdG8uc3VidGxlLmltcG9ydEtleSkge1xuICAgIHRocm93IG5ldyBFcnJvcignYGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5YCBpcyB1bmRlZmluZWQuIEpXVCBhdXRoIG1pZGRsZXdhcmUgcmVxdWlyZXMgaXQuJylcbiAgfVxuXG4gIGNvbnN0IHV0ZjhFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKClcbiAgY29uc3QgY3J5cHRvS2V5ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgQ3J5cHRvS2V5Rm9ybWF0LlJBVyxcbiAgICB1dGY4RW5jb2Rlci5lbmNvZGUoc2VjcmV0KSxcbiAgICBwYXJhbShhbGcpLFxuICAgIGZhbHNlLFxuICAgIFtDcnlwdG9LZXlVc2FnZS5TaWduXVxuICApXG4gIHJldHVybiBhd2FpdCBjcnlwdG8uc3VidGxlLnNpZ24ocGFyYW0oYWxnKSwgY3J5cHRvS2V5LCB1dGY4RW5jb2Rlci5lbmNvZGUoZGF0YSkpXG59XG5cbmV4cG9ydCBjb25zdCBzaWduID0gYXN5bmMgKFxuICBwYXlsb2FkOiB1bmtub3duLFxuICBzZWNyZXQ6IHN0cmluZyxcbiAgYWxnOiBBbGdvcml0aG1UeXBlcyA9IEFsZ29yaXRobVR5cGVzLkhTMjU2XG4pOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBjb25zdCBlbmNvZGVkUGF5bG9hZCA9IGVuY29kZUp3dFBhcnQocGF5bG9hZClcbiAgY29uc3QgZW5jb2RlZEhlYWRlciA9IGVuY29kZUp3dFBhcnQoeyBhbGcsIHR5cDogJ0pXVCcgfSlcblxuICBjb25zdCBwYXJ0aWFsVG9rZW4gPSBgJHtlbmNvZGVkSGVhZGVyfS4ke2VuY29kZWRQYXlsb2FkfWBcblxuICBjb25zdCBzaWduYXR1cmVQYXJ0ID0gYXdhaXQgc2lnbmluZyhwYXJ0aWFsVG9rZW4sIHNlY3JldCwgYWxnKVxuICBjb25zdCBzaWduYXR1cmUgPSBlbmNvZGVTaWduYXR1cmVQYXJ0KHNpZ25hdHVyZVBhcnQpXG5cbiAgcmV0dXJuIGAke3BhcnRpYWxUb2tlbn0uJHtzaWduYXR1cmV9YFxufVxuXG5leHBvcnQgY29uc3QgdmVyaWZ5ID0gYXN5bmMgKFxuICB0b2tlbjogc3RyaW5nLFxuICBzZWNyZXQ6IHN0cmluZyxcbiAgYWxnOiBBbGdvcml0aG1UeXBlcyA9IEFsZ29yaXRobVR5cGVzLkhTMjU2XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4pOiBQcm9taXNlPGFueT4gPT4ge1xuICBjb25zdCB0b2tlblBhcnRzID0gdG9rZW4uc3BsaXQoJy4nKVxuICBpZiAodG9rZW5QYXJ0cy5sZW5ndGggIT09IDMpIHtcbiAgICB0aHJvdyBuZXcgSnd0VG9rZW5JbnZhbGlkKHRva2VuKVxuICB9XG5cbiAgY29uc3QgeyBwYXlsb2FkIH0gPSBkZWNvZGUodG9rZW4pXG4gIGNvbnN0IG5vdyA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXG4gIGlmIChwYXlsb2FkLm5iZiAmJiBwYXlsb2FkLm5iZiA+IG5vdykge1xuICAgIHRocm93IG5ldyBKd3RUb2tlbk5vdEJlZm9yZSh0b2tlbilcbiAgfVxuICBpZiAocGF5bG9hZC5leHAgJiYgcGF5bG9hZC5leHAgPD0gbm93KSB7XG4gICAgdGhyb3cgbmV3IEp3dFRva2VuRXhwaXJlZCh0b2tlbilcbiAgfVxuICBpZiAocGF5bG9hZC5pYXQgJiYgbm93IDwgcGF5bG9hZC5pYXQpIHtcbiAgICB0aHJvdyBuZXcgSnd0VG9rZW5Jc3N1ZWRBdChub3csIHBheWxvYWQuaWF0KVxuICB9XG5cbiAgY29uc3Qgc2lnbmF0dXJlUGFydCA9IHRva2VuUGFydHMuc2xpY2UoMCwgMikuam9pbignLicpXG4gIGNvbnN0IHNpZ25hdHVyZSA9IGF3YWl0IHNpZ25pbmcoc2lnbmF0dXJlUGFydCwgc2VjcmV0LCBhbGcpXG4gIGNvbnN0IGVuY29kZWRTaWduYXR1cmUgPSBlbmNvZGVTaWduYXR1cmVQYXJ0KHNpZ25hdHVyZSlcbiAgaWYgKGVuY29kZWRTaWduYXR1cmUgIT09IHRva2VuUGFydHNbMl0pIHtcbiAgICB0aHJvdyBuZXcgSnd0VG9rZW5TaWduYXR1cmVNaXNtYXRjaGVkKHRva2VuKVxuICB9XG5cbiAgcmV0dXJuIHBheWxvYWRcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5leHBvcnQgY29uc3QgZGVjb2RlID0gKHRva2VuOiBzdHJpbmcpOiB7IGhlYWRlcjogYW55OyBwYXlsb2FkOiBhbnkgfSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgW2gsIHBdID0gdG9rZW4uc3BsaXQoJy4nKVxuICAgIGNvbnN0IGhlYWRlciA9IGRlY29kZUp3dFBhcnQoaClcbiAgICBjb25zdCBwYXlsb2FkID0gZGVjb2RlSnd0UGFydChwKVxuICAgIHJldHVybiB7XG4gICAgICBoZWFkZXIsXG4gICAgICBwYXlsb2FkLFxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBKd3RUb2tlbkludmFsaWQodG9rZW4pXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLGVBQWUsRUFBRSxlQUFlLFFBQVEsd0JBQXVCO0FBQ3hFLFNBQVMsY0FBYyxFQUFFLGdCQUFnQixRQUFRLGFBQVk7QUFDN0QsU0FDRSxlQUFlLEVBQ2YsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZiwyQkFBMkIsRUFDM0IsMEJBQTBCLFFBQ3JCLGFBQVk7SUFVbkI7VUFBSyxlQUFlO0lBQWYsZ0JBQ0gsU0FBTTtJQURILGdCQUVILFdBQVE7SUFGTCxnQkFHSCxVQUFPO0lBSEosZ0JBSUgsU0FBTTtHQUpILG9CQUFBO0lBT0w7VUFBSyxjQUFjO0lBQWQsZUFDSCxZQUFTO0lBRE4sZUFFSCxhQUFVO0lB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