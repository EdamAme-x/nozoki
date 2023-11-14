// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { osType } from "../_util/os.ts";
import { join, normalize } from "./mod.ts";
import { SEP, SEP_PATTERN } from "./separator.ts";
// deno-fmt-ignore
const regExpEscapeChars = [
    "!",
    "$",
    "(",
    ")",
    "*",
    "+",
    ".",
    "=",
    "?",
    "[",
    "\\",
    "^",
    "{",
    "|"
];
const rangeEscapeChars = [
    "-",
    "\\",
    "]"
];
/** Convert a glob string to a regular expression.
 *
 * Tries to match bash glob expansion as closely as possible.
 *
 * Basic glob syntax:
 * - `*` - Matches everything without leaving the path segment.
 * - `{foo,bar}` - Matches `foo` or `bar`.
 * - `[abcd]` - Matches `a`, `b`, `c` or `d`.
 * - `[a-d]` - Matches `a`, `b`, `c` or `d`.
 * - `[!abcd]` - Matches any single character besides `a`, `b`, `c` or `d`.
 * - `[[:<class>:]]` - Matches any character belonging to `<class>`.
 *     - `[[:alnum:]]` - Matches any digit or letter.
 *     - `[[:digit:]abc]` - Matches any digit, `a`, `b` or `c`.
 *     - See https://facelessuser.github.io/wcmatch/glob/#posix-character-classes
 *       for a complete list of supported character classes.
 * - `\` - Escapes the next character for an `os` other than `"windows"`.
 * - \` - Escapes the next character for `os` set to `"windows"`.
 * - `/` - Path separator.
 * - `\` - Additional path separator only for `os` set to `"windows"`.
 *
 * Extended syntax:
 * - Requires `{ extended: true }`.
 * - `?(foo|bar)` - Matches 0 or 1 instance of `{foo,bar}`.
 * - `@(foo|bar)` - Matches 1 instance of `{foo,bar}`. They behave the same.
 * - `*(foo|bar)` - Matches _n_ instances of `{foo,bar}`.
 * - `+(foo|bar)` - Matches _n > 0_ instances of `{foo,bar}`.
 * - `!(foo|bar)` - Matches anything other than `{foo,bar}`.
 * - See https://www.linuxjournal.com/content/bash-extended-globbing.
 *
 * Globstar syntax:
 * - Requires `{ globstar: true }`.
 * - `**` - Matches any number of any path segments.
 *     - Must comprise its entire path segment in the provided glob.
 * - See https://www.linuxjournal.com/content/globstar-new-bash-globbing-option.
 *
 * Note the following properties:
 * - The generated `RegExp` is anchored at both start and end.
 * - Repeating and trailing separators are tolerated. Trailing separators in the
 *   provided glob have no meaning and are discarded.
 * - Absolute globs will only match absolute paths, etc.
 * - Empty globs will match nothing.
 * - Any special glob syntax must be contained to one path segment. For example,
 *   `?(foo|bar/baz)` is invalid. The separator will take precendence and the
 *   first segment ends with an unclosed group.
 * - If a path segment ends with unclosed groups or a dangling escape prefix, a
 *   parse error has occured. Every character for that segment is taken
 *   literally in this event.
 *
 * Limitations:
 * - A negative group like `!(foo|bar)` will wrongly be converted to a negative
 *   look-ahead followed by a wildcard. This means that `!(foo).js` will wrongly
 *   fail to match `foobar.js`, even though `foobar` is not `foo`. Effectively,
 *   `!(foo|bar)` is treated like `!(@(foo|bar)*)`. This will work correctly if
 *   the group occurs not nested at the end of the segment. */ export function globToRegExp(glob, { extended =true , globstar: globstarOption = true , os =osType  } = {}) {
    if (glob == "") {
        return /(?!)/;
    }
    const sep = os == "windows" ? "(?:\\\\|/)+" : "/+";
    const sepMaybe = os == "windows" ? "(?:\\\\|/)*" : "/*";
    const seps = os == "windows" ? [
        "\\",
        "/"
    ] : [
        "/"
    ];
    const globstar = os == "windows" ? "(?:[^\\\\/]*(?:\\\\|/|$)+)*" : "(?:[^/]*(?:/|$)+)*";
    const wildcard = os == "windows" ? "[^\\\\/]*" : "[^/]*";
    const escapePrefix = os == "windows" ? "`" : "\\";
    // Remove trailing separators.
    let newLength = glob.length;
    for(; newLength > 1 && seps.includes(glob[newLength - 1]); newLength--);
    glob = glob.slice(0, newLength);
    let regExpString = "";
    // Terminates correctly. Trust that `j` is incremented every iteration.
    for(let j = 0; j < glob.length;){
        let segment = "";
        const groupStack = [];
        let inRange = false;
        let inEscape = false;
        let endsWithSep = false;
        let i = j;
        // Terminates with `i` at the non-inclusive end of the current segment.
        for(; i < glob.length && !seps.includes(glob[i]); i++){
            if (inEscape) {
                inEscape = false;
                const escapeChars = inRange ? rangeEscapeChars : regExpEscapeChars;
                segment += escapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
                continue;
            }
            if (glob[i] == escapePrefix) {
                inEscape = true;
                continue;
            }
            if (glob[i] == "[") {
                if (!inRange) {
                    inRange = true;
                    segment += "[";
                    if (glob[i + 1] == "!") {
                        i++;
                        segment += "^";
                    } else if (glob[i + 1] == "^") {
                        i++;
                        segment += "\\^";
                    }
                    continue;
                } else if (glob[i + 1] == ":") {
                    let k = i + 1;
                    let value = "";
                    while(glob[k + 1] != null && glob[k + 1] != ":"){
                        value += glob[k + 1];
                        k++;
                    }
                    if (glob[k + 1] == ":" && glob[k + 2] == "]") {
                        i = k + 2;
                        if (value == "alnum") segment += "\\dA-Za-z";
                        else if (value == "alpha") segment += "A-Za-z";
                        else if (value == "ascii") segment += "\x00-\x7F";
                        else if (value == "blank") segment += "\t ";
                        else if (value == "cntrl") segment += "\x00-\x1F\x7F";
                        else if (value == "digit") segment += "\\d";
                        else if (value == "graph") segment += "\x21-\x7E";
                        else if (value == "lower") segment += "a-z";
                        else if (value == "print") segment += "\x20-\x7E";
                        else if (value == "punct") {
                            segment += "!\"#$%&'()*+,\\-./:;<=>?@[\\\\\\]^_‘{|}~";
                        } else if (value == "space") segment += "\\s\v";
                        else if (value == "upper") segment += "A-Z";
                        else if (value == "word") segment += "\\w";
                        else if (value == "xdigit") segment += "\\dA-Fa-f";
                        continue;
                    }
                }
            }
            if (glob[i] == "]" && inRange) {
                inRange = false;
                segment += "]";
                continue;
            }
            if (inRange) {
                if (glob[i] == "\\") {
                    segment += `\\\\`;
                } else {
                    segment += glob[i];
                }
                continue;
            }
            if (glob[i] == ")" && groupStack.length > 0 && groupStack[groupStack.length - 1] != "BRACE") {
                segment += ")";
                const type = groupStack.pop();
                if (type == "!") {
                    segment += wildcard;
                } else if (type != "@") {
                    segment += type;
                }
                continue;
            }
            if (glob[i] == "|" && groupStack.length > 0 && groupStack[groupStack.length - 1] != "BRACE") {
                segment += "|";
                continue;
            }
            if (glob[i] == "+" && extended && glob[i + 1] == "(") {
                i++;
                groupStack.push("+");
                segment += "(?:";
                continue;
            }
            if (glob[i] == "@" && extended && glob[i + 1] == "(") {
                i++;
                groupStack.push("@");
                segment += "(?:";
                continue;
            }
            if (glob[i] == "?") {
                if (extended && glob[i + 1] == "(") {
                    i++;
                    groupStack.push("?");
                    segment += "(?:";
                } else {
                    segment += ".";
                }
                continue;
            }
            if (glob[i] == "!" && extended && glob[i + 1] == "(") {
                i++;
                groupStack.push("!");
                segment += "(?!";
                continue;
            }
            if (glob[i] == "{") {
                groupStack.push("BRACE");
                segment += "(?:";
                continue;
            }
            if (glob[i] == "}" && groupStack[groupStack.length - 1] == "BRACE") {
                groupStack.pop();
                segment += ")";
                continue;
            }
            if (glob[i] == "," && groupStack[groupStack.length - 1] == "BRACE") {
                segment += "|";
                continue;
            }
            if (glob[i] == "*") {
                if (extended && glob[i + 1] == "(") {
                    i++;
                    groupStack.push("*");
                    segment += "(?:";
                } else {
                    const prevChar = glob[i - 1];
                    let numStars = 1;
                    while(glob[i + 1] == "*"){
                        i++;
                        numStars++;
                    }
                    const nextChar = glob[i + 1];
                    if (globstarOption && numStars == 2 && [
                        ...seps,
                        undefined
                    ].includes(prevChar) && [
                        ...seps,
                        undefined
                    ].includes(nextChar)) {
                        segment += globstar;
                        endsWithSep = true;
                    } else {
                        segment += wildcard;
                    }
                }
                continue;
            }
            segment += regExpEscapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
        }
        // Check for unclosed groups or a dangling backslash.
        if (groupStack.length > 0 || inRange || inEscape) {
            // Parse failure. Take all characters from this segment literally.
            segment = "";
            for (const c of glob.slice(j, i)){
                segment += regExpEscapeChars.includes(c) ? `\\${c}` : c;
                endsWithSep = false;
            }
        }
        regExpString += segment;
        if (!endsWithSep) {
            regExpString += i < glob.length ? sep : sepMaybe;
            endsWithSep = true;
        }
        // Terminates with `i` at the start of the next segment.
        while(seps.includes(glob[i]))i++;
        // Check that the next value of `j` is indeed higher than the current value.
        if (!(i > j)) {
            throw new Error("Assertion failure: i > j (potential infinite loop)");
        }
        j = i;
    }
    regExpString = `^${regExpString}$`;
    return new RegExp(regExpString);
}
/** Test whether the given string is a glob */ export function isGlob(str) {
    const chars = {
        "{": "}",
        "(": ")",
        "[": "]"
    };
    const regex = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
    if (str === "") {
        return false;
    }
    let match;
    while(match = regex.exec(str)){
        if (match[2]) return true;
        let idx = match.index + match[0].length;
        // if an open bracket/brace/paren is escaped,
        // set the index to the next closing character
        const open = match[1];
        const close = open ? chars[open] : null;
        if (open && close) {
            const n = str.indexOf(close, idx);
            if (n !== -1) {
                idx = n + 1;
            }
        }
        str = str.slice(idx);
    }
    return false;
}
/** Like normalize(), but doesn't collapse "**\/.." when `globstar` is true. */ export function normalizeGlob(glob, { globstar =false  } = {}) {
    if (glob.match(/\0/g)) {
        throw new Error(`Glob contains invalid characters: "${glob}"`);
    }
    if (!globstar) {
        return normalize(glob);
    }
    const s = SEP_PATTERN.source;
    const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
    return normalize(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
/** Like join(), but doesn't collapse "**\/.." when `globstar` is true. */ export function joinGlobs(globs, { extended =false , globstar =false  } = {}) {
    if (!globstar || globs.length == 0) {
        return join(...globs);
    }
    if (globs.length === 0) return ".";
    let joined;
    for (const glob of globs){
        const path = glob;
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `${SEP}${path}`;
        }
    }
    if (!joined) return ".";
    return normalizeGlob(joined, {
        extended,
        globstar
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjg0LjAvcGF0aC9nbG9iLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IG9zVHlwZSB9IGZyb20gXCIuLi9fdXRpbC9vcy50c1wiO1xuaW1wb3J0IHsgam9pbiwgbm9ybWFsaXplIH0gZnJvbSBcIi4vbW9kLnRzXCI7XG5pbXBvcnQgeyBTRVAsIFNFUF9QQVRURVJOIH0gZnJvbSBcIi4vc2VwYXJhdG9yLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2xvYk9wdGlvbnMge1xuICAvKiogRXh0ZW5kZWQgZ2xvYiBzeW50YXguXG4gICAqIFNlZSBodHRwczovL3d3dy5saW51eGpvdXJuYWwuY29tL2NvbnRlbnQvYmFzaC1leHRlbmRlZC1nbG9iYmluZy4gRGVmYXVsdHNcbiAgICogdG8gdHJ1ZS4gKi9cbiAgZXh0ZW5kZWQ/OiBib29sZWFuO1xuICAvKiogR2xvYnN0YXIgc3ludGF4LlxuICAgKiBTZWUgaHR0cHM6Ly93d3cubGludXhqb3VybmFsLmNvbS9jb250ZW50L2dsb2JzdGFyLW5ldy1iYXNoLWdsb2JiaW5nLW9wdGlvbi5cbiAgICogSWYgZmFsc2UsIGAqKmAgaXMgdHJlYXRlZCBsaWtlIGAqYC4gRGVmYXVsdHMgdG8gdHJ1ZS4gKi9cbiAgZ2xvYnN0YXI/OiBib29sZWFuO1xuICAvKiogT3BlcmF0aW5nIHN5c3RlbS4gRGVmYXVsdHMgdG8gdGhlIG5hdGl2ZSBPUy4gKi9cbiAgb3M/OiB0eXBlb2YgRGVuby5idWlsZC5vcztcbn1cblxuZXhwb3J0IHR5cGUgR2xvYlRvUmVnRXhwT3B0aW9ucyA9IEdsb2JPcHRpb25zO1xuXG4vLyBkZW5vLWZtdC1pZ25vcmVcbmNvbnN0IHJlZ0V4cEVzY2FwZUNoYXJzID0gW1wiIVwiLCBcIiRcIiwgXCIoXCIsIFwiKVwiLCBcIipcIiwgXCIrXCIsIFwiLlwiLCBcIj1cIiwgXCI/XCIsIFwiW1wiLCBcIlxcXFxcIiwgXCJeXCIsIFwie1wiLCBcInxcIl07XG5jb25zdCByYW5nZUVzY2FwZUNoYXJzID0gW1wiLVwiLCBcIlxcXFxcIiwgXCJdXCJdO1xuXG4vKiogQ29udmVydCBhIGdsb2Igc3RyaW5nIHRvIGEgcmVndWxhciBleHByZXNzaW9uLlxuICpcbiAqIFRyaWVzIHRvIG1hdGNoIGJhc2ggZ2xvYiBleHBhbnNpb24gYXMgY2xvc2VseSBhcyBwb3NzaWJsZS5cbiAqXG4gKiBCYXNpYyBnbG9iIHN5bnRheDpcbiAqIC0gYCpgIC0gTWF0Y2hlcyBldmVyeXRoaW5nIHdpdGhvdXQgbGVhdmluZyB0aGUgcGF0aCBzZWdtZW50LlxuICogLSBge2ZvbyxiYXJ9YCAtIE1hdGNoZXMgYGZvb2Agb3IgYGJhcmAuXG4gKiAtIGBbYWJjZF1gIC0gTWF0Y2hlcyBgYWAsIGBiYCwgYGNgIG9yIGBkYC5cbiAqIC0gYFthLWRdYCAtIE1hdGNoZXMgYGFgLCBgYmAsIGBjYCBvciBgZGAuXG4gKiAtIGBbIWFiY2RdYCAtIE1hdGNoZXMgYW55IHNpbmdsZSBjaGFyYWN0ZXIgYmVzaWRlcyBgYWAsIGBiYCwgYGNgIG9yIGBkYC5cbiAqIC0gYFtbOjxjbGFzcz46XV1gIC0gTWF0Y2hlcyBhbnkgY2hhcmFjdGVyIGJlbG9uZ2luZyB0byBgPGNsYXNzPmAuXG4gKiAgICAgLSBgW1s6YWxudW06XV1gIC0gTWF0Y2hlcyBhbnkgZGlnaXQgb3IgbGV0dGVyLlxuICogICAgIC0gYFtbOmRpZ2l0Ol1hYmNdYCAtIE1hdGNoZXMgYW55IGRpZ2l0LCBgYWAsIGBiYCBvciBgY2AuXG4gKiAgICAgLSBTZWUgaHR0cHM6Ly9mYWNlbGVzc3VzZXIuZ2l0aHViLmlvL3djbWF0Y2gvZ2xvYi8jcG9zaXgtY2hhcmFjdGVyLWNsYXNzZXNcbiAqICAgICAgIGZvciBhIGNvbXBsZXRlIGxpc3Qgb2Ygc3VwcG9ydGVkIGNoYXJhY3RlciBjbGFzc2VzLlxuICogLSBgXFxgIC0gRXNjYXBlcyB0aGUgbmV4dCBjaGFyYWN0ZXIgZm9yIGFuIGBvc2Agb3RoZXIgdGhhbiBgXCJ3aW5kb3dzXCJgLlxuICogLSBcXGAgLSBFc2NhcGVzIHRoZSBuZXh0IGNoYXJhY3RlciBmb3IgYG9zYCBzZXQgdG8gYFwid2luZG93c1wiYC5cbiAqIC0gYC9gIC0gUGF0aCBzZXBhcmF0b3IuXG4gKiAtIGBcXGAgLSBBZGRpdGlvbmFsIHBhdGggc2VwYXJhdG9yIG9ubHkgZm9yIGBvc2Agc2V0IHRvIGBcIndpbmRvd3NcImAuXG4gKlxuICogRXh0ZW5kZWQgc3ludGF4OlxuICogLSBSZXF1aXJlcyBgeyBleHRlbmRlZDogdHJ1ZSB9YC5cbiAqIC0gYD8oZm9vfGJhcilgIC0gTWF0Y2hlcyAwIG9yIDEgaW5zdGFuY2Ugb2YgYHtmb28sYmFyfWAuXG4gKiAtIGBAKGZvb3xiYXIpYCAtIE1hdGNoZXMgMSBpbnN0YW5jZSBvZiBge2ZvbyxiYXJ9YC4gVGhleSBiZWhhdmUgdGhlIHNhbWUuXG4gKiAtIGAqKGZvb3xiYXIpYCAtIE1hdGNoZXMgX25fIGluc3RhbmNlcyBvZiBge2ZvbyxiYXJ9YC5cbiAqIC0gYCsoZm9vfGJhcilgIC0gTWF0Y2hlcyBfbiA+IDBfIGluc3RhbmNlcyBvZiBge2ZvbyxiYXJ9YC5cbiAqIC0gYCEoZm9vfGJhcilgIC0gTWF0Y2hlcyBhbnl0aGluZyBvdGhlciB0aGFuIGB7Zm9vLGJhcn1gLlxuICogLSBTZWUgaHR0cHM6Ly93d3cubGludXhqb3VybmFsLmNvbS9jb250ZW50L2Jhc2gtZXh0ZW5kZWQtZ2xvYmJpbmcuXG4gKlxuICogR2xvYnN0YXIgc3ludGF4OlxuICogLSBSZXF1aXJlcyBgeyBnbG9ic3RhcjogdHJ1ZSB9YC5cbiAqIC0gYCoqYCAtIE1hdGNoZXMgYW55IG51bWJlciBvZiBhbnkgcGF0aCBzZWdtZW50cy5cbiAqICAgICAtIE11c3QgY29tcHJpc2UgaXRzIGVudGlyZSBwYXRoIHNlZ21lbnQgaW4gdGhlIHByb3ZpZGVkIGdsb2IuXG4gKiAtIFNlZSBodHRwczovL3d3dy5saW51eGpvdXJuYWwuY29tL2NvbnRlbnQvZ2xvYnN0YXItbmV3LWJhc2gtZ2xvYmJpbmctb3B0aW9uLlxuICpcbiAqIE5vdGUgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogLSBUaGUgZ2VuZXJhdGVkIGBSZWdFeHBgIGlzIGFuY2hvcmVkIGF0IGJvdGggc3RhcnQgYW5kIGVuZC5cbiAqIC0gUmVwZWF0aW5nIGFuZCB0cmFpbGluZyBzZXBhcmF0b3JzIGFyZSB0b2xlcmF0ZWQuIFRyYWlsaW5nIHNlcGFyYXRvcnMgaW4gdGhlXG4gKiAgIHByb3ZpZGVkIGdsb2IgaGF2ZSBubyBtZWFuaW5nIGFuZCBhcmUgZGlzY2FyZGVkLlxuICogLSBBYnNvbHV0ZSBnbG9icyB3aWxsIG9ubHkgbWF0Y2ggYWJzb2x1dGUgcGF0aHMsIGV0Yy5cbiAqIC0gRW1wdHkgZ2xvYnMgd2lsbCBtYXRjaCBub3RoaW5nLlxuICogLSBBbnkgc3BlY2lhbCBnbG9iIHN5bnRheCBtdXN0IGJlIGNvbnRhaW5lZCB0byBvbmUgcGF0aCBzZWdtZW50LiBGb3IgZXhhbXBsZSxcbiAqICAgYD8oZm9vfGJhci9iYXopYCBpcyBpbnZhbGlkLiBUaGUgc2VwYXJhdG9yIHdpbGwgdGFrZSBwcmVjZW5kZW5jZSBhbmQgdGhlXG4gKiAgIGZpcnN0IHNlZ21lbnQgZW5kcyB3aXRoIGFuIHVuY2xvc2VkIGdyb3VwLlxuICogLSBJZiBhIHBhdGggc2VnbWVudCBlbmRzIHdpdGggdW5jbG9zZWQgZ3JvdXBzIG9yIGEgZGFuZ2xpbmcgZXNjYXBlIHByZWZpeCwgYVxuICogICBwYXJzZSBlcnJvciBoYXMgb2NjdXJlZC4gRXZlcnkgY2hhcmFjdGVyIGZvciB0aGF0IHNlZ21lbnQgaXMgdGFrZW5cbiAqICAgbGl0ZXJhbGx5IGluIHRoaXMgZXZlbnQuXG4gKlxuICogTGltaXRhdGlvbnM6XG4gKiAtIEEgbmVnYXRpdmUgZ3JvdXAgbGlrZSBgIShmb298YmFyKWAgd2lsbCB3cm9uZ2x5IGJlIGNvbnZlcnRlZCB0byBhIG5lZ2F0aXZlXG4gKiAgIGxvb2stYWhlYWQgZm9sbG93ZWQgYnkgYSB3aWxkY2FyZC4gVGhpcyBtZWFucyB0aGF0IGAhKGZvbykuanNgIHdpbGwgd3JvbmdseVxuICogICBmYWlsIHRvIG1hdGNoIGBmb29iYXIuanNgLCBldmVuIHRob3VnaCBgZm9vYmFyYCBpcyBub3QgYGZvb2AuIEVmZmVjdGl2ZWx5LFxuICogICBgIShmb298YmFyKWAgaXMgdHJlYXRlZCBsaWtlIGAhKEAoZm9vfGJhcikqKWAuIFRoaXMgd2lsbCB3b3JrIGNvcnJlY3RseSBpZlxuICogICB0aGUgZ3JvdXAgb2NjdXJzIG5vdCBuZXN0ZWQgYXQgdGhlIGVuZCBvZiB0aGUgc2VnbWVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnbG9iVG9SZWdFeHAoXG4gIGdsb2I6IHN0cmluZyxcbiAgeyBleHRlbmRlZCA9IHRydWUsIGdsb2JzdGFyOiBnbG9ic3Rhck9wdGlvbiA9IHRydWUsIG9zID0gb3NUeXBlIH06XG4gICAgR2xvYlRvUmVnRXhwT3B0aW9ucyA9IHt9LFxuKTogUmVnRXhwIHtcbiAgaWYgKGdsb2IgPT0gXCJcIikge1xuICAgIHJldHVybiAvKD8hKS87XG4gIH1cblxuICBjb25zdCBzZXAgPSBvcyA9PSBcIndpbmRvd3NcIiA/IFwiKD86XFxcXFxcXFx8LykrXCIgOiBcIi8rXCI7XG4gIGNvbnN0IHNlcE1heWJlID0gb3MgPT0gXCJ3aW5kb3dzXCIgPyBcIig/OlxcXFxcXFxcfC8pKlwiIDogXCIvKlwiO1xuICBjb25zdCBzZXBzID0gb3MgPT0gXCJ3aW5kb3dzXCIgPyBbXCJcXFxcXCIsIFwiL1wiXSA6IFtcIi9cIl07XG4gIGNvbnN0IGdsb2JzdGFyID0gb3MgPT0gXCJ3aW5kb3dzXCJcbiAgICA/IFwiKD86W15cXFxcXFxcXC9dKig/OlxcXFxcXFxcfC98JCkrKSpcIlxuICAgIDogXCIoPzpbXi9dKig/Oi98JCkrKSpcIjtcbiAgY29uc3Qgd2lsZGNhcmQgPSBvcyA9PSBcIndpbmRvd3NcIiA/IFwiW15cXFxcXFxcXC9dKlwiIDogXCJbXi9dKlwiO1xuICBjb25zdCBlc2NhcGVQcmVmaXggPSBvcyA9PSBcIndpbmRvd3NcIiA/IFwiYFwiIDogXCJcXFxcXCI7XG5cbiAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNlcGFyYXRvcnMuXG4gIGxldCBuZXdMZW5ndGggPSBnbG9iLmxlbmd0aDtcbiAgZm9yICg7IG5ld0xlbmd0aCA+IDEgJiYgc2Vwcy5pbmNsdWRlcyhnbG9iW25ld0xlbmd0aCAtIDFdKTsgbmV3TGVuZ3RoLS0pO1xuICBnbG9iID0gZ2xvYi5zbGljZSgwLCBuZXdMZW5ndGgpO1xuXG4gIGxldCByZWdFeHBTdHJpbmcgPSBcIlwiO1xuXG4gIC8vIFRlcm1pbmF0ZXMgY29ycmVjdGx5LiBUcnVzdCB0aGF0IGBqYCBpcyBpbmNyZW1lbnRlZCBldmVyeSBpdGVyYXRpb24uXG4gIGZvciAobGV0IGogPSAwOyBqIDwgZ2xvYi5sZW5ndGg7KSB7XG4gICAgbGV0IHNlZ21lbnQgPSBcIlwiO1xuICAgIGNvbnN0IGdyb3VwU3RhY2sgPSBbXTtcbiAgICBsZXQgaW5SYW5nZSA9IGZhbHNlO1xuICAgIGxldCBpbkVzY2FwZSA9IGZhbHNlO1xuICAgIGxldCBlbmRzV2l0aFNlcCA9IGZhbHNlO1xuICAgIGxldCBpID0gajtcblxuICAgIC8vIFRlcm1pbmF0ZXMgd2l0aCBgaWAgYXQgdGhlIG5vbi1pbmNsdXNpdmUgZW5kIG9mIHRoZSBjdXJyZW50IHNlZ21lbnQuXG4gICAgZm9yICg7IGkgPCBnbG9iLmxlbmd0aCAmJiAhc2Vwcy5pbmNsdWRlcyhnbG9iW2ldKTsgaSsrKSB7XG4gICAgICBpZiAoaW5Fc2NhcGUpIHtcbiAgICAgICAgaW5Fc2NhcGUgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgZXNjYXBlQ2hhcnMgPSBpblJhbmdlID8gcmFuZ2VFc2NhcGVDaGFycyA6IHJlZ0V4cEVzY2FwZUNoYXJzO1xuICAgICAgICBzZWdtZW50ICs9IGVzY2FwZUNoYXJzLmluY2x1ZGVzKGdsb2JbaV0pID8gYFxcXFwke2dsb2JbaV19YCA6IGdsb2JbaV07XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2xvYltpXSA9PSBlc2NhcGVQcmVmaXgpIHtcbiAgICAgICAgaW5Fc2NhcGUgPSB0cnVlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGdsb2JbaV0gPT0gXCJbXCIpIHtcbiAgICAgICAgaWYgKCFpblJhbmdlKSB7XG4gICAgICAgICAgaW5SYW5nZSA9IHRydWU7XG4gICAgICAgICAgc2VnbWVudCArPSBcIltcIjtcbiAgICAgICAgICBpZiAoZ2xvYltpICsgMV0gPT0gXCIhXCIpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHNlZ21lbnQgKz0gXCJeXCI7XG4gICAgICAgICAgfSBlbHNlIGlmIChnbG9iW2kgKyAxXSA9PSBcIl5cIikge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgc2VnbWVudCArPSBcIlxcXFxeXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGdsb2JbaSArIDFdID09IFwiOlwiKSB7XG4gICAgICAgICAgbGV0IGsgPSBpICsgMTtcbiAgICAgICAgICBsZXQgdmFsdWUgPSBcIlwiO1xuICAgICAgICAgIHdoaWxlIChnbG9iW2sgKyAxXSAhPSBudWxsICYmIGdsb2JbayArIDFdICE9IFwiOlwiKSB7XG4gICAgICAgICAgICB2YWx1ZSArPSBnbG9iW2sgKyAxXTtcbiAgICAgICAgICAgIGsrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGdsb2JbayArIDFdID09IFwiOlwiICYmIGdsb2JbayArIDJdID09IFwiXVwiKSB7XG4gICAgICAgICAgICBpID0gayArIDI7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJhbG51bVwiKSBzZWdtZW50ICs9IFwiXFxcXGRBLVphLXpcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09IFwiYWxwaGFcIikgc2VnbWVudCArPSBcIkEtWmEtelwiO1xuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgPT0gXCJhc2NpaVwiKSBzZWdtZW50ICs9IFwiXFx4MDAtXFx4N0ZcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09IFwiYmxhbmtcIikgc2VnbWVudCArPSBcIlxcdCBcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09IFwiY250cmxcIikgc2VnbWVudCArPSBcIlxceDAwLVxceDFGXFx4N0ZcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09IFwiZGlnaXRcIikgc2VnbWVudCArPSBcIlxcXFxkXCI7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSA9PSBcImdyYXBoXCIpIHNlZ21lbnQgKz0gXCJcXHgyMS1cXHg3RVwiO1xuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgPT0gXCJsb3dlclwiKSBzZWdtZW50ICs9IFwiYS16XCI7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSA9PSBcInByaW50XCIpIHNlZ21lbnQgKz0gXCJcXHgyMC1cXHg3RVwiO1xuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgPT0gXCJwdW5jdFwiKSB7XG4gICAgICAgICAgICAgIHNlZ21lbnQgKz0gXCIhXFxcIiMkJSYnKCkqKyxcXFxcLS4vOjs8PT4/QFtcXFxcXFxcXFxcXFxdXl/igJh7fH1+XCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09IFwic3BhY2VcIikgc2VnbWVudCArPSBcIlxcXFxzXFx2XCI7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSA9PSBcInVwcGVyXCIpIHNlZ21lbnQgKz0gXCJBLVpcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09IFwid29yZFwiKSBzZWdtZW50ICs9IFwiXFxcXHdcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09IFwieGRpZ2l0XCIpIHNlZ21lbnQgKz0gXCJcXFxcZEEtRmEtZlwiO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChnbG9iW2ldID09IFwiXVwiICYmIGluUmFuZ2UpIHtcbiAgICAgICAgaW5SYW5nZSA9IGZhbHNlO1xuICAgICAgICBzZWdtZW50ICs9IFwiXVwiO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGluUmFuZ2UpIHtcbiAgICAgICAgaWYgKGdsb2JbaV0gPT0gXCJcXFxcXCIpIHtcbiAgICAgICAgICBzZWdtZW50ICs9IGBcXFxcXFxcXGA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VnbWVudCArPSBnbG9iW2ldO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIGdsb2JbaV0gPT0gXCIpXCIgJiYgZ3JvdXBTdGFjay5sZW5ndGggPiAwICYmXG4gICAgICAgIGdyb3VwU3RhY2tbZ3JvdXBTdGFjay5sZW5ndGggLSAxXSAhPSBcIkJSQUNFXCJcbiAgICAgICkge1xuICAgICAgICBzZWdtZW50ICs9IFwiKVwiO1xuICAgICAgICBjb25zdCB0eXBlID0gZ3JvdXBTdGFjay5wb3AoKSE7XG4gICAgICAgIGlmICh0eXBlID09IFwiIVwiKSB7XG4gICAgICAgICAgc2VnbWVudCArPSB3aWxkY2FyZDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlICE9IFwiQFwiKSB7XG4gICAgICAgICAgc2VnbWVudCArPSB0eXBlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIGdsb2JbaV0gPT0gXCJ8XCIgJiYgZ3JvdXBTdGFjay5sZW5ndGggPiAwICYmXG4gICAgICAgIGdyb3VwU3RhY2tbZ3JvdXBTdGFjay5sZW5ndGggLSAxXSAhPSBcIkJSQUNFXCJcbiAgICAgICkge1xuICAgICAgICBzZWdtZW50ICs9IFwifFwiO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGdsb2JbaV0gPT0gXCIrXCIgJiYgZXh0ZW5kZWQgJiYgZ2xvYltpICsgMV0gPT0gXCIoXCIpIHtcbiAgICAgICAgaSsrO1xuICAgICAgICBncm91cFN0YWNrLnB1c2goXCIrXCIpO1xuICAgICAgICBzZWdtZW50ICs9IFwiKD86XCI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2xvYltpXSA9PSBcIkBcIiAmJiBleHRlbmRlZCAmJiBnbG9iW2kgKyAxXSA9PSBcIihcIikge1xuICAgICAgICBpKys7XG4gICAgICAgIGdyb3VwU3RhY2sucHVzaChcIkBcIik7XG4gICAgICAgIHNlZ21lbnQgKz0gXCIoPzpcIjtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChnbG9iW2ldID09IFwiP1wiKSB7XG4gICAgICAgIGlmIChleHRlbmRlZCAmJiBnbG9iW2kgKyAxXSA9PSBcIihcIikge1xuICAgICAgICAgIGkrKztcbiAgICAgICAgICBncm91cFN0YWNrLnB1c2goXCI/XCIpO1xuICAgICAgICAgIHNlZ21lbnQgKz0gXCIoPzpcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWdtZW50ICs9IFwiLlwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2xvYltpXSA9PSBcIiFcIiAmJiBleHRlbmRlZCAmJiBnbG9iW2kgKyAxXSA9PSBcIihcIikge1xuICAgICAgICBpKys7XG4gICAgICAgIGdyb3VwU3RhY2sucHVzaChcIiFcIik7XG4gICAgICAgIHNlZ21lbnQgKz0gXCIoPyFcIjtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChnbG9iW2ldID09IFwie1wiKSB7XG4gICAgICAgIGdyb3VwU3RhY2sucHVzaChcIkJSQUNFXCIpO1xuICAgICAgICBzZWdtZW50ICs9IFwiKD86XCI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2xvYltpXSA9PSBcIn1cIiAmJiBncm91cFN0YWNrW2dyb3VwU3RhY2subGVuZ3RoIC0gMV0gPT0gXCJCUkFDRVwiKSB7XG4gICAgICAgIGdyb3VwU3RhY2sucG9wKCk7XG4gICAgICAgIHNlZ21lbnQgKz0gXCIpXCI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2xvYltpXSA9PSBcIixcIiAmJiBncm91cFN0YWNrW2dyb3VwU3RhY2subGVuZ3RoIC0gMV0gPT0gXCJCUkFDRVwiKSB7XG4gICAgICAgIHNlZ21lbnQgKz0gXCJ8XCI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZ2xvYltpXSA9PSBcIipcIikge1xuICAgICAgICBpZiAoZXh0ZW5kZWQgJiYgZ2xvYltpICsgMV0gPT0gXCIoXCIpIHtcbiAgICAgICAgICBpKys7XG4gICAgICAgICAgZ3JvdXBTdGFjay5wdXNoKFwiKlwiKTtcbiAgICAgICAgICBzZWdtZW50ICs9IFwiKD86XCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcHJldkNoYXIgPSBnbG9iW2kgLSAxXTtcbiAgICAgICAgICBsZXQgbnVtU3RhcnMgPSAxO1xuICAgICAgICAgIHdoaWxlIChnbG9iW2kgKyAxXSA9PSBcIipcIikge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgbnVtU3RhcnMrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbmV4dENoYXIgPSBnbG9iW2kgKyAxXTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBnbG9ic3Rhck9wdGlvbiAmJiBudW1TdGFycyA9PSAyICYmXG4gICAgICAgICAgICBbLi4uc2VwcywgdW5kZWZpbmVkXS5pbmNsdWRlcyhwcmV2Q2hhcikgJiZcbiAgICAgICAgICAgIFsuLi5zZXBzLCB1bmRlZmluZWRdLmluY2x1ZGVzKG5leHRDaGFyKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgc2VnbWVudCArPSBnbG9ic3RhcjtcbiAgICAgICAgICAgIGVuZHNXaXRoU2VwID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VnbWVudCArPSB3aWxkY2FyZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHNlZ21lbnQgKz0gcmVnRXhwRXNjYXBlQ2hhcnMuaW5jbHVkZXMoZ2xvYltpXSkgPyBgXFxcXCR7Z2xvYltpXX1gIDogZ2xvYltpXTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgdW5jbG9zZWQgZ3JvdXBzIG9yIGEgZGFuZ2xpbmcgYmFja3NsYXNoLlxuICAgIGlmIChncm91cFN0YWNrLmxlbmd0aCA+IDAgfHwgaW5SYW5nZSB8fCBpbkVzY2FwZSkge1xuICAgICAgLy8gUGFyc2UgZmFpbHVyZS4gVGFrZSBhbGwgY2hhcmFjdGVycyBmcm9tIHRoaXMgc2VnbWVudCBsaXRlcmFsbHkuXG4gICAgICBzZWdtZW50ID0gXCJcIjtcbiAgICAgIGZvciAoY29uc3QgYyBvZiBnbG9iLnNsaWNlKGosIGkpKSB7XG4gICAgICAgIHNlZ21lbnQgKz0gcmVnRXhwRXNjYXBlQ2hhcnMuaW5jbHVkZXMoYykgPyBgXFxcXCR7Y31gIDogYztcbiAgICAgICAgZW5kc1dpdGhTZXAgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWdFeHBTdHJpbmcgKz0gc2VnbWVudDtcbiAgICBpZiAoIWVuZHNXaXRoU2VwKSB7XG4gICAgICByZWdFeHBTdHJpbmcgKz0gaSA8IGdsb2IubGVuZ3RoID8gc2VwIDogc2VwTWF5YmU7XG4gICAgICBlbmRzV2l0aFNlcCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gVGVybWluYXRlcyB3aXRoIGBpYCBhdCB0aGUgc3RhcnQgb2YgdGhlIG5leHQgc2VnbWVudC5cbiAgICB3aGlsZSAoc2Vwcy5pbmNsdWRlcyhnbG9iW2ldKSkgaSsrO1xuXG4gICAgLy8gQ2hlY2sgdGhhdCB0aGUgbmV4dCB2YWx1ZSBvZiBgamAgaXMgaW5kZWVkIGhpZ2hlciB0aGFuIHRoZSBjdXJyZW50IHZhbHVlLlxuICAgIGlmICghKGkgPiBqKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXNzZXJ0aW9uIGZhaWx1cmU6IGkgPiBqIChwb3RlbnRpYWwgaW5maW5pdGUgbG9vcClcIik7XG4gICAgfVxuICAgIGogPSBpO1xuICB9XG5cbiAgcmVnRXhwU3RyaW5nID0gYF4ke3JlZ0V4cFN0cmluZ30kYDtcbiAgcmV0dXJuIG5ldyBSZWdFeHAocmVnRXhwU3RyaW5nKTtcbn1cblxuLyoqIFRlc3Qgd2hldGhlciB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGEgZ2xvYiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzR2xvYihzdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBjaGFyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHsgXCJ7XCI6IFwifVwiLCBcIihcIjogXCIpXCIsIFwiW1wiOiBcIl1cIiB9O1xuICBjb25zdCByZWdleCA9XG4gICAgL1xcXFwoLil8KF4hfFxcKnxbXFxdLispXVxcP3xcXFtbXlxcXFxcXF1dK1xcXXxcXHtbXlxcXFx9XStcXH18XFwoXFw/WzohPV1bXlxcXFwpXStcXCl8XFwoW158XStcXHxbXlxcXFwpXStcXCkpLztcblxuICBpZiAoc3RyID09PSBcIlwiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgbGV0IG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuXG4gIHdoaWxlICgobWF0Y2ggPSByZWdleC5leGVjKHN0cikpKSB7XG4gICAgaWYgKG1hdGNoWzJdKSByZXR1cm4gdHJ1ZTtcbiAgICBsZXQgaWR4ID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XG5cbiAgICAvLyBpZiBhbiBvcGVuIGJyYWNrZXQvYnJhY2UvcGFyZW4gaXMgZXNjYXBlZCxcbiAgICAvLyBzZXQgdGhlIGluZGV4IHRvIHRoZSBuZXh0IGNsb3NpbmcgY2hhcmFjdGVyXG4gICAgY29uc3Qgb3BlbiA9IG1hdGNoWzFdO1xuICAgIGNvbnN0IGNsb3NlID0gb3BlbiA/IGNoYXJzW29wZW5dIDogbnVsbDtcbiAgICBpZiAob3BlbiAmJiBjbG9zZSkge1xuICAgICAgY29uc3QgbiA9IHN0ci5pbmRleE9mKGNsb3NlLCBpZHgpO1xuICAgICAgaWYgKG4gIT09IC0xKSB7XG4gICAgICAgIGlkeCA9IG4gKyAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0ciA9IHN0ci5zbGljZShpZHgpO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKiogTGlrZSBub3JtYWxpemUoKSwgYnV0IGRvZXNuJ3QgY29sbGFwc2UgXCIqKlxcLy4uXCIgd2hlbiBgZ2xvYnN0YXJgIGlzIHRydWUuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplR2xvYihcbiAgZ2xvYjogc3RyaW5nLFxuICB7IGdsb2JzdGFyID0gZmFsc2UgfTogR2xvYk9wdGlvbnMgPSB7fSxcbik6IHN0cmluZyB7XG4gIGlmIChnbG9iLm1hdGNoKC9cXDAvZykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEdsb2IgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzOiBcIiR7Z2xvYn1cImApO1xuICB9XG4gIGlmICghZ2xvYnN0YXIpIHtcbiAgICByZXR1cm4gbm9ybWFsaXplKGdsb2IpO1xuICB9XG4gIGNvbnN0IHMgPSBTRVBfUEFUVEVSTi5zb3VyY2U7XG4gIGNvbnN0IGJhZFBhcmVudFBhdHRlcm4gPSBuZXcgUmVnRXhwKFxuICAgIGAoPzw9KCR7c318XilcXFxcKlxcXFwqJHtzfSlcXFxcLlxcXFwuKD89JHtzfXwkKWAsXG4gICAgXCJnXCIsXG4gICk7XG4gIHJldHVybiBub3JtYWxpemUoZ2xvYi5yZXBsYWNlKGJhZFBhcmVudFBhdHRlcm4sIFwiXFwwXCIpKS5yZXBsYWNlKC9cXDAvZywgXCIuLlwiKTtcbn1cblxuLyoqIExpa2Ugam9pbigpLCBidXQgZG9lc24ndCBjb2xsYXBzZSBcIioqXFwvLi5cIiB3aGVuIGBnbG9ic3RhcmAgaXMgdHJ1ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqb2luR2xvYnMoXG4gIGdsb2JzOiBzdHJpbmdbXSxcbiAgeyBleHRlbmRlZCA9IGZhbHNlLCBnbG9ic3RhciA9IGZhbHNlIH06IEdsb2JPcHRpb25zID0ge30sXG4pOiBzdHJpbmcge1xuICBpZiAoIWdsb2JzdGFyIHx8IGdsb2JzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIGpvaW4oLi4uZ2xvYnMpO1xuICB9XG4gIGlmIChnbG9icy5sZW5ndGggPT09IDApIHJldHVybiBcIi5cIjtcbiAgbGV0IGpvaW5lZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBmb3IgKGNvbnN0IGdsb2Igb2YgZ2xvYnMpIHtcbiAgICBjb25zdCBwYXRoID0gZ2xvYjtcbiAgICBpZiAocGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoIWpvaW5lZCkgam9pbmVkID0gcGF0aDtcbiAgICAgIGVsc2Ugam9pbmVkICs9IGAke1NFUH0ke3BhdGh9YDtcbiAgICB9XG4gIH1cbiAgaWYgKCFqb2luZWQpIHJldHVybiBcIi5cIjtcbiAgcmV0dXJuIG5vcm1hbGl6ZUdsb2Ioam9pbmVkLCB7IGV4dGVuZGVkLCBnbG9ic3RhciB9KTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsTUFBTSxRQUFRLGlCQUFpQjtBQUN4QyxTQUFTLElBQUksRUFBRSxTQUFTLFFBQVEsV0FBVztBQUMzQyxTQUFTLEdBQUcsRUFBRSxXQUFXLFFBQVEsaUJBQWlCO0FBaUJsRCxrQkFBa0I7QUFDbEIsTUFBTSxvQkFBb0I7SUFBQztJQUFLO0lBQUs7SUFBSztJQUFLO0lBQUs7SUFBSztJQUFLO0lBQUs7SUFBSztJQUFLO0lBQU07SUFBSztJQUFLO0NBQUk7QUFDakcsTUFBTSxtQkFBbUI7SUFBQztJQUFLO0lBQU07Q0FBSTtBQUV6Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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