import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TeamService } from '../../../../services/team.service';
import { NotificationService } from '../../../../utils/notification.service';
import { MemberStatus, TeamResponse } from '@h.linker/libs';
import { MatDividerModule } from '@angular/material/divider';
import { SettingsFooterComponent } from '../../../settings/settings-footer.component';
import { SettingsSectionComponent } from '../../../settings/settings-section.component';
import { ConfirmDialogComponent } from '../../../../utils/confirm-dialog.component';

@Component({
  selector: 'app-team-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatDividerModule,
    RouterLink,
    NgOptimizedImage,
    SettingsFooterComponent,
    SettingsSectionComponent,
  ],
  templateUrl: './team-settings.component.html',
  styleUrls: [
    '../../../settings/settings.scss',
    './team-settings.component.scss',
  ],
})
export class TeamSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private teamService = inject(TeamService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);

  team = signal<TeamResponse | null>(null);
  isSaving = signal(false);

  teamForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.maxLength(500)]],
    communicationLink: [''],
  });

  pendingRequests = computed(
    () =>
      this.team()
        ?.requests?.filter((r) => r.status === 'PENDING')
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ) || [],
  );
  activeMembers = computed(() => this.team()?.members || []);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadTeamData(id);
  }

  loadTeamData(id: string) {
    this.teamService.getById(id).subscribe((data) => {
      this.team.set(data);
      this.teamForm.patchValue({
        name: data.name,
        description: data.description,
        communicationLink: data.communicationLink,
      });
      this.teamForm.markAsPristine();
    });
  }

  onSave() {
    const currentTeam = this.team();
    if (this.teamForm.valid && currentTeam) {
      this.isSaving.set(true);
      this.teamService.update(currentTeam.id, this.teamForm.value).subscribe({
        next: (updated) => {
          this.team.set(updated);
          this.notify.success('Team settings updated');
          this.isSaving.set(false);
          this.teamForm.markAsPristine();
        },
        error: () => this.isSaving.set(false),
      });
    }
  }

  acceptMember(memberId: string) {
    this.handleRequest(memberId, MemberStatus.ACCEPTED);
  }

  rejectMember(memberId: string) {
    this.handleRequest(memberId, MemberStatus.REJECTED);
  }

  private handleRequest(memberId: string, status: MemberStatus) {
    const currentTeam = this.team();
    if (!currentTeam) return;

    this.teamService
      .respondToRequest(currentTeam.id, memberId, status)
      .subscribe(() => {
        this.notify.success(`Member ${status.toLowerCase()}`);
        this.loadTeamData(currentTeam.id);
      });
  }

  onDeleteTeam() {
    const currentTeam = this.team();
    if (!currentTeam) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Disband Team',
        message:
          'This action is permanent and cannot be undone. All members will be removed.',
        confirmText: 'Disband',
        isDanger: true,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.teamService.delete(currentTeam.id).subscribe(() => {
          this.notify.success('Team disbanded');
          this.router.navigate(['/teams']);
        });
      }
    });
  }

  scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
