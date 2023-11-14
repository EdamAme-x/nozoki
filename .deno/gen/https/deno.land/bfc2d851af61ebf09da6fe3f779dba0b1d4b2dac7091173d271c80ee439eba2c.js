import { sha1 } from '../../utils/crypto.ts';
/**
 * Default headers to pass through on 304 responses. From the spec:
 * > The response must not contain a body and must include the headers that
 * > would have been sent in an equivalent 200 OK response: Cache-Control,
 * > Content-Location, Date, ETag, Expires, and Vary.
 */ const RETAINED_304_HEADERS = [
    'cache-control',
    'content-location',
    'date',
    'etag',
    'expires',
    'vary'
];
function etagMatches(etag, ifNoneMatch) {
    return ifNoneMatch != null && ifNoneMatch.split(/,\s*/).indexOf(etag) > -1;
}
export const etag = (options)=>{
    const retainedHeaders = options?.retainedHeaders ?? RETAINED_304_HEADERS;
    const weak = options?.weak ?? false;
    return async (c, next)=>{
        const ifNoneMatch = c.req.header('If-None-Match') ?? null;
        await next();
        const res = c.res;
        let etag = res.headers.get('ETag');
        if (!etag) {
            const hash = await sha1(res.clone().body || '');
            etag = weak ? `W/"${hash}"` : `"${hash}"`;
        }
        if (etagMatches(etag, ifNoneMatch)) {
            await c.res.blob() // Force using body
            ;
            c.res = new Response(null, {
                status: 304,
                statusText: 'Not Modified',
                headers: {
                    ETag: etag
                }
            });
            c.res.headers.forEach((_, key)=>{
                if (retainedHeaders.indexOf(key.toLowerCase()) === -1) {
                    c.res.headers.delete(key);
                }
            });
        } else {
            c.res.headers.set('ETag', etag);
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvZXRhZy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5pbXBvcnQgeyBzaGExIH0gZnJvbSAnLi4vLi4vdXRpbHMvY3J5cHRvLnRzJ1xuXG50eXBlIEVUYWdPcHRpb25zID0ge1xuICByZXRhaW5lZEhlYWRlcnM/OiBzdHJpbmdbXVxuICB3ZWFrPzogYm9vbGVhblxufVxuXG4vKipcbiAqIERlZmF1bHQgaGVhZGVycyB0byBwYXNzIHRocm91Z2ggb24gMzA0IHJlc3BvbnNlcy4gRnJvbSB0aGUgc3BlYzpcbiAqID4gVGhlIHJlc3BvbnNlIG11c3Qgbm90IGNvbnRhaW4gYSBib2R5IGFuZCBtdXN0IGluY2x1ZGUgdGhlIGhlYWRlcnMgdGhhdFxuICogPiB3b3VsZCBoYXZlIGJlZW4gc2VudCBpbiBhbiBlcXVpdmFsZW50IDIwMCBPSyByZXNwb25zZTogQ2FjaGUtQ29udHJvbCxcbiAqID4gQ29udGVudC1Mb2NhdGlvbiwgRGF0ZSwgRVRhZywgRXhwaXJlcywgYW5kIFZhcnkuXG4gKi9cbmNvbnN0IFJFVEFJTkVEXzMwNF9IRUFERVJTID0gW1xuICAnY2FjaGUtY29udHJvbCcsXG4gICdjb250ZW50LWxvY2F0aW9uJyxcbiAgJ2RhdGUnLFxuICAnZXRhZycsXG4gICdleHBpcmVzJyxcbiAgJ3ZhcnknLFxuXVxuXG5mdW5jdGlvbiBldGFnTWF0Y2hlcyhldGFnOiBzdHJpbmcsIGlmTm9uZU1hdGNoOiBzdHJpbmcgfCBudWxsKSB7XG4gIHJldHVybiBpZk5vbmVNYXRjaCAhPSBudWxsICYmIGlmTm9uZU1hdGNoLnNwbGl0KC8sXFxzKi8pLmluZGV4T2YoZXRhZykgPiAtMVxufVxuXG5leHBvcnQgY29uc3QgZXRhZyA9IChvcHRpb25zPzogRVRhZ09wdGlvbnMpOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIGNvbnN0IHJldGFpbmVkSGVhZGVycyA9IG9wdGlvbnM/LnJldGFpbmVkSGVhZGVycyA/PyBSRVRBSU5FRF8zMDRfSEVBREVSU1xuICBjb25zdCB3ZWFrID0gb3B0aW9ucz8ud2VhayA/PyBmYWxzZVxuXG4gIHJldHVybiBhc3luYyAoYywgbmV4dCkgPT4ge1xuICAgIGNvbnN0IGlmTm9uZU1hdGNoID0gYy5yZXEuaGVhZGVyKCdJZi1Ob25lLU1hdGNoJykgPz8gbnVsbFxuXG4gICAgYXdhaXQgbmV4dCgpXG5cbiAgICBjb25zdCByZXMgPSBjLnJlcyBhcyBSZXNwb25zZVxuICAgIGxldCBldGFnID0gcmVzLmhlYWRlcnMuZ2V0KCdFVGFnJylcblxuICAgIGlmICghZXRhZykge1xuICAgICAgY29uc3QgaGFzaCA9IGF3YWl0IHNoYTEocmVzLmNsb25lKCkuYm9keSB8fCAnJylcbiAgICAgIGV0YWcgPSB3ZWFrID8gYFcvXCIke2hhc2h9XCJgIDogYFwiJHtoYXNofVwiYFxuICAgIH1cblxuICAgIGlmIChldGFnTWF0Y2hlcyhldGFnLCBpZk5vbmVNYXRjaCkpIHtcbiAgICAgIGF3YWl0IGMucmVzLmJsb2IoKSAvLyBGb3JjZSB1c2luZyBib2R5XG4gICAgICBjLnJlcyA9IG5ldyBSZXNwb25zZShudWxsLCB7XG4gICAgICAgIHN0YXR1czogMzA0LFxuICAgICAgICBzdGF0dXNUZXh0OiAnTm90IE1vZGlmaWVkJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEVUYWc6IGV0YWcsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICAgYy5yZXMuaGVhZGVycy5mb3JFYWNoKChfLCBrZXkpID0+IHtcbiAgICAgICAgaWYgKHJldGFpbmVkSGVhZGVycy5pbmRleE9mKGtleS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcbiAgICAgICAgICBjLnJlcy5oZWFkZXJzLmRlbGV0ZShrZXkpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGMucmVzLmhlYWRlcnMuc2V0KCdFVGFnJywgZXRhZylcbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLElBQUksUUFBUSx3QkFBdUI7QUFPNUM7Ozs7O0NBS0MsR0FDRCxNQUFNLHVCQUF1QjtJQUMzQjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7Q0FDRDtBQUVELFNBQVMsWUFBWSxJQUFZLEVBQUUsV0FBMEIsRUFBRTtJQUM3RCxPQUFPLGVBQWUsSUFBSSxJQUFJLFlBQVksS0FBSyxDQUFDLFFBQVEsT0FBTyxDQUFDLFFBQVEsQ0FBQztBQUMzRTtBQUVBLE9BQU8sTUFBTSxPQUFPLENBQUMsVUFBNkM7SUFDaEUsTUFBTSxrQkFBa0IsU0FBUyxtQkFBbUI7SUFDcEQsTUFBTSxPQUFPLFNBQVMsUUFBUSxLQUFLO0lBRW5DLE9BQU8sT0FBTyxHQUFHLE9BQVM7UUFDeEIsTUFBTSxjQUFjLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsSUFBSTtRQUV6RCxNQUFNO1FBRU4sTUFBTSxNQUFNLEVBQUUsR0FBRztRQUNqQixJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDO1FBRTNCLElBQUksQ0FBQyxNQUFNO1lBQ1QsTUFBTSxPQUFPLE1BQU0sS0FBSyxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUk7WUFDNUMsT0FBTyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELElBQUksWUFBWSxNQUFNLGNBQWM7WUFDbEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsbUJBQW1COztZQUN0QyxFQUFFLEdBQUcsR0FBRyxJQUFJLFNBQVMsSUFBSSxFQUFFO2dCQUN6QixRQUFRO2dCQUNSLFlBQVk7Z0JBQ1osU0FBUztvQkFDUCxNQUFNO2dCQUNSO1lBQ0Y7WUFDQSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxNQUFRO2dCQUNoQyxJQUFJLGdCQUFnQixPQUFPLENBQUMsSUFBSSxXQUFXLFFBQVEsQ0FBQyxHQUFHO29CQUNyRCxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2dCQUN2QixDQUFDO1lBQ0g7UUFDRixPQUFPO1lBQ0wsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRO1FBQzVCLENBQUM7SUFDSDtBQUNGLEVBQUMifQ==