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
        const ifNoneMatch = c.req.headers.get('If-None-Match');
        await next();
        const res = c.res;
        let undisturbedRes = res;
        let etag = res.headers.get('ETag');
        if (!etag) {
            undisturbedRes = res.clone();
            const hash = await sha1(res.body || '');
            etag = weak ? `W/"${hash}"` : `"${hash}"`;
        }
        if (etagMatches(etag, ifNoneMatch)) {
            await undisturbedRes.blob() // Force using body
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
            c.res = new Response(undisturbedRes.body, undisturbedRes);
            c.res.headers.set('ETag', etag);
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvbWlkZGxld2FyZS9ldGFnL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi8uLi90eXBlcy50cydcbmltcG9ydCB7IHNoYTEgfSBmcm9tICcuLi8uLi91dGlscy9jcnlwdG8udHMnXG5cbnR5cGUgRVRhZ09wdGlvbnMgPSB7XG4gIHJldGFpbmVkSGVhZGVycz86IHN0cmluZ1tdLFxuICB3ZWFrPzogYm9vbGVhblxufVxuXG4vKipcbiAqIERlZmF1bHQgaGVhZGVycyB0byBwYXNzIHRocm91Z2ggb24gMzA0IHJlc3BvbnNlcy4gRnJvbSB0aGUgc3BlYzpcbiAqID4gVGhlIHJlc3BvbnNlIG11c3Qgbm90IGNvbnRhaW4gYSBib2R5IGFuZCBtdXN0IGluY2x1ZGUgdGhlIGhlYWRlcnMgdGhhdFxuICogPiB3b3VsZCBoYXZlIGJlZW4gc2VudCBpbiBhbiBlcXVpdmFsZW50IDIwMCBPSyByZXNwb25zZTogQ2FjaGUtQ29udHJvbCxcbiAqID4gQ29udGVudC1Mb2NhdGlvbiwgRGF0ZSwgRVRhZywgRXhwaXJlcywgYW5kIFZhcnkuXG4gKi9cbmNvbnN0IFJFVEFJTkVEXzMwNF9IRUFERVJTID0gW1xuICAnY2FjaGUtY29udHJvbCcsICdjb250ZW50LWxvY2F0aW9uJywgJ2RhdGUnLCAnZXRhZycsICdleHBpcmVzJywgJ3ZhcnknXG5dXG5cbmZ1bmN0aW9uIGV0YWdNYXRjaGVzKGV0YWc6IHN0cmluZywgaWZOb25lTWF0Y2g6IHN0cmluZyB8IG51bGwpIHtcbiAgcmV0dXJuIGlmTm9uZU1hdGNoICE9IG51bGwgJiYgaWZOb25lTWF0Y2guc3BsaXQoLyxcXHMqLykuaW5kZXhPZihldGFnKSA+IC0xXG59XG5cbmV4cG9ydCBjb25zdCBldGFnID0gKG9wdGlvbnM/OiBFVGFnT3B0aW9ucyk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgY29uc3QgcmV0YWluZWRIZWFkZXJzID0gb3B0aW9ucz8ucmV0YWluZWRIZWFkZXJzID8/IFJFVEFJTkVEXzMwNF9IRUFERVJTXG4gIGNvbnN0IHdlYWsgPSBvcHRpb25zPy53ZWFrID8/IGZhbHNlXG5cbiAgcmV0dXJuIGFzeW5jIChjLCBuZXh0KSA9PiB7XG4gICAgY29uc3QgaWZOb25lTWF0Y2ggPSBjLnJlcS5oZWFkZXJzLmdldCgnSWYtTm9uZS1NYXRjaCcpXG5cbiAgICBhd2FpdCBuZXh0KClcblxuICAgIGNvbnN0IHJlcyA9IGMucmVzIGFzIFJlc3BvbnNlXG4gICAgbGV0IHVuZGlzdHVyYmVkUmVzID0gcmVzXG4gICAgbGV0IGV0YWcgPSByZXMuaGVhZGVycy5nZXQoJ0VUYWcnKVxuXG4gICAgaWYgKCFldGFnKSB7XG4gICAgICB1bmRpc3R1cmJlZFJlcyA9IHJlcy5jbG9uZSgpXG4gICAgICBjb25zdCBoYXNoID0gYXdhaXQgc2hhMShyZXMuYm9keSB8fCAnJylcbiAgICAgIGV0YWcgPSB3ZWFrID8gYFcvXCIke2hhc2h9XCJgIDogYFwiJHtoYXNofVwiYFxuICAgIH1cblxuICAgIGlmIChldGFnTWF0Y2hlcyhldGFnLCBpZk5vbmVNYXRjaCkpIHtcbiAgICAgIGF3YWl0IHVuZGlzdHVyYmVkUmVzLmJsb2IoKSAvLyBGb3JjZSB1c2luZyBib2R5XG4gICAgICBjLnJlcyA9IG5ldyBSZXNwb25zZShudWxsLCB7XG4gICAgICAgIHN0YXR1czogMzA0LFxuICAgICAgICBzdGF0dXNUZXh0OiAnTm90IE1vZGlmaWVkJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEVUYWc6IGV0YWcsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICAgYy5yZXMuaGVhZGVycy5mb3JFYWNoKChfLCBrZXkpID0+IHtcbiAgICAgICAgaWYgKHJldGFpbmVkSGVhZGVycy5pbmRleE9mKGtleS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcbiAgICAgICAgICBjLnJlcy5oZWFkZXJzLmRlbGV0ZShrZXkpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGMucmVzID0gbmV3IFJlc3BvbnNlKHVuZGlzdHVyYmVkUmVzLmJvZHksIHVuZGlzdHVyYmVkUmVzKVxuICAgICAgYy5yZXMuaGVhZGVycy5zZXQoJ0VUYWcnLCBldGFnKVxuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsSUFBSSxRQUFRLHdCQUF1QjtBQU81Qzs7Ozs7Q0FLQyxHQUNELE1BQU0sdUJBQXVCO0lBQzNCO0lBQWlCO0lBQW9CO0lBQVE7SUFBUTtJQUFXO0NBQ2pFO0FBRUQsU0FBUyxZQUFZLElBQVksRUFBRSxXQUEwQixFQUFFO0lBQzdELE9BQU8sZUFBZSxJQUFJLElBQUksWUFBWSxLQUFLLENBQUMsUUFBUSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzNFO0FBRUEsT0FBTyxNQUFNLE9BQU8sQ0FBQyxVQUE2QztJQUNoRSxNQUFNLGtCQUFrQixTQUFTLG1CQUFtQjtJQUNwRCxNQUFNLE9BQU8sU0FBUyxRQUFRLEtBQUs7SUFFbkMsT0FBTyxPQUFPLEdBQUcsT0FBUztRQUN4QixNQUFNLGNBQWMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUV0QyxNQUFNO1FBRU4sTUFBTSxNQUFNLEVBQUUsR0FBRztRQUNqQixJQUFJLGlCQUFpQjtRQUNyQixJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDO1FBRTNCLElBQUksQ0FBQyxNQUFNO1lBQ1QsaUJBQWlCLElBQUksS0FBSztZQUMxQixNQUFNLE9BQU8sTUFBTSxLQUFLLElBQUksSUFBSSxJQUFJO1lBQ3BDLE9BQU8sT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxJQUFJLFlBQVksTUFBTSxjQUFjO1lBQ2xDLE1BQU0sZUFBZSxJQUFJLEdBQUcsbUJBQW1COztZQUMvQyxFQUFFLEdBQUcsR0FBRyxJQUFJLFNBQVMsSUFBSSxFQUFFO2dCQUN6QixRQUFRO2dCQUNSLFlBQVk7Z0JBQ1osU0FBUztvQkFDUCxNQUFNO2dCQUNSO1lBQ0Y7WUFDQSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxNQUFRO2dCQUNoQyxJQUFJLGdCQUFnQixPQUFPLENBQUMsSUFBSSxXQUFXLFFBQVEsQ0FBQyxHQUFHO29CQUNyRCxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2dCQUN2QixDQUFDO1lBQ0g7UUFDRixPQUFPO1lBQ0wsRUFBRSxHQUFHLEdBQUcsSUFBSSxTQUFTLGVBQWUsSUFBSSxFQUFFO1lBQzFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUTtRQUM1QixDQUFDO0lBQ0g7QUFDRixFQUFDIn0=