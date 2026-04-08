import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UpdateUserDTO, UserResponse } from '@h.linker/libs';
import { MatChipGrid, MatChipRow } from '@angular/material/chips';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../utils/notification.service';
import { ActivatedRoute } from '@angular/router';
import { ImageUploadService } from '../../services/image-upload.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
  imports: [
    MatChipGrid,
    MatCardContent,
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
  ],
})
export class ProfileSettingsComponent implements OnInit {
  profileForm: FormGroup;
  user = signal<UserResponse | null>(null);
  skills = signal<string[]>([
    'React',
    'Node.js',
    'Python',
    'PostgreSQL',
    'Docker',
    'FastAPI',
  ]);

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

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      username: ['', Validators.required],
      bio: ['', Validators.maxLength(300)],
    });
  }

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

  addSkill(input: HTMLInputElement) {
    const value = input.value.trim();
    if (value && this.skills().length < 15) {
      this.skills.update((s) => [...s, value]);
      input.value = '';
    }
  }

  removeSkill(skill: string) {
    this.skills.update((s) => s.filter((item) => item !== skill));
  }

  onSave() {
    if (this.profileForm.valid) {
      this.isSaving.set(true);

      const updateData: UpdateUserDTO = {
        ...this.profileForm.value,
        avatarUrl: this.user()?.avatarUrl,
      };

      this.userService.updateProfile(updateData).subscribe({
        next: (updated) => {
          this.user.set(updated);
          this.authService.updateUserState(updated);
          this.notify.success('Profile saved successfully');
          this.isSaving.set(false);
          this.profileForm.markAsPristine();
        },
        error: () => this.isSaving.set(false),
      });
    }
  }
}
