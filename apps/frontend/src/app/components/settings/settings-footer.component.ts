import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-settings-footer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule],
  template: `
    <footer class="settings-footer">
      <div
        class="status"
        [matTooltip]="
          isDirty
            ? 'You have modified fields that need to be saved'
            : 'Your profile is up to date'
        "
      >
        <span class="dot" [class.dirty]="isDirty"></span>
        <span class="h-text-secondary">
          {{ isDirty ? 'Unsaved changes' : 'All changes saved' }}
        </span>
      </div>
      <div class="card-footer">
        <button
          mat-button
          type="button"
          (click)="discard.emit()"
          [disabled]="isSaving"
          matTooltip="Reset all fields to their last saved state"
          matTooltipPosition="above"
        >
          Discard
        </button>

        <button
          mat-flat-button
          color="primary"
          [disabled]="!isDirty || isSaving"
          (click)="save.emit()"
          [matTooltip]="saveButtonTooltip"
          matTooltipPosition="above"
        >
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </footer>
  `,
  styleUrls: ['./settings-footer.component.scss'],
})
export class SettingsFooterComponent {
  @Input() isDirty = false;
  @Input() isSaving = false;
  @Output() save = new EventEmitter<void>();
  @Output() discard = new EventEmitter<void>();

  get saveButtonTooltip(): string {
    if (this.isSaving) return 'Uploading data to server...';
    if (!this.isDirty) return 'No changes detected';
    return 'Commit your changes to the database';
  }
}
