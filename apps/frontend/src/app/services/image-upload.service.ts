import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ImgbbResponse {
  data: {
    url: string;
    image?: {
      url: string;
    };
  };
  success: boolean;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private readonly http = inject(HttpClient);

  upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${environment.imgbbApiUrl}?key=${environment.imgbbApiKey}`;

    return this.http.post<ImgbbResponse>(url, formData).pipe(
      map((res) => {
        return res.data.image?.url || res.data.url;
      }),
    );
  }
}
