import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private readonly http = inject(HttpClient);

  upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${environment.imgbbApiUrl}?key=${environment.imgbbApiKey}`;

    return this.http.post<any>(url, formData).pipe(map((res) => res.data.url));
  }
}
