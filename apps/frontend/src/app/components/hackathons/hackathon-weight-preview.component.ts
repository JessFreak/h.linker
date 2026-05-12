import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WeightItem {
  name: string;
  weight: number;
}

@Component({
  selector: 'app-hackathon-weight-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-weight-container">
      <div class="h-weight-track h-card">
        @for (item of items(); track $index) {
          <div
            class="h-weight-segment"
            [style.width.%]="item.weight"
            [style.background-color]="getColor($index)"
            [title]="item.name + ': ' + item.weight + '%'"
          ></div>
        }
      </div>

      <div class="h-weight-legend">
        @for (item of items(); track $index) {
          @if (item.weight > 0) {
            <div class="h-legend-item">
              <span
                class="h-dot"
                [style.background-color]="getColor($index)"
              ></span>
              <span class="h-label">{{ item.name || 'Unnamed' }}</span>
              <span class="h-value tech-data">{{ item.weight }}%</span>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .h-weight-container {
        margin-top: 16px;
        width: 100%;
      }
      .h-weight-track {
        height: 8px;
        display: flex;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        margin-bottom: 12px;
      }
      .h-weight-segment {
        height: 100%;
        transition: width 0.3s ease;
        border-right: 1px solid rgba(0, 0, 0, 0.2);
        &:last-child {
          border-right: none;
        }
      }
      .h-weight-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .h-legend-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
      }
      .h-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      .h-label {
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .h-value {
        font-weight: 600;
        color: #fff;
        margin-left: 2px;
      }
    `,
  ],
})
export class HackathonWeightPreviewComponent {
  @Input({ required: true }) set criteria(val: WeightItem[]) {
    this._criteria.set(val);
  }

  private _criteria = signal<WeightItem[]>([]);

  items = computed(() => {
    return this._criteria().map((c) => ({
      name: c.name,
      weight: Number(c.weight) || 0,
    }));
  });

  private colors = [
    '#6366f1',
    '#a855f7',
    '#ec4899',
    '#f43f5e',
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#10b981',
  ];

  getColor(index: number): string {
    return this.colors[index % this.colors.length];
  }
}
