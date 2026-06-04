import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../utils/notification.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { TeamService } from '../../services/team.service';
import { HackathonService } from '../../services/hackathon.service';
import { MatTooltip } from '@angular/material/tooltip';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  map,
} from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { signal } from '@angular/core';

import {
  FullHackathonResponse,
  TeamResponse,
  UserResponse,
} from '@h.linker/libs';

interface GlobalSearchResults {
  users: UserResponse[];
  teams: TeamResponse[];
  events: FullHackathonResponse[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    NgOptimizedImage,
    MatTooltip,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly teamService = inject(TeamService);
  private readonly hackathonService = inject(HackathonService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  public user = toSignal(this.authService.user$);
  public searchCtrl = new FormControl('');

  public searchResults = signal<GlobalSearchResults | null>(null);
  public isSearching = signal(false);

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('auth') === 'success') {
      localStorage.setItem('isAuthorised', 'true');
      this.notify.success('Logged in successfully');
      this.router.navigate([], {
        queryParams: { auth: null },
        queryParamsHandling: 'merge',
      });
    }

    this.authService.setUser();

    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.searchCtrl.setValue(params['search'], { emitEvent: false });
      }
    });

    this.searchCtrl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          const searchText = typeof term === 'string' ? term.trim() : '';

          if (!searchText || searchText.length < 2) {
            this.searchResults.set(null);
            this.isSearching.set(false);
            return of(null);
          }

          this.isSearching.set(true);

          return forkJoin({
            users: this.userService
              .getAll({ search: searchText, take: 3 })
              .pipe(
                map((r) => r.data),
                catchError(() => of([] as UserResponse[])),
              ),
            teams: this.teamService
              .getAll({ search: searchText, take: 3 })
              .pipe(
                map((r) => r.data),
                catchError(() => of([] as TeamResponse[])),
              ),
            events: this.hackathonService
              .getAll({ search: searchText, take: 3 })
              .pipe(
                map((r) => r.data),
                catchError(() => of([] as FullHackathonResponse[])),
              ),
          });
        }),
      )
      .subscribe((results) => {
        if (results) {
          this.searchResults.set(results);
        }
        this.isSearching.set(false);
      });
  }

  logout(): void {
    this.authService.logout();
  }

  onResultSelected(event: MatAutocompleteSelectedEvent): void {
    const data = event.option.value;

    this.searchCtrl.setValue('', { emitEvent: false });
    this.searchResults.set(null);

    if (data.type === 'user') this.router.navigate(['/users', data.username]);
    if (data.type === 'team') this.router.navigate(['/teams', data.id]);
    if (data.type === 'event') this.router.navigate(['/events', data.slug]);
  }

  displayFn(): string {
    return '';
  }

  onSearch(): void {
    const term = this.searchCtrl.value?.trim();
    if (!term) return;

    this.searchResults.set(null);

    const currentUrl = this.router.url.split('?')[0];
    let targetRoute = '/events';
    if (currentUrl.startsWith('/teams')) targetRoute = '/teams';
    else if (currentUrl.startsWith('/showcase')) targetRoute = '/showcase';
    else if (currentUrl.startsWith('/users')) targetRoute = '/users';

    this.router.navigate([targetRoute], {
      queryParams: { search: term, page: 1 },
      queryParamsHandling: 'merge',
    });
  }
}
