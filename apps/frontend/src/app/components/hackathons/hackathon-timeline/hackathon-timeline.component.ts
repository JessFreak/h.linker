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

  // Сховище для значень (сигнал)
  private timelineState = signal<any>(null);

  // Зберігаємо посилання на форму для шаблону
  public _formGroup?: FormGroup;

  @Input() readonly = false;

  @Input() set formGroup(fg: FormGroup | undefined) {
    this._formGroup = fg; // Зберігаємо форму тут!
    if (fg) {
      fg.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((val) => this.timelineState.set(val));
      this.timelineState.set(fg.value);
    }
  }

  @Input() set data(val: any) {
    if (val) {
      this.timelineState.set(val);
    }
  }

  dates = computed(() => {
    const s = this.timelineState();
    if (!s) return null;
    return {
      regStart: s.registrationStartDate
        ? new Date(s.registrationStartDate)
        : null,
      start: s.startDate ? new Date(s.startDate) : null,
      subEnd: s.submissionDeadline ? new Date(s.submissionDeadline) : null,
      end: s.endDate ? new Date(s.endDate) : null,
    };
  });

  timelineError = computed(() => {
    const d = this.dates();
    if (!d || !d.regStart || !d.start || !d.subEnd || !d.end) return null;
    if (d.regStart >= d.start)
      return 'Registration must be before Hackathon Starts';
    if (d.start >= d.subEnd)
      return 'Hackathon must start before Submission Deadline';
    if (d.subEnd > d.end) return 'Deadline must be before or at Hackathon Ends';
    return null;
  });

  timelinePercentages = computed(() => {
    const d = this.dates();
    if (
      this.timelineError() ||
      !d ||
      !d.regStart ||
      !d.start ||
      !d.subEnd ||
      !d.end
    )
      return null;

    const totalMs = d.end.getTime() - d.regStart.getTime();
    if (totalMs <= 0) return null;

    const toDays = (ms: number) =>
      Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));

    return {
      pctA: ((d.start.getTime() - d.regStart.getTime()) / totalMs) * 100,
      pctB: ((d.subEnd.getTime() - d.start.getTime()) / totalMs) * 100,
      pctC: ((d.end.getTime() - d.subEnd.getTime()) / totalMs) * 100,
      daysA: toDays(d.start.getTime() - d.regStart.getTime()),
      daysB: toDays(d.subEnd.getTime() - d.start.getTime()),
      daysC: toDays(d.end.getTime() - d.subEnd.getTime()),
    };
  });
}
