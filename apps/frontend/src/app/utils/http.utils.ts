import { HttpParams } from '@angular/common/http';

export class HttpUtils {
  static buildQueryParams<T extends object>(query: T): HttpParams {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            params = params.append(key, String(v));
          });
        } else {
          params = params.set(key, String(value));
        }
      }
    });

    return params;
  }
}
