// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
export const osType = (()=>{
    if (globalThis.Deno != null) {
        return Deno.build.os;
    }
    // deno-lint-ignore no-explicit-any
    const navigator = globalThis.navigator;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
export const isWindows = osType === "windows";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjg0LjAvX3V0aWwvb3MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMSB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuZXhwb3J0IGNvbnN0IG9zVHlwZSA9ICgoKSA9PiB7XG4gIGlmIChnbG9iYWxUaGlzLkRlbm8gIT0gbnVsbCkge1xuICAgIHJldHVybiBEZW5vLmJ1aWxkLm9zO1xuICB9XG5cbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgY29uc3QgbmF2aWdhdG9yID0gKGdsb2JhbFRoaXMgYXMgYW55KS5uYXZpZ2F0b3I7XG4gIGlmIChuYXZpZ2F0b3I/LmFwcFZlcnNpb24/LmluY2x1ZGVzPy4oXCJXaW5cIikgPz8gZmFsc2UpIHtcbiAgICByZXR1cm4gXCJ3aW5kb3dzXCI7XG4gIH1cblxuICByZXR1cm4gXCJsaW51eFwiO1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IGlzV2luZG93cyA9IG9zVHlwZSA9PT0gXCJ3aW5kb3dzXCI7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxPQUFPLE1BQU0sU0FBUyxBQUFDLENBQUEsSUFBTTtJQUMzQixJQUFJLFdBQVcsSUFBSSxJQUFJLElBQUksRUFBRTtRQUMzQixPQUFPLEtBQUssS0FBSyxDQUFDLEVBQUU7SUFDdEIsQ0FBQztJQUVELG1DQUFtQztJQUNuQyxNQUFNLFlBQVksQUFBQyxXQUFtQixTQUFTO0lBQy9DLElBQUksV0FBVyxZQUFZLFdBQVcsVUFBVSxLQUFLLEVBQUU7UUFDckQsT0FBTztJQUNULENBQUM7SUFFRCxPQUFPO0FBQ1QsQ0FBQSxJQUFLO0FBRUwsT0FBTyxNQUFNLFlBQVksV0FBVyxVQUFVIn0=