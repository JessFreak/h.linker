import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HackathonStatus } from '@h.linker/libs';

@Injectable({
  providedIn: 'root',
})
export class HackathonService {
  private http = inject(HttpClient);

  getStatus(): Observable<{ status: HackathonStatus }> {
    return this.http.get<{ status: HackathonStatus }>('/api/status');
  }
}
