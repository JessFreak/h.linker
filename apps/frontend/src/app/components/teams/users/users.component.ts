import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';
import { UserResponse } from '@h.linker/libs';
import { UserService } from '../../../services/user.service';
import AuthService from '../../../services/auth.service';
import { NotificationService } from '../../../utils/notification.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCheckboxModule,
    RouterLink,
    NgOptimizedImage,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['../discovery-shared.scss', './users.component.scss'],
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);

  currentUser = toSignal(this.authService.user$);
  allUsers = signal<UserResponse[]>([]);

  searchQuery = signal('');
  showOnlyWithGithub = signal(false);

  filteredUsers = computed(() => {
    let list = this.allUsers();
    const currentId = this.currentUser()?.id;

    list = list.filter((u) => u.id !== currentId);

    if (this.showOnlyWithGithub()) {
      list = list.filter((u) => !!u.githubId);
    }

    const query = this.searchQuery().toLowerCase();
    if (query) {
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(query) ||
          u.skills.some((s) => s.toLowerCase().includes(query)),
      );
    }

    return list;
  });

  expandedUsers = signal<Set<string>>(new Set());

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (res) => this.allUsers.set(res.users),
      error: () => this.notify.error('Failed to load developers'),
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  toggleSkills(userId: string, event: Event) {
    event.stopPropagation(); // Щоб не спрацював перехід по картці, якщо він буде
    this.expandedUsers.update((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  isExpanded(userId: string): boolean {
    return this.expandedUsers().has(userId);
  }
}
