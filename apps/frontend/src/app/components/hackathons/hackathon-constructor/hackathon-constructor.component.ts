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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  forkJoin,
  map,
  of,
  switchMap,
} from 'rxjs';

import { HackathonService } from '../../../services/hackathon.service';
import { UserService } from '../../../services/user.service';
import { SettingsSectionComponent } from '../../settings/settings-section.component';
import {
  HackathonStatus,
  FullHackathonResponse,
  CreateHackathonDTO,
  UpdateHackathonDTO,
  CriterionDTO,
  UserResponse,
  JuryDisplay,
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
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AuthService } from '../../../services/auth.service';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

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
    RouterLink,
    BreadcrumbComponent,
  ],
  templateUrl: './hackathon-constructor.component.html',
  styleUrls: ['./hackathon-constructor.component.scss'],
})
export class HackathonConstructorComponent implements OnInit {
  currentStep = signal(0);
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('categoryInput') categoryInput!: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private hackathonService = inject(HackathonService);
  private categoryService = inject(CategoryService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private imageUploadService = inject(ImageUploadService);
  private authService = inject(AuthService);

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

  jurySearchCtrl = new FormControl('');
  selectedJury = signal<JuryDisplay[]>([]);
  filteredUsers = toSignal(
    this.jurySearchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((val) =>
        val && val.length >= 2
          ? this.userService.getAll(val).pipe(map((res) => res.users))
          : of([]),
      ),
    ),
    { initialValue: [] as UserResponse[] },
  );

  hackathonId = signal<string | null>(null);
  isLinearStepper = computed(() => !this.hackathonId());
  isSaving = signal(false);
  currentUser = toSignal(this.authService.user$);

  infoForm = this.fb.group({
    title: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
    ],
    slug: ['', [Validators.required, Validators.maxLength(120)]],
    prize: ['', [Validators.maxLength(200)]],
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
    const current = this.detailsForm.controls.categories.value || [];
    if (value && !current.includes(value)) {
      this.detailsForm.controls.categories.setValue([...current, value]);
      this.detailsForm.markAsDirty();
    }
    event.chipInput?.clear();
    this.categoryCtrl.setValue(null);
  }

  removeCategory(category: string): void {
    const current = this.detailsForm.controls.categories.value || [];
    this.detailsForm.controls.categories.setValue(
      current.filter((c) => c !== category),
    );
    this.detailsForm.markAsDirty();
  }

  selectedCategory(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    const current = this.detailsForm.controls.categories.value || [];
    if (!current.includes(value)) {
      this.detailsForm.controls.categories.setValue([...current, value]);
      this.detailsForm.markAsDirty();
    }
    this.categoryInput.nativeElement.value = '';
    this.categoryCtrl.setValue(null);
  }

  addJury(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as UserResponse;
    const id = this.hackathonId();

    if (!id) {
      this.notificationService.error('Save identity first!');
      return;
    }

    if (this.selectedJury().some((u) => u.id === user.id)) return;

    this.isSaving.set(true);
    this.hackathonService.addJury(id, { userId: user.id }).subscribe({
      next: () => {
        this.selectedJury.update((prev) => [
          ...prev,
          {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl ?? undefined,
            firstName: user.firstName,
            lastName: user.lastName ?? undefined,
          },
        ]);
        this.isSaving.set(false);
        this.notificationService.success(`${user.username} added to jury`);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message);
      },
    });

    this.jurySearchCtrl.setValue('');
  }

  removeJury(userId: string): void {
    const id = this.hackathonId();
    if (!id) return;

    this.isSaving.set(true);
    this.hackathonService.removeJury(id, userId).subscribe({
      next: () => {
        this.selectedJury.update((prev) => prev.filter((u) => u.id !== userId));
        this.isSaving.set(false);
        this.notificationService.success('Jury member removed');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message);
      },
    });
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
    const params = this.route.snapshot.queryParamMap;
    const id = params.get('id');
    const step = params.get('step');

    if (id) {
      this.loadHackathonData(id);
    }

    if (step) {
      this.currentStep.set(Number(step));
    }
  }

  onStepChange(event: StepperSelectionEvent): void {
    this.currentStep.set(event.selectedIndex);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        step: event.selectedIndex,
        id: this.hackathonId(),
      },
      queryParamsHandling: 'merge',
    });
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
        this.notificationService.success('Banner uploaded!');
        this.isSaving.set(false);
      },
      error: () => {
        this.notificationService.error('Upload failed');
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
        const user = this.currentUser();

        if (!user || h.creator.id !== user.id) {
          this.notificationService.error(
            'Access denied. You are not the creator of this event.',
          );
          this.router.navigate(['/events']);
          return;
        }

        this.hackathonId.set(h.id);
        this.infoForm.patchValue({
          title: h.title,
          slug: h.slug,
          description: h.description,
          prize: h.prize || '',
          imageUrl: h.imageUrl,
          registrationStartDate: new Date(h.registrationStartDate),
          startDate: new Date(h.startDate),
          submissionDeadline: new Date(h.submissionDeadline),
          endDate: new Date(h.endDate),
        });

        this.statusForm.patchValue({ status: h.status });
        this.detailsForm.patchValue({ categories: h.categories });

        const juryData: JuryDisplay[] = (h.jury || []).map((j) => ({
          id: j.userId,
          username: j.username,
          avatarUrl: j.avatarUrl ?? undefined,
        }));
        this.selectedJury.set(juryData);

        this.criteriaArray.clear();
        h.criteria?.forEach((c) => {
          this.criteriaArray.push(
            this.fb.group({
              name: [c.name, Validators.required],
              weight: [
                c.weight,
                [Validators.required, Validators.min(1), Validators.max(100)],
              ],
              maxValue: [
                c.maxValue || 10,
                [Validators.required, Validators.min(1)],
              ],
            }),
          );
        });
      },
      error: () => this.notificationService.error('Failed to load data'),
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
        maxValue: [10, [Validators.required, Validators.min(1)]],
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
    )
      return;

    this.isSaving.set(true);
    const payload: CreateHackathonDTO = {
      title,
      slug,
      description: raw.description ?? undefined,
      prize: raw.prize || undefined,
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
        this.hackathonId.set(res.id);

        this.isSaving.set(false);
        this.infoForm.markAsPristine();

        this.notificationService.success('Identity saved');
        stepper.next();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message);
      },
    });
  }

  displayFn(): string {
    return '';
  }

  saveDetails(stepper: MatStepper): void {
    const id = this.hackathonId();
    if (!id || this.totalWeight() !== 100) return;

    this.isSaving.set(true);
    const raw = this.detailsForm.getRawValue();

    forkJoin({
      categories: this.hackathonService.setCategories(id, {
        categories: raw.categories || [],
      }),
      criteria: this.hackathonService.setCriteria(id, {
        criteria: raw.criteria as CriterionDTO[],
      }),
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.detailsForm.markAsPristine();
        this.notificationService.success('Details saved successfully');
        stepper.next();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message);
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

        const option = this.statusOptions.find(
          (opt) => opt.value === newStatus,
        );
        const label = option ? option.label : newStatus;
        this.notificationService.success(
          `Hackathon status updated to: ${label}`,
        );
      },
      error: () => {
        this.isSaving.set(false);
        this.notificationService.error('Update failed');
      },
    });
  }

  goToView(): void {
    const slug = this.infoForm.get('slug')?.value;
    if (slug) {
      this.router.navigate(['/events', slug]);
    } else {
      this.notificationService.error(
        'Slug is missing, cannot navigate to view',
      );
    }
  }
}
