const HEADERS_MAP = {
    crossOriginEmbedderPolicy: [
        'Cross-Origin-Embedder-Policy',
        'require-corp'
    ],
    crossOriginResourcePolicy: [
        'Cross-Origin-Resource-Policy',
        'same-origin'
    ],
    crossOriginOpenerPolicy: [
        'Cross-Origin-Opener-Policy',
        'same-origin'
    ],
    originAgentCluster: [
        'Origin-Agent-Cluster',
        '?1'
    ],
    referrerPolicy: [
        'Referrer-Policy',
        'no-referrer'
    ],
    strictTransportSecurity: [
        'Strict-Transport-Security',
        'max-age=15552000; includeSubDomains'
    ],
    xContentTypeOptions: [
        'X-Content-Type-Options',
        'nosniff'
    ],
    xDnsPrefetchControl: [
        'X-DNS-Prefetch-Control',
        'off'
    ],
    xDownloadOptions: [
        'X-Download-Options',
        'noopen'
    ],
    xFrameOptions: [
        'X-Frame-Options',
        'SAMEORIGIN'
    ],
    xPermittedCrossDomainPolicies: [
        'X-Permitted-Cross-Domain-Policies',
        'none'
    ],
    xXssProtection: [
        'X-XSS-Protection',
        '0'
    ]
};
const DEFAULT_OPTIONS = {
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: true,
    crossOriginOpenerPolicy: true,
    originAgentCluster: true,
    referrerPolicy: true,
    strictTransportSecurity: true,
    xContentTypeOptions: true,
    xDnsPrefetchControl: true,
    xDownloadOptions: true,
    xFrameOptions: true,
    xPermittedCrossDomainPolicies: true,
    xXssProtection: true
};
export const secureHeaders = (customOptions)=>{
    const options = {
        ...DEFAULT_OPTIONS,
        ...customOptions
    };
    const headersToSet = Object.entries(HEADERS_MAP).filter(([key])=>options[key]).map(([key, defaultValue])=>{
        const overrideValue = options[key];
        if (typeof overrideValue === 'string') return [
            defaultValue[0],
            overrideValue
        ];
        return defaultValue;
    });
    if (options.contentSecurityPolicy) {
        const cspDirectives = Object.entries(options.contentSecurityPolicy).map(([directive, value])=>{
            // convert camelCase to kebab-case directives (e.g. `defaultSrc` -> `default-src`)
            directive = directive.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (match, offset)=>(offset ? '-' : '') + match.toLowerCase());
            return `${directive} ${Array.isArray(value) ? value.join(' ') : value}`;
        }).join('; ');
        headersToSet.push([
            'Content-Security-Policy',
            cspDirectives
        ]);
    }
    if (options.reportingEndpoints) {
        const reportingEndpoints = options.reportingEndpoints.map((endpoint)=>`${endpoint.name}="${endpoint.url}"`).join(', ');
        headersToSet.push([
            'Reporting-Endpoints',
            reportingEndpoints
        ]);
    }
    if (options.reportTo) {
        const reportToOptions = options.reportTo.map((option)=>JSON.stringify(option)).join(', ');
        headersToSet.push([
            'Report-To',
            reportToOptions
        ]);
    }
    return async (ctx, next)=>{
        await next();
        headersToSet.forEach(([header, value])=>{
            ctx.res.headers.set(header, value);
        });
        ctx.res.headers.delete('X-Powered-By');
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvc2VjdXJlLWhlYWRlcnMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBNaWRkbGV3YXJlSGFuZGxlciB9IGZyb20gJy4uLy4uL3R5cGVzLnRzJ1xuXG5pbnRlcmZhY2UgQ29udGVudFNlY3VyaXR5UG9saWN5T3B0aW9ucyB7XG4gIGRlZmF1bHRTcmM/OiBzdHJpbmdbXVxuICBiYXNlVXJpPzogc3RyaW5nW11cbiAgY2hpbGRTcmM/OiBzdHJpbmdbXVxuICBjb25uZWN0U3JjPzogc3RyaW5nW11cbiAgZm9udFNyYz86IHN0cmluZ1tdXG4gIGZvcm1BY3Rpb24/OiBzdHJpbmdbXVxuICBmcmFtZUFuY2VzdG9ycz86IHN0cmluZ1tdXG4gIGZyYW1lU3JjPzogc3RyaW5nW11cbiAgaW1nU3JjPzogc3RyaW5nW11cbiAgbWFuaWZlc3RTcmM/OiBzdHJpbmdbXVxuICBtZWRpYVNyYz86IHN0cmluZ1tdXG4gIG9iamVjdFNyYz86IHN0cmluZ1tdXG4gIHJlcG9ydFRvPzogc3RyaW5nXG4gIHNhbmRib3g/OiBzdHJpbmdbXVxuICBzY3JpcHRTcmM/OiBzdHJpbmdbXVxuICBzY3JpcHRTcmNBdHRyPzogc3RyaW5nW11cbiAgc2NyaXB0U3JjRWxlbT86IHN0cmluZ1tdXG4gIHN0eWxlU3JjPzogc3RyaW5nW11cbiAgc3R5bGVTcmNBdHRyPzogc3RyaW5nW11cbiAgc3R5bGVTcmNFbGVtPzogc3RyaW5nW11cbiAgdXBncmFkZUluc2VjdXJlUmVxdWVzdHM/OiBzdHJpbmdbXVxuICB3b3JrZXJTcmM/OiBzdHJpbmdbXVxufVxuXG5pbnRlcmZhY2UgUmVwb3J0VG9PcHRpb25zIHtcbiAgZ3JvdXA6IHN0cmluZ1xuICBtYXhfYWdlOiBudW1iZXJcbiAgZW5kcG9pbnRzOiBSZXBvcnRUb0VuZHBvaW50W11cbn1cblxuaW50ZXJmYWNlIFJlcG9ydFRvRW5kcG9pbnQge1xuICB1cmw6IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgUmVwb3J0aW5nRW5kcG9pbnRPcHRpb25zIHtcbiAgbmFtZTogc3RyaW5nXG4gIHVybDogc3RyaW5nXG59XG5cbnR5cGUgb3ZlcnJpZGFibGVIZWFkZXIgPSBib29sZWFuIHwgc3RyaW5nXG5cbmludGVyZmFjZSBTZWN1cmVIZWFkZXJzT3B0aW9ucyB7XG4gIGNvbnRlbnRTZWN1cml0eVBvbGljeT86IENvbnRlbnRTZWN1cml0eVBvbGljeU9wdGlvbnNcbiAgY3Jvc3NPcmlnaW5FbWJlZGRlclBvbGljeT86IG92ZXJyaWRhYmxlSGVhZGVyXG4gIGNyb3NzT3JpZ2luUmVzb3VyY2VQb2xpY3k/OiBvdmVycmlkYWJsZUhlYWRlclxuICBjcm9zc09yaWdpbk9wZW5lclBvbGljeT86IG92ZXJyaWRhYmxlSGVhZGVyXG4gIG9yaWdpbkFnZW50Q2x1c3Rlcjogb3ZlcnJpZGFibGVIZWFkZXJcbiAgcmVmZXJyZXJQb2xpY3k/OiBvdmVycmlkYWJsZUhlYWRlclxuICByZXBvcnRpbmdFbmRwb2ludHM/OiBSZXBvcnRpbmdFbmRwb2ludE9wdGlvbnNbXVxuICByZXBvcnRUbz86IFJlcG9ydFRvT3B0aW9uc1tdXG4gIHN0cmljdFRyYW5zcG9ydFNlY3VyaXR5Pzogb3ZlcnJpZGFibGVIZWFkZXJcbiAgeENvbnRlbnRUeXBlT3B0aW9ucz86IG92ZXJyaWRhYmxlSGVhZGVyXG4gIHhEbnNQcmVmZXRjaENvbnRyb2w/OiBvdmVycmlkYWJsZUhlYWRlclxuICB4RG93bmxvYWRPcHRpb25zPzogb3ZlcnJpZGFibGVIZWFkZXJcbiAgeEZyYW1lT3B0aW9ucz86IG92ZXJyaWRhYmxlSGVhZGVyXG4gIHhQZXJtaXR0ZWRDcm9zc0RvbWFpblBvbGljaWVzPzogb3ZlcnJpZGFibGVIZWFkZXJcbiAgeFhzc1Byb3RlY3Rpb24/OiBvdmVycmlkYWJsZUhlYWRlclxufVxuXG50eXBlIEhlYWRlcnNNYXAgPSB7XG4gIFtrZXkgaW4ga2V5b2YgU2VjdXJlSGVhZGVyc09wdGlvbnNdOiBbc3RyaW5nLCBzdHJpbmddXG59XG5cbmNvbnN0IEhFQURFUlNfTUFQOiBIZWFkZXJzTWFwID0ge1xuICBjcm9zc09yaWdpbkVtYmVkZGVyUG9saWN5OiBbJ0Nyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3knLCAncmVxdWlyZS1jb3JwJ10sXG4gIGNyb3NzT3JpZ2luUmVzb3VyY2VQb2xpY3k6IFsnQ3Jvc3MtT3JpZ2luLVJlc291cmNlLVBvbGljeScsICdzYW1lLW9yaWdpbiddLFxuICBjcm9zc09yaWdpbk9wZW5lclBvbGljeTogWydDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeScsICdzYW1lLW9yaWdpbiddLFxuICBvcmlnaW5BZ2VudENsdXN0ZXI6IFsnT3JpZ2luLUFnZW50LUNsdXN0ZXInLCAnPzEnXSxcbiAgcmVmZXJyZXJQb2xpY3k6IFsnUmVmZXJyZXItUG9saWN5JywgJ25vLXJlZmVycmVyJ10sXG4gIHN0cmljdFRyYW5zcG9ydFNlY3VyaXR5OiBbJ1N0cmljdC1UcmFuc3BvcnQtU2VjdXJpdHknLCAnbWF4LWFnZT0xNTU1MjAwMDsgaW5jbHVkZVN1YkRvbWFpbnMnXSxcbiAgeENvbnRlbnRUeXBlT3B0aW9uczogWydYLUNvbnRlbnQtVHlwZS1PcHRpb25zJywgJ25vc25pZmYnXSxcbiAgeERuc1ByZWZldGNoQ29udHJvbDogWydYLUROUy1QcmVmZXRjaC1Db250cm9sJywgJ29mZiddLFxuICB4RG93bmxvYWRPcHRpb25zOiBbJ1gtRG93bmxvYWQtT3B0aW9ucycsICdub29wZW4nXSxcbiAgeEZyYW1lT3B0aW9uczogWydYLUZyYW1lLU9wdGlvbnMnLCAnU0FNRU9SSUdJTiddLFxuICB4UGVybWl0dGVkQ3Jvc3NEb21haW5Qb2xpY2llczogWydYLVBlcm1pdHRlZC1Dcm9zcy1Eb21haW4tUG9saWNpZXMnLCAnbm9uZSddLFxuICB4WHNzUHJvdGVjdGlvbjogWydYLVhTUy1Qcm90ZWN0aW9uJywgJzAnXSxcbn1cblxuY29uc3QgREVGQVVMVF9PUFRJT05TOiBTZWN1cmVIZWFkZXJzT3B0aW9ucyA9IHtcbiAgY3Jvc3NPcmlnaW5FbWJlZGRlclBvbGljeTogZmFsc2UsXG4gIGNyb3NzT3JpZ2luUmVzb3VyY2VQb2xpY3k6IHRydWUsXG4gIGNyb3NzT3JpZ2luT3BlbmVyUG9saWN5OiB0cnVlLFxuICBvcmlnaW5BZ2VudENsdXN0ZXI6IHRydWUsXG4gIHJlZmVycmVyUG9saWN5OiB0cnVlLFxuICBzdHJpY3RUcmFuc3BvcnRTZWN1cml0eTogdHJ1ZSxcbiAgeENvbnRlbnRUeXBlT3B0aW9uczogdHJ1ZSxcbiAgeERuc1ByZWZldGNoQ29udHJvbDogdHJ1ZSxcbiAgeERvd25sb2FkT3B0aW9uczogdHJ1ZSxcbiAgeEZyYW1lT3B0aW9uczogdHJ1ZSxcbiAgeFBlcm1pdHRlZENyb3NzRG9tYWluUG9saWNpZXM6IHRydWUsXG4gIHhYc3NQcm90ZWN0aW9uOiB0cnVlLFxufVxuXG5leHBvcnQgY29uc3Qgc2VjdXJlSGVhZGVycyA9IChjdXN0b21PcHRpb25zPzogUGFydGlhbDxTZWN1cmVIZWFkZXJzT3B0aW9ucz4pOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIGNvbnN0IG9wdGlvbnMgPSB7IC4uLkRFRkFVTFRfT1BUSU9OUywgLi4uY3VzdG9tT3B0aW9ucyB9XG4gIGNvbnN0IGhlYWRlcnNUb1NldCA9IE9iamVjdC5lbnRyaWVzKEhFQURFUlNfTUFQKVxuICAgIC5maWx0ZXIoKFtrZXldKSA9PiBvcHRpb25zW2tleSBhcyBrZXlvZiBTZWN1cmVIZWFkZXJzT3B0aW9uc10pXG4gICAgLm1hcCgoW2tleSwgZGVmYXVsdFZhbHVlXSkgPT4ge1xuICAgICAgY29uc3Qgb3ZlcnJpZGVWYWx1ZSA9IG9wdGlvbnNba2V5IGFzIGtleW9mIFNlY3VyZUhlYWRlcnNPcHRpb25zXVxuICAgICAgaWYgKHR5cGVvZiBvdmVycmlkZVZhbHVlID09PSAnc3RyaW5nJykgcmV0dXJuIFtkZWZhdWx0VmFsdWVbMF0sIG92ZXJyaWRlVmFsdWVdXG4gICAgICByZXR1cm4gZGVmYXVsdFZhbHVlXG4gICAgfSlcblxuICBpZiAob3B0aW9ucy5jb250ZW50U2VjdXJpdHlQb2xpY3kpIHtcbiAgICBjb25zdCBjc3BEaXJlY3RpdmVzID0gT2JqZWN0LmVudHJpZXMob3B0aW9ucy5jb250ZW50U2VjdXJpdHlQb2xpY3kpXG4gICAgICAubWFwKChbZGlyZWN0aXZlLCB2YWx1ZV0pID0+IHtcbiAgICAgICAgLy8gY29udmVydCBjYW1lbENhc2UgdG8ga2ViYWItY2FzZSBkaXJlY3RpdmVzIChlLmcuIGBkZWZhdWx0U3JjYCAtPiBgZGVmYXVsdC1zcmNgKVxuICAgICAgICBkaXJlY3RpdmUgPSBkaXJlY3RpdmUucmVwbGFjZShcbiAgICAgICAgICAvW0EtWl0rKD8hW2Etel0pfFtBLVpdL2csXG4gICAgICAgICAgKG1hdGNoLCBvZmZzZXQpID0+IChvZmZzZXQgPyAnLScgOiAnJykgKyBtYXRjaC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuIGAke2RpcmVjdGl2ZX0gJHtBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLmpvaW4oJyAnKSA6IHZhbHVlfWBcbiAgICAgIH0pXG4gICAgICAuam9pbignOyAnKVxuICAgIGhlYWRlcnNUb1NldC5wdXNoKFsnQ29udGVudC1TZWN1cml0eS1Qb2xpY3knLCBjc3BEaXJlY3RpdmVzXSlcbiAgfVxuXG4gIGlmIChvcHRpb25zLnJlcG9ydGluZ0VuZHBvaW50cykge1xuICAgIGNvbnN0IHJlcG9ydGluZ0VuZHBvaW50cyA9IG9wdGlvbnMucmVwb3J0aW5nRW5kcG9pbnRzXG4gICAgICAubWFwKChlbmRwb2ludCkgPT4gYCR7ZW5kcG9pbnQubmFtZX09XCIke2VuZHBvaW50LnVybH1cImApXG4gICAgICAuam9pbignLCAnKVxuICAgIGhlYWRlcnNUb1NldC5wdXNoKFsnUmVwb3J0aW5nLUVuZHBvaW50cycsIHJlcG9ydGluZ0VuZHBvaW50c10pXG4gIH1cblxuICBpZiAob3B0aW9ucy5yZXBvcnRUbykge1xuICAgIGNvbnN0IHJlcG9ydFRvT3B0aW9ucyA9IG9wdGlvbnMucmVwb3J0VG8ubWFwKChvcHRpb24pID0+IEpTT04uc3RyaW5naWZ5KG9wdGlvbikpLmpvaW4oJywgJylcbiAgICBoZWFkZXJzVG9TZXQucHVzaChbJ1JlcG9ydC1UbycsIHJlcG9ydFRvT3B0aW9uc10pXG4gIH1cblxuICByZXR1cm4gYXN5bmMgKGN0eCwgbmV4dCkgPT4ge1xuICAgIGF3YWl0IG5leHQoKVxuICAgIGhlYWRlcnNUb1NldC5mb3JFYWNoKChbaGVhZGVyLCB2YWx1ZV0pID0+IHtcbiAgICAgIGN0eC5yZXMuaGVhZGVycy5zZXQoaGVhZGVyLCB2YWx1ZSlcbiAgICB9KVxuXG4gICAgY3R4LnJlcy5oZWFkZXJzLmRlbGV0ZSgnWC1Qb3dlcmVkLUJ5JylcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtFQSxNQUFNLGNBQTBCO0lBQzlCLDJCQUEyQjtRQUFDO1FBQWdDO0tBQWU7SUFDM0UsMkJBQTJCO1FBQUM7UUFBZ0M7S0FBYztJQUMxRSx5QkFBeUI7UUFBQztRQUE4QjtLQUFjO0lBQ3RFLG9CQUFvQjtRQUFDO1FBQXdCO0tBQUs7SUFDbEQsZ0JBQWdCO1FBQUM7UUFBbUI7S0FBYztJQUNsRCx5QkFBeUI7UUFBQztRQUE2QjtLQUFzQztJQUM3RixxQkFBcUI7UUFBQztRQUEwQjtLQUFVO0lBQzFELHFCQUFxQjtRQUFDO1FBQTBCO0tBQU07SUFDdEQsa0JBQWtCO1FBQUM7UUFBc0I7S0FBUztJQUNsRCxlQUFlO1FBQUM7UUFBbUI7S0FBYTtJQUNoRCwrQkFBK0I7UUFBQztRQUFxQztLQUFPO0lBQzVFLGdCQUFnQjtRQUFDO1FBQW9CO0tBQUk7QUFDM0M7QUFFQSxNQUFNLGtCQUF3QztJQUM1QywyQkFBMkIsS0FBSztJQUNoQywyQkFBMkIsSUFBSTtJQUMvQix5QkFBeUIsSUFBSTtJQUM3QixvQkFBb0IsSUFBSTtJQUN4QixnQkFBZ0IsSUFBSTtJQUNwQix5QkFBeUIsSUFBSTtJQUM3QixxQkFBcUIsSUFBSTtJQUN6QixxQkFBcUIsSUFBSTtJQUN6QixrQkFBa0IsSUFBSTtJQUN0QixlQUFlLElBQUk7SUFDbkIsK0JBQStCLElBQUk7SUFDbkMsZ0JBQWdCLElBQUk7QUFDdEI7QUFFQSxPQUFPLE1BQU0sZ0JBQWdCLENBQUMsZ0JBQXFFO0lBQ2pHLE1BQU0sVUFBVTtRQUFFLEdBQUcsZUFBZTtRQUFFLEdBQUcsYUFBYTtJQUFDO0lBQ3ZELE1BQU0sZUFBZSxPQUFPLE9BQU8sQ0FBQyxhQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBSyxPQUFPLENBQUMsSUFBa0MsRUFDNUQsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLGFBQWEsR0FBSztRQUM1QixNQUFNLGdCQUFnQixPQUFPLENBQUMsSUFBa0M7UUFDaEUsSUFBSSxPQUFPLGtCQUFrQixVQUFVLE9BQU87WUFBQyxZQUFZLENBQUMsRUFBRTtZQUFFO1NBQWM7UUFDOUUsT0FBTztJQUNUO0lBRUYsSUFBSSxRQUFRLHFCQUFxQixFQUFFO1FBQ2pDLE1BQU0sZ0JBQWdCLE9BQU8sT0FBTyxDQUFDLFFBQVEscUJBQXFCLEVBQy9ELEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxNQUFNLEdBQUs7WUFDM0Isa0ZBQWtGO1lBQ2xGLFlBQVksVUFBVSxPQUFPLENBQzNCLDBCQUNBLENBQUMsT0FBTyxTQUFXLENBQUMsU0FBUyxNQUFNLEVBQUUsSUFBSSxNQUFNLFdBQVc7WUFFNUQsT0FBTyxDQUFDLEVBQUUsVUFBVSxDQUFDLEVBQUUsTUFBTSxPQUFPLENBQUMsU0FBUyxNQUFNLElBQUksQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDO1FBQ3pFLEdBQ0MsSUFBSSxDQUFDO1FBQ1IsYUFBYSxJQUFJLENBQUM7WUFBQztZQUEyQjtTQUFjO0lBQzlELENBQUM7SUFFRCxJQUFJLFFBQVEsa0JBQWtCLEVBQUU7UUFDOUIsTUFBTSxxQkFBcUIsUUFBUSxrQkFBa0IsQ0FDbEQsR0FBRyxDQUFDLENBQUMsV0FBYSxDQUFDLEVBQUUsU0FBUyxJQUFJLENBQUMsRUFBRSxFQUFFLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUN0RCxJQUFJLENBQUM7UUFDUixhQUFhLElBQUksQ0FBQztZQUFDO1lBQXVCO1NBQW1CO0lBQy9ELENBQUM7SUFFRCxJQUFJLFFBQVEsUUFBUSxFQUFFO1FBQ3BCLE1BQU0sa0JBQWtCLFFBQVEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVcsS0FBSyxTQUFTLENBQUMsU0FBUyxJQUFJLENBQUM7UUFDdEYsYUFBYSxJQUFJLENBQUM7WUFBQztZQUFhO1NBQWdCO0lBQ2xELENBQUM7SUFFRCxPQUFPLE9BQU8sS0FBSyxPQUFTO1FBQzFCLE1BQU07UUFDTixhQUFhLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxNQUFNLEdBQUs7WUFDeEMsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRO1FBQzlCO1FBRUEsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUN6QjtBQUNGLEVBQUMifQ==