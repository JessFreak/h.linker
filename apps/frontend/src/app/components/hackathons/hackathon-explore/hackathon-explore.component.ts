import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Meta, Title } from '@angular/platform-browser';
import { HackathonService } from '../../../services/hackathon.service';
import { CategoryService } from '../../../services/category.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { HackathonQueryDTO, Order, HackathonStatus } from '@h.linker/libs';
import {
  map,
  debounceTime,
  distinctUntilChanged,
  startWith,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-hackathon-explore',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSelect,
    MatOption,
    MatDatepickerModule,
    MatNativeDateModule,
    NgOptimizedImage,
  ],
  templateUrl: './hackathon-explore.component.html',
  styleUrls: ['./hackathon-explore.component.scss'],
})
export class HackathonExploreComponent implements OnInit {
  private hackathonService = inject(HackathonService);
  private categoryService = inject(CategoryService);

  private metaService = inject(Meta);
  private titleService = inject(Title);

  filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl<HackathonStatus | ''>(''),
    categories: new FormControl<string[]>([]),
    startDateFrom: new FormControl<Date | null>(null),
    startDateTo: new FormControl<Date | null>(null),
  });

  categorySearchCtrl = new FormControl('');

  queryState = signal<Partial<HackathonQueryDTO>>({
    page: 1,
    take: 10,
    order: Order.DESC,
  });

  pageResponse = toSignal(
    toObservable(this.queryState).pipe(
      debounceTime(200),
      switchMap((query) => this.hackathonService.getAll(query)),
    ),
  );

  hackathons = computed(() => this.pageResponse()?.data || []);
  meta = computed(() => this.pageResponse()?.meta);

  readonly HackathonStatus = HackathonStatus;
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

  expandedHackathons = signal<Set<string>>(new Set());

  ngOnInit() {
    this.titleService.setTitle('Explore Hackathons | h.linker');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Discover, join, and participate in top tech hackathons and coding events. Find teams and build amazing projects.',
    });
  }

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
      status: (filters.status as HackathonStatus) || undefined,
      categories: filters.categories?.length ? filters.categories : undefined,
      startDateFrom: filters.startDateFrom
        ? (filters.startDateFrom.toISOString() as unknown as Date)
        : undefined,
      startDateTo: filters.startDateTo
        ? (filters.startDateTo.toISOString() as unknown as Date)
        : undefined,
    }));
  }

  resetFilters() {
    this.filterForm.reset({
      search: '',
      status: '',
      categories: [],
      startDateFrom: null,
      startDateTo: null,
    });
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

  toggleCategories(hackathonId: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.expandedHackathons.update((prev) => {
      const next = new Set(prev);
      if (next.has(hackathonId)) {
        next.delete(hackathonId);
      } else {
        next.add(hackathonId);
      }
      return next;
    });
  }

  isExpanded(hackathonId: string): boolean {
    return this.expandedHackathons().has(hackathonId);
  }
}
