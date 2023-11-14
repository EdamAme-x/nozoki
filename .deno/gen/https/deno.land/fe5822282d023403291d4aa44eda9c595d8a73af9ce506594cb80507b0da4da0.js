import { raw } from '../helper/html/index.ts';
let suspenseCounter = 0;
async function childrenToString(children) {
    try {
        return children.map((c)=>c.toString());
    } catch (e) {
        if (e instanceof Promise) {
            await e;
            return childrenToString(children);
        } else {
            throw e;
        }
    }
}
/**
 * @experimental
 * `Suspense` is an experimental feature.
 * The API might be changed.
 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Suspense = async ({ children , fallback  })=>{
    if (!children) {
        return fallback.toString();
    }
    if (!Array.isArray(children)) {
        children = [
            children
        ];
    }
    let resArray = [];
    try {
        resArray = children.map((c)=>c.toString());
    } catch (e) {
        if (e instanceof Promise) {
            resArray = [
                e.then(()=>childrenToString(children))
            ];
        } else {
            throw e;
        }
    }
    if (resArray.some((res)=>res instanceof Promise)) {
        const index = suspenseCounter++;
        return raw(`<template id="H:${index}"></template>${fallback.toString()}<!--/$-->`, [
            Promise.all(resArray).then((htmlArray)=>{
                htmlArray = htmlArray.flat();
                const html = `<template>${htmlArray.join('')}</template><script>
((d,c,n) => {
c=d.currentScript.previousSibling
d=d.getElementById('H:${index}')
do{n=d.nextSibling;n.remove()}while(n.nodeType!=8||n.nodeValue!='/$')
d.replaceWith(c.content)
})(document)
</script>`;
                if (htmlArray.every((html)=>!html.promises?.length)) {
                    return html;
                }
                return raw(html, htmlArray.map((html)=>html.promises || []).flat());
            })
        ]);
    } else {
        return raw(resArray.join(''));
    }
};
const textEncoder = new TextEncoder();
/**
 * @experimental
 * `renderToReadableStream()` is an experimental feature.
 * The API might be changed.
 */ export const renderToReadableStream = (str)=>{
    const reader = new ReadableStream({
        async start (controller) {
            const resolved = str instanceof Promise ? await str : await str.toString();
            controller.enqueue(textEncoder.encode(resolved));
            let resolvedCount = 0;
            const promises = [];
            const then = (promise)=>{
                promises.push(promise.catch((err)=>{
                    console.trace(err);
                    return '';
                }).then((res)=>{
                    if (res.promises) {
                        const resPromises = res.promises || [];
                        resPromises.forEach(then);
                    }
                    resolvedCount++;
                    controller.enqueue(textEncoder.encode(res));
                }));
            };
            resolved.promises?.map(then);
            while(resolvedCount !== promises.length){
                await Promise.all(promises);
            }
            controller.close();
        }
    });
    return reader;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL2pzeC9zdHJlYW1pbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmF3IH0gZnJvbSAnLi4vaGVscGVyL2h0bWwvaW5kZXgudHMnXG5pbXBvcnQgdHlwZSB7IEh0bWxFc2NhcGVkU3RyaW5nIH0gZnJvbSAnLi4vdXRpbHMvaHRtbC50cydcbmltcG9ydCB0eXBlIHsgRkMsIENoaWxkIH0gZnJvbSAnLi9pbmRleC50cydcblxubGV0IHN1c3BlbnNlQ291bnRlciA9IDBcblxuYXN5bmMgZnVuY3Rpb24gY2hpbGRyZW5Ub1N0cmluZyhjaGlsZHJlbjogQ2hpbGRbXSk6IFByb21pc2U8SHRtbEVzY2FwZWRTdHJpbmdbXT4ge1xuICB0cnkge1xuICAgIHJldHVybiBjaGlsZHJlbi5tYXAoKGMpID0+IGMudG9TdHJpbmcoKSkgYXMgSHRtbEVzY2FwZWRTdHJpbmdbXVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICBhd2FpdCBlXG4gICAgICByZXR1cm4gY2hpbGRyZW5Ub1N0cmluZyhjaGlsZHJlbilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBleHBlcmltZW50YWxcbiAqIGBTdXNwZW5zZWAgaXMgYW4gZXhwZXJpbWVudGFsIGZlYXR1cmUuXG4gKiBUaGUgQVBJIG1pZ2h0IGJlIGNoYW5nZWQuXG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG5leHBvcnQgY29uc3QgU3VzcGVuc2U6IEZDPHsgZmFsbGJhY2s6IGFueSB9PiA9IGFzeW5jICh7IGNoaWxkcmVuLCBmYWxsYmFjayB9KSA9PiB7XG4gIGlmICghY2hpbGRyZW4pIHtcbiAgICByZXR1cm4gZmFsbGJhY2sudG9TdHJpbmcoKVxuICB9XG4gIGlmICghQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICBjaGlsZHJlbiA9IFtjaGlsZHJlbl1cbiAgfVxuXG4gIGxldCByZXNBcnJheTogSHRtbEVzY2FwZWRTdHJpbmdbXSB8IFByb21pc2U8SHRtbEVzY2FwZWRTdHJpbmdbXT5bXSA9IFtdXG4gIHRyeSB7XG4gICAgcmVzQXJyYXkgPSBjaGlsZHJlbi5tYXAoKGMpID0+IGMudG9TdHJpbmcoKSkgYXMgSHRtbEVzY2FwZWRTdHJpbmdbXVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICByZXNBcnJheSA9IFtlLnRoZW4oKCkgPT4gY2hpbGRyZW5Ub1N0cmluZyhjaGlsZHJlbiBhcyBDaGlsZFtdKSldIGFzIFByb21pc2U8XG4gICAgICAgIEh0bWxFc2NhcGVkU3RyaW5nW11cbiAgICAgID5bXVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlXG4gICAgfVxuICB9XG5cbiAgaWYgKHJlc0FycmF5LnNvbWUoKHJlcykgPT4gKHJlcyBhcyB7fSkgaW5zdGFuY2VvZiBQcm9taXNlKSkge1xuICAgIGNvbnN0IGluZGV4ID0gc3VzcGVuc2VDb3VudGVyKytcbiAgICByZXR1cm4gcmF3KGA8dGVtcGxhdGUgaWQ9XCJIOiR7aW5kZXh9XCI+PC90ZW1wbGF0ZT4ke2ZhbGxiYWNrLnRvU3RyaW5nKCl9PCEtLS8kLS0+YCwgW1xuICAgICAgUHJvbWlzZS5hbGwocmVzQXJyYXkpLnRoZW4oKGh0bWxBcnJheSkgPT4ge1xuICAgICAgICBodG1sQXJyYXkgPSBodG1sQXJyYXkuZmxhdCgpXG4gICAgICAgIGNvbnN0IGh0bWwgPSBgPHRlbXBsYXRlPiR7aHRtbEFycmF5LmpvaW4oJycpfTwvdGVtcGxhdGU+PHNjcmlwdD5cbigoZCxjLG4pID0+IHtcbmM9ZC5jdXJyZW50U2NyaXB0LnByZXZpb3VzU2libGluZ1xuZD1kLmdldEVsZW1lbnRCeUlkKCdIOiR7aW5kZXh9JylcbmRve249ZC5uZXh0U2libGluZztuLnJlbW92ZSgpfXdoaWxlKG4ubm9kZVR5cGUhPTh8fG4ubm9kZVZhbHVlIT0nLyQnKVxuZC5yZXBsYWNlV2l0aChjLmNvbnRlbnQpXG59KShkb2N1bWVudClcbjwvc2NyaXB0PmBcbiAgICAgICAgaWYgKGh0bWxBcnJheS5ldmVyeSgoaHRtbCkgPT4gIShodG1sIGFzIEh0bWxFc2NhcGVkU3RyaW5nKS5wcm9taXNlcz8ubGVuZ3RoKSkge1xuICAgICAgICAgIHJldHVybiBodG1sXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmF3KGh0bWwsIGh0bWxBcnJheS5tYXAoKGh0bWwpID0+IChodG1sIGFzIEh0bWxFc2NhcGVkU3RyaW5nKS5wcm9taXNlcyB8fCBbXSkuZmxhdCgpKVxuICAgICAgfSksXG4gICAgXSlcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcmF3KHJlc0FycmF5LmpvaW4oJycpKVxuICB9XG59XG5cbmNvbnN0IHRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKClcbi8qKlxuICogQGV4cGVyaW1lbnRhbFxuICogYHJlbmRlclRvUmVhZGFibGVTdHJlYW0oKWAgaXMgYW4gZXhwZXJpbWVudGFsIGZlYXR1cmUuXG4gKiBUaGUgQVBJIG1pZ2h0IGJlIGNoYW5nZWQuXG4gKi9cbmV4cG9ydCBjb25zdCByZW5kZXJUb1JlYWRhYmxlU3RyZWFtID0gKFxuICBzdHI6IEh0bWxFc2NhcGVkU3RyaW5nIHwgUHJvbWlzZTxIdG1sRXNjYXBlZFN0cmluZz5cbik6IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+ID0+IHtcbiAgY29uc3QgcmVhZGVyID0gbmV3IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+KHtcbiAgICBhc3luYyBzdGFydChjb250cm9sbGVyKSB7XG4gICAgICBjb25zdCByZXNvbHZlZCA9IHN0ciBpbnN0YW5jZW9mIFByb21pc2UgPyBhd2FpdCBzdHIgOiBhd2FpdCBzdHIudG9TdHJpbmcoKVxuICAgICAgY29udHJvbGxlci5lbnF1ZXVlKHRleHRFbmNvZGVyLmVuY29kZShyZXNvbHZlZCkpXG5cbiAgICAgIGxldCByZXNvbHZlZENvdW50ID0gMFxuICAgICAgY29uc3QgcHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdXG4gICAgICBjb25zdCB0aGVuID0gKHByb21pc2U6IFByb21pc2U8c3RyaW5nPikgPT4ge1xuICAgICAgICBwcm9taXNlcy5wdXNoKFxuICAgICAgICAgIHByb21pc2VcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUudHJhY2UoZXJyKVxuICAgICAgICAgICAgICByZXR1cm4gJydcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgIGlmICgocmVzIGFzIEh0bWxFc2NhcGVkU3RyaW5nKS5wcm9taXNlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc1Byb21pc2VzID0gKHJlcyBhcyBIdG1sRXNjYXBlZFN0cmluZykucHJvbWlzZXMgfHwgW11cbiAgICAgICAgICAgICAgICByZXNQcm9taXNlcy5mb3JFYWNoKHRoZW4pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmVzb2x2ZWRDb3VudCsrXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZSh0ZXh0RW5jb2Rlci5lbmNvZGUocmVzKSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIDsocmVzb2x2ZWQgYXMgSHRtbEVzY2FwZWRTdHJpbmcpLnByb21pc2VzPy5tYXAodGhlbilcbiAgICAgIHdoaWxlIChyZXNvbHZlZENvdW50ICE9PSBwcm9taXNlcy5sZW5ndGgpIHtcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICB9XG5cbiAgICAgIGNvbnRyb2xsZXIuY2xvc2UoKVxuICAgIH0sXG4gIH0pXG4gIHJldHVybiByZWFkZXJcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLEdB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