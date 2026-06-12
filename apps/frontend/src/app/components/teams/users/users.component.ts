import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { UserResponse, UserQueryDTO, Order } from '@h.linker/libs';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { CategoryService } from '../../../services/category.service';
import { TeamService } from '../../../services/team.service';
import { NotificationService } from '../../../utils/notification.service';
import { InviteUserDialogComponent } from './invite-user-dialog/invite-user-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCheckboxModule,
    RouterLink,
    NgOptimizedImage,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['../discovery-shared.scss', './users.component.scss'],
})
export class UsersComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private teamService = inject(TeamService);
  private categoryService = inject(CategoryService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);

  currentUser = toSignal(this.authService.user$);

  isFiltersVisible = signal(true);

  toggleFilters() {
    this.isFiltersVisible.update((v) => !v);
  }

  filterForm = new FormGroup({
    search: new FormControl(''),
    connectedGithub: new FormControl(false),
    isRecommended: new FormControl(false),
    categories: new FormControl<string[]>([]),
  });

  categorySearchCtrl = new FormControl('');

  queryState = signal<Partial<UserQueryDTO>>({
    page: 1,
    take: 9,
    order: Order.ASC,
    excludeSelf: true,
  });

  pageResponse = toSignal(
    toObservable(this.queryState).pipe(
      debounceTime(200),
      switchMap((query) => this.userService.getAll(query)),
    ),
  );

  users = computed(() => this.pageResponse()?.data || []);

  meta = computed(() => this.pageResponse()?.meta);

  readonly Order = Order;

  allCategories = toSignal(
    this.categorySearchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => this.categoryService.searchCategories(query || '')),
      map((res) => res.categories),
    ),
    { initialValue: [] as string[] },
  );

  expandedUsers = signal<Set<string>>(new Set());

  toggleCategory(category: string, isChecked: boolean) {
    const currentCategories = this.filterForm.value.categories ?? [];
    if (isChecked) {
      this.filterForm.patchValue({
        categories: [...currentCategories, category],
      });
    } else {
      this.filterForm.patchValue({
        categories: currentCategories.filter((c) => c !== category),
      });
    }
  }

  isCategorySelected(category: string): boolean {
    return (this.filterForm.value.categories ?? []).includes(category);
  }

  applyFilters() {
    const filters = this.filterForm.value;
    const user = this.currentUser();

    if (filters.isRecommended && !user) {
      this.notify.info('Please sign in to get personalized recommendations.');
      this.filterForm.patchValue({ isRecommended: false });
      return;
    }

    this.queryState.update((q) => ({
      ...q,
      page: 1,
      search: filters.search || undefined,
      connectedGithub: filters.connectedGithub ? true : undefined,
      isRecommended: filters.isRecommended ? true : undefined,
      categories: filters.categories?.length ? filters.categories : undefined,
      excludeSelf: true,
    }));
  }

  resetFilters() {
    this.filterForm.reset({
      search: '',
      connectedGithub: false,
      isRecommended: false,
      categories: [],
    });
    this.applyFilters();
  }

  changePage(newPage: number) {
    this.queryState.update((q) => ({ ...q, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSort() {
    this.queryState.update((q) => ({
      ...q,
      order: q.order === Order.DESC ? Order.ASC : Order.DESC,
    }));
  }

  toggleSkills(userId: string, event: Event) {
    event.stopPropagation();
    this.expandedUsers.update((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  isExpanded(userId: string): boolean {
    return this.expandedUsers().has(userId);
  }

  openInviteDialog(user: UserResponse) {
    const currentUser = this.currentUser();
    if (!currentUser) {
      this.notify.info('Please sign in to invite developers to your team');
      return;
    }

    const dialogRef = this.dialog.open(InviteUserDialogComponent, {
      width: '550px',
      maxWidth: '95vw',
      data: {
        username: user.username,
        userId: user.id,
        currentUserId: currentUser.id,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const dto = {
          userId: user.id,
          roleName: result.roleName,
          message: result.message,
        };

        this.teamService.inviteUser(result.teamId, dto).subscribe({
          next: () =>
            this.notify.success(`Invitation sent to ${user.username}`),
          error: (err) =>
            this.notify.error(
              err.error?.message || 'Failed to send invitation',
            ),
        });
      }
    });
  }
}
