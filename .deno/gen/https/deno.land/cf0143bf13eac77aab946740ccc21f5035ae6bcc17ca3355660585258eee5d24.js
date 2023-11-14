export class JwtAlgorithmNotImplemented extends Error {
    constructor(alg){
        super(`${alg} is not an implemented algorithm`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL3V0aWxzL2p3dC90eXBlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgSnd0QWxnb3JpdGhtTm90SW1wbGVtZW50ZWQgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGFsZzogc3RyaW5nKSB7XG4gICAgc3VwZXIoYCR7YWxnfSBpcyBub3QgYW4gaW1wbGVtZW50ZWQgYWxnb3JpdGhtYClcbiAgICB0aGlzLm5hbWUgPSAnSnd0QWxnb3JpdGhtTm90SW1wbGVtZW50ZWQnXG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvcnQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAqIEBkZXByZWNhdGVkIFVzZSBKd3RBbGdvcml0aG1Ob3RJbXBsZW1lbnRlZCBpbnN0ZWFkXG4gKiovXG5leHBvcnQgY29uc3QgSnd0QWxvcml0aG1Ob3RJbXBsZW1lbnRlZCA9IEp3dEFsZ29yaXRobU5vdEltcGxlbWVudGVkXG5cbmV4cG9ydCBjbGFzcyBKd3RUb2tlbkludmFsaWQgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHRva2VuOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgaW52YWxpZCBKV1QgdG9rZW46ICR7dG9rZW59YClcbiAgICB0aGlzLm5hbWUgPSAnSnd0VG9rZW5JbnZhbGlkJ1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBKd3RUb2tlbk5vdEJlZm9yZSBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IodG9rZW46IHN0cmluZykge1xuICAgIHN1cGVyKGB0b2tlbiAoJHt0b2tlbn0pIGlzIGJlaW5nIHVzZWQgYmVmb3JlIGl0J3MgdmFsaWRgKVxuICAgIHRoaXMubmFtZSA9ICdKd3RUb2tlbk5vdEJlZm9yZSdcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSnd0VG9rZW5FeHBpcmVkIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3Rvcih0b2tlbjogc3RyaW5nKSB7XG4gICAgc3VwZXIoYHRva2VuICgke3Rva2VufSkgZXhwaXJlZGApXG4gICAgdGhpcy5uYW1lID0gJ0p3dFRva2VuRXhwaXJlZCdcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSnd0VG9rZW5Jc3N1ZWRBdCBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoY3VycmVudFRpbWVzdGFtcDogbnVtYmVyLCBpYXQ6IG51bWJlcikge1xuICAgIHN1cGVyKGBJbmNvcnJlY3QgXCJpYXRcIiBjbGFpbSBtdXN0IGJlIGEgb2xkZXIgdGhhbiBcIiR7Y3VycmVudFRpbWVzdGFtcH1cIiAoaWF0OiBcIiR7aWF0fVwiKWApXG4gICAgdGhpcy5uYW1lID0gJ0p3dFRva2VuSXNzdWVkQXQnXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEp3dFRva2VuU2lnbmF0dXJlTWlzbWF0Y2hlZCBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IodG9rZW46IHN0cmluZykge1xuICAgIHN1cGVyKGB0b2tlbigke3Rva2VufSkgc2lnbmF0dXJlIG1pc21hdGNoZWRgKVxuICAgIHRoaXMubmFtZSA9ICdKd3RUb2tlblNpZ25hdHVyZU1pc21hdGNoZWQnXG4gIH1cbn1cblxuZXhwb3J0IGVudW0gQWxnb3JpdGhtVHlwZXMge1xuICBIUzI1NiA9ICdIUzI1NicsXG4gIEhTMzg0ID0gJ0hTMzg0JyxcbiAgSFM1MTIgPSAnSFM1MTInLFxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxtQ0FBbUM7SUFDOUMsWUFBWSxHQUFXLENBQUU7UUFDdkIsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLGdDQUFnQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxJQUFJLEdBQUc7SUFDZDtBQUNGLENBQUM7QUFFRDs7O0VBR0UsR0FDRixPQUFPLE1BQU0sNEJBQTRCLDJCQUEwQjtBQUVuRSxPQUFPLE1BQU0sd0JBQXdCO0lBQ25DLFlBQVksS0FBYSxDQUFFO1FBQ3pCLEtBQUssQ0FBQyxDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsSUFBSSxHQUFHO0lBQ2Q7QUFDRixDQUFDO0FBRUQsT0FBTyxNQUFNLDBCQUEwQjtJQUNyQyxZQUFZLEtBQWEsQ0FBRTtRQUN6QixLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsSUFBSSxHQUFHO0lBQ2Q7QUFDRixDQUFDO0FBRUQsT0FBTyxNQUFNLHdCQUF3QjtJQUNuQyxZQUFZLEtBQWEsQ0FBRTtRQUN6QixLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLElBQUksR0FBRztJQUNkO0FBQ0YsQ0FBQztBQUVELE9BQU8sTUFBTSx5QkFBeUI7SUFDcEMsWUFBWSxnQkFBd0IsRUFBRSxHQUFXLENBQUU7UUFDakQsS0FBSyxDQUFDLENBQUMsNENBQTRDLEVBQUUsaUJBQWlCLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUN4RixJQUFJLENBQUMsSUFBSSxHQUFHO0lBQ2Q7QUFDRixDQUFDO0FBRUQsT0FBTyxNQUFNLG9DQUFvQztJQUMvQyxZQUFZLEtBQWEsQ0FBRTtRQUN6QixLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztRQUM1QyxJQUFJLENBQUMsSUFBSSxHQUFHO0lBQ2Q7QUFDRixDQUFDO1dBRU07VUFBSyxjQUFjO0lBQWQsZUFDVixXQUFBO0lBRFUsZUFFVixXQUFBO0lBRlUsZUFHVixXQUFBO0dBSFUsbUJBQUEifQ==