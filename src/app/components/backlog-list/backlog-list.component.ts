import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { BacklogService, EnrichedBacklog } from '../../services/backlog.service';
import { CategoryService } from '../../services/category.service';
import { ConsoleFamilyService } from '../../services/console-family.service';
import { ListReturnService } from '../../services/list-return.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { InventoryListBaseComponent } from '../shared/inventory-list-base.component';

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
export class BacklogListComponent extends InventoryListBaseComponent {
  entries: EnrichedBacklog[] = [];
  currentSort: { field: 'date' | 'title'; direction: 'asc' | 'desc' } = {
    field: 'date',
    direction: 'desc',
  };

  constructor(
    private backlogService: BacklogService,
    categoryService: CategoryService,
    consoleFamilyService: ConsoleFamilyService,
    router: Router,
    route: ActivatedRoute,
    listReturn: ListReturnService
  ) {
    super(router, categoryService, consoleFamilyService, route, listReturn);
    this.limit = 20;
  }

  fetchItems(): void {
    this.backlogService.getEnrichedAndPaginatedBacklogs(
      {
        search: this.currentSearchQuery,
        consoleFamilyId: this.activeFilters['consoleFamily'],
        categoryIds: this.selectedCategoryIds(),
        dateFrom: this.dateFrom,
        dateTo: this.dateTo,
        sortBy: `${this.currentSort.field}-${this.currentSort.direction}`,
      },
      { page: this.currentPage, limit: this.limit }
    ).subscribe((result) => {
      this.entries = result.data;
      this.applyPagination(result);
    });
  }

  protected override extraQueryParams(): Params {
    const sort = `${this.currentSort.field}-${this.currentSort.direction}`;
    return { sort: sort !== 'date-desc' ? sort : null };
  }

  protected override restoreExtraState(params: ParamMap): void {
    const sort = params.get('sort');
    if (sort) {
      const [field, direction] = sort.split('-');
      this.currentSort = {
        field: field as 'date' | 'title',
        direction: direction as 'asc' | 'desc',
      };
    }
  }

  toggleSort(field: 'date' | 'title'): void {
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = { field, direction: field === 'date' ? 'desc' : 'asc' };
    }
    this.currentPage = 1;
    this.fetchItems();
  }

  clearFilters(): void {
    this.resetCommonFilters();
    this.currentSort = { field: 'date', direction: 'desc' };
    this.currentPage = 1;
    this.fetchItems();
  }

  viewGame(gameId: string): void {
    this.router.navigate(['/game', gameId]);
  }

  getAttributeEntries(attrs: Record<string, any>): { key: string; value: any }[] {
    return Object.entries(attrs).map(([key, value]) => ({ key, value }));
  }
}
