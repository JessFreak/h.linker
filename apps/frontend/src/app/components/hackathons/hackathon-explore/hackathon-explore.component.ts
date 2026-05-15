import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HackathonService } from '../../../services/hackathon.service';
import { CategoryService } from '../../../services/category.service';
import { toSignal } from '@angular/core/rxjs-interop';
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
  ],
  templateUrl: './hackathon-explore.component.html',
  styleUrls: ['./hackathon-explore.component.scss'],
})
export class HackathonExploreComponent {
  private hackathonService = inject(HackathonService);
  private categoryService = inject(CategoryService);

  categorySearchCtrl = new FormControl('');

  hackathons = toSignal(
    this.hackathonService.getAll().pipe(map((res) => res.hackathons)),
    { initialValue: [] },
  );

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
}
