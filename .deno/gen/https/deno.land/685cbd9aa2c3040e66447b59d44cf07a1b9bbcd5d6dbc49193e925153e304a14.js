export class JwtAlgorithmNotImplemented extends Error {
    constructor(token){
        super(`invalid JWT token: ${token}`);
        this.name = 'JwtAlgorithmNotImplemented';
    }
}
/**
 * Export for backward compatibility
 * @deprecated Use JwtAlgorithmNotImplemented instead
 **/ export const JwtAlorithmNotImplemented = JwtAlgorithmNotImplemented;
export class JwtTokenInvalid extends Error {
    constructor(token){
        super(`invalid JWT token: ${token}`);
        this.name = 'JwtTokenInvalid';
    }
}
export class JwtTokenNotBefore extends Error {
    constructor(token){
        super(`token (${token}) is being used before it's valid`);
        this.name = 'JwtTokenNotBefore';
    }
}
export class JwtTokenExpired extends Error {
    constructor(token){
        super(`token (${token}) expired`);
        this.name = 'JwtTokenExpired';
    }
}
export class JwtTokenIssuedAt extends Error {
    constructor(currentTimestamp, iat){
        super(`Incorrect "iat" claim must be a older than "${currentTimestamp}" (iat: "${iat}")`);
        this.name = 'JwtTokenIssuedAt';
    }
}
export class JwtTokenSignatureMismatched extends Error {
    constructor(token){
        super(`token(${token}) signature mismatched`);
        this.name = 'JwtTokenSignatureMismatched';
    }
}
export var AlgorithmTypes;
(function(AlgorithmTypes) {
    AlgorithmTypes["HS256"] = "HS256";
    AlgorithmTypes["HS384"] = "HS384";
    AlgorithmTypes["HS512"] = "HS512";
})(AlgorithmTypes || (AlgorithmTypes = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvdXRpbHMvand0L3R5cGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBKd3RBbGdvcml0aG1Ob3RJbXBsZW1lbnRlZCBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IodG9rZW46IHN0cmluZykge1xuICAgIHN1cGVyKGBpbnZhbGlkIEpXVCB0b2tlbjogJHt0b2tlbn1gKVxuICAgIHRoaXMubmFtZSA9ICdKd3RBbGdvcml0aG1Ob3RJbXBsZW1lbnRlZCdcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9ydCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICogQGRlcHJlY2F0ZWQgVXNlIEp3dEFsZ29yaXRobU5vdEltcGxlbWVudGVkIGluc3RlYWRcbiAqKi9cbmV4cG9ydCBjb25zdCBKd3RBbG9yaXRobU5vdEltcGxlbWVudGVkID0gSnd0QWxnb3JpdGhtTm90SW1wbGVtZW50ZWRcblxuZXhwb3J0IGNsYXNzIEp3dFRva2VuSW52YWxpZCBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IodG9rZW46IHN0cmluZykge1xuICAgIHN1cGVyKGBpbnZhbGlkIEpXVCB0b2tlbjogJHt0b2tlbn1gKVxuICAgIHRoaXMubmFtZSA9ICdKd3RUb2tlbkludmFsaWQnXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEp3dFRva2VuTm90QmVmb3JlIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3Rvcih0b2tlbjogc3RyaW5nKSB7XG4gICAgc3VwZXIoYHRva2VuICgke3Rva2VufSkgaXMgYmVpbmcgdXNlZCBiZWZvcmUgaXQncyB2YWxpZGApXG4gICAgdGhpcy5uYW1lID0gJ0p3dFRva2VuTm90QmVmb3JlJ1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBKd3RUb2tlbkV4cGlyZWQgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHRva2VuOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgdG9rZW4gKCR7dG9rZW59KSBleHBpcmVkYClcbiAgICB0aGlzLm5hbWUgPSAnSnd0VG9rZW5FeHBpcmVkJ1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBKd3RUb2tlbklzc3VlZEF0IGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihjdXJyZW50VGltZXN0YW1wOiBudW1iZXIsIGlhdDogbnVtYmVyKSB7XG4gICAgc3VwZXIoYEluY29ycmVjdCBcImlhdFwiIGNsYWltIG11c3QgYmUgYSBvbGRlciB0aGFuIFwiJHtjdXJyZW50VGltZXN0YW1wfVwiIChpYXQ6IFwiJHtpYXR9XCIpYClcbiAgICB0aGlzLm5hbWUgPSAnSnd0VG9rZW5Jc3N1ZWRBdCdcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSnd0VG9rZW5TaWduYXR1cmVNaXNtYXRjaGVkIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3Rvcih0b2tlbjogc3RyaW5nKSB7XG4gICAgc3VwZXIoYHRva2VuKCR7dG9rZW59KSBzaWduYXR1cmUgbWlzbWF0Y2hlZGApXG4gICAgdGhpcy5uYW1lID0gJ0p3dFRva2VuU2lnbmF0dXJlTWlzbWF0Y2hlZCdcbiAgfVxufVxuXG5leHBvcnQgZW51bSBBbGdvcml0aG1UeXBlcyB7XG4gIEhTMjU2ID0gJ0hTMjU2JyxcbiAgSFMzODQgPSAnSFMzODQnLFxuICBIUzUxMiA9ICdIUzUxMicsXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLG1DQUFtQztJQUM5QyxZQUFZLEtBQWEsQ0FBRTtRQUN6QixLQUFLLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUM7UUFDbkMsSUFBSSxDQUFDLElBQUksR0FBRztJQUNkO0FBQ0YsQ0FBQztBQUVEOzs7RUFHRSxHQUNGLE9BQU8sTUFBTSw0QkFBNEIsMkJBQTBCO0FBRW5FLE9BQU8sTUFBTSx3QkFBd0I7SUFDbkMsWUFBWSxLQUFhLENBQUU7UUFDekIsS0FBSyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxDQUFDO1FBQ25DLElBQUksQ0FBQyxJQUFJLEdBQUc7SUFDZDtBQUNGLENBQUM7QUFFRCxPQUFPLE1BQU0sMEJBQTBCO0lBQ3JDLFlBQVksS0FBYSxDQUFFO1FBQ3pCLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLGlDQUFpQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxJQUFJLEdBQUc7SUFDZDtBQUNGLENBQUM7QUFFRCxPQUFPLE1BQU0sd0JBQXdCO0lBQ25DLFlBQVksS0FBYSxDQUFFO1FBQ3pCLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLFNBQVMsQ0FBQztRQUNoQyxJQUFJLENBQUMsSUFBSSxHQUFHO0lBQ2Q7QUFDRixDQUFDO0FBRUQsT0FBTyxNQUFNLHlCQUF5QjtJQUNwQyxZQUFZLGdCQUF3QixFQUFFLEdBQVcsQ0FBRTtRQUNqRCxLQUFLLENBQUMsQ0FBQyw0Q0FBNEMsRUFBRSxpQkFBaUIsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDO1FBQ3hGLElBQUksQ0FBQyxJQUFJLEdBQUc7SUFDZDtBQUNGLENBQUM7QUFFRCxPQUFPLE1BQU0sb0NBQW9DO0lBQy9DLFlBQVksS0FBYSxDQUFFO1FBQ3pCLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLHNCQUFzQixDQUFDO1FBQzVDLElBQUksQ0FBQyxJQUFJLEdBQUc7SUFDZDtBQUNGLENBQUM7V0FFTTtVQUFLLGNBQWM7SUFBZCxlQUNWLFdBQUE7SUFEVSxlQUVWLFdBQUE7SUFGVSxlQUdWLFdBQUE7R0FIVSxtQkFBQSJ9