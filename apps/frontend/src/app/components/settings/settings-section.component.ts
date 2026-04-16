import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-settings-section',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card [id]="id" class="h-card settings-section">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <ng-content></ng-content>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .settings-section {
        margin-bottom: 24px;
        scroll-margin-top: 24px;
        mat-card-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        mat-card-content {
          padding: 24px;
        }
      }
    `,
  ],
})
export class SettingsSectionComponent {
  @Input({ required: true }) id!: string;
  @Input({ required: true }) title!: string;
}
