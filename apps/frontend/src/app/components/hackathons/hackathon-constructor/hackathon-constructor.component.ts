import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { toSignal } from '@angular/core/rxjs-interop';

import { HackathonService } from '../../../services/hackathon.service';
import { SettingsSectionComponent } from '../../settings/settings-section.component';
import { HackathonStatus, FullHackathonResponse } from '@h.linker/libs';
import { NotificationService } from '../../../utils/notification.service';
import { HackathonTimelineComponent } from '../hackathon-timeline/hackathon-timeline.component';

@Component({
  selector: 'app-hackathon-constructor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    SettingsSectionComponent,
    HackathonTimelineComponent,
  ],
  templateUrl: './hackathon-constructor.component.html',
  styleUrls: ['./hackathon-constructor.component.scss'],
})
export class HackathonConstructorComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  private fb = inject(FormBuilder);
  private hackathonService = inject(HackathonService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  hackathonId = signal<string | null>(null);
  isSaving = signal(false);

  infoForm = this.fb.group({
    title: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
    ],
    slug: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(2000)]],
    imageUrl: [''],
    registrationStartDate: [null as Date | null, Validators.required],
    startDate: [null as Date | null, Validators.required],
    submissionDeadline: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required],
  });

  detailsForm = this.fb.group({
    categories: [[] as string[]],
    criteria: this.fb.array([]),
  });

  private detailsValue = toSignal(this.detailsForm.valueChanges, {
    initialValue: this.detailsForm.value,
  });

  get criteriaArray() {
    return this.detailsForm.get('criteria') as FormArray;
  }

  totalWeight = computed(() => {
    const criteria = this.detailsValue()?.criteria || [];
    return criteria.reduce(
      (acc: number, curr: any) => acc + (Number(curr?.weight) || 0),
      0,
    );
  });

  isDirty = computed(() => this.infoForm.dirty || this.detailsForm.dirty);

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.loadHackathonData(id);
    }
  }

  private loadHackathonData(id: string) {
    this.hackathonService.getById(id).subscribe({
      next: (h: FullHackathonResponse) => {
        this.hackathonId.set(h.id);
        this.infoForm.patchValue({
          title: h.title,
          slug: h.slug,
          description: h.description,
          imageUrl: h.imageUrl,
          registrationStartDate: new Date(h.registrationStartDate),
          startDate: new Date(h.startDate),
          submissionDeadline: new Date(h.submissionDeadline),
          endDate: new Date(h.endDate),
        });
        this.detailsForm.patchValue({ categories: h.categories });
        this.criteriaArray.clear();
        h.criteria?.forEach((c) => {
          this.criteriaArray.push(
            this.fb.group({
              name: [c.name, Validators.required],
              weight: [
                c.weight,
                [Validators.required, Validators.min(1), Validators.max(100)],
              ],
              maxValue: [c.maxValue || 10],
            }),
          );
        });
      },
      error: () =>
        this.notificationService.error('Failed to load hackathon data'),
    });
  }

  addCriterion() {
    this.criteriaArray.push(
      this.fb.group({
        name: ['', Validators.required],
        weight: [
          10,
          [Validators.required, Validators.min(1), Validators.max(100)],
        ],
        maxValue: [10],
      }),
    );
  }

  removeCriterion(index: number) {
    this.criteriaArray.removeAt(index);
    this.detailsForm.markAsDirty();
  }

  saveIdentity(stepper: MatStepper) {
    if (this.infoForm.invalid) return;
    this.isSaving.set(true);
    const dto = this.infoForm.getRawValue() as any;
    const payload = {
      ...dto,
      registrationStartDate: new Date(dto.registrationStartDate).toISOString(),
      startDate: new Date(dto.startDate).toISOString(),
      submissionDeadline: new Date(dto.submissionDeadline).toISOString(),
      endDate: new Date(dto.endDate).toISOString(),
    };
    const request = this.hackathonId()
      ? this.hackathonService.update(this.hackathonId()!, payload)
      : this.hackathonService.create(payload);
    request.subscribe({
      next: (res) => {
        const isNew = !this.hackathonId();
        this.hackathonId.set(res.id);
        this.isSaving.set(false);
        this.infoForm.markAsPristine();
        if (isNew)
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { id: res.id },
            queryParamsHandling: 'merge',
          });
        this.notificationService.success('Identity and Timeline updated');
        stepper.next();
      },
      error: () => {
        this.isSaving.set(false);
        this.notificationService.error('Failed to save identity');
      },
    });
  }

  saveDetails(stepper: MatStepper) {
    if (!this.hackathonId() || this.totalWeight() !== 100) return;
    this.isSaving.set(true);
    const categories = this.detailsForm.value.categories || [];
    const criteria = this.criteriaArray.value;
    this.hackathonService
      .setCategories(this.hackathonId()!, { categories })
      .subscribe();
    this.hackathonService
      .setCriteria(this.hackathonId()!, { criteria })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.detailsForm.markAsPristine();
          this.notificationService.success('Scoring and Categories saved');
          stepper.next();
        },
        error: () => {
          this.isSaving.set(false);
          this.notificationService.error('Failed to save details');
        },
      });
  }

  publish() {
    if (!this.hackathonId()) return;
    this.isSaving.set(true);
    this.hackathonService
      .updateStatus(this.hackathonId()!, HackathonStatus.ACTIVE)
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notificationService.success('Hackathon is LIVE!');
        },
        error: () => {
          this.isSaving.set(false);
          this.notificationService.error('Failed to publish hackathon');
        },
      });
  }
}
