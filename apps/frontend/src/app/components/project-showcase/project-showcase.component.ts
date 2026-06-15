import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { ProjectQueryDTO, Order } from '@h.linker/libs';
import { ProjectService } from '../../services/project.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-project-showcase',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './project-showcase.component.html',
  styleUrls: ['./project-showcase.component.scss'],
})
export class ProjectShowcaseComponent {
  private projectService = inject(ProjectService);
  private categoryService = inject(CategoryService);

  isFiltersVisible = signal(true);

  toggleFilters() {
    this.isFiltersVisible.update((v) => !v);
  }

  filterForm = new FormGroup({
    search: new FormControl(''),
    categories: new FormControl<string[]>([]),
  });

  categorySearchCtrl = new FormControl('');

  queryState = signal<Partial<ProjectQueryDTO>>({
    page: 1,
    take: 8,
    order: Order.DESC,
  });

  pageResponse = toSignal(
    toObservable(this.queryState).pipe(
      debounceTime(200),
      switchMap((query) => this.projectService.getShowcase(query)),
    ),
  );

  projects = computed(() => this.pageResponse()?.data || []);
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

    this.queryState.update((q) => ({
      ...q,
      page: 1,
      search: filters.search || undefined,
      categories: filters.categories?.length ? filters.categories : undefined,
    }));
  }

  resetFilters() {
    this.filterForm.reset({ search: '', categories: [] });
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

  getRankClass(index: number): string {
    const page = this.queryState().page ?? 1;
    const take = this.queryState().take ?? 12;
    const realIndex = (page - 1) * take + index;

    if (realIndex === 0) return 'rank-1';
    if (realIndex === 1) return 'rank-2';
    if (realIndex === 2) return 'rank-3';
    return 'rank-default';
  }

  getRankDisplay(index: number): string {
    const page = this.queryState().page ?? 1;
    const take = this.queryState().take ?? 12;
    const realIndex = (page - 1) * take + index;

    if (realIndex === 0) return '🏆 1st';
    if (realIndex === 1) return '🥈 2nd';
    if (realIndex === 2) return '🥉 3rd';
    return `#${realIndex + 1}`;
  }
}
