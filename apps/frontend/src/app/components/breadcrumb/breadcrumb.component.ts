import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Params } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';

export interface BreadcrumbItem {
  label: string;
  route?: string | (string | number)[];
  queryParams?: Params;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltip,
  ],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  @Input({ required: true }) items: BreadcrumbItem[] = [];
  @Input() backRoute?: string | (string | number)[];
  @Input() backQueryParams?: Params;
}
