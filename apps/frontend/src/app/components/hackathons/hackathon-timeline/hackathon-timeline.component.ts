import {
  Component,
  Input,
  computed,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface TimelineInputData {
  registrationStartDate: string | Date | null;
  startDate: string | Date | null;
  submissionDeadline: string | Date | null;
  endDate: string | Date | null;
}

export interface TimelineDates {
  regStart: Date;
  start: Date;
  subEnd: Date;
  end: Date;
}

export interface TimelineCalculations {
  pctA: number;
  pctB: number;
  pctC: number;
  daysA: number;
  daysB: number;
  daysC: number;
}

@Component({
  selector: 'app-hackathon-timeline',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
  ],
  providers: [DatePipe],
  templateUrl: './hackathon-timeline.component.html',
  styleUrls: ['./hackathon-timeline.component.scss'],
})
export class HackathonTimelineComponent {
  private destroyRef = inject(DestroyRef);

  private timelineState = signal<Partial<TimelineInputData> | null>(null);

  public _formGroup?: FormGroup;

  @Input() readonly = false;

  @Input() set formGroup(fg: FormGroup | undefined) {
    this._formGroup = fg;
    if (fg) {
      fg.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((val: TimelineInputData) => {
          this.timelineState.set(val);
        });
      this.timelineState.set(fg.value as TimelineInputData);
    }
  }

  @Input() set data(val: TimelineInputData | null | undefined) {
    if (val) {
      this.timelineState.set(val);
    }
  }

  dates = computed<TimelineDates | null>(() => {
    const s = this.timelineState();
    if (
      !s ||
      !s.registrationStartDate ||
      !s.startDate ||
      !s.submissionDeadline ||
      !s.endDate
    ) {
      return null;
    }

    return {
      regStart: new Date(s.registrationStartDate),
      start: new Date(s.startDate),
      subEnd: new Date(s.submissionDeadline),
      end: new Date(s.endDate),
    };
  });

  timelineError = computed<string | null>(() => {
    const d = this.dates();
    if (!d) return null;

    if (d.regStart >= d.start)
      return 'Registration must be before Hackathon Starts';
    if (d.start >= d.subEnd)
      return 'Hackathon must start before Submission Deadline';
    if (d.subEnd > d.end) return 'Deadline must be before or at Hackathon Ends';

    return null;
  });

  timelinePercentages = computed<TimelineCalculations | null>(() => {
    const d = this.dates();
    const error = this.timelineError();

    if (error || !d) return null;

    const tReg = d.regStart.getTime();
    const tStart = d.start.getTime();
    const tSub = d.subEnd.getTime();
    const tEnd = d.end.getTime();

    const totalMs = tEnd - tReg;
    if (totalMs <= 0) return null;

    const toDays = (ms: number) =>
      Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));

    return {
      pctA: ((tStart - tReg) / totalMs) * 100,
      pctB: ((tSub - tStart) / totalMs) * 100,
      pctC: ((tEnd - tSub) / totalMs) * 100,
      daysA: toDays(tStart - tReg),
      daysB: toDays(tSub - tStart),
      daysC: toDays(tEnd - tSub),
    };
  });
}
