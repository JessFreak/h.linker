import { Component, inject, OnInit, signal } from '@angular/core';
import { HackathonService } from './services/hackathon';
import { HackathonStatus } from '@h.linker/libs';

@Component({
  selector: 'app-cool-root',
  template: ` <h1>Статус хакатону: {{ currentStatus() }}</h1> `,
})
export class AppComponent implements OnInit {
  currentStatus = signal<HackathonStatus | undefined>(undefined);

  statuses = HackathonStatus;
  private hackathonService = inject(HackathonService);

  ngOnInit() {
    this.hackathonService.getStatus().subscribe((response) => {
      console.log(response);
      this.currentStatus.set(response.status);
    });
  }
}
