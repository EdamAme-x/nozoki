// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
/** HTTP status codes */ export var Status;
(function(Status) {
    Status[Status[/** RFC 7231, 6.2.1 */ "Continue"] = 100] = "Continue";
    Status[Status[/** RFC 7231, 6.2.2 */ "SwitchingProtocols"] = 101] = "SwitchingProtocols";
    Status[Status[/** RFC 2518, 10.1 */ "Processing"] = 102] = "Processing";
    Status[Status[/** RFC 8297 **/ "EarlyHints"] = 103] = "EarlyHints";
    Status[Status[/** RFC 7231, 6.3.1 */ "OK"] = 200] = "OK";
    Status[Status[/** RFC 7231, 6.3.2 */ "Created"] = 201] = "Created";
    Status[Status[/** RFC 7231, 6.3.3 */ "Accepted"] = 202] = "Accepted";
    Status[Status[/** RFC 7231, 6.3.4 */ "NonAuthoritativeInfo"] = 203] = "NonAuthoritativeInfo";
    Status[Status[/** RFC 7231, 6.3.5 */ "NoContent"] = 204] = "NoContent";
    Status[Status[/** RFC 7231, 6.3.6 */ "ResetContent"] = 205] = "ResetContent";
    Status[Status[/** RFC 7233, 4.1 */ "PartialContent"] = 206] = "PartialContent";
    Status[Status[/** RFC 4918, 11.1 */ "MultiStatus"] = 207] = "MultiStatus";
    Status[Status[/** RFC 5842, 7.1 */ "AlreadyReported"] = 208] = "AlreadyReported";
    Status[Status[/** RFC 3229, 10.4.1 */ "IMUsed"] = 226] = "IMUsed";
    Status[Status[/** RFC 7231, 6.4.1 */ "MultipleChoices"] = 300] = "MultipleChoices";
    Status[Status[/** RFC 7231, 6.4.2 */ "MovedPermanently"] = 301] = "MovedPermanently";
    Status[Status[/** RFC 7231, 6.4.3 */ "Found"] = 302] = "Found";
    Status[Status[/** RFC 7231, 6.4.4 */ "SeeOther"] = 303] = "SeeOther";
    Status[Status[/** RFC 7232, 4.1 */ "NotModified"] = 304] = "NotModified";
    Status[Status[/** RFC 7231, 6.4.5 */ "UseProxy"] = 305] = "UseProxy";
    Status[Status[/** RFC 7231, 6.4.7 */ "TemporaryRedirect"] = 307] = "TemporaryRedirect";
    Status[Status[/** RFC 7538, 3 */ "PermanentRedirect"] = 308] = "PermanentRedirect";
    Status[Status[/** RFC 7231, 6.5.1 */ "BadRequest"] = 400] = "BadRequest";
    Status[Status[/** RFC 7235, 3.1 */ "Unauthorized"] = 401] = "Unauthorized";
    Status[Status[/** RFC 7231, 6.5.2 */ "PaymentRequired"] = 402] = "PaymentRequired";
    Status[Status[/** RFC 7231, 6.5.3 */ "Forbidden"] = 403] = "Forbidden";
    Status[Status[/** RFC 7231, 6.5.4 */ "NotFound"] = 404] = "NotFound";
    Status[Status[/** RFC 7231, 6.5.5 */ "MethodNotAllowed"] = 405] = "MethodNotAllowed";
    Status[Status[/** RFC 7231, 6.5.6 */ "NotAcceptable"] = 406] = "NotAcceptable";
    Status[Status[/** RFC 7235, 3.2 */ "ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
    Status[Status[/** RFC 7231, 6.5.7 */ "RequestTimeout"] = 408] = "RequestTimeout";
    Status[Status[/** RFC 7231, 6.5.8 */ "Conflict"] = 409] = "Conflict";
    Status[Status[/** RFC 7231, 6.5.9 */ "Gone"] = 410] = "Gone";
    Status[Status[/** RFC 7231, 6.5.10 */ "LengthRequired"] = 411] = "LengthRequired";
    Status[Status[/** RFC 7232, 4.2 */ "PreconditionFailed"] = 412] = "PreconditionFailed";
    Status[Status[/** RFC 7231, 6.5.11 */ "RequestEntityTooLarge"] = 413] = "RequestEntityTooLarge";
    Status[Status[/** RFC 7231, 6.5.12 */ "RequestURITooLong"] = 414] = "RequestURITooLong";
    Status[Status[/** RFC 7231, 6.5.13 */ "UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    Status[Status[/** RFC 7233, 4.4 */ "RequestedRangeNotSatisfiable"] = 416] = "RequestedRangeNotSatisfiable";
    Status[Status[/** RFC 7231, 6.5.14 */ "ExpectationFailed"] = 417] = "ExpectationFailed";
    Status[Status[/** RFC 7168, 2.3.3 */ "Teapot"] = 418] = "Teapot";
    Status[Status[/** RFC 7540, 9.1.2 */ "MisdirectedRequest"] = 421] = "MisdirectedRequest";
    Status[Status[/** RFC 4918, 11.2 */ "UnprocessableEntity"] = 422] = "UnprocessableEntity";
    Status[Status[/** RFC 4918, 11.3 */ "Locked"] = 423] = "Locked";
    Status[Status[/** RFC 4918, 11.4 */ "FailedDependency"] = 424] = "FailedDependency";
    Status[Status[/** RFC 8470, 5.2 */ "TooEarly"] = 425] = "TooEarly";
    Status[Status[/** RFC 7231, 6.5.15 */ "UpgradeRequired"] = 426] = "UpgradeRequired";
    Status[Status[/** RFC 6585, 3 */ "PreconditionRequired"] = 428] = "PreconditionRequired";
    Status[Status[/** RFC 6585, 4 */ "TooManyRequests"] = 429] = "TooManyRequests";
    Status[Status[/** RFC 6585, 5 */ "RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
    Status[Status[/** RFC 7725, 3 */ "UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
    Status[Status[/** RFC 7231, 6.6.1 */ "InternalServerError"] = 500] = "InternalServerError";
    Status[Status[/** RFC 7231, 6.6.2 */ "NotImplemented"] = 501] = "NotImplemented";
    Status[Status[/** RFC 7231, 6.6.3 */ "BadGateway"] = 502] = "BadGateway";
    Status[Status[/** RFC 7231, 6.6.4 */ "ServiceUnavailable"] = 503] = "ServiceUnavailable";
    Status[Status[/** RFC 7231, 6.6.5 */ "GatewayTimeout"] = 504] = "GatewayTimeout";
    Status[Status[/** RFC 7231, 6.6.6 */ "HTTPVersionNotSupported"] = 505] = "HTTPVersionNotSupported";
    Status[Status[/** RFC 2295, 8.1 */ "VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
    Status[Status[/** RFC 4918, 11.5 */ "InsufficientStorage"] = 507] = "InsufficientStorage";
    Status[Status[/** RFC 5842, 7.2 */ "LoopDetected"] = 508] = "LoopDetected";
    Status[Status[/** RFC 2774, 7 */ "NotExtended"] = 510] = "NotExtended";
    Status[Status[/** RFC 6585, 6 */ "NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(Status || (Status = {}));
export const STATUS_TEXT = new Map([
    [
        Status.Continue,
        "Continue"
    ],
    [
        Status.SwitchingProtocols,
        "Switching Protocols"
    ],
    [
        Status.Processing,
        "Processing"
    ],
    [
        Status.EarlyHints,
        "Early Hints"
    ],
    [
        Status.OK,
        "OK"
    ],
    [
        Status.Created,
        "Created"
    ],
    [
        Status.Accepted,
        "Accepted"
    ],
    [
        Status.NonAuthoritativeInfo,
        "Non-Authoritative Information"
    ],
    [
        Status.NoContent,
        "No Content"
    ],
    [
        Status.ResetContent,
        "Reset Content"
    ],
    [
        Status.PartialContent,
        "Partial Content"
    ],
    [
        Status.MultiStatus,
        "Multi-Status"
    ],
    [
        Status.AlreadyReported,
        "Already Reported"
    ],
    [
        Status.IMUsed,
        "IM Used"
    ],
    [
        Status.MultipleChoices,
        "Multiple Choices"
    ],
    [
        Status.MovedPermanently,
        "Moved Permanently"
    ],
    [
        Status.Found,
        "Found"
    ],
    [
        Status.SeeOther,
        "See Other"
    ],
    [
        Status.NotModified,
        "Not Modified"
    ],
    [
        Status.UseProxy,
        "Use Proxy"
    ],
    [
        Status.TemporaryRedirect,
        "Temporary Redirect"
    ],
    [
        Status.PermanentRedirect,
        "Permanent Redirect"
    ],
    [
        Status.BadRequest,
        "Bad Request"
    ],
    [
        Status.Unauthorized,
        "Unauthorized"
    ],
    [
        Status.PaymentRequired,
        "Payment Required"
    ],
    [
        Status.Forbidden,
        "Forbidden"
    ],
    [
        Status.NotFound,
        "Not Found"
    ],
    [
        Status.MethodNotAllowed,
        "Method Not Allowed"
    ],
    [
        Status.NotAcceptable,
        "Not Acceptable"
    ],
    [
        Status.ProxyAuthRequired,
        "Proxy Authentication Required"
    ],
    [
        Status.RequestTimeout,
        "Request Timeout"
    ],
    [
        Status.Conflict,
        "Conflict"
    ],
    [
        Status.Gone,
        "Gone"
    ],
    [
        Status.LengthRequired,
        "Length Required"
    ],
    [
        Status.PreconditionFailed,
        "Precondition Failed"
    ],
    [
        Status.RequestEntityTooLarge,
        "Request Entity Too Large"
    ],
    [
        Status.RequestURITooLong,
        "Request URI Too Long"
    ],
    [
        Status.UnsupportedMediaType,
        "Unsupported Media Type"
    ],
    [
        Status.RequestedRangeNotSatisfiable,
        "Requested Range Not Satisfiable"
    ],
    [
        Status.ExpectationFailed,
        "Expectation Failed"
    ],
    [
        Status.Teapot,
        "I'm a teapot"
    ],
    [
        Status.MisdirectedRequest,
        "Misdirected Request"
    ],
    [
        Status.UnprocessableEntity,
        "Unprocessable Entity"
    ],
    [
        Status.Locked,
        "Locked"
    ],
    [
        Status.FailedDependency,
        "Failed Dependency"
    ],
    [
        Status.TooEarly,
        "Too Early"
    ],
    [
        Status.UpgradeRequired,
        "Upgrade Required"
    ],
    [
        Status.PreconditionRequired,
        "Precondition Required"
    ],
    [
        Status.TooManyRequests,
        "Too Many Requests"
    ],
    [
        Status.RequestHeaderFieldsTooLarge,
        "Request Header Fields Too Large"
    ],
    [
        Status.UnavailableForLegalReasons,
        "Unavailable For Legal Reasons"
    ],
    [
        Status.InternalServerError,
        "Internal Server Error"
    ],
    [
        Status.NotImplemented,
        "Not Implemented"
    ],
    [
        Status.BadGateway,
        "Bad Gateway"
    ],
    [
        Status.ServiceUnavailable,
        "Service Unavailable"
    ],
    [
        Status.GatewayTimeout,
        "Gateway Timeout"
    ],
    [
        Status.HTTPVersionNotSupported,
        "HTTP Version Not Supported"
    ],
    [
        Status.VariantAlsoNegotiates,
        "Variant Also Negotiates"
    ],
    [
        Status.InsufficientStorage,
        "Insufficient Storage"
    ],
    [
        Status.LoopDetected,
        "Loop Detected"
    ],
    [
        Status.NotExtended,
        "Not Extended"
    ],
    [
        Status.NetworkAuthenticationRequired,
        "Network Authentication Required"
    ]
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjkyLjAvaHR0cC9odHRwX3N0YXR1cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIxIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG4vKiogSFRUUCBzdGF0dXMgY29kZXMgKi9cbmV4cG9ydCBlbnVtIFN0YXR1cyB7XG4gIC8qKiBSRkMgNzIzMSwgNi4yLjEgKi9cbiAgQ29udGludWUgPSAxMDAsXG4gIC8qKiBSRkMgNzIzMSwgNi4yLjIgKi9cbiAgU3dpdGNoaW5nUHJvdG9jb2xzID0gMTAxLFxuICAvKiogUkZDIDI1MTgsIDEwLjEgKi9cbiAgUHJvY2Vzc2luZyA9IDEwMixcbiAgLyoqIFJGQyA4Mjk3ICoqL1xuICBFYXJseUhpbnRzID0gMTAzLFxuICAvKiogUkZDIDcyMzEsIDYuMy4xICovXG4gIE9LID0gMjAwLFxuICAvKiogUkZDIDcyMzEsIDYuMy4yICovXG4gIENyZWF0ZWQgPSAyMDEsXG4gIC8qKiBSRkMgNzIzMSwgNi4zLjMgKi9cbiAgQWNjZXB0ZWQgPSAyMDIsXG4gIC8qKiBSRkMgNzIzMSwgNi4zLjQgKi9cbiAgTm9uQXV0aG9yaXRhdGl2ZUluZm8gPSAyMDMsXG4gIC8qKiBSRkMgNzIzMSwgNi4zLjUgKi9cbiAgTm9Db250ZW50ID0gMjA0LFxuICAvKiogUkZDIDcyMzEsIDYuMy42ICovXG4gIFJlc2V0Q29udGVudCA9IDIwNSxcbiAgLyoqIFJGQyA3MjMzLCA0LjEgKi9cbiAgUGFydGlhbENvbnRlbnQgPSAyMDYsXG4gIC8qKiBSRkMgNDkxOCwgMTEuMSAqL1xuICBNdWx0aVN0YXR1cyA9IDIwNyxcbiAgLyoqIFJGQyA1ODQyLCA3LjEgKi9cbiAgQWxyZWFkeVJlcG9ydGVkID0gMjA4LFxuICAvKiogUkZDIDMyMjksIDEwLjQuMSAqL1xuICBJTVVzZWQgPSAyMjYsXG5cbiAgLyoqIFJGQyA3MjMxLCA2LjQuMSAqL1xuICBNdWx0aXBsZUNob2ljZXMgPSAzMDAsXG4gIC8qKiBSRkMgNzIzMSwgNi40LjIgKi9cbiAgTW92ZWRQZXJtYW5lbnRseSA9IDMwMSxcbiAgLyoqIFJGQyA3MjMxLCA2LjQuMyAqL1xuICBGb3VuZCA9IDMwMixcbiAgLyoqIFJGQyA3MjMxLCA2LjQuNCAqL1xuICBTZWVPdGhlciA9IDMwMyxcbiAgLyoqIFJGQyA3MjMyLCA0LjEgKi9cbiAgTm90TW9kaWZpZWQgPSAzMDQsXG4gIC8qKiBSRkMgNzIzMSwgNi40LjUgKi9cbiAgVXNlUHJveHkgPSAzMDUsXG4gIC8qKiBSRkMgNzIzMSwgNi40LjcgKi9cbiAgVGVtcG9yYXJ5UmVkaXJlY3QgPSAzMDcsXG4gIC8qKiBSRkMgNzUzOCwgMyAqL1xuICBQZXJtYW5lbnRSZWRpcmVjdCA9IDMwOCxcblxuICAvKiogUkZDIDcyMzEsIDYuNS4xICovXG4gIEJhZFJlcXVlc3QgPSA0MDAsXG4gIC8qKiBSRkMgNzIzNSwgMy4xICovXG4gIFVuYXV0aG9yaXplZCA9IDQwMSxcbiAgLyoqIFJGQyA3MjMxLCA2LjUuMiAqL1xuICBQYXltZW50UmVxdWlyZWQgPSA0MDIsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjMgKi9cbiAgRm9yYmlkZGVuID0gNDAzLFxuICAvKiogUkZDIDcyMzEsIDYuNS40ICovXG4gIE5vdEZvdW5kID0gNDA0LFxuICAvKiogUkZDIDcyMzEsIDYuNS41ICovXG4gIE1ldGhvZE5vdEFsbG93ZWQgPSA0MDUsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjYgKi9cbiAgTm90QWNjZXB0YWJsZSA9IDQwNixcbiAgLyoqIFJGQyA3MjM1LCAzLjIgKi9cbiAgUHJveHlBdXRoUmVxdWlyZWQgPSA0MDcsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjcgKi9cbiAgUmVxdWVzdFRpbWVvdXQgPSA0MDgsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjggKi9cbiAgQ29uZmxpY3QgPSA0MDksXG4gIC8qKiBSRkMgNzIzMSwgNi41LjkgKi9cbiAgR29uZSA9IDQxMCxcbiAgLyoqIFJGQyA3MjMxLCA2LjUuMTAgKi9cbiAgTGVuZ3RoUmVxdWlyZWQgPSA0MTEsXG4gIC8qKiBSRkMgNzIzMiwgNC4yICovXG4gIFByZWNvbmRpdGlvbkZhaWxlZCA9IDQxMixcbiAgLyoqIFJGQyA3MjMxLCA2LjUuMTEgKi9cbiAgUmVxdWVzdEVudGl0eVRvb0xhcmdlID0gNDEzLFxuICAvKiogUkZDIDcyMzEsIDYuNS4xMiAqL1xuICBSZXF1ZXN0VVJJVG9vTG9uZyA9IDQxNCxcbiAgLyoqIFJGQyA3MjMxLCA2LjUuMTMgKi9cbiAgVW5zdXBwb3J0ZWRNZWRpYVR5cGUgPSA0MTUsXG4gIC8qKiBSRkMgNzIzMywgNC40ICovXG4gIFJlcXVlc3RlZFJhbmdlTm90U2F0aXNmaWFibGUgPSA0MTYsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjE0ICovXG4gIEV4cGVjdGF0aW9uRmFpbGVkID0gNDE3LFxuICAvKiogUkZDIDcxNjgsIDIuMy4zICovXG4gIFRlYXBvdCA9IDQxOCxcbiAgLyoqIFJGQyA3NTQwLCA5LjEuMiAqL1xuICBNaXNkaXJlY3RlZFJlcXVlc3QgPSA0MjEsXG4gIC8qKiBSRkMgNDkxOCwgMTEuMiAqL1xuICBVbnByb2Nlc3NhYmxlRW50aXR5ID0gNDIyLFxuICAvKiogUkZDIDQ5MTgsIDExLjMgKi9cbiAgTG9ja2VkID0gNDIzLFxuICAvKiogUkZDIDQ5MTgsIDExLjQgKi9cbiAgRmFpbGVkRGVwZW5kZW5jeSA9IDQyNCxcbiAgLyoqIFJGQyA4NDcwLCA1LjIgKi9cbiAgVG9vRWFybHkgPSA0MjUsXG4gIC8qKiBSRkMgNzIzMSwgNi41LjE1ICovXG4gIFVwZ3JhZGVSZXF1aXJlZCA9IDQyNixcbiAgLyoqIFJGQyA2NTg1LCAzICovXG4gIFByZWNvbmRpdGlvblJlcXVpcmVkID0gNDI4LFxuICAvKiogUkZDIDY1ODUsIDQgKi9cbiAgVG9vTWFueVJlcXVlc3RzID0gNDI5LFxuICAvKiogUkZDIDY1ODUsIDUgKi9cbiAgUmVxdWVzdEhlYWRlckZpZWxkc1Rvb0xhcmdlID0gNDMxLFxuICAvKiogUkZDIDc3MjUsIDMgKi9cbiAgVW5hdmFpbGFibGVGb3JMZWdhbFJlYXNvbnMgPSA0NTEsXG5cbiAgLyoqIFJGQyA3MjMxLCA2LjYuMSAqL1xuICBJbnRlcm5hbFNlcnZlckVycm9yID0gNTAwLFxuICAvKiogUkZDIDcyMzEsIDYuNi4yICovXG4gIE5vdEltcGxlbWVudGVkID0gNTAxLFxuICAvKiogUkZDIDcyMzEsIDYuNi4zICovXG4gIEJhZEdhdGV3YXkgPSA1MDIsXG4gIC8qKiBSRkMgNzIzMSwgNi42LjQgKi9cbiAgU2VydmljZVVuYXZhaWxhYmxlID0gNTAzLFxuICAvKiogUkZDIDcyMzEsIDYuNi41ICovXG4gIEdhdGV3YXlUaW1lb3V0ID0gNTA0LFxuICAvKiogUkZDIDcyMzEsIDYuNi42ICovXG4gIEhUVFBWZXJzaW9uTm90U3VwcG9ydGVkID0gNTA1LFxuICAvKiogUkZDIDIyOTUsIDguMSAqL1xuICBWYXJpYW50QWxzb05lZ290aWF0ZXMgPSA1MDYsXG4gIC8qKiBSRkMgNDkxOCwgMTEuNSAqL1xuICBJbnN1ZmZpY2llbnRTdG9yYWdlID0gNTA3LFxuICAvKiogUkZDIDU4NDIsIDcuMiAqL1xuICBMb29wRGV0ZWN0ZWQgPSA1MDgsXG4gIC8qKiBSRkMgMjc3NCwgNyAqL1xuICBOb3RFeHRlbmRlZCA9IDUxMCxcbiAgLyoqIFJGQyA2NTg1LCA2ICovXG4gIE5ldHdvcmtBdXRoZW50aWNhdGlvblJlcXVpcmVkID0gNTExLFxufVxuXG5leHBvcnQgY29uc3QgU1RBVFVTX1RFWFQgPSBuZXcgTWFwPFN0YXR1cywgc3RyaW5nPihbXG4gIFtTdGF0dXMuQ29udGludWUsIFwiQ29udGludWVcIl0sXG4gIFtTdGF0dXMuU3dpdGNoaW5nUHJvdG9jb2xzLCBcIlN3aXRjaGluZyBQcm90b2NvbHNcIl0sXG4gIFtTdGF0dXMuUHJvY2Vzc2luZywgXCJQcm9jZXNzaW5nXCJdLFxuICBbU3RhdHVzLkVhcmx5SGludHMsIFwiRWFybHkgSGludHNcIl0sXG4gIFtTdGF0dXMuT0ssIFwiT0tcIl0sXG4gIFtTdGF0dXMuQ3JlYXRlZCwgXCJDcmVhdGVkXCJdLFxuICBbU3RhdHVzLkFjY2VwdGVkLCBcIkFjY2VwdGVkXCJdLFxuICBbU3RhdHVzLk5vbkF1dGhvcml0YXRpdmVJbmZvLCBcIk5vbi1BdXRob3JpdGF0aXZlIEluZm9ybWF0aW9uXCJdLFxuICBbU3RhdHVzLk5vQ29udGVudCwgXCJObyBDb250ZW50XCJdLFxuICBbU3RhdHVzLlJlc2V0Q29udGVudCwgXCJSZXNldCBDb250ZW50XCJdLFxuICBbU3RhdHVzLlBhcnRpYWxDb250ZW50LCBcIlBhcnRpYWwgQ29udGVudFwiXSxcbiAgW1N0YXR1cy5NdWx0aVN0YXR1cywgXCJNdWx0aS1TdGF0dXNcIl0sXG4gIFtTdGF0dXMuQWxyZWFkeVJlcG9ydGVkLCBcIkFscmVhZHkgUmVwb3J0ZWRcIl0sXG4gIFtTdGF0dXMuSU1Vc2VkLCBcIklNIFVzZWRcIl0sXG4gIFtTdGF0dXMuTXVsdGlwbGVDaG9pY2VzLCBcIk11bHRpcGxlIENob2ljZXNcIl0sXG4gIFtTdGF0dXMuTW92ZWRQZXJtYW5lbnRseSwgXCJNb3ZlZCBQZXJtYW5lbnRseVwiXSxcbiAgW1N0YXR1cy5Gb3VuZCwgXCJGb3VuZFwiXSxcbiAgW1N0YXR1cy5TZWVPdGhlciwgXCJTZWUgT3RoZXJcIl0sXG4gIFtTdGF0dXMuTm90TW9kaWZpZWQsIFwiTm90IE1vZGlmaWVkXCJdLFxuICBbU3RhdHVzLlVzZVByb3h5LCBcIlVzZSBQcm94eVwiXSxcbiAgW1N0YXR1cy5UZW1wb3JhcnlSZWRpcmVjdCwgXCJUZW1wb3JhcnkgUmVkaXJlY3RcIl0sXG4gIFtTdGF0dXMuUGVybWFuZW50UmVkaXJlY3QsIFwiUGVybWFuZW50IFJlZGlyZWN0XCJdLFxuICBbU3RhdHVzLkJhZFJlcXVlc3QsIFwiQmFkIFJlcXVlc3RcIl0sXG4gIFtTdGF0dXMuVW5hdXRob3JpemVkLCBcIlVuYXV0aG9yaXplZFwiXSxcbiAgW1N0YXR1cy5QYXltZW50UmVxdWlyZWQsIFwiUGF5bWVudCBSZXF1aXJlZFwiXSxcbiAgW1N0YXR1cy5Gb3JiaWRkZW4sIFwiRm9yYmlkZGVuXCJdLFxuICBbU3RhdHVzLk5vdEZvdW5kLCBcIk5vdCBGb3VuZFwiXSxcbiAgW1N0YXR1cy5NZXRob2ROb3RBbGxvd2VkLCBcIk1ldGhvZCBOb3QgQWxsb3dlZFwiXSxcbiAgW1N0YXR1cy5Ob3RBY2NlcHRhYmxlLCBcIk5vdCBBY2NlcHRhYmxlXCJdLFxuICBbU3RhdHVzLlByb3h5QXV0aFJlcXVpcmVkLCBcIlByb3h5IEF1dGhlbnRpY2F0aW9uIFJlcXVpcmVkXCJdLFxuICBbU3RhdHVzLlJlcXVlc3RUaW1lb3V0LCBcIlJlcXVlc3QgVGltZW91dFwiXSxcbiAgW1N0YXR1cy5Db25mbGljdCwgXCJDb25mbGljdFwiXSxcbiAgW1N0YXR1cy5Hb25lLCBcIkdvbmVcIl0sXG4gIFtTdGF0dXMuTGVuZ3RoUmVxdWlyZWQsIFwiTGVuZ3RoIFJlcXVpcmVkXCJdLFxuICBbU3RhdHVzLlByZWNvbmRpdGlvbkZhaWxlZCwgXCJQcmVjb25kaXRpb24gRmFpbGVkXCJdLFxuICBbU3RhdHVzLlJlcXVlc3RFbnRpdHlUb29MYXJnZSwgXCJSZXF1ZXN0IEVudGl0eSBUb28gTGFyZ2VcIl0sXG4gIFtTdGF0dXMuUmVxdWVzdFVSSVRvb0xvbmcsIFwiUmVxdWVzdCBVUkkgVG9vIExvbmdcIl0sXG4gIFtTdGF0dXMuVW5zdXBwb3J0ZWRNZWRpYVR5cGUsIFwiVW5zdXBwb3J0ZWQgTWVkaWEgVHlwZVwiXSxcbiAgW1N0YXR1cy5SZXF1ZXN0ZWRSYW5nZU5vdFNhdGlzZmlhYmxlLCBcIlJlcXVlc3RlZCBSYW5nZSBOb3QgU2F0aXNmaWFibGVcIl0sXG4gIFtTdGF0dXMuRXhwZWN0YXRpb25GYWlsZWQsIFwiRXhwZWN0YXRpb24gRmFpbGVkXCJdLFxuICBbU3RhdHVzLlRlYXBvdCwgXCJJJ20gYSB0ZWFwb3RcIl0sXG4gIFtTdGF0dXMuTWlzZGlyZWN0ZWRSZXF1ZXN0LCBcIk1pc2RpcmVjdGVkIFJlcXVlc3RcIl0sXG4gIFtTdGF0dXMuVW5wcm9jZXNzYWJsZUVudGl0eSwgXCJVbnByb2Nlc3NhYmxlIEVudGl0eVwiXSxcbiAgW1N0YXR1cy5Mb2NrZWQsIFwiTG9ja2VkXCJdLFxuICBbU3RhdHVzLkZhaWxlZERlcGVuZGVuY3ksIFwiRmFpbGVkIERlcGVuZGVuY3lcIl0sXG4gIFtTdGF0dXMuVG9vRWFybHksIFwiVG9vIEVhcmx5XCJdLFxuICBbU3RhdHVzLlVwZ3JhZGVSZXF1aXJlZCwgXCJVcGdyYWRlIFJlcXVpcmVkXCJdLFxuICBbU3RhdHVzLlByZWNvbmRpdGlvblJlcXVpcmVkLCBcIlByZWNvbmRpdGlvbiBSZXF1aXJlZFwiXSxcbiAgW1N0YXR1cy5Ub29NYW55UmVxdWVzdHMsIFwiVG9vIE1hbnkgUmVxdWVzdHNcIl0sXG4gIFtTdGF0dXMuUmVxdWVzdEhlYWRlckZpZWxkc1Rvb0xhcmdlLCBcIlJlcXVlc3QgSGVhZGVyIEZpZWxkcyBUb28gTGFyZ2VcIl0sXG4gIFtTdGF0dXMuVW5hdmFpbGFibGVGb3JMZWdhbFJlYXNvbnMsIFwiVW5hdmFpbGFibGUgRm9yIExlZ2FsIFJlYXNvbnNcIl0sXG4gIFtTdGF0dXMuSW50ZXJuYWxTZXJ2ZXJFcnJvciwgXCJJbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcIl0sXG4gIFtTdGF0dXMuTm90SW1wbGVtZW50ZWQsIFwiTm90IEltcGxlbWVudGVkXCJdLFxuICBbU3RhdHVzLkJhZEdhdGV3YXksIFwiQmFkIEdhdGV3YXlcIl0sXG4gIFtTdGF0dXMuU2VydmljZVVuYXZhaWxhYmxlLCBcIlNlcnZpY2UgVW5hdmFpbGFibGVcIl0sXG4gIFtTdGF0dXMuR2F0ZXdheVRpbWVvdXQsIFwiR2F0ZXdheSBUaW1lb3V0XCJdLFxuICBbU3RhdHVzLkhUVFBWZXJzaW9uTm90U3VwcG9ydGVkLCBcIkhUVFAgVmVyc2lvbiBOb3QgU3VwcG9ydGVkXCJdLFxuICBbU3RhdHVzLlZhcmlhbnRBbHNvTmVnb3RpYXRlcywgXCJWYXJpYW50IEFsc28gTmVnb3RpYXRlc1wiXSxcbiAgW1N0YXR1cy5JbnN1ZmZpY2llbnRTdG9yYWdlLCBcIkluc3VmZmljaWVudCBTdG9yYWdlXCJdLFxuICBbU3RhdHVzLkxvb3BEZXRlY3RlZCwgXCJMb29wIERldGVjdGVkXCJdLFxuICBbU3RhdHVzLk5vdEV4dGVuZGVkLCBcIk5vdCBFeHRlbmRlZFwiXSxcbiAgW1N0YXR1cy5OZXR3b3JrQXV0aGVudGljYXRpb25SZXF1aXJlZCwgXCJOZXR3b3JrIEF1dGhlbnRpY2F0aW9uIFJlcXVpcmVkXCJdLFxuXSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLHNCQUFzQixjQUNmO1VBQUssTUFBTTtJQUFOLE9BQUEsT0FDVixvQkFBb0IsR0FDcEIsY0FBVyxPQUFYO0lBRlUsT0FBQSxPQUdWLG9CQUFvQixHQUNwQix3QkFBcUIsT0FBckI7SUFKVSxPQUFBLE9BS1YsbUJBQW1CLEdBQ25CLGdCQUFhLE9BQWI7SUFOVSxPQUFBLE9BT1YsY0FBYyxHQUNkLGdCQUFhLE9BQWI7SUFSVSxPQUFBLE9BU1Ysb0JBQW9CLEdBQ3BCLFFBQUssT0FBTDtJQVZVLE9BQUEsT0FXVixvQkFBb0IsR0FDcEIsYUFBVSxPQUFWO0lBWlUsT0FBQSxPQWFWLG9CQUFvQixHQUNwQixjQUFXLE9BQVg7SUFkVSxPQUFBLE9BZVYsb0JBQW9CLEdBQ3BCLDBCQUF1QixPQUF2QjtJQWhCVSxPQUFBLE9BaUJWLG9CQUFvQixHQUNwQixlQUFZLE9BQVo7SUFsQlUsT0FBQSxPQW1CVixvQkFBb0IsR0FDcEIsa0JBQWUsT0FBZjtJQXBCVSxPQUFBLE9BcUJWLGtCQUFrQixHQUNsQixvQkFBaUIsT0FBakI7SUF0QlUsT0FBQSxPQXVCVixtQkFBbUIsR0FDbkIsaUJBQWMsT0FBZDtJQXhCVSxPQUFBLE9BeUJWLGtCQUFrQixHQUNsQixxQkFBa0IsT0FBbEI7SUExQlUsT0FBQSxPQTJCVixxQkFBcUIsR0FDckIsWUFBUyxPQUFUO0lBNUJVLE9BQUEsT0E4QlYsb0JBQW9CLEdBQ3BCLHFCQUFrQixPQUFsQjtJQS9CVSxPQUFBLE9BZ0NWLG9CQUFvQixHQUNwQixzQkFBbUIsT0FBbkI7SUFq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