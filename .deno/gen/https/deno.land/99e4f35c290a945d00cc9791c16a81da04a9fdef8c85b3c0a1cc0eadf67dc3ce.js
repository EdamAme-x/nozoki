import { parseBody } from '../utils/body.ts';
export const validator = (target, validationFunc)=>{
    return async (c, next)=>{
        let value = {};
        switch(target){
            case 'json':
                try {
                    value = await c.req.raw.clone().json();
                } catch  {
                    console.error('Error: Malformed JSON in request body');
                    return c.json({
                        success: false,
                        message: 'Malformed JSON in request body'
                    }, 400);
                }
                break;
            case 'form':
                value = await parseBody(c.req.raw.clone());
                break;
            case 'query':
                value = Object.fromEntries(Object.entries(c.req.queries()).map(([k, v])=>{
                    return v.length === 1 ? [
                        k,
                        v[0]
                    ] : [
                        k,
                        v
                    ];
                }));
                break;
            case 'queries':
                value = c.req.queries();
                break;
            case 'param':
                value = c.req.param();
                break;
        }
        const res = await validationFunc(value, c);
        if (res instanceof Response) {
            return res;
        }
        c.req.addValidatedData(target, res);
        await next();
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvdmFsaWRhdG9yL3ZhbGlkYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbnRleHQgfSBmcm9tICcuLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHR5cGUgeyBFbnYsIFZhbGlkYXRpb25UYXJnZXRzLCBNaWRkbGV3YXJlSGFuZGxlciB9IGZyb20gJy4uL3R5cGVzLnRzJ1xuaW1wb3J0IHsgcGFyc2VCb2R5IH0gZnJvbSAnLi4vdXRpbHMvYm9keS50cydcblxudHlwZSBWYWxpZGF0aW9uVGFyZ2V0S2V5c1dpdGhCb2R5ID0gJ2Zvcm0nIHwgJ2pzb24nXG50eXBlIFZhbGlkYXRpb25UYXJnZXRCeU1ldGhvZDxNPiA9IE0gZXh0ZW5kcyAnZ2V0JyB8ICdoZWFkJyAvLyBHRVQgYW5kIEhFQUQgcmVxdWVzdCBtdXN0IG5vdCBoYXZlIGEgYm9keSBjb250ZW50LlxuICA/IEV4Y2x1ZGU8a2V5b2YgVmFsaWRhdGlvblRhcmdldHMsIFZhbGlkYXRpb25UYXJnZXRLZXlzV2l0aEJvZHk+XG4gIDoga2V5b2YgVmFsaWRhdGlvblRhcmdldHNcblxuZXhwb3J0IHR5cGUgVmFsaWRhdGlvbkZ1bmN0aW9uPFxuICBJbnB1dFR5cGUsXG4gIE91dHB1dFR5cGUsXG4gIEUgZXh0ZW5kcyBFbnYgPSB7fSxcbiAgUCBleHRlbmRzIHN0cmluZyA9IHN0cmluZ1xuPiA9IChcbiAgdmFsdWU6IElucHV0VHlwZSxcbiAgYzogQ29udGV4dDxFLCBQPlxuKSA9PiBPdXRwdXRUeXBlIHwgUmVzcG9uc2UgfCBQcm9taXNlPE91dHB1dFR5cGU+IHwgUHJvbWlzZTxSZXNwb25zZT5cblxuZXhwb3J0IGNvbnN0IHZhbGlkYXRvciA9IDxcbiAgSW5wdXRUeXBlLFxuICBQIGV4dGVuZHMgc3RyaW5nLFxuICBNIGV4dGVuZHMgc3RyaW5nLFxuICBVIGV4dGVuZHMgVmFsaWRhdGlvblRhcmdldEJ5TWV0aG9kPE0+LFxuICBPdXRwdXRUeXBlID0gVmFsaWRhdGlvblRhcmdldHNbVV0sXG4gIFAyIGV4dGVuZHMgc3RyaW5nID0gUCxcbiAgViBleHRlbmRzIHtcbiAgICBpbjogeyBbSyBpbiBVXTogdW5rbm93biBleHRlbmRzIElucHV0VHlwZSA/IE91dHB1dFR5cGUgOiBJbnB1dFR5cGUgfVxuICAgIG91dDogeyBbSyBpbiBVXTogT3V0cHV0VHlwZSB9XG4gIH0gPSB7XG4gICAgaW46IHsgW0sgaW4gVV06IHVua25vd24gZXh0ZW5kcyBJbnB1dFR5cGUgPyBPdXRwdXRUeXBlIDogSW5wdXRUeXBlIH1cbiAgICBvdXQ6IHsgW0sgaW4gVV06IE91dHB1dFR5cGUgfVxuICB9LFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBFIGV4dGVuZHMgRW52ID0gYW55XG4+KFxuICB0YXJnZXQ6IFUsXG4gIHZhbGlkYXRpb25GdW5jOiBWYWxpZGF0aW9uRnVuY3Rpb248XG4gICAgdW5rbm93biBleHRlbmRzIElucHV0VHlwZSA/IFZhbGlkYXRpb25UYXJnZXRzW1VdIDogSW5wdXRUeXBlLFxuICAgIE91dHB1dFR5cGUsXG4gICAgRSxcbiAgICBQMlxuICA+XG4pOiBNaWRkbGV3YXJlSGFuZGxlcjxFLCBQLCBWPiA9PiB7XG4gIHJldHVybiBhc3luYyAoYywgbmV4dCkgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHt9XG5cbiAgICBzd2l0Y2ggKHRhcmdldCkge1xuICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFsdWUgPSBhd2FpdCBjLnJlcS5yYXcuY2xvbmUoKS5qc29uKClcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3I6IE1hbGZvcm1lZCBKU09OIGluIHJlcXVlc3QgYm9keScpXG4gICAgICAgICAgcmV0dXJuIGMuanNvbihcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICdNYWxmb3JtZWQgSlNPTiBpbiByZXF1ZXN0IGJvZHknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDQwMFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnZm9ybSc6XG4gICAgICAgIHZhbHVlID0gYXdhaXQgcGFyc2VCb2R5KGMucmVxLnJhdy5jbG9uZSgpKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAncXVlcnknOlxuICAgICAgICB2YWx1ZSA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICBPYmplY3QuZW50cmllcyhjLnJlcS5xdWVyaWVzKCkpLm1hcCgoW2ssIHZdKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdi5sZW5ndGggPT09IDEgPyBbaywgdlswXV0gOiBbaywgdl1cbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdxdWVyaWVzJzpcbiAgICAgICAgdmFsdWUgPSBjLnJlcS5xdWVyaWVzKClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3BhcmFtJzpcbiAgICAgICAgdmFsdWUgPSBjLnJlcS5wYXJhbSgpIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgICAgICAgYnJlYWtcbiAgICB9XG5cbiAgICBjb25zdCByZXMgPSBhd2FpdCB2YWxpZGF0aW9uRnVuYyh2YWx1ZSBhcyBuZXZlciwgYyBhcyBuZXZlcilcblxuICAgIGlmIChyZXMgaW5zdGFuY2VvZiBSZXNwb25zZSkge1xuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cblxuICAgIGMucmVxLmFkZFZhbGlkYXRlZERhdGEodGFyZ2V0LCByZXMgYXMgbmV2ZXIpXG5cbiAgICBhd2FpdCBuZXh0KClcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLFNBQVMsU0FBUyxRQUFRLG1CQUFrQjtBQWlCNUMsT0FBTyxNQUFNLFlBQVksQ0FpQnZCLFFBQ0EsaUJBTStCO0lBQy9CLE9BQU8sT0FBTyxHQUFHLE9BQVM7UUFDeEIsSUFBSSxRQUFRLENBQUM7UUFFYixPQUFRO1lBQ04sS0FBSztnQkFDSCxJQUFJO29CQUNGLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUk7Z0JBQ3RDLEVBQUUsT0FBTTtvQkFDTixRQUFRLEtBQUssQ0FBQztvQkFDZCxPQUFPLEVBQUUsSUFBSSxDQUNYO3dCQUNFLFNBQVMsS0FBSzt3QkFDZCxTQUFTO29CQUNYLEdBQ0E7Z0JBRUo7Z0JBQ0EsS0FBSztZQUNQLEtBQUs7Z0JBQ0gsUUFBUSxNQUFNLFVBQVUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUs7Z0JBQ3ZDLEtBQUs7WUFDUCxLQUFLO2dCQUNILFFBQVEsT0FBTyxXQUFXLENBQ3hCLE9BQU8sT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFLO29CQUM5QyxPQUFPLEVBQUUsTUFBTSxLQUFLLElBQUk7d0JBQUM7d0JBQUcsQ0FBQyxDQUFDLEVBQUU7cUJBQUMsR0FBRzt3QkFBQzt3QkFBRztxQkFBRTtnQkFDNUM7Z0JBRUYsS0FBSztZQUNQLEtBQUs7Z0JBQ0gsUUFBUSxFQUFFLEdBQUcsQ0FBQyxPQUFPO2dCQUNyQixLQUFLO1lBQ1AsS0FBSztnQkFDSCxRQUFRLEVBQUUsR0FBRyxDQUFDLEtBQUs7Z0JBQ25CLEtBQUs7UUFDVDtRQUVBLE1BQU0sTUFBTSxNQUFNLGVBQWUsT0FBZ0I7UUFFakQsSUFBSSxlQUFlLFVBQVU7WUFDM0IsT0FBTztRQUNULENBQUM7UUFFRCxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRO1FBRS9CLE1BQU07SUFDUjtBQUNGLEVBQUMifQ==