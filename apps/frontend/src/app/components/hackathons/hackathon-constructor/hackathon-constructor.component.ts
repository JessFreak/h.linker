import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  OnInit,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormArray,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { toSignal } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
} from 'rxjs';

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
import { MatTooltip } from '@angular/material/tooltip';
import { HackathonWeightPreviewComponent } from '../hackathon-weight-preview.component';
import { CategoryService } from '../../../services/category.service';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';

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
    MatTooltip,
    MatChipsModule,
    MatAutocompleteModule,
    HackathonWeightPreviewComponent,
  ],
  templateUrl: './hackathon-constructor.component.html',
  styleUrls: ['./hackathon-constructor.component.scss'],
})
export class HackathonConstructorComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('categoryInput') categoryInput!: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private hackathonService = inject(HackathonService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private imageUploadService = inject(ImageUploadService);

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  categoryCtrl = new FormControl('');

  filteredCategories = toSignal(
    this.categoryCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((value) => !!value && value.length >= 2),
      switchMap((query) => this.categoryService.searchCategories(query || '')),
      map((res) => res.categories),
    ),
    { initialValue: [] as string[] },
  );

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

  statusForm = this.fb.group({
    status: [HackathonStatus.DRAFT, Validators.required],
  });

  readonly statusOptions = [
    {
      value: HackathonStatus.DRAFT,
      label: 'Draft',
      icon: 'edit_note',
      desc: 'Visible only to organizers.',
    },
    {
      value: HackathonStatus.REGISTRATION,
      label: 'Registration',
      icon: 'how_to_reg',
      desc: 'Participants can join teams.',
    },
    {
      value: HackathonStatus.ACTIVE,
      label: 'Active',
      icon: 'rocket_launch',
      desc: 'Hackathon is ongoing. Submissions open.',
    },
    {
      value: HackathonStatus.FINISHED,
      label: 'Finished',
      icon: 'emoji_events',
      desc: 'Event ended. Judging phase.',
    },
  ];

  addCategory(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    const currentCategories = this.detailsForm.controls.categories.value || [];

    if (value && !currentCategories.includes(value)) {
      this.detailsForm.controls.categories.setValue([
        ...currentCategories,
        value,
      ]);
      this.detailsForm.markAsDirty();
    }

    event.chipInput?.clear();
    this.categoryCtrl.setValue(null);
  }

  removeCategory(category: string): void {
    const currentCategories = this.detailsForm.controls.categories.value || [];
    const index = currentCategories.indexOf(category);

    if (index >= 0) {
      const updated = [...currentCategories];
      updated.splice(index, 1);
      this.detailsForm.controls.categories.setValue(updated);
      this.detailsForm.markAsDirty();
    }
  }

  selectedCategory(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    const currentCategories = this.detailsForm.controls.categories.value || [];

    if (!currentCategories.includes(value)) {
      this.detailsForm.controls.categories.setValue([
        ...currentCategories,
        value,
      ]);
      this.detailsForm.markAsDirty();
    }

    this.categoryInput.nativeElement.value = '';
    this.categoryCtrl.setValue(null);
  }

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

  getStatusDetail(value: HackathonStatus | null | undefined) {
    return this.statusOptions.find((opt) => opt.value === value);
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

        this.statusForm.patchValue({ status: h.status });
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

  updateStatus(): void {
    const id = this.hackathonId();
    const newStatus = this.statusForm.value.status;

    if (!id || !newStatus) return;

    this.isSaving.set(true);
    this.hackathonService.updateStatus(id, newStatus).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.statusForm.markAsPristine();
        this.notificationService.success(`Status updated to ${newStatus}`);
      },
      error: () => {
        this.isSaving.set(false);
        this.notificationService.error('Failed to update status');
      },
    });
  }
}
