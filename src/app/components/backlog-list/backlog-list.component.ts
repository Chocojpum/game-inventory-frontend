import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BacklogService, EnrichedBacklog } from '../../services/backlog.service';
import { PaginatedResult, PaginationOptions } from '../shared/pagination.interface';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-backlog-list',
  templateUrl: './backlog-list.component.html',
  styleUrls: ['./backlog-list.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger(40, [
            animate('250ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class BacklogListComponent implements OnInit {
  entries: EnrichedBacklog[] = [];
  currentPage: number = 1;
  limit: number = 20;
  totalItems: number = 0;
  totalPages: number = 0;

  currentSearchQuery: string = '';
  dateFrom: string = '';
  dateTo: string = '';
  dateRangeText: string = '';
  showDatePicker: boolean = false;

  currentSort: { field: 'date' | 'title'; direction: 'asc' | 'desc' } = {
    field: 'date',
    direction: 'desc',
  };

  constructor(
    private backlogService: BacklogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEntries();
  }

  fetchEntries(): void {
    const sortBy = `${this.currentSort.field}-${this.currentSort.direction}`;
    this.backlogService.getEnrichedAndPaginatedBacklogs(
      {
        search: this.currentSearchQuery,
        dateFrom: this.dateFrom,
        dateTo: this.dateTo,
        sortBy,
      },
      { page: this.currentPage, limit: this.limit }
    ).subscribe((result: PaginatedResult<EnrichedBacklog>) => {
      this.entries = result.data;
      this.currentPage = result.page;
      this.limit = result.limit;
      this.totalItems = result.total;
      this.totalPages = result.totalPages;
    });
  }

  onSearch(query: string): void {
    this.currentSearchQuery = query;
    this.currentPage = 1;
    this.fetchEntries();
  }

  updateDateRangeText(): void {
    if (this.dateFrom && this.dateTo) {
      this.dateRangeText = `${this.dateFrom} to ${this.dateTo}`;
    } else if (this.dateFrom) {
      this.dateRangeText = `From ${this.dateFrom}`;
    } else if (this.dateTo) {
      this.dateRangeText = `Until ${this.dateTo}`;
    } else {
      this.dateRangeText = '';
    }
  }

  applyDateRange(): void {
    this.updateDateRangeText();
    this.showDatePicker = false;
    this.currentPage = 1;
    this.fetchEntries();
  }

  clearDateRange(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.dateRangeText = '';
    this.showDatePicker = false;
    this.currentPage = 1;
    this.fetchEntries();
  }

  toggleSort(field: 'date' | 'title'): void {
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = { field, direction: field === 'date' ? 'desc' : 'asc' };
    }
    this.currentPage = 1;
    this.fetchEntries();
  }

  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchEntries();
    }
  }

  onLimitChange(): void {
    this.currentPage = 1;
    this.fetchEntries();
  }

  clearFilters(): void {
    this.currentSearchQuery = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.dateRangeText = '';
    this.currentSort = { field: 'date', direction: 'desc' };
    this.currentPage = 1;
    this.fetchEntries();
  }

  viewGame(gameId: string): void {
    this.router.navigate(['/game', gameId]);
  }

  getAttributeEntries(attrs: Record<string, any>): { key: string; value: any }[] {
    return Object.entries(attrs).map(([key, value]) => ({ key, value }));
  }
}
