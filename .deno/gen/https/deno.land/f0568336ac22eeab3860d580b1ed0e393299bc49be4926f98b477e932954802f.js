// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
// A module to print ANSI terminal colors. Inspired by chalk, kleur, and colors
// on npm.
//
// ```
// import { bgBlue, red, bold } from "https://deno.land/std/fmt/colors.ts";
// console.log(bgBlue(red(bold("Hello world!"))));
// ```
//
// This module supports `NO_COLOR` environmental variable disabling any coloring
// if `NO_COLOR` is set.
//
// This module is browser compatible.
const noColor = globalThis.Deno?.noColor ?? true;
let enabled = !noColor;
/**
 * Set changing text color to enabled or disabled
 * @param value
 */ export function setColorEnabled(value) {
    if (noColor) {
        return;
    }
    enabled = value;
}
/** Get whether text color change is enabled or disabled. */ export function getColorEnabled() {
    return enabled;
}
/**
 * Builds color code
 * @param open
 * @param close
 */ function code(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
/**
 * Applies color and background based on color code and its associated text
 * @param str text to apply color settings to
 * @param code color code to apply
 */ function run(str, code) {
    return enabled ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}` : str;
}
/**
 * Reset the text modified
 * @param str text to reset
 */ export function reset(str) {
    return run(str, code([
        0
    ], 0));
}
/**
 * Make the text bold.
 * @param str text to make bold
 */ export function bold(str) {
    return run(str, code([
        1
    ], 22));
}
/**
 * The text emits only a small amount of light.
 * @param str text to dim
 */ export function dim(str) {
    return run(str, code([
        2
    ], 22));
}
/**
 * Make the text italic.
 * @param str text to make italic
 */ export function italic(str) {
    return run(str, code([
        3
    ], 23));
}
/**
 * Make the text underline.
 * @param str text to underline
 */ export function underline(str) {
    return run(str, code([
        4
    ], 24));
}
/**
 * Invert background color and text color.
 * @param str text to invert its color
 */ export function inverse(str) {
    return run(str, code([
        7
    ], 27));
}
/**
 * Make the text hidden.
 * @param str text to hide
 */ export function hidden(str) {
    return run(str, code([
        8
    ], 28));
}
/**
 * Put horizontal line through the center of the text.
 * @param str text to strike through
 */ export function strikethrough(str) {
    return run(str, code([
        9
    ], 29));
}
/**
 * Set text color to black.
 * @param str text to make black
 */ export function black(str) {
    return run(str, code([
        30
    ], 39));
}
/**
 * Set text color to red.
 * @param str text to make red
 */ export function red(str) {
    return run(str, code([
        31
    ], 39));
}
/**
 * Set text color to green.
 * @param str text to make green
 */ export function green(str) {
    return run(str, code([
        32
    ], 39));
}
/**
 * Set text color to yellow.
 * @param str text to make yellow
 */ export function yellow(str) {
    return run(str, code([
        33
    ], 39));
}
/**
 * Set text color to blue.
 * @param str text to make blue
 */ export function blue(str) {
    return run(str, code([
        34
    ], 39));
}
/**
 * Set text color to magenta.
 * @param str text to make magenta
 */ export function magenta(str) {
    return run(str, code([
        35
    ], 39));
}
/**
 * Set text color to cyan.
 * @param str text to make cyan
 */ export function cyan(str) {
    return run(str, code([
        36
    ], 39));
}
/**
 * Set text color to white.
 * @param str text to make white
 */ export function white(str) {
    return run(str, code([
        37
    ], 39));
}
/**
 * Set text color to gray.
 * @param str text to make gray
 */ export function gray(str) {
    return brightBlack(str);
}
/**
 * Set text color to bright black.
 * @param str text to make bright-black
 */ export function brightBlack(str) {
    return run(str, code([
        90
    ], 39));
}
/**
 * Set text color to bright red.
 * @param str text to make bright-red
 */ export function brightRed(str) {
    return run(str, code([
        91
    ], 39));
}
/**
 * Set text color to bright green.
 * @param str text to make bright-green
 */ export function brightGreen(str) {
    return run(str, code([
        92
    ], 39));
}
/**
 * Set text color to bright yellow.
 * @param str text to make bright-yellow
 */ export function brightYellow(str) {
    return run(str, code([
        93
    ], 39));
}
/**
 * Set text color to bright blue.
 * @param str text to make bright-blue
 */ export function brightBlue(str) {
    return run(str, code([
        94
    ], 39));
}
/**
 * Set text color to bright magenta.
 * @param str text to make bright-magenta
 */ export function brightMagenta(str) {
    return run(str, code([
        95
    ], 39));
}
/**
 * Set text color to bright cyan.
 * @param str text to make bright-cyan
 */ export function brightCyan(str) {
    return run(str, code([
        96
    ], 39));
}
/**
 * Set text color to bright white.
 * @param str text to make bright-white
 */ export function brightWhite(str) {
    return run(str, code([
        97
    ], 39));
}
/**
 * Set background color to black.
 * @param str text to make its background black
 */ export function bgBlack(str) {
    return run(str, code([
        40
    ], 49));
}
/**
 * Set background color to red.
 * @param str text to make its background red
 */ export function bgRed(str) {
    return run(str, code([
        41
    ], 49));
}
/**
 * Set background color to green.
 * @param str text to make its background green
 */ export function bgGreen(str) {
    return run(str, code([
        42
    ], 49));
}
/**
 * Set background color to yellow.
 * @param str text to make its background yellow
 */ export function bgYellow(str) {
    return run(str, code([
        43
    ], 49));
}
/**
 * Set background color to blue.
 * @param str text to make its background blue
 */ export function bgBlue(str) {
    return run(str, code([
        44
    ], 49));
}
/**
 *  Set background color to magenta.
 * @param str text to make its background magenta
 */ export function bgMagenta(str) {
    return run(str, code([
        45
    ], 49));
}
/**
 * Set background color to cyan.
 * @param str text to make its background cyan
 */ export function bgCyan(str) {
    return run(str, code([
        46
    ], 49));
}
/**
 * Set background color to white.
 * @param str text to make its background white
 */ export function bgWhite(str) {
    return run(str, code([
        47
    ], 49));
}
/**
 * Set background color to bright black.
 * @param str text to make its background bright-black
 */ export function bgBrightBlack(str) {
    return run(str, code([
        100
    ], 49));
}
/**
 * Set background color to bright red.
 * @param str text to make its background bright-red
 */ export function bgBrightRed(str) {
    return run(str, code([
        101
    ], 49));
}
/**
 * Set background color to bright green.
 * @param str text to make its background bright-green
 */ export function bgBrightGreen(str) {
    return run(str, code([
        102
    ], 49));
}
/**
 * Set background color to bright yellow.
 * @param str text to make its background bright-yellow
 */ export function bgBrightYellow(str) {
    return run(str, code([
        103
    ], 49));
}
/**
 * Set background color to bright blue.
 * @param str text to make its background bright-blue
 */ export function bgBrightBlue(str) {
    return run(str, code([
        104
    ], 49));
}
/**
 * Set background color to bright magenta.
 * @param str text to make its background bright-magenta
 */ export function bgBrightMagenta(str) {
    return run(str, code([
        105
    ], 49));
}
/**
 * Set background color to bright cyan.
 * @param str text to make its background bright-cyan
 */ export function bgBrightCyan(str) {
    return run(str, code([
        106
    ], 49));
}
/**
 * Set background color to bright white.
 * @param str text to make its background bright-white
 */ export function bgBrightWhite(str) {
    return run(str, code([
        107
    ], 49));
}
/* Special Color Sequences */ /**
 * Clam and truncate color codes
 * @param n
 * @param max number to truncate to
 * @param min number to truncate from
 */ function clampAndTruncate(n, max = 255, min = 0) {
    return Math.trunc(Math.max(Math.min(n, max), min));
}
/**
 * Set text color using paletted 8bit colors.
 * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
 * @param str text color to apply paletted 8bit colors to
 * @param color code
 */ export function rgb8(str, color) {
    return run(str, code([
        38,
        5,
        clampAndTruncate(color)
    ], 39));
}
/**
 * Set background color using paletted 8bit colors.
 * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
 * @param str text color to apply paletted 8bit background colors to
 * @param color code
 */ export function bgRgb8(str, color) {
    return run(str, code([
        48,
        5,
        clampAndTruncate(color)
    ], 49));
}
/**
 * Set text color using 24bit rgb.
 * `color` can be a number in range `0x000000` to `0xffffff` or
 * an `Rgb`.
 *
 * To produce the color magenta:
 *
 *      rgb24("foo", 0xff00ff);
 *      rgb24("foo", {r: 255, g: 0, b: 255});
 * @param str text color to apply 24bit rgb to
 * @param color code
 */ export function rgb24(str, color) {
    if (typeof color === "number") {
        return run(str, code([
            38,
            2,
            color >> 16 & 0xff,
            color >> 8 & 0xff,
            color & 0xff
        ], 39));
    }
    return run(str, code([
        38,
        2,
        clampAndTruncate(color.r),
        clampAndTruncate(color.g),
        clampAndTruncate(color.b)
    ], 39));
}
/**
 * Set background color using 24bit rgb.
 * `color` can be a number in range `0x000000` to `0xffffff` or
 * an `Rgb`.
 *
 * To produce the color magenta:
 *
 *      bgRgb24("foo", 0xff00ff);
 *      bgRgb24("foo", {r: 255, g: 0, b: 255});
 * @param str text color to apply 24bit rgb to
 * @param color code
 */ export function bgRgb24(str, color) {
    if (typeof color === "number") {
        return run(str, code([
            48,
            2,
            color >> 16 & 0xff,
            color >> 8 & 0xff,
            color & 0xff
        ], 49));
    }
    return run(str, code([
        48,
        2,
        clampAndTruncate(color.r),
        clampAndTruncate(color.g),
        clampAndTruncate(color.b)
    ], 49));
}
// https://github.com/chalk/ansi-regex/blob/2b56fb0c7a07108e5b54241e8faec160d393aedb/index.js
const ANSI_PATTERN = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
].join("|"), "g");
/**
 * Remove ANSI escape codes from the string.
 * @param string to remove ANSI escape codes from
 */ export function stripColor(string) {
    return string.replace(ANSI_PATTERN, "");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjkyLjAvZm10L2NvbG9ycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQSBtb2R1bGUgdG8gcHJpbnQgQU5TSSB0ZXJtaW5hbCBjb2xvcnMuIEluc3BpcmVkIGJ5IGNoYWxrLCBrbGV1ciwgYW5kIGNvbG9yc1xuLy8gb24gbnBtLlxuLy9cbi8vIGBgYFxuLy8gaW1wb3J0IHsgYmdCbHVlLCByZWQsIGJvbGQgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkL2ZtdC9jb2xvcnMudHNcIjtcbi8vIGNvbnNvbGUubG9nKGJnQmx1ZShyZWQoYm9sZChcIkhlbGxvIHdvcmxkIVwiKSkpKTtcbi8vIGBgYFxuLy9cbi8vIFRoaXMgbW9kdWxlIHN1cHBvcnRzIGBOT19DT0xPUmAgZW52aXJvbm1lbnRhbCB2YXJpYWJsZSBkaXNhYmxpbmcgYW55IGNvbG9yaW5nXG4vLyBpZiBgTk9fQ09MT1JgIGlzIHNldC5cbi8vXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmNvbnN0IG5vQ29sb3IgPSBnbG9iYWxUaGlzLkRlbm8/Lm5vQ29sb3IgPz8gdHJ1ZTtcblxuaW50ZXJmYWNlIENvZGUge1xuICBvcGVuOiBzdHJpbmc7XG4gIGNsb3NlOiBzdHJpbmc7XG4gIHJlZ2V4cDogUmVnRXhwO1xufVxuXG4vKiogUkdCIDgtYml0cyBwZXIgY2hhbm5lbC4gRWFjaCBpbiByYW5nZSBgMC0+MjU1YCBvciBgMHgwMC0+MHhmZmAgKi9cbmludGVyZmFjZSBSZ2Ige1xuICByOiBudW1iZXI7XG4gIGc6IG51bWJlcjtcbiAgYjogbnVtYmVyO1xufVxuXG5sZXQgZW5hYmxlZCA9ICFub0NvbG9yO1xuXG4vKipcbiAqIFNldCBjaGFuZ2luZyB0ZXh0IGNvbG9yIHRvIGVuYWJsZWQgb3IgZGlzYWJsZWRcbiAqIEBwYXJhbSB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29sb3JFbmFibGVkKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChub0NvbG9yKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZW5hYmxlZCA9IHZhbHVlO1xufVxuXG4vKiogR2V0IHdoZXRoZXIgdGV4dCBjb2xvciBjaGFuZ2UgaXMgZW5hYmxlZCBvciBkaXNhYmxlZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2xvckVuYWJsZWQoKTogYm9vbGVhbiB7XG4gIHJldHVybiBlbmFibGVkO1xufVxuXG4vKipcbiAqIEJ1aWxkcyBjb2xvciBjb2RlXG4gKiBAcGFyYW0gb3BlblxuICogQHBhcmFtIGNsb3NlXG4gKi9cbmZ1bmN0aW9uIGNvZGUob3BlbjogbnVtYmVyW10sIGNsb3NlOiBudW1iZXIpOiBDb2RlIHtcbiAgcmV0dXJuIHtcbiAgICBvcGVuOiBgXFx4MWJbJHtvcGVuLmpvaW4oXCI7XCIpfW1gLFxuICAgIGNsb3NlOiBgXFx4MWJbJHtjbG9zZX1tYCxcbiAgICByZWdleHA6IG5ldyBSZWdFeHAoYFxcXFx4MWJcXFxcWyR7Y2xvc2V9bWAsIFwiZ1wiKSxcbiAgfTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGNvbG9yIGFuZCBiYWNrZ3JvdW5kIGJhc2VkIG9uIGNvbG9yIGNvZGUgYW5kIGl0cyBhc3NvY2lhdGVkIHRleHRcbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBhcHBseSBjb2xvciBzZXR0aW5ncyB0b1xuICogQHBhcmFtIGNvZGUgY29sb3IgY29kZSB0byBhcHBseVxuICovXG5mdW5jdGlvbiBydW4oc3RyOiBzdHJpbmcsIGNvZGU6IENvZGUpOiBzdHJpbmcge1xuICByZXR1cm4gZW5hYmxlZFxuICAgID8gYCR7Y29kZS5vcGVufSR7c3RyLnJlcGxhY2UoY29kZS5yZWdleHAsIGNvZGUub3Blbil9JHtjb2RlLmNsb3NlfWBcbiAgICA6IHN0cjtcbn1cblxuLyoqXG4gKiBSZXNldCB0aGUgdGV4dCBtb2RpZmllZFxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIHJlc2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFswXSwgMCkpO1xufVxuXG4vKipcbiAqIE1ha2UgdGhlIHRleHQgYm9sZC5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGJvbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJvbGQoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMV0sIDIyKSk7XG59XG5cbi8qKlxuICogVGhlIHRleHQgZW1pdHMgb25seSBhIHNtYWxsIGFtb3VudCBvZiBsaWdodC5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBkaW1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpbShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFsyXSwgMjIpKTtcbn1cblxuLyoqXG4gKiBNYWtlIHRoZSB0ZXh0IGl0YWxpYy5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGl0YWxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXRhbGljKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzNdLCAyMykpO1xufVxuXG4vKipcbiAqIE1ha2UgdGhlIHRleHQgdW5kZXJsaW5lLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIHVuZGVybGluZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5kZXJsaW5lKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzRdLCAyNCkpO1xufVxuXG4vKipcbiAqIEludmVydCBiYWNrZ3JvdW5kIGNvbG9yIGFuZCB0ZXh0IGNvbG9yLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIGludmVydCBpdHMgY29sb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2Uoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbN10sIDI3KSk7XG59XG5cbi8qKlxuICogTWFrZSB0aGUgdGV4dCBoaWRkZW4uXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gaGlkZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaGlkZGVuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzhdLCAyOCkpO1xufVxuXG4vKipcbiAqIFB1dCBob3Jpem9udGFsIGxpbmUgdGhyb3VnaCB0aGUgY2VudGVyIG9mIHRoZSB0ZXh0LlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIHN0cmlrZSB0aHJvdWdoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpa2V0aHJvdWdoKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzldLCAyOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGJsYWNrLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgYmxhY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJsYWNrKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzMwXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byByZWQuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSByZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszMV0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gZ3JlZW4uXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBncmVlblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JlZW4oc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMzJdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIHllbGxvdy5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIHllbGxvd1xuICovXG5leHBvcnQgZnVuY3Rpb24geWVsbG93KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzMzXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBibHVlLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgYmx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmx1ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszNF0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gbWFnZW50YS5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIG1hZ2VudGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hZ2VudGEoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcnVuKHN0ciwgY29kZShbMzVdLCAzOSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHRvIGN5YW4uXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBjeWFuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjeWFuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzM2XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byB3aGl0ZS5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIHdoaXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aGl0ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFszN10sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdG8gZ3JheS5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGdyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyYXkoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYnJpZ2h0QmxhY2soc3RyKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgYmxhY2suXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBicmlnaHQtYmxhY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJyaWdodEJsYWNrKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzkwXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgcmVkLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgYnJpZ2h0LXJlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYnJpZ2h0UmVkKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzkxXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgZ3JlZW4uXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBicmlnaHQtZ3JlZW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJyaWdodEdyZWVuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzkyXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgeWVsbG93LlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgYnJpZ2h0LXllbGxvd1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnJpZ2h0WWVsbG93KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzkzXSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgYmx1ZS5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGJyaWdodC1ibHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmlnaHRCbHVlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzk0XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgbWFnZW50YS5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGJyaWdodC1tYWdlbnRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmlnaHRNYWdlbnRhKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzk1XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgY3lhbi5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGJyaWdodC1jeWFuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBicmlnaHRDeWFuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzk2XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgdGV4dCBjb2xvciB0byBicmlnaHQgd2hpdGUuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBicmlnaHQtd2hpdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJyaWdodFdoaXRlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzk3XSwgMzkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBibGFjay5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJsYWNrXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JsYWNrKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzQwXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byByZWQuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCByZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnUmVkKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzQxXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBncmVlbi5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGdyZWVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0dyZWVuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzQyXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byB5ZWxsb3cuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCB5ZWxsb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnWWVsbG93KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzQzXSwgNDkpKTtcbn1cblxuLyoqXG4gKiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBibHVlLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYmx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCbHVlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzQ0XSwgNDkpKTtcbn1cblxuLyoqXG4gKiAgU2V0IGJhY2tncm91bmQgY29sb3IgdG8gbWFnZW50YS5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIG1hZ2VudGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnTWFnZW50YShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0NV0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gY3lhbi5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGN5YW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQ3lhbihzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0Nl0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gd2hpdGUuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCB3aGl0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdXaGl0ZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0N10sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IGJsYWNrLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYnJpZ2h0LWJsYWNrXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JyaWdodEJsYWNrKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwMF0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IHJlZC5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJyaWdodC1yZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQnJpZ2h0UmVkKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwMV0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IGdyZWVuLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYnJpZ2h0LWdyZWVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JyaWdodEdyZWVuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwMl0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IHllbGxvdy5cbiAqIEBwYXJhbSBzdHIgdGV4dCB0byBtYWtlIGl0cyBiYWNrZ3JvdW5kIGJyaWdodC15ZWxsb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnQnJpZ2h0WWVsbG93KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwM10sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IGJsdWUuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBicmlnaHQtYmx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRCbHVlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwNF0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IG1hZ2VudGEuXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBicmlnaHQtbWFnZW50YVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRNYWdlbnRhKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwNV0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IGN5YW4uXG4gKiBAcGFyYW0gc3RyIHRleHQgdG8gbWFrZSBpdHMgYmFja2dyb3VuZCBicmlnaHQtY3lhblxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdCcmlnaHRDeWFuKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwNl0sIDQ5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdG8gYnJpZ2h0IHdoaXRlLlxuICogQHBhcmFtIHN0ciB0ZXh0IHRvIG1ha2UgaXRzIGJhY2tncm91bmQgYnJpZ2h0LXdoaXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZ0JyaWdodFdoaXRlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzEwN10sIDQ5KSk7XG59XG5cbi8qIFNwZWNpYWwgQ29sb3IgU2VxdWVuY2VzICovXG5cbi8qKlxuICogQ2xhbSBhbmQgdHJ1bmNhdGUgY29sb3IgY29kZXNcbiAqIEBwYXJhbSBuXG4gKiBAcGFyYW0gbWF4IG51bWJlciB0byB0cnVuY2F0ZSB0b1xuICogQHBhcmFtIG1pbiBudW1iZXIgdG8gdHJ1bmNhdGUgZnJvbVxuICovXG5mdW5jdGlvbiBjbGFtcEFuZFRydW5jYXRlKG46IG51bWJlciwgbWF4ID0gMjU1LCBtaW4gPSAwKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgudHJ1bmMoTWF0aC5tYXgoTWF0aC5taW4obiwgbWF4KSwgbWluKSk7XG59XG5cbi8qKlxuICogU2V0IHRleHQgY29sb3IgdXNpbmcgcGFsZXR0ZWQgOGJpdCBjb2xvcnMuXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlIzgtYml0XG4gKiBAcGFyYW0gc3RyIHRleHQgY29sb3IgdG8gYXBwbHkgcGFsZXR0ZWQgOGJpdCBjb2xvcnMgdG9cbiAqIEBwYXJhbSBjb2xvciBjb2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZ2I4KHN0cjogc3RyaW5nLCBjb2xvcjogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJ1bihzdHIsIGNvZGUoWzM4LCA1LCBjbGFtcEFuZFRydW5jYXRlKGNvbG9yKV0sIDM5KSk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdXNpbmcgcGFsZXR0ZWQgOGJpdCBjb2xvcnMuXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlIzgtYml0XG4gKiBAcGFyYW0gc3RyIHRleHQgY29sb3IgdG8gYXBwbHkgcGFsZXR0ZWQgOGJpdCBiYWNrZ3JvdW5kIGNvbG9ycyB0b1xuICogQHBhcmFtIGNvbG9yIGNvZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJnUmdiOChzdHI6IHN0cmluZywgY29sb3I6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBydW4oc3RyLCBjb2RlKFs0OCwgNSwgY2xhbXBBbmRUcnVuY2F0ZShjb2xvcildLCA0OSkpO1xufVxuXG4vKipcbiAqIFNldCB0ZXh0IGNvbG9yIHVzaW5nIDI0Yml0IHJnYi5cbiAqIGBjb2xvcmAgY2FuIGJlIGEgbnVtYmVyIGluIHJhbmdlIGAweDAwMDAwMGAgdG8gYDB4ZmZmZmZmYCBvclxuICogYW4gYFJnYmAuXG4gKlxuICogVG8gcHJvZHVjZSB0aGUgY29sb3IgbWFnZW50YTpcbiAqXG4gKiAgICAgIHJnYjI0KFwiZm9vXCIsIDB4ZmYwMGZmKTtcbiAqICAgICAgcmdiMjQoXCJmb29cIiwge3I6IDI1NSwgZzogMCwgYjogMjU1fSk7XG4gKiBAcGFyYW0gc3RyIHRleHQgY29sb3IgdG8gYXBwbHkgMjRiaXQgcmdiIHRvXG4gKiBAcGFyYW0gY29sb3IgY29kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmdiMjQoc3RyOiBzdHJpbmcsIGNvbG9yOiBudW1iZXIgfCBSZ2IpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgcmV0dXJuIHJ1bihcbiAgICAgIHN0cixcbiAgICAgIGNvZGUoXG4gICAgICAgIFszOCwgMiwgKGNvbG9yID4+IDE2KSAmIDB4ZmYsIChjb2xvciA+PiA4KSAmIDB4ZmYsIGNvbG9yICYgMHhmZl0sXG4gICAgICAgIDM5LFxuICAgICAgKSxcbiAgICApO1xuICB9XG4gIHJldHVybiBydW4oXG4gICAgc3RyLFxuICAgIGNvZGUoXG4gICAgICBbXG4gICAgICAgIDM4LFxuICAgICAgICAyLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLnIpLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLmcpLFxuICAgICAgICBjbGFtcEFuZFRydW5jYXRlKGNvbG9yLmIpLFxuICAgICAgXSxcbiAgICAgIDM5LFxuICAgICksXG4gICk7XG59XG5cbi8qKlxuICogU2V0IGJhY2tncm91bmQgY29sb3IgdXNpbmcgMjRiaXQgcmdiLlxuICogYGNvbG9yYCBjYW4gYmUgYSBudW1iZXIgaW4gcmFuZ2UgYDB4MDAwMDAwYCB0byBgMHhmZmZmZmZgIG9yXG4gKiBhbiBgUmdiYC5cbiAqXG4gKiBUbyBwcm9kdWNlIHRoZSBjb2xvciBtYWdlbnRhOlxuICpcbiAqICAgICAgYmdSZ2IyNChcImZvb1wiLCAweGZmMDBmZik7XG4gKiAgICAgIGJnUmdiMjQoXCJmb29cIiwge3I6IDI1NSwgZzogMCwgYjogMjU1fSk7XG4gKiBAcGFyYW0gc3RyIHRleHQgY29sb3IgdG8gYXBwbHkgMjRiaXQgcmdiIHRvXG4gKiBAcGFyYW0gY29sb3IgY29kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmdSZ2IyNChzdHI6IHN0cmluZywgY29sb3I6IG51bWJlciB8IFJnYik6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICByZXR1cm4gcnVuKFxuICAgICAgc3RyLFxuICAgICAgY29kZShcbiAgICAgICAgWzQ4LCAyLCAoY29sb3IgPj4gMTYpICYgMHhmZiwgKGNvbG9yID4+IDgpICYgMHhmZiwgY29sb3IgJiAweGZmXSxcbiAgICAgICAgNDksXG4gICAgICApLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJ1bihcbiAgICBzdHIsXG4gICAgY29kZShcbiAgICAgIFtcbiAgICAgICAgNDgsXG4gICAgICAgIDIsXG4gICAgICAgIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IuciksXG4gICAgICAgIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IuZyksXG4gICAgICAgIGNsYW1wQW5kVHJ1bmNhdGUoY29sb3IuYiksXG4gICAgICBdLFxuICAgICAgNDksXG4gICAgKSxcbiAgKTtcbn1cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2NoYWxrL2Fuc2ktcmVnZXgvYmxvYi8yYjU2ZmIwYzdhMDcxMDhlNWI1NDI0MWU4ZmFlYzE2MGQzOTNhZWRiL2luZGV4LmpzXG5jb25zdCBBTlNJX1BBVFRFUk4gPSBuZXcgUmVnRXhwKFxuICBbXG4gICAgXCJbXFxcXHUwMDFCXFxcXHUwMDlCXVtbXFxcXF0oKSM7P10qKD86KD86KD86W2EtekEtWlxcXFxkXSooPzo7Wy1hLXpBLVpcXFxcZFxcXFwvIyYuOj0/JUB+X10qKSopP1xcXFx1MDAwNylcIixcbiAgICBcIig/Oig/OlxcXFxkezEsNH0oPzo7XFxcXGR7MCw0fSkqKT9bXFxcXGRBLVBSLVRaY2YtbnRxcnk9Pjx+XSkpXCIsXG4gIF0uam9pbihcInxcIiksXG4gIFwiZ1wiLFxuKTtcblxuLyoqXG4gKiBSZW1vdmUgQU5TSSBlc2NhcGUgY29kZXMgZnJvbSB0aGUgc3RyaW5nLlxuICogQHBhcmFtIHN0cmluZyB0byByZW1vdmUgQU5TSSBlc2NhcGUgY29kZXMgZnJvbVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBDb2xvcihzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShBTlNJX1BBVFRFUk4sIFwiXCIpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSwrRUFBK0U7QUFDL0UsVUFBVTtBQUNWLEVBQUU7QUFDRixNQUFNO0FBQ04sMkVBQTJFO0FBQzNFLGtEQUFrRDtBQUNsRCxNQUFNO0FBQ04sRUFBRTtBQUNGLGdGQUFnRjtBQUNoRix3QkFBd0I7QUFDeEIsRUFBRTtBQUNGLHFDQUFxQztBQUVyQyxNQUFNLFVBQVUsV0FBVyxJQUFJLEVBQUUsV0FBVyxJQUFJO0FBZWhELElBQUksVUFBVSxDQUFDO0FBRWY7OztDQUdDLEdBQ0QsT0FBTyxTQUFTLGdCQUFnQixLQUFjLEVBQVE7SUFDcEQsSUFBSSxTQUFTO1FBQ1g7SUFDRixDQUFDO0lBRUQsVUFBVTtBQUNaLENBQUM7QUFFRCwwREFBMEQsR0FDMUQsT0FBTyxTQUFTLGtCQUEyQjtJQUN6QyxPQUFPO0FBQ1QsQ0FBQztBQUVEOzs7O0NB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