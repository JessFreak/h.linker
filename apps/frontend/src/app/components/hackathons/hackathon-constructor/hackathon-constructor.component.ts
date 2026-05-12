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
  FormGroup,
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
import {
  HackathonStatus,
  FullHackathonResponse,
  CreateHackathonDTO,
  UpdateHackathonDTO,
  CriterionDTO,
} from '@h.linker/libs';
import { NotificationService } from '../../../utils/notification.service';
import { HackathonTimelineComponent } from '../hackathon-timeline/hackathon-timeline.component';
import { ImageUploadService } from '../../../services/image-upload.service';

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
  private imageUploadService = inject(ImageUploadService);

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
    criteria: this.fb.array<FormGroup>([]),
  });

  private detailsValue = toSignal(this.detailsForm.valueChanges, {
    initialValue: this.detailsForm.getRawValue(),
  });

  get criteriaArray(): FormArray<FormGroup> {
    return this.detailsForm.get('criteria') as FormArray<FormGroup>;
  }

  totalWeight = computed(() => {
    const criteria = this.detailsValue().criteria || [];
    return criteria.reduce(
      (acc: number, curr: Partial<{ weight: number | null }>) =>
        acc + (Number(curr?.weight) || 0),
      0,
    );
  });

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.loadHackathonData(id);
    }
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isSaving.set(true);
    this.imageUploadService.upload(file).subscribe({
      next: (imageUrl: string) => {
        this.infoForm.patchValue({ imageUrl });
        this.infoForm.get('imageUrl')?.markAsDirty();
        this.notificationService.success(
          'Banner uploaded! Remember to save changes.',
        );
        this.isSaving.set(false);
      },
      error: (err: unknown) => {
        console.error('Upload failed:', err);
        this.notificationService.error('Failed to upload banner');
        this.isSaving.set(false);
      },
    });
  }

  private loadHackathonData(id: string): void {
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

  addCriterion(): void {
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

  removeCriterion(index: number): void {
    this.criteriaArray.removeAt(index);
    this.detailsForm.markAsDirty();
  }

  saveIdentity(stepper: MatStepper): void {
    if (this.infoForm.invalid) return;

    const raw = this.infoForm.getRawValue();
    const {
      title,
      slug,
      registrationStartDate,
      startDate,
      submissionDeadline,
      endDate,
    } = raw;

    if (
      !title ||
      !slug ||
      !registrationStartDate ||
      !startDate ||
      !submissionDeadline ||
      !endDate
    ) {
      return;
    }

    this.isSaving.set(true);

    const payload: CreateHackathonDTO = {
      title,
      slug,
      description: raw.description ?? undefined,
      imageUrl: raw.imageUrl ?? undefined,
      registrationStartDate: registrationStartDate.toISOString(),
      startDate: startDate.toISOString(),
      submissionDeadline: submissionDeadline.toISOString(),
      endDate: endDate.toISOString(),
    };

    const id = this.hackathonId();
    const request = id
      ? this.hackathonService.update(id, payload as UpdateHackathonDTO)
      : this.hackathonService.create(payload);

    request.subscribe({
      next: (res: FullHackathonResponse) => {
        const isNew = !this.hackathonId();
        this.hackathonId.set(res.id);
        this.isSaving.set(false);
        this.infoForm.markAsPristine();

        if (isNew) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { id: res.id },
            queryParamsHandling: 'merge',
          });
        }

        this.notificationService.success('Identity and Timeline updated');
        stepper.next();
      },
      error: () => {
        this.isSaving.set(false);
        this.notificationService.error('Failed to save identity');
      },
    });
  }

  saveDetails(stepper: MatStepper): void {
    const id = this.hackathonId();
    if (!id || this.totalWeight() !== 100) return;

    this.isSaving.set(true);
    const raw = this.detailsForm.getRawValue();

    const categories = raw.categories || [];
    const criteria = raw.criteria as CriterionDTO[];

    this.hackathonService.setCategories(id, { categories }).subscribe();
    this.hackathonService.setCriteria(id, { criteria }).subscribe({
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

  publish(): void {
    const id = this.hackathonId();
    if (!id) return;

    this.isSaving.set(true);
    this.hackathonService.updateStatus(id, HackathonStatus.ACTIVE).subscribe({
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
