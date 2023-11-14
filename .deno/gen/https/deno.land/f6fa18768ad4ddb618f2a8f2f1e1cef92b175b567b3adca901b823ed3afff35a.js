// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
// Based on https://github.com/golang/go/tree/master/src/net/textproto
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { concat } from "../bytes/mod.ts";
const decoder = new TextDecoder();
// FROM https://github.com/denoland/deno/blob/b34628a26ab0187a827aa4ebe256e23178e25d39/cli/js/web/headers.ts#L9
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/g;
function str(buf) {
    if (buf == null) {
        return "";
    } else {
        return decoder.decode(buf);
    }
}
function charCode(s) {
    return s.charCodeAt(0);
}
export class TextProtoReader {
    r;
    constructor(r){
        this.r = r;
    }
    /** readLine() reads a single line from the TextProtoReader,
   * eliding the final \n or \r\n from the returned string.
   */ async readLine() {
        const s = await this.readLineSlice();
        if (s === null) return null;
        return str(s);
    }
    /** ReadMIMEHeader reads a MIME-style header from r.
   * The header is a sequence of possibly continued Key: Value lines
   * ending in a blank line.
   * The returned map m maps CanonicalMIMEHeaderKey(key) to a
   * sequence of values in the same order encountered in the input.
   *
   * For example, consider this input:
   *
   *	My-Key: Value 1
   *	Long-Key: Even
   *	       Longer Value
   *	My-Key: Value 2
   *
   * Given that input, ReadMIMEHeader returns the map:
   *
   *	map[string][]string{
   *		"My-Key": {"Value 1", "Value 2"},
   *		"Long-Key": {"Even Longer Value"},
   *	}
   */ async readMIMEHeader() {
        const m = new Headers();
        let line;
        // The first line cannot start with a leading space.
        let buf = await this.r.peek(1);
        if (buf === null) {
            return null;
        } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            line = await this.readLineSlice();
        }
        buf = await this.r.peek(1);
        if (buf === null) {
            throw new Deno.errors.UnexpectedEof();
        } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            throw new Deno.errors.InvalidData(`malformed MIME header initial line: ${str(line)}`);
        }
        while(true){
            const kv = await this.readLineSlice(); // readContinuedLineSlice
            if (kv === null) throw new Deno.errors.UnexpectedEof();
            if (kv.byteLength === 0) return m;
            // Key ends at first colon
            let i = kv.indexOf(charCode(":"));
            if (i < 0) {
                throw new Deno.errors.InvalidData(`malformed MIME header line: ${str(kv)}`);
            }
            //let key = canonicalMIMEHeaderKey(kv.subarray(0, endKey));
            const key = str(kv.subarray(0, i));
            // As per RFC 7230 field-name is a token,
            // tokens consist of one or more chars.
            // We could throw `Deno.errors.InvalidData` here,
            // but better to be liberal in what we
            // accept, so if we get an empty key, skip it.
            if (key == "") {
                continue;
            }
            // Skip initial spaces in value.
            i++; // skip colon
            while(i < kv.byteLength && (kv[i] == charCode(" ") || kv[i] == charCode("\t"))){
                i++;
            }
            const value = str(kv.subarray(i)).replace(invalidHeaderCharRegex, encodeURI);
            // In case of invalid header we swallow the error
            // example: "Audio Mode" => invalid due to space in the key
            try {
                m.append(key, value);
            } catch  {
            // Pass
            }
        }
    }
    async readLineSlice() {
        // this.closeDot();
        let line;
        while(true){
            const r = await this.r.readLine();
            if (r === null) return null;
            const { line: l , more  } = r;
            // Avoid the copy if the first call produced a full line.
            if (!line && !more) {
                // TODO(ry):
                // This skipSpace() is definitely misplaced, but I don't know where it
                // comes from nor how to fix it.
                if (this.skipSpace(l) === 0) {
                    return new Uint8Array(0);
                }
                return l;
            }
            line = line ? concat(line, l) : l;
            if (!more) {
                break;
            }
        }
        return line;
    }
    skipSpace(l) {
        let n = 0;
        for(let i = 0; i < l.length; i++){
            if (l[i] === charCode(" ") || l[i] === charCode("\t")) {
                continue;
            }
            n++;
        }
        return n;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjkyLjAvdGV4dHByb3RvL21vZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL2dvbGFuZy9nby90cmVlL21hc3Rlci9zcmMvbmV0L3RleHRwcm90b1xuLy8gQ29weXJpZ2h0IDIwMDkgVGhlIEdvIEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZVxuLy8gbGljZW5zZSB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlLlxuXG5pbXBvcnQgdHlwZSB7IEJ1ZlJlYWRlciB9IGZyb20gXCIuLi9pby9idWZpby50c1wiO1xuaW1wb3J0IHsgY29uY2F0IH0gZnJvbSBcIi4uL2J5dGVzL21vZC50c1wiO1xuXG5jb25zdCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG5cbi8vIEZST00gaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm8vYmxvYi9iMzQ2MjhhMjZhYjAxODdhODI3YWE0ZWJlMjU2ZTIzMTc4ZTI1ZDM5L2NsaS9qcy93ZWIvaGVhZGVycy50cyNMOVxuY29uc3QgaW52YWxpZEhlYWRlckNoYXJSZWdleCA9IC9bXlxcdFxceDIwLVxceDdlXFx4ODAtXFx4ZmZdL2c7XG5cbmZ1bmN0aW9uIHN0cihidWY6IFVpbnQ4QXJyYXkgfCBudWxsIHwgdW5kZWZpbmVkKTogc3RyaW5nIHtcbiAgaWYgKGJ1ZiA9PSBudWxsKSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGRlY29kZXIuZGVjb2RlKGJ1Zik7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hhckNvZGUoczogc3RyaW5nKTogbnVtYmVyIHtcbiAgcmV0dXJuIHMuY2hhckNvZGVBdCgwKTtcbn1cblxuZXhwb3J0IGNsYXNzIFRleHRQcm90b1JlYWRlciB7XG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHI6IEJ1ZlJlYWRlcikge31cblxuICAvKiogcmVhZExpbmUoKSByZWFkcyBhIHNpbmdsZSBsaW5lIGZyb20gdGhlIFRleHRQcm90b1JlYWRlcixcbiAgICogZWxpZGluZyB0aGUgZmluYWwgXFxuIG9yIFxcclxcbiBmcm9tIHRoZSByZXR1cm5lZCBzdHJpbmcuXG4gICAqL1xuICBhc3luYyByZWFkTGluZSgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICBjb25zdCBzID0gYXdhaXQgdGhpcy5yZWFkTGluZVNsaWNlKCk7XG4gICAgaWYgKHMgPT09IG51bGwpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBzdHIocyk7XG4gIH1cblxuICAvKiogUmVhZE1JTUVIZWFkZXIgcmVhZHMgYSBNSU1FLXN0eWxlIGhlYWRlciBmcm9tIHIuXG4gICAqIFRoZSBoZWFkZXIgaXMgYSBzZXF1ZW5jZSBvZiBwb3NzaWJseSBjb250aW51ZWQgS2V5OiBWYWx1ZSBsaW5lc1xuICAgKiBlbmRpbmcgaW4gYSBibGFuayBsaW5lLlxuICAgKiBUaGUgcmV0dXJuZWQgbWFwIG0gbWFwcyBDYW5vbmljYWxNSU1FSGVhZGVyS2V5KGtleSkgdG8gYVxuICAgKiBzZXF1ZW5jZSBvZiB2YWx1ZXMgaW4gdGhlIHNhbWUgb3JkZXIgZW5jb3VudGVyZWQgaW4gdGhlIGlucHV0LlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgY29uc2lkZXIgdGhpcyBpbnB1dDpcbiAgICpcbiAgICpcdE15LUtleTogVmFsdWUgMVxuICAgKlx0TG9uZy1LZXk6IEV2ZW5cbiAgICpcdCAgICAgICBMb25nZXIgVmFsdWVcbiAgICpcdE15LUtleTogVmFsdWUgMlxuICAgKlxuICAgKiBHaXZlbiB0aGF0IGlucHV0LCBSZWFkTUlNRUhlYWRlciByZXR1cm5zIHRoZSBtYXA6XG4gICAqXG4gICAqXHRtYXBbc3RyaW5nXVtdc3RyaW5ne1xuICAgKlx0XHRcIk15LUtleVwiOiB7XCJWYWx1ZSAxXCIsIFwiVmFsdWUgMlwifSxcbiAgICpcdFx0XCJMb25nLUtleVwiOiB7XCJFdmVuIExvbmdlciBWYWx1ZVwifSxcbiAgICpcdH1cbiAgICovXG4gIGFzeW5jIHJlYWRNSU1FSGVhZGVyKCk6IFByb21pc2U8SGVhZGVycyB8IG51bGw+IHtcbiAgICBjb25zdCBtID0gbmV3IEhlYWRlcnMoKTtcbiAgICBsZXQgbGluZTogVWludDhBcnJheSB8IHVuZGVmaW5lZDtcblxuICAgIC8vIFRoZSBmaXJzdCBsaW5lIGNhbm5vdCBzdGFydCB3aXRoIGEgbGVhZGluZyBzcGFjZS5cbiAgICBsZXQgYnVmID0gYXdhaXQgdGhpcy5yLnBlZWsoMSk7XG4gICAgaWYgKGJ1ZiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChidWZbMF0gPT0gY2hhckNvZGUoXCIgXCIpIHx8IGJ1ZlswXSA9PSBjaGFyQ29kZShcIlxcdFwiKSkge1xuICAgICAgbGluZSA9IChhd2FpdCB0aGlzLnJlYWRMaW5lU2xpY2UoKSkgYXMgVWludDhBcnJheTtcbiAgICB9XG5cbiAgICBidWYgPSBhd2FpdCB0aGlzLnIucGVlaygxKTtcbiAgICBpZiAoYnVmID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRGVuby5lcnJvcnMuVW5leHBlY3RlZEVvZigpO1xuICAgIH0gZWxzZSBpZiAoYnVmWzBdID09IGNoYXJDb2RlKFwiIFwiKSB8fCBidWZbMF0gPT0gY2hhckNvZGUoXCJcXHRcIikpIHtcbiAgICAgIHRocm93IG5ldyBEZW5vLmVycm9ycy5JbnZhbGlkRGF0YShcbiAgICAgICAgYG1hbGZvcm1lZCBNSU1FIGhlYWRlciBpbml0aWFsIGxpbmU6ICR7c3RyKGxpbmUpfWAsXG4gICAgICApO1xuICAgIH1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb25zdCBrdiA9IGF3YWl0IHRoaXMucmVhZExpbmVTbGljZSgpOyAvLyByZWFkQ29udGludWVkTGluZVNsaWNlXG4gICAgICBpZiAoa3YgPT09IG51bGwpIHRocm93IG5ldyBEZW5vLmVycm9ycy5VbmV4cGVjdGVkRW9mKCk7XG4gICAgICBpZiAoa3YuYnl0ZUxlbmd0aCA9PT0gMCkgcmV0dXJuIG07XG5cbiAgICAgIC8vIEtleSBlbmRzIGF0IGZpcnN0IGNvbG9uXG4gICAgICBsZXQgaSA9IGt2LmluZGV4T2YoY2hhckNvZGUoXCI6XCIpKTtcbiAgICAgIGlmIChpIDwgMCkge1xuICAgICAgICB0aHJvdyBuZXcgRGVuby5lcnJvcnMuSW52YWxpZERhdGEoXG4gICAgICAgICAgYG1hbGZvcm1lZCBNSU1FIGhlYWRlciBsaW5lOiAke3N0cihrdil9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy9sZXQga2V5ID0gY2Fub25pY2FsTUlNRUhlYWRlcktleShrdi5zdWJhcnJheSgwLCBlbmRLZXkpKTtcbiAgICAgIGNvbnN0IGtleSA9IHN0cihrdi5zdWJhcnJheSgwLCBpKSk7XG5cbiAgICAgIC8vIEFzIHBlciBSRkMgNzIzMCBmaWVsZC1uYW1lIGlzIGEgdG9rZW4sXG4gICAgICAvLyB0b2tlbnMgY29uc2lzdCBvZiBvbmUgb3IgbW9yZSBjaGFycy5cbiAgICAgIC8vIFdlIGNvdWxkIHRocm93IGBEZW5vLmVycm9ycy5JbnZhbGlkRGF0YWAgaGVyZSxcbiAgICAgIC8vIGJ1dCBiZXR0ZXIgdG8gYmUgbGliZXJhbCBpbiB3aGF0IHdlXG4gICAgICAvLyBhY2NlcHQsIHNvIGlmIHdlIGdldCBhbiBlbXB0eSBrZXksIHNraXAgaXQuXG4gICAgICBpZiAoa2V5ID09IFwiXCIpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFNraXAgaW5pdGlhbCBzcGFjZXMgaW4gdmFsdWUuXG4gICAgICBpKys7IC8vIHNraXAgY29sb25cbiAgICAgIHdoaWxlIChcbiAgICAgICAgaSA8IGt2LmJ5dGVMZW5ndGggJiZcbiAgICAgICAgKGt2W2ldID09IGNoYXJDb2RlKFwiIFwiKSB8fCBrdltpXSA9PSBjaGFyQ29kZShcIlxcdFwiKSlcbiAgICAgICkge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgICBjb25zdCB2YWx1ZSA9IHN0cihrdi5zdWJhcnJheShpKSkucmVwbGFjZShcbiAgICAgICAgaW52YWxpZEhlYWRlckNoYXJSZWdleCxcbiAgICAgICAgZW5jb2RlVVJJLFxuICAgICAgKTtcblxuICAgICAgLy8gSW4gY2FzZSBvZiBpbnZhbGlkIGhlYWRlciB3ZSBzd2FsbG93IHRoZSBlcnJvclxuICAgICAgLy8gZXhhbXBsZTogXCJBdWRpbyBNb2RlXCIgPT4gaW52YWxpZCBkdWUgdG8gc3BhY2UgaW4gdGhlIGtleVxuICAgICAgdHJ5IHtcbiAgICAgICAgbS5hcHBlbmQoa2V5LCB2YWx1ZSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gUGFzc1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlYWRMaW5lU2xpY2UoKTogUHJvbWlzZTxVaW50OEFycmF5IHwgbnVsbD4ge1xuICAgIC8vIHRoaXMuY2xvc2VEb3QoKTtcbiAgICBsZXQgbGluZTogVWludDhBcnJheSB8IHVuZGVmaW5lZDtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3QgciA9IGF3YWl0IHRoaXMuci5yZWFkTGluZSgpO1xuICAgICAgaWYgKHIgPT09IG51bGwpIHJldHVybiBudWxsO1xuICAgICAgY29uc3QgeyBsaW5lOiBsLCBtb3JlIH0gPSByO1xuXG4gICAgICAvLyBBdm9pZCB0aGUgY29weSBpZiB0aGUgZmlyc3QgY2FsbCBwcm9kdWNlZCBhIGZ1bGwgbGluZS5cbiAgICAgIGlmICghbGluZSAmJiAhbW9yZSkge1xuICAgICAgICAvLyBUT0RPKHJ5KTpcbiAgICAgICAgLy8gVGhpcyBza2lwU3BhY2UoKSBpcyBkZWZpbml0ZWx5IG1pc3BsYWNlZCwgYnV0IEkgZG9uJ3Qga25vdyB3aGVyZSBpdFxuICAgICAgICAvLyBjb21lcyBmcm9tIG5vciBob3cgdG8gZml4IGl0LlxuICAgICAgICBpZiAodGhpcy5za2lwU3BhY2UobCkgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGw7XG4gICAgICB9XG4gICAgICBsaW5lID0gbGluZSA/IGNvbmNhdChsaW5lLCBsKSA6IGw7XG4gICAgICBpZiAoIW1vcmUpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lO1xuICB9XG5cbiAgc2tpcFNwYWNlKGw6IFVpbnQ4QXJyYXkpOiBudW1iZXIge1xuICAgIGxldCBuID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGwubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsW2ldID09PSBjaGFyQ29kZShcIiBcIikgfHwgbFtpXSA9PT0gY2hhckNvZGUoXCJcXHRcIikpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBuKys7XG4gICAgfVxuICAgIHJldHVybiBuO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHNFQUFzRTtBQUN0RSxzREFBc0Q7QUFDdEQscURBQXFEO0FBQ3JELGlEQUFpRDtBQUdqRCxTQUFTLE1BQU0sUUFBUSxrQkFBa0I7QUFFekMsTUFBTSxVQUFVLElBQUk7QUFFcEIsK0dBQStHO0FBQy9HLE1BQU0seUJBQXlCO0FBRS9CLFNBQVMsSUFBSSxHQUFrQyxFQUFVO0lBQ3ZELElBQUksT0FBTyxJQUFJLEVBQUU7UUFDZixPQUFPO0lBQ1QsT0FBTztRQUNMLE9BQU8sUUFBUSxNQUFNLENBQUM7SUFDeEIsQ0FBQztBQUNIO0FBRUEsU0FBUyxTQUFTLENBQVMsRUFBVTtJQUNuQyxPQUFPLEVBQUUsVUFBVSxDQUFDO0FBQ3RCO0FBRUEsT0FBTyxNQUFNO0lBQ1U7SUFBckIsWUFBcUIsRUFBYztpQkFBZDtJ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