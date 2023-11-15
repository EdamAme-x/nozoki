export const sha256 = async (data)=>{
    const algorithm = {
        name: 'SHA-256',
        alias: 'sha256'
    };
    const hash = await createHash(data, algorithm);
    return hash;
};
export const sha1 = async (data)=>{
    const algorithm = {
        name: 'SHA-1',
        alias: 'sha1'
    };
    const hash = await createHash(data, algorithm);
    return hash;
};
export const md5 = async (data)=>{
    const algorithm = {
        name: 'MD5',
        alias: 'md5'
    };
    const hash = await createHash(data, algorithm);
    return hash;
};
export const createHash = async (data, algorithm)=>{
    let sourceBuffer;
    if (data instanceof ReadableStream) {
        let body = '';
        const reader = data.getReader();
        await reader?.read().then(async (chuck)=>{
            const value = await createHash(chuck.value || '', algorithm);
            body += value;
        });
        return body;
    }
    if (ArrayBuffer.isView(data) || data instanceof ArrayBuffer) {
        sourceBuffer = data;
    } else {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }
        sourceBuffer = new TextEncoder().encode(String(data));
    }
    if (crypto && crypto.subtle) {
        const buffer = await crypto.subtle.digest({
            name: algorithm.name
        }, sourceBuffer);
        const hash = Array.prototype.map.call(new Uint8Array(buffer), (x)=>('00' + x.toString(16)).slice(-2)).join('');
        return hash;
    }
    return null;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvdXRpbHMvY3J5cHRvLnRzIl0sInNvdXJjZXNDb250ZW50IjpbInR5cGUgQWxnb3JpdGhtID0ge1xuICBuYW1lOiBzdHJpbmdcbiAgYWxpYXM6IHN0cmluZ1xufVxuXG50eXBlIERhdGEgPSBzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyIHwgb2JqZWN0IHwgQXJyYXlCdWZmZXJWaWV3IHwgQXJyYXlCdWZmZXIgfCBSZWFkYWJsZVN0cmVhbVxuXG5leHBvcnQgY29uc3Qgc2hhMjU2ID0gYXN5bmMgKGRhdGE6IERhdGEpID0+IHtcbiAgY29uc3QgYWxnb3JpdGhtOiBBbGdvcml0aG0gPSB7IG5hbWU6ICdTSEEtMjU2JywgYWxpYXM6ICdzaGEyNTYnIH1cbiAgY29uc3QgaGFzaCA9IGF3YWl0IGNyZWF0ZUhhc2goZGF0YSwgYWxnb3JpdGhtKVxuICByZXR1cm4gaGFzaFxufVxuXG5leHBvcnQgY29uc3Qgc2hhMSA9IGFzeW5jIChkYXRhOiBEYXRhKSA9PiB7XG4gIGNvbnN0IGFsZ29yaXRobTogQWxnb3JpdGhtID0geyBuYW1lOiAnU0hBLTEnLCBhbGlhczogJ3NoYTEnIH1cbiAgY29uc3QgaGFzaCA9IGF3YWl0IGNyZWF0ZUhhc2goZGF0YSwgYWxnb3JpdGhtKVxuICByZXR1cm4gaGFzaFxufVxuXG5leHBvcnQgY29uc3QgbWQ1ID0gYXN5bmMgKGRhdGE6IERhdGEpID0+IHtcbiAgY29uc3QgYWxnb3JpdGhtOiBBbGdvcml0aG0gPSB7IG5hbWU6ICdNRDUnLCBhbGlhczogJ21kNScgfVxuICBjb25zdCBoYXNoID0gYXdhaXQgY3JlYXRlSGFzaChkYXRhLCBhbGdvcml0aG0pXG4gIHJldHVybiBoYXNoXG59XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVIYXNoID0gYXN5bmMgKGRhdGE6IERhdGEsIGFsZ29yaXRobTogQWxnb3JpdGhtKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiA9PiB7XG4gIGxldCBzb3VyY2VCdWZmZXI6IEFycmF5QnVmZmVyVmlldyB8IEFycmF5QnVmZmVyXG5cbiAgaWYgKGRhdGEgaW5zdGFuY2VvZiBSZWFkYWJsZVN0cmVhbSkge1xuICAgIGxldCBib2R5ID0gJydcbiAgICBjb25zdCByZWFkZXIgPSBkYXRhLmdldFJlYWRlcigpXG4gICAgYXdhaXQgcmVhZGVyPy5yZWFkKCkudGhlbihhc3luYyAoY2h1Y2spID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgY3JlYXRlSGFzaChjaHVjay52YWx1ZSB8fCAnJywgYWxnb3JpdGhtKVxuICAgICAgYm9keSArPSB2YWx1ZVxuICAgIH0pXG4gICAgcmV0dXJuIGJvZHlcbiAgfVxuICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGRhdGEpIHx8IGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHNvdXJjZUJ1ZmZlciA9IGRhdGFcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSlcbiAgICB9XG4gICAgc291cmNlQnVmZmVyID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKFN0cmluZyhkYXRhKSlcbiAgfVxuXG4gIGlmIChjcnlwdG8gJiYgY3J5cHRvLnN1YnRsZSkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KFxuICAgICAge1xuICAgICAgICBuYW1lOiBhbGdvcml0aG0ubmFtZSxcbiAgICAgIH0sXG4gICAgICBzb3VyY2VCdWZmZXIgYXMgQXJyYXlCdWZmZXJcbiAgICApXG4gICAgY29uc3QgaGFzaCA9IEFycmF5LnByb3RvdHlwZS5tYXBcbiAgICAgIC5jYWxsKG5ldyBVaW50OEFycmF5KGJ1ZmZlciksICh4KSA9PiAoJzAwJyArIHgudG9TdHJpbmcoMTYpKS5zbGljZSgtMikpXG4gICAgICAuam9pbignJylcbiAgICByZXR1cm4gaGFzaFxuICB9XG4gIHJldHVybiBudWxsXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT0EsT0FBTyxNQUFNLFNBQVMsT0FBTyxPQUFlO0lBQzFDLE1BQU0sWUFBdUI7UUFBRSxNQUFNO1FBQVcsT0FBTztJQUFTO0lBQ2hFLE1BQU0sT0FBTyxNQUFNLFdBQVcsTUFBTTtJQUNwQyxPQUFPO0FBQ1QsRUFBQztBQUVELE9BQU8sTUFBTSxPQUFPLE9BQU8sT0FBZTtJQUN4QyxNQUFNLFlBQXVCO1FBQUUsTUFBTTtRQUFTLE9BQU87SUFBTztJQUM1RCxNQUFNLE9BQU8sTUFBTSxXQUFXLE1BQU07SUFDcEMsT0FBTztBQUNULEVBQUM7QUFFRCxPQUFPLE1BQU0sTUFBTSxPQUFPLE9BQWU7SUFDdkMsTUFBTSxZQUF1QjtRQUFFLE1BQU07UUFBTyxPQUFPO0lBQU07SUFDekQsTUFBTSxPQUFPLE1BQU0sV0FBVyxNQUFNO0lBQ3BDLE9BQU87QUFDVCxFQUFDO0FBRUQsT0FBTyxNQUFNLGFBQWEsT0FBTyxNQUFZLFlBQWlEO0lBQzVGLElBQUk7SUFFSixJQUFJLGdCQUFnQixnQkFBZ0I7UUFDbEMsSUFBSSxPQUFPO1FBQ1gsTUFBTSxTQUFTLEtBQUssU0FBUztRQUM3QixNQUFNLFFBQVEsT0FBTyxJQUFJLENBQUMsT0FBTyxRQUFVO1lBQ3pDLE1BQU0sUUFBUSxNQUFNLFdBQVcsTUFBTSxLQUFLLElBQUksSUFBSTtZQUNsRCxRQUFRO1FBQ1Y7UUFDQSxPQUFPO0lBQ1QsQ0FBQztJQUNELElBQUksWUFBWSxNQUFNLENBQUMsU0FBUyxnQkFBZ0IsYUFBYTtRQUMzRCxlQUFlO0lBQ2pCLE9BQU87UUFDTCxJQUFJLE9BQU8sU0FBUyxVQUFVO1lBQzVCLE9BQU8sS0FBSyxTQUFTLENBQUM7UUFDeEIsQ0FBQztRQUNELGVBQWUsSUFBSSxjQUFjLE1BQU0sQ0FBQyxPQUFPO0lBQ2pELENBQUM7SUFFRCxJQUFJLFVBQVUsT0FBTyxNQUFNLEVBQUU7UUFDM0IsTUFBTSxTQUFTLE1BQU0sT0FBTyxNQUFNLENBQUMsTUFBTSxDQUN2QztZQUNFLE1BQU0sVUFBVSxJQUFJO1FBQ3RCLEdBQ0E7UUFFRixNQUFNLE9BQU8sTUFBTSxTQUFTLENBQUMsR0FBRyxDQUM3QixJQUFJLENBQUMsSUFBSSxXQUFXLFNBQVMsQ0FBQyxJQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFDbkUsSUFBSSxDQUFDO1FBQ1IsT0FBTztJQUNULENBQUM7SUFDRCxPQUFPLElBQUk7QUFDYixFQUFDIn0=