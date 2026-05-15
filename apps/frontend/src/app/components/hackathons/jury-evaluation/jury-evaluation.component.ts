import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  CriterionResponse,
  FullHackathonResponse,
  JurySubmissionItem,
} from '@h.linker/libs';
import { HackathonService } from '../../../services/hackathon.service';

import { Subscription, debounceTime } from 'rxjs';
import { NotificationService } from '../../../utils/notification.service';

export interface EvaluationFormValues {
  review: string;
  [criterionId: string]: string | number | null | undefined;
}

@Component({
  selector: 'app-jury-evaluation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinner,
  ],
  templateUrl: './jury-evaluation.component.html',
  styleUrls: ['./jury-evaluation.component.scss'],
})
export class JuryEvaluationComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private hackathonService = inject(HackathonService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  hackathon = signal<FullHackathonResponse | null>(null);
  submissions = signal<JurySubmissionItem[]>([]);
  currentIndex = signal<number>(0);
  isLoading = signal(true);

  evalForm!: FormGroup;
  calculatedScore = signal<number>(0);
  draftStatus = signal<string>('No changes detected');

  private formListenerSub?: Subscription;

  currentSub = computed(() => {
    const subs = this.submissions();
    return subs.length > 0 ? subs[this.currentIndex()] : null;
  });

  mockOtherScores = [
    { name: 'Juror A', score: 7.9 },
    { name: 'Juror B', score: 9.0 },
    { name: 'Juror C', score: null },
  ];

  constructor() {
    effect(() => {
      const h = this.hackathon();
      if (h?.criteria && this.evalForm) {
        this.evalForm.valueChanges.subscribe(
          (values: Partial<EvaluationFormValues>) => {
            let total = 0;
            h.criteria.forEach((c) => {
              const val = Number(values[c.id] ?? 0);
              total += val * (c.weight / 100);
            });
            this.calculatedScore.set(total);
          },
        );
      }
    });
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadData(slug);
    }
  }

  ngOnDestroy() {
    this.formListenerSub?.unsubscribe();
  }

  private loadData(slug: string) {
    this.hackathonService.getBySlug(slug).subscribe({
      next: (h) => {
        this.hackathon.set(h);
        this.buildForm(h.criteria);

        this.hackathonService.getJurySubmissions(h.id).subscribe({
          next: (res) => {
            this.submissions.set(res.submissions);
            this.isLoading.set(false);

            if (res.submissions.length > 0) {
              this.selectTeam(0);
            }
          },
          error: () => {
            this.notificationService.error(
              'Failed to load participant submissions',
            );
            this.isLoading.set(false);
          },
        });
      },
      error: () => {
        this.notificationService.error('Failed to fetch hackathon details');
        this.isLoading.set(false);
        this.router.navigate(['/events']);
      },
    });
  }

  private buildForm(criteria: CriterionResponse[]) {
    const group: Record<string, unknown> = {
      review: ['', Validators.maxLength(800)],
    };
    criteria.forEach((c) => {
      group[c.id] = [0, [Validators.min(1), Validators.max(c.maxValue)]];
    });
    this.evalForm = this.fb.group(group);
  }

  selectTeam(index: number) {
    this.formListenerSub?.unsubscribe();

    this.currentIndex.set(index);

    const sub = this.currentSub();
    const h = this.hackathon();
    if (!sub || !h) return;

    this.evalForm.reset({ review: '' }, { emitEvent: false });

    const storageKey = `h_linker_draft:${h.id}:${sub.participationId}`;
    const savedDraft = localStorage.getItem(storageKey);

    if (savedDraft) {
      try {
        const parsedData = JSON.parse(savedDraft) as EvaluationFormValues;
        this.evalForm.patchValue(parsedData, { emitEvent: false });
        this.draftStatus.set('Draft loaded');
      } catch (e) {
        console.error('Failed to parse draft data', e);
      }
    } else {
      this.draftStatus.set('All changes saved to database');
    }

    this.updateCalculatedScore(this.evalForm.value as EvaluationFormValues);

    this.formListenerSub = this.evalForm.valueChanges.subscribe(
      (values: Partial<EvaluationFormValues>) => {
        this.updateCalculatedScore(values);
        this.draftStatus.set('Typing...');
      },
    );

    this.formListenerSub.add(
      this.evalForm.valueChanges
        .pipe(debounceTime(800))
        .subscribe((values: Partial<EvaluationFormValues>) => {
          localStorage.setItem(storageKey, JSON.stringify(values));
          const timeString = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          this.draftStatus.set(`Draft saved automatically at ${timeString}`);
        }),
    );
  }

  private updateCalculatedScore(values: Partial<EvaluationFormValues>) {
    const h = this.hackathon();
    if (!h?.criteria) return;

    let total = 0;
    h.criteria.forEach((c) => {
      const val = Number(values[c.id] ?? 0);
      total += val * (c.weight / 100);
    });
    this.calculatedScore.set(total);
  }

  onSaveAndNext() {
    const h = this.hackathon();
    const sub = this.currentSub();
    if (!h || !sub) return;

    const storageKey = `h_linker_draft:${h.id}:${sub.participationId}`;
    localStorage.removeItem(storageKey);

    this.notificationService.success(
      `Evaluation for team "${sub.teamName}" successfully saved`,
    );

    this.nextTeam();
  }

  nextTeam() {
    if (this.currentIndex() < this.submissions().length - 1) {
      this.selectTeam(this.currentIndex() + 1);
    }
  }

  prevTeam() {
    if (this.currentIndex() > 0) {
      this.selectTeam(this.currentIndex() - 1);
    }
  }

  getMathFormula(): string {
    const h = this.hackathon();
    if (!h) return '';
    return h.criteria
      .map((c) => `${c.weight}% x ${this.evalForm.get(c.id)?.value || 0}`)
      .join(' + ');
  }
}
