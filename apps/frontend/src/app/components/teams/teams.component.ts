import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';
import { TeamResponse, TeamQueryDTO, Order } from '@h.linker/libs';
import { CreateTeamDialogComponent } from './create-team-dialog.component';
import { TeamService } from '../../services/team.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../utils/notification.service';
import { TeamUtils } from '../../utils/team.utils';
import { TeamActionsService } from '../../utils/team-actions.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    RouterLink,
    MatTooltip,
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./discovery-shared.scss', './.rejected.scss'],
})
export class TeamsComponent {
  private teamService = inject(TeamService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);
  private teamActions = inject(TeamActionsService);
  private router = inject(Router);

  currentUser = toSignal(this.authService.user$);

  isFiltersVisible = signal(true);

  toggleFilters() {
    this.isFiltersVisible.update((v) => !v);
  }

  filterForm = new FormGroup({
    search: new FormControl(''),
    myTeams: new FormControl(false),
    iAmLeader: new FormControl(false),
  });

  queryState = signal<Partial<TeamQueryDTO>>({
    page: 1,
    take: 9,
    order: Order.DESC,
  });

  pageResponse = toSignal(
    toObservable(this.queryState).pipe(
      debounceTime(200),
      switchMap((query) => this.teamService.getAll(query)),
    ),
  );

  teams = computed(() => this.pageResponse()?.data || []);
  meta = computed(() => this.pageResponse()?.meta);

  readonly Order = Order;

  applyFilters() {
    const filters = this.filterForm.value;
    const user = this.currentUser();

    if ((filters.myTeams || filters.iAmLeader) && !user) {
      this.notify.info('Please sign in to use personal filters');
      this.filterForm.patchValue({ myTeams: false, iAmLeader: false });
      return;
    }

    this.queryState.update((q) => ({
      ...q,
      page: 1,
      search: filters.search || undefined,
      leaderId: filters.iAmLeader && user ? user.id : undefined,
      memberId: filters.myTeams && user ? user.id : undefined,
    }));
  }

  resetFilters() {
    this.filterForm.reset({ search: '', myTeams: false, iAmLeader: false });
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

  openCreateDialog() {
    const user = this.currentUser();
    if (!user) {
      this.notify.info('Please sign in to create a team');
      this.router.navigate(['/login']);
      return;
    }

    const dialogRef = this.dialog.open(CreateTeamDialogComponent, {
      width: '450px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.teamService.create(result).subscribe({
          next: () => {
            this.notify.success('Successfully created team');
            this.queryState.update((q) => ({ ...q }));
          },
          error: (err) => {
            console.error(err);
            this.notify.error('Failed to create team');
          },
        });
      }
    });
  }

  openApplyDialog(team: TeamResponse) {
    const user = this.currentUser();
    if (!user) {
      this.notify.info('Please login or register first to join the team');
      this.router.navigate(['/login']);
      return;
    }

    this.teamActions.openApplyDialog(team, () =>
      this.queryState.update((q) => ({ ...q })),
    );
  }

  isMember(team: TeamResponse): boolean {
    return TeamUtils.isMember(team, this.currentUser()?.id);
  }

  hasRequest(team: TeamResponse): boolean {
    return TeamUtils.hasPendingRequest(team, this.currentUser()?.id);
  }

  isRejected(team: TeamResponse): boolean {
    return TeamUtils.isRejected(team, this.currentUser()?.id);
  }
}
