import {
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  FormControl,
} from '@angular/forms';
import { UserService } from '../../../services/user.service';
import {
  MemberStatus,
  UpdateUserDTO,
  UserInvitationResponse,
  UserResponse,
} from '@h.linker/libs';
import {
  MatChipGrid, MatChipInput,
  MatChipRemove,
  MatChipRow,
} from '@angular/material/chips';
import { MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import AuthService from '../../../services/auth.service';
import { NotificationService } from '../../../utils/notification.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ImageUploadService } from '../../../services/image-upload.service';
import { MatDialog } from '@angular/material/dialog';
import { SettingsFooterComponent } from '../../settings/settings-footer.component';
import { SettingsSectionComponent } from '../../settings/settings-section.component';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog.component';
import { TeamService } from '../../../services/team.service';
import { MatTooltip } from '@angular/material/tooltip';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatOption,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CategoryService } from '../../../services/category.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: [
    '../../settings/settings.scss',
    './profile-settings.component.scss',
  ],
  imports: [
    MatChipGrid,
    MatChipRemove,
    MatLabel,
    MatHint,
    MatFormField,
    MatIcon,
    ReactiveFormsModule,
    MatButton,
    MatChipRow,
    MatIconButton,
    MatInput,
    SettingsFooterComponent,
    SettingsSectionComponent,
    NgOptimizedImage,
    RouterLink,
    DatePipe,
    MatTooltip,
    MatChipInput,
    MatAutocomplete,
    MatOption,
    MatAutocompleteTrigger,
  ],
})
export class ProfileSettingsComponent implements OnInit {
  @ViewChild('skillInput') skillInput!: ElementRef<HTMLInputElement>;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isChangingPassword = signal(false);

  user = signal<UserResponse | null>(null);
  skills = signal<string[]>([]);
  invitations = signal<UserInvitationResponse[]>([]);

  connectedCount = computed(() => {
    let count = 1;
    if (this.user()?.githubId) {
      count++;
    }
    return count;
  });

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  skillCtrl = new FormControl('');

  protected readonly categoryService = inject(CategoryService);
  isSaving = signal(false);
  protected readonly authService = inject(AuthService);
  protected readonly userService = inject(UserService);
  protected readonly teamService = inject(TeamService);
  private readonly fb = inject(FormBuilder);
  private readonly notify = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  bioPreview = computed(() => {
    const bio = this.user()?.bio;
    if (!bio) return 'Full-stack developer';

    const maxLength = 60;
    return bio.length > maxLength ? bio.substring(0, maxLength) + '...' : bio;
  });

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      username: ['', Validators.required],
      bio: ['', Validators.maxLength(300)],
    });

    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const newPass = control.get('newPassword');
    const confirmPass = control.get('confirmPassword');
    return newPass && confirmPass && newPass.value !== confirmPass.value
      ? { passwordMismatch: true }
      : null;
  };

  ngOnInit() {
    this.loadUserData();
    this.loadInvitations();
    this.checkExternalErrors();
  }

  filteredSkills = toSignal(
    this.skillCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((value) => !!value && value.length >= 2),
      switchMap((query) => this.categoryService.searchCategories(query || '')),
      map((res) => res.categories),
    ),
    { initialValue: [] as string[] },
  );

  checkExternalErrors() {
    this.route.queryParams.subscribe((params) => {
      if (params['error']) {
        this.notify.error(params['error']);

        window.history.replaceState({}, '', window.location.pathname);
      }
    });
  }

  loadUserData() {
    this.authService.user$.subscribe((userData) => {
      if (userData) {
        this.user.set(userData);
        this.skills.set(userData.skills || []);

        this.profileForm.patchValue({
          firstName: userData.firstName,
          lastName: userData.lastName,
          bio: userData.bio,
          username: userData.username,
        });
        this.profileForm.markAsPristine();
      }
    });
  }

  loadInvitations() {
    this.teamService.getMyInvitations().subscribe({
      next: (res) => {
        this.invitations.set(res.invitations);
        console.log(res);
      },
      error: () => this.notify.error('Failed to load invitations'),
    });
  }

  acceptInvitation(teamId: string) {
    this.handleInvitation(teamId, MemberStatus.ACCEPTED);
  }

  rejectInvitation(teamId: string) {
    this.handleInvitation(teamId, MemberStatus.REJECTED);
  }

  private handleInvitation(teamId: string, status: MemberStatus) {
    const currentUserId = this.user()?.id;
    if (!currentUserId) return;

    this.teamService.respondToRequest(teamId, currentUserId, status).subscribe({
      next: () => {
        const msg =
          status === MemberStatus.ACCEPTED
            ? 'Joined the team!'
            : 'Invitation declined';
        this.notify.success(msg);

        this.invitations.update((prev) =>
          prev.filter((i) => i.teamId !== teamId),
        );

        if (status === MemberStatus.ACCEPTED) {
          this.loadUserData();
        }
      },
      error: (err) => this.notify.error(err.error?.message || 'Action failed'),
    });
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.isSaving.set(true);

    this.imageUploadService.upload(file).subscribe({
      next: (imageUrl) => {
        this.user.update((u) => (u ? { ...u, avatarUrl: imageUrl } : null));

        this.profileForm.markAsDirty();

        this.notify.success('Photo uploaded! Don’t forget to save changes.');
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.notify.error('Failed to upload image');
        this.isSaving.set(false);
      },
    });
  }

  onDeleteAccount() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Account',
        message:
          'Are you sure you want to delete your account? This action is permanent and all your data (skills, integrations, bio) will be lost forever.',
        confirmText: 'Yes, Delete',
        isDanger: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.deleteMe();
        this.notify.success('Account deleted successfully');
        this.router.navigate(['/login']);
      }
    });
  }

  addSkill(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    const currentSkills = this.skills();

    if (value && !currentSkills.includes(value)) {
      this.skills.update((s) => [...s, value]);
      this.profileForm.markAsDirty();
    }

    event.chipInput?.clear();
    this.skillCtrl.setValue(null);
  }

  removeSkill(skill: string): void {
    this.skills.update((s) => s.filter((item) => item !== skill));
    this.profileForm.markAsDirty();
  }

  selectedSkill(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    const currentSkills = this.skills();

    if (!currentSkills.includes(value)) {
      this.skills.update((s) => [...s, value]);
      this.profileForm.markAsDirty();
    }

    this.skillInput.nativeElement.value = '';
    this.skillCtrl.setValue(null);
  }

  onSave() {
    if (this.profileForm.valid) {
      this.isSaving.set(true);

      const updateData: UpdateUserDTO = {
        ...this.profileForm.value,
        avatarUrl: this.user()?.avatarUrl,
        skills: this.skills(),
      };

      this.userService.updateProfile(updateData).subscribe({
        next: (updated) => {
          this.user.set(updated);
          this.authService.updateUserState(updated);

          this.skills.set(updated.skills || []);

          this.notify.success('Profile saved successfully');
          this.isSaving.set(false);
          this.profileForm.markAsPristine();
        },
        error: () => this.isSaving.set(false),
      });
    }
  }

  onUpdatePassword() {
    if (this.passwordForm.valid) {
      this.isChangingPassword.set(true);

      this.authService.updatePassword(this.passwordForm.value).subscribe({
        next: () => {
          this.notify.success('Password updated successfully');
          this.passwordForm.reset();
          this.isChangingPassword.set(false);
          Object.keys(this.passwordForm.controls).forEach((key) => {
            this.passwordForm.get(key)?.setErrors(null);
          });
        },
        error: (err) => {
          this.notify.error(err.error?.message || 'Failed to update password');
          this.isChangingPassword.set(false);
        },
      });
    }
  }
}
