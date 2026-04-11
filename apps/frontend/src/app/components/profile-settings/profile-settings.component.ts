import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UpdateUserDTO, UserResponse } from '@h.linker/libs';
import {
  MatChipGrid,
  MatChipRemove,
  MatChipRow,
} from '@angular/material/chips';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import AuthService from '../../services/auth.service';
import { NotificationService } from '../../utils/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageUploadService } from '../../services/image-upload.service';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
  imports: [
    MatChipGrid,
    MatCardContent,
    MatChipRemove,
    MatCardHeader,
    MatCard,
    MatLabel,
    MatHint,
    MatCardTitle,
    MatFormField,
    MatIcon,
    ReactiveFormsModule,
    MatButton,
    MatChipRow,
    MatIconButton,
    MatInput,
    MatError,
  ],
})
export class ProfileSettingsComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isChangingPassword = signal(false);

  user = signal<UserResponse | null>(null);
  skills = signal<string[]>([]);

  connectedCount = computed(() => {
    let count = 1;
    if (this.user()?.githubId) {
      count++;
    }
    return count;
  });

  isSaving = signal(false);
  protected readonly authService = inject(AuthService);
  protected readonly userService = inject(UserService);
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
    this.checkExternalErrors();
  }

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
      }
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
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.deleteMe();
        this.notify.success('Account deleted successfully');
        this.router.navigate(['/login']);
      }
    });
  }

  addSkill(input: HTMLInputElement) {
    const value = input.value.trim();
    if (value) {
      this.skills.update((s) => [...s, value]);
      input.value = '';
      this.profileForm.markAsDirty();
    }
  }

  removeSkill(skill: string) {
    this.skills.update((s) => s.filter((item) => item !== skill));
    this.profileForm.markAsDirty();
  }

  onSave() {
    if (this.profileForm.valid) {
      this.isSaving.set(true);

      const updateData: UpdateUserDTO = {
        ...this.profileForm.value,
        avatarUrl: this.user()?.avatarUrl,
        skills: this.skills(), // Відправляємо актуальний масив скілів
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
