import { Component, inject, Input, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FullUserResponse } from '@h.linker/libs';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  imports: [
    MatCard,
    MatIcon,
    MatButton,
    MatChipSet,
    MatChip,
    MatProgressBar,
    MatTabGroup,
    MatTab,
    NgOptimizedImage,
  ],
})
export class UserProfileComponent {
  @Input() set username(name: string) {
    this.fetchProfile(name);
  }

  private userService = inject(UserService);

  user = signal<FullUserResponse | null>(null);
  isLoading = signal(true);

  fetchProfile(username: string) {
    this.isLoading.set(true);

    this.userService.getByUsername(username).subscribe({
      next: (data) => {
        this.user.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('User not found', err);
        this.isLoading.set(false);
      },
    });
  }
}
