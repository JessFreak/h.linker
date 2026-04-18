import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-settings-footer',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <footer class="settings-footer">
      <div class="status">
        <span class="dot" [class.dirty]="isDirty"></span>
        <span class="h-text-secondary">
          {{ isDirty ? 'Unsaved changes' : 'All changes saved' }}
        </span>
      </div>
      <div class="card-footer">
        <button mat-button type="button" (click)="discard.emit()">
          Discard
        </button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="!isDirty || isSaving"
          (click)="save.emit()"
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
}
