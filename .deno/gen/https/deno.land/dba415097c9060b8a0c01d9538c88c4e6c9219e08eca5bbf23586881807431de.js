export async function parseBody(r) {
    let body = {};
    const contentType = r.headers.get('Content-Type');
    if (contentType && (contentType.startsWith('multipart/form-data') || contentType.startsWith('application/x-www-form-urlencoded'))) {
        const form = {};
        (await r.formData()).forEach((value, key)=>{
            form[key] = value;
        });
        body = form;
    }
    return body;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvdXRpbHMvYm9keS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgdHlwZSBCb2R5RGF0YSA9IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IEZpbGU+XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwYXJzZUJvZHkocjogUmVxdWVzdCB8IFJlc3BvbnNlKSB7XG4gIGxldCBib2R5OiBCb2R5RGF0YSA9IHt9XG4gIGNvbnN0IGNvbnRlbnRUeXBlID0gci5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJylcbiAgaWYgKFxuICAgIGNvbnRlbnRUeXBlICYmXG4gICAgKGNvbnRlbnRUeXBlLnN0YXJ0c1dpdGgoJ211bHRpcGFydC9mb3JtLWRhdGEnKSB8fFxuICAgICAgY29udGVudFR5cGUuc3RhcnRzV2l0aCgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJykpXG4gICkge1xuICAgIGNvbnN0IGZvcm06IEJvZHlEYXRhID0ge31cbiAgICA7KGF3YWl0IHIuZm9ybURhdGEoKSkuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgZm9ybVtrZXldID0gdmFsdWVcbiAgICB9KVxuICAgIGJvZHkgPSBmb3JtXG4gIH1cbiAgcmV0dXJuIGJvZHlcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLGVBQWUsVUFBVSxDQUFxQixFQUFFO0lBQ3JELElBQUksT0FBaUIsQ0FBQztJQUN0QixNQUFNLGNBQWMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDO0lBQ2xDLElBQ0UsZUFDQSxDQUFDLFlBQVksVUFBVSxDQUFDLDBCQUN0QixZQUFZLFVBQVUsQ0FBQyxvQ0FBb0MsR0FDN0Q7UUFDQSxNQUFNLE9BQWlCLENBQUM7UUFDdkIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsT0FBTyxNQUFRO1lBQzVDLElBQUksQ0FBQyxJQUFJLEdBQUc7UUFDZDtRQUNBLE9BQU87SUFDVCxDQUFDO0lBQ0QsT0FBTztBQUNULENBQUMifQ==