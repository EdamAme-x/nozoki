import { parseBody } from './utils/body.ts';
import { parse } from './utils/cookie.ts';
import { getQueryParam, getQueryParams, decodeURIComponent_ } from './utils/url.ts';
export class HonoRequest {
    raw;
    paramData;
    vData;
    path;
    constructor(request, path = '/', paramData){
        this.raw = request;
        this.path = path;
        this.paramData = paramData;
        this.vData = {};
    }
    param(key) {
        if (this.paramData) {
            if (key) {
                const param = this.paramData[key];
                return param ? /\%/.test(param) ? decodeURIComponent_(param) : param : undefined;
            } else {
                const decoded = {};
                for (const [key, value] of Object.entries(this.paramData)){
                    if (value && typeof value === 'string') {
                        decoded[key] = /\%/.test(value) ? decodeURIComponent_(value) : value;
                    }
                }
                return decoded;
            }
        }
        return null;
    }
    query(key) {
        return getQueryParam(this.url, key);
    }
    queries(key) {
        return getQueryParams(this.url, key);
    }
    header(name) {
        if (name) return this.raw.headers.get(name.toLowerCase()) ?? undefined;
        const headerData = {};
        this.raw.headers.forEach((value, key)=>{
            headerData[key] = value;
        });
        return headerData;
    }
    cookie(key) {
        const cookie = this.raw.headers.get('Cookie');
        if (!cookie) return;
        const obj = parse(cookie);
        if (key) {
            const value = obj[key];
            return value;
        } else {
            return obj;
        }
    }
    async parseBody() {
        return await parseBody(this.raw);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json() {
        return this.raw.json();
    }
    text() {
        return this.raw.text();
    }
    arrayBuffer() {
        return this.raw.arrayBuffer();
    }
    blob() {
        return this.raw.blob();
    }
    formData() {
        return this.raw.formData();
    }
    addValidatedData(target, data) {
        this.vData[target] = data;
    }
    valid(target) {
        if (target) {
            return this.vData[target];
        }
    }
    get url() {
        return this.raw.url;
    }
    get method() {
        return this.raw.method;
    }
    get headers() {
        return this.raw.headers;
    }
    get body() {
        return this.raw.body;
    }
    get bodyUsed() {
        return this.raw.bodyUsed;
    }
    get integrity() {
        return this.raw.integrity;
    }
    get keepalive() {
        return this.raw.keepalive;
    }
    get referrer() {
        return this.raw.referrer;
    }
    get signal() {
        return this.raw.signal;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvcmVxdWVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7XG4gIElucHV0LFxuICBJbnB1dFRvRGF0YUJ5VGFyZ2V0LFxuICBQYXJhbUtleXMsXG4gIFBhcmFtS2V5VG9SZWNvcmQsXG4gIFJlbW92ZVF1ZXN0aW9uLFxuICBVbmRlZmluZWRJZkhhdmluZ1F1ZXN0aW9uLFxuICBWYWxpZGF0aW9uVGFyZ2V0cyxcbn0gZnJvbSAnLi90eXBlcy50cydcbmltcG9ydCB7IHBhcnNlQm9keSB9IGZyb20gJy4vdXRpbHMvYm9keS50cydcbmltcG9ydCB0eXBlIHsgQm9keURhdGEgfSBmcm9tICcuL3V0aWxzL2JvZHkudHMnXG5pbXBvcnQgdHlwZSB7IENvb2tpZSB9IGZyb20gJy4vdXRpbHMvY29va2llLnRzJ1xuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICcuL3V0aWxzL2Nvb2tpZS50cydcbmltcG9ydCB0eXBlIHsgVW5pb25Ub0ludGVyc2VjdGlvbiB9IGZyb20gJy4vdXRpbHMvdHlwZXMudHMnXG5pbXBvcnQgeyBnZXRRdWVyeVBhcmFtLCBnZXRRdWVyeVBhcmFtcywgZGVjb2RlVVJJQ29tcG9uZW50XyB9IGZyb20gJy4vdXRpbHMvdXJsLnRzJ1xuXG5leHBvcnQgY2xhc3MgSG9ub1JlcXVlc3Q8UCBleHRlbmRzIHN0cmluZyA9ICcvJywgSSBleHRlbmRzIElucHV0WydvdXQnXSA9IHt9PiB7XG4gIHJhdzogUmVxdWVzdFxuXG4gIHByaXZhdGUgcGFyYW1EYXRhOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHwgdW5kZWZpbmVkXG4gIHByaXZhdGUgdkRhdGE6IHsgW0sgaW4ga2V5b2YgVmFsaWRhdGlvblRhcmdldHNdPzoge30gfSAvLyBTaG9ydCBuYW1lIG9mIHZhbGlkYXRlZERhdGFcbiAgcGF0aDogc3RyaW5nXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVxdWVzdDogUmVxdWVzdCxcbiAgICBwYXRoOiBzdHJpbmcgPSAnLycsXG4gICAgcGFyYW1EYXRhPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IHVuZGVmaW5lZFxuICApIHtcbiAgICB0aGlzLnJhdyA9IHJlcXVlc3RcbiAgICB0aGlzLnBhdGggPSBwYXRoXG4gICAgdGhpcy5wYXJhbURhdGEgPSBwYXJhbURhdGFcbiAgICB0aGlzLnZEYXRhID0ge31cbiAgfVxuXG4gIHBhcmFtKGtleTogUmVtb3ZlUXVlc3Rpb248UGFyYW1LZXlzPFA+Pik6IFVuZGVmaW5lZElmSGF2aW5nUXVlc3Rpb248UGFyYW1LZXlzPFA+PlxuICBwYXJhbSgpOiBVbmlvblRvSW50ZXJzZWN0aW9uPFBhcmFtS2V5VG9SZWNvcmQ8UGFyYW1LZXlzPFA+Pj5cbiAgcGFyYW0oa2V5Pzogc3RyaW5nKTogdW5rbm93biB7XG4gICAgaWYgKHRoaXMucGFyYW1EYXRhKSB7XG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIGNvbnN0IHBhcmFtID0gdGhpcy5wYXJhbURhdGFba2V5XVxuICAgICAgICByZXR1cm4gcGFyYW0gPyAoL1xcJS8udGVzdChwYXJhbSkgPyBkZWNvZGVVUklDb21wb25lbnRfKHBhcmFtKSA6IHBhcmFtKSA6IHVuZGVmaW5lZFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZGVjb2RlZDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9XG5cbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModGhpcy5wYXJhbURhdGEpKSB7XG4gICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGRlY29kZWRba2V5XSA9IC9cXCUvLnRlc3QodmFsdWUpID8gZGVjb2RlVVJJQ29tcG9uZW50Xyh2YWx1ZSkgOiB2YWx1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkZWNvZGVkXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBxdWVyeShrZXk6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBxdWVyeSgpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG4gIHF1ZXJ5KGtleT86IHN0cmluZykge1xuICAgIHJldHVybiBnZXRRdWVyeVBhcmFtKHRoaXMudXJsLCBrZXkpXG4gIH1cblxuICBxdWVyaWVzKGtleTogc3RyaW5nKTogc3RyaW5nW10gfCB1bmRlZmluZWRcbiAgcXVlcmllcygpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT5cbiAgcXVlcmllcyhrZXk/OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZ2V0UXVlcnlQYXJhbXModGhpcy51cmwsIGtleSlcbiAgfVxuXG4gIGhlYWRlcihuYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgaGVhZGVyKCk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgaGVhZGVyKG5hbWU/OiBzdHJpbmcpIHtcbiAgICBpZiAobmFtZSkgcmV0dXJuIHRoaXMucmF3LmhlYWRlcnMuZ2V0KG5hbWUudG9Mb3dlckNhc2UoKSkgPz8gdW5kZWZpbmVkXG5cbiAgICBjb25zdCBoZWFkZXJEYXRhOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+ID0ge31cbiAgICB0aGlzLnJhdy5oZWFkZXJzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGhlYWRlckRhdGFba2V5XSA9IHZhbHVlXG4gICAgfSlcbiAgICByZXR1cm4gaGVhZGVyRGF0YVxuICB9XG5cbiAgLyoqIEBkZXByZWNhdGVkXG4gICAqIFVzZSBDb29raWUgTWlkZGxld2FyZSBpbnN0ZWFkIG9mIGBjLnJlcS5jb29raWUoKWAuIFRoZSBgYy5yZXEuY29va2llKClgIHdpbGwgYmUgcmVtb3ZlZCBpbiB2NC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnaG9uby9jb29raWUnXG4gICAqIC8vIC4uLlxuICAgKiBhcHAuZ2V0KCcvJywgKGMpID0+IGMudGV4dChnZXRDb29raWUoYywgJ2Nvb2tpZS1uYW1lJykpKVxuICAgKi9cbiAgY29va2llKGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkXG5cbiAgLyoqIEBkZXByZWNhdGVkXG4gICAqIFVzZSBDb29raWUgTWlkZGxld2FyZSBpbnN0ZWFkIG9mIGBjLnJlcS5jb29raWUoKWAuIFRoZSBgYy5yZXEuY29va2llKClgIHdpbGwgYmUgcmVtb3ZlZCBpbiB2NC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnaG9uby9jb29raWUnXG4gICAqIC8vIC4uLlxuICAgKiBhcHAuZ2V0KCcvJywgKGMpID0+IGMuanNvbihnZXRDb29raWUoYykpKVxuICAgKi9cbiAgY29va2llKCk6IENvb2tpZVxuXG4gIGNvb2tpZShrZXk/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb29raWUgPSB0aGlzLnJhdy5oZWFkZXJzLmdldCgnQ29va2llJylcbiAgICBpZiAoIWNvb2tpZSkgcmV0dXJuXG4gICAgY29uc3Qgb2JqID0gcGFyc2UoY29va2llKVxuICAgIGlmIChrZXkpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV1cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2JqXG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcGFyc2VCb2R5KCk6IFByb21pc2U8Qm9keURhdGE+IHtcbiAgICByZXR1cm4gYXdhaXQgcGFyc2VCb2R5KHRoaXMucmF3KVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAganNvbjxUID0gYW55PigpOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5yYXcuanNvbigpXG4gIH1cblxuICB0ZXh0KCkge1xuICAgIHJldHVybiB0aGlzLnJhdy50ZXh0KClcbiAgfVxuXG4gIGFycmF5QnVmZmVyKCkge1xuICAgIHJldHVybiB0aGlzLnJhdy5hcnJheUJ1ZmZlcigpXG4gIH1cblxuICBibG9iKCkge1xuICAgIHJldHVybiB0aGlzLnJhdy5ibG9iKClcbiAgfVxuXG4gIGZvcm1EYXRhKCkge1xuICAgIHJldHVybiB0aGlzLnJhdy5mb3JtRGF0YSgpXG4gIH1cblxuICBhZGRWYWxpZGF0ZWREYXRhKHRhcmdldDoga2V5b2YgVmFsaWRhdGlvblRhcmdldHMsIGRhdGE6IHt9KSB7XG4gICAgdGhpcy52RGF0YVt0YXJnZXRdID0gZGF0YVxuICB9XG5cbiAgdmFsaWQ8XG4gICAgVCBleHRlbmRzIGtleW9mIFZhbGlkYXRpb25UYXJnZXRzID0gSSBleHRlbmRzIFJlY29yZDxpbmZlciBSLCB1bmtub3duPlxuICAgICAgPyBSIGV4dGVuZHMga2V5b2YgVmFsaWRhdGlvblRhcmdldHNcbiAgICAgICAgPyBSXG4gICAgICAgIDogbmV2ZXJcbiAgICAgIDogbmV2ZXJcbiAgPih0YXJnZXQ6IFQpOiBJbnB1dFRvRGF0YUJ5VGFyZ2V0PEksIFQ+XG4gIHZhbGlkKCk6IG5ldmVyXG4gIHZhbGlkKHRhcmdldD86IGtleW9mIFZhbGlkYXRpb25UYXJnZXRzKSB7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgcmV0dXJuIHRoaXMudkRhdGFbdGFyZ2V0XSBhcyB1bmtub3duXG4gICAgfVxuICB9XG5cbiAgZ2V0IHVybCgpIHtcbiAgICByZXR1cm4gdGhpcy5yYXcudXJsXG4gIH1cbiAgZ2V0IG1ldGhvZCgpIHtcbiAgICByZXR1cm4gdGhpcy5yYXcubWV0aG9kXG4gIH1cbiAgZ2V0IGhlYWRlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMucmF3LmhlYWRlcnNcbiAgfVxuICBnZXQgYm9keSgpIHtcbiAgICByZXR1cm4gdGhpcy5yYXcuYm9keVxuICB9XG4gIGdldCBib2R5VXNlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5yYXcuYm9keVVzZWRcbiAgfVxuICBnZXQgaW50ZWdyaXR5KCkge1xuICAgIHJldHVybiB0aGlzLnJhdy5pbnRlZ3JpdHlcbiAgfVxuICBnZXQga2VlcGFsaXZlKCkge1xuICAgIHJldHVybiB0aGlzLnJhdy5rZWVwYWxpdmVcbiAgfVxuICBnZXQgcmVmZXJyZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMucmF3LnJlZmVycmVyXG4gIH1cbiAgZ2V0IHNpZ25hbCgpIHtcbiAgICByZXR1cm4gdGhpcy5yYXcuc2lnbmFsXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxTQUFTLFNBQVMsUUFBUSxrQkFBaUI7QUFHM0MsU0FBUyxLQUFLLFFBQVEsb0JBQW1CO0FBRXpDLFNBQVMsYUFBYSxFQUFFLGNBQWMsRUFBRSxtQkFBbUIsUUFBUSxpQkFBZ0I7QUFFbkYsT0FBTyxNQUFNO0lBQ1gsSUFBWTtJQUVKLFVBQTZDO0lBQzdDLE1BQThDO0lBQ3RELEtBQVk7SUFFWixZQUNFLE9BQWdCLEVBQ2hCLE9BQWUsR0FBRyxFQUNsQixTQUE4QyxDQUM5QztRQUNBLElBQUksQ0FBQyxHQUFHLEdBQUc7UUFDWCxJQUFJLENBQUMsSUFBSSxHQUFHO1FBQ1osSUFBSSxDQUFDLFNBQVMsR0FBRztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUM7SUFDaEI7SUFJQSxNQUFNLEdBQVksRUFBVztRQUMzQixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEIsSUFBSSxLQUFLO2dCQUNQLE1BQU0sUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUk7Z0JBQ2pDLE9BQU8sUUFBUyxLQUFLLElBQUksQ0FBQyxTQUFTLG9CQUFvQixTQUFTLEtBQUssR0FBSSxTQUFTO1lBQ3BGLE9BQU87Z0JBQ0wsTUFBTSxVQUFrQyxDQUFDO2dCQUV6QyxLQUFLLE1BQU0sQ0FBQyxLQUFLLE1BQU0sSUFBSSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFHO29CQUN6RCxJQUFJLFNBQVMsT0FBTyxVQUFVLFVBQVU7d0JBQ3RDLE9BQU8sQ0FBQyxJQUFJLEdBQUcs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