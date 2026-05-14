import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FullHackathonResponse, TeamResponse } from '@h.linker/libs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TeamMembersListComponent } from '../../../../teams/team-details/team-members-list.component';
import { HackathonService } from '../../../../../services/hackathon.service';
import { TeamService } from '../../../../../services/team.service';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationService } from '../../../../../utils/notification.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-hackathon-submission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    RouterLink,
    TeamMembersListComponent,
    MatTooltip,
  ],
  templateUrl: './hackathon-submission.component.html',
  styleUrls: ['./hackathon-submission.component.scss'],
})
export class HackathonSubmissionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private hackathonService = inject(HackathonService);
  private teamService = inject(TeamService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  hackathon = signal<FullHackathonResponse | null>(null);
  teamDetails = signal<TeamResponse | null>(null);
  isSaving = signal(false);
  currentUser = toSignal(this.authService.user$);

  infoForm = this.fb.group({
    title: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
    ],
    description: [
      '',
      [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(2000),
      ],
    ],
  });

  repoForm = this.fb.group({
    repoUrl: [
      '',
      [Validators.required, Validators.pattern('https://github.com/.*')],
    ],
  });

  confirmForm = this.fb.group({
    agreed: [false, Validators.requiredTrue],
  });

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadData(slug);
    }
  }

  private loadData(slug: string) {
    this.hackathonService.getBySlug(slug).subscribe((h) => {
      this.hackathon.set(h);

      this.hackathonService.getRegistrationStatus(h.id).subscribe((reg) => {
        if (reg.isRegistered && reg.team) {
          this.teamService.getById(reg.team.id).subscribe((team) => {
            this.teamDetails.set(team);
          });
        } else {
          this.router.navigate(['/events', slug]);
        }
      });
    });
  }

  submitProject() {
    if (
      this.infoForm.invalid ||
      this.repoForm.invalid ||
      this.confirmForm.invalid
    )
      return;

    this.isSaving.set(true);
    // Тут буде виклик методу сабміту (який ми зробимо наступним кроком на беці)
    setTimeout(() => {
      this.notification.success('Project submitted successfully!');
      this.isSaving.set(false);
      this.router.navigate(['../'], { relativeTo: this.route });
    }, 1500);
  }
}
