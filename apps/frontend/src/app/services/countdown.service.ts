import { Injectable, signal } from '@angular/core';
import { timer } from 'rxjs';

export interface TimeLeft {
  days: number;
  hrs: number;
  min: number;
  sec: number;
}

@Injectable({ providedIn: 'root' })
export class CountdownService {
  start(target: Date, intervalMs = 1000) {
    const timeLeft = signal<TimeLeft>({ days: 0, hrs: 0, min: 0, sec: 0 });

    const sub = timer(0, intervalMs).subscribe(() => {
      const now = new Date().getTime();
      const diff = target.getTime() - now;

      if (diff > 0) {
        timeLeft.set({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hrs: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          min: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          sec: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        timeLeft.set({ days: 0, hrs: 0, min: 0, sec: 0 });
      }
    });

    return { timeLeft, sub };
  }
}
