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
import { AuthService } from '../../../services/auth.service';
import { Subscription, debounceTime, forkJoin, of } from 'rxjs';
import { NotificationService } from '../../../utils/notification.service';
import { toSignal } from '@angular/core/rxjs-interop';

export interface EvaluationFormValues {
  summary: string;
  strengths: string;
  weaknesses: string;
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
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  currentUser = toSignal(this.authService.user$);
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

  scoredCount = computed(() => {
    const userId = this.currentUser()?.id;
    if (!userId) return 0;
    return this.submissions().filter((s) =>
      s.otherScores.some((os) => os.userId === userId),
    ).length;
  });

  otherJuryScores = computed(() => {
    const h = this.hackathon();
    const sub = this.currentSub();
    const myId = this.currentUser()?.id;
    if (!h || !sub) return [];

    return (h.jury || [])
      .filter((j) => j.userId !== myId)
      .map((j) => {
        const scoreDoc = sub.otherScores.find((os) => os.userId === j.userId);
        return {
          name: j.username || 'Juror',
          avatarUrl: j.avatarUrl || undefined,
          score: scoreDoc ? scoreDoc.score : null,
        };
      });
  });

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
          error: (err) => {
            if (err.status === 403) {
              this.notificationService.error('Access denied. You are not a jury member for this event.');
            } else {
              this.notificationService.error('Failed to load participant submissions.');
            }
            this.isLoading.set(false);
            this.router.navigate(['/events', slug]);
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
      summary: ['', Validators.maxLength(800)],
      strengths: ['', Validators.maxLength(500)],
      weaknesses: ['', Validators.maxLength(500)],
    };
    criteria.forEach((c) => {
      group[c.id] = [0, [Validators.min(1), Validators.max(c.maxValue)]];
    });
    this.evalForm = this.fb.group(group);
  }

  isTeamEvaluatedByMe(sub: JurySubmissionItem): boolean {
    const myId = this.currentUser()?.id;
    if (!myId) return false;
    return sub.otherScores.some((os) => os.userId === myId);
  }

  selectTeam(index: number) {
    this.formListenerSub?.unsubscribe();
    this.currentIndex.set(index);

    const sub = this.currentSub();
    const h = this.hackathon();
    if (!sub || !h) return;

    this.evalForm.reset(
      { summary: '', strengths: '', weaknesses: '' },
      { emitEvent: false },
    );

    const storageKey = `h_linker_draft:${h.id}:${sub.participationId}`;
    const savedDraft = localStorage.getItem(storageKey);

    if (savedDraft) {
      try {
        const parsedData = JSON.parse(savedDraft) as EvaluationFormValues;
        this.evalForm.patchValue(parsedData, { emitEvent: false });
        this.draftStatus.set('Unsaved draft loaded from local storage');
      } catch (e) {
        console.error('Failed to parse draft data', e);
      }
    } else if (
      sub.submittedScores &&
      Object.keys(sub.submittedScores).length > 0
    ) {
      const dbValues: Record<string, unknown> = {
        summary: sub.submittedComment || '',
        strengths: sub.submittedStrengths || '',
        weaknesses: sub.submittedWeaknesses || '',
        ...sub.submittedScores,
      };
      this.evalForm.patchValue(dbValues, { emitEvent: false });
      this.draftStatus.set('Saved evaluation loaded from database');
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
    if (!h || !sub || this.evalForm.invalid) return;

    const formValues = this.evalForm.value as EvaluationFormValues;
    const { summary, strengths, weaknesses, ...criteriaScores } = formValues;

    const scores: Record<string, number> = {};
    Object.entries(criteriaScores).forEach(([key, val]) => {
      scores[key] = Number(val ?? 0);
    });

    this.draftStatus.set('Saving evaluation...');

    const hasComment =
      (summary && summary.trim().length > 0) ||
      (strengths && strengths.trim().length > 0) ||
      (weaknesses && weaknesses.trim().length > 0);

    const commentPayload = { summary, strengths, weaknesses };

    forkJoin({
      score: this.hackathonService.submitScores(
        h.id,
        sub.participationId,
        scores,
      ),
      comment: hasComment
        ? this.hackathonService.submitComment(
            h.id,
            sub.participationId,
            commentPayload,
          )
        : of(null),
    }).subscribe({
      next: () => {
        const storageKey = `h_linker_draft:${h.id}:${sub.participationId}`;
        localStorage.removeItem(storageKey);

        this.notificationService.success(
          `Evaluation for team "${sub.teamName}" successfully saved`,
        );

        const myId = this.currentUser()?.id;
        const myName = this.currentUser()?.username;
        if (myId && myName) {
          this.submissions.update((subs) =>
            subs.map((s, idx) =>
              idx === this.currentIndex()
                ? {
                    ...s,
                    submittedScores: scores,
                    submittedComment: hasComment ? summary : '',
                    otherScores: [
                      ...s.otherScores.filter((os) => os.userId !== myId),
                      {
                        userId: myId,
                        username: myName,
                        avatarUrl: this.currentUser()?.avatarUrl ?? undefined,
                        score: Number(this.calculatedScore().toFixed(1)),
                      },
                    ],
                  }
                : s,
            ),
          );
        }

        this.nextTeam();
      },
      error: (err) => {
        this.notificationService.error(err.message);
        this.draftStatus.set('Error saving changes');
      },
    });
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
