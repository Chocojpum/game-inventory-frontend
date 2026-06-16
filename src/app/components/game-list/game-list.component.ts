import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { CategoryService } from '../../services/category.service';
import { ConsoleFamilyService } from '../../services/console-family.service';
import { ListReturnService } from '../../services/list-return.service';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { PaginationOptions } from '../shared/pagination.interface';
import { InventoryListBaseComponent } from '../shared/inventory-list-base.component';

@Component({
  selector: 'app-game-list',
  templateUrl: `./game-list.component.html`,
  styleUrls: [`./game-list.component.css`],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(50, [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class GameListComponent extends InventoryListBaseComponent {
  games: Game[] = [];
  currentSort: { field: 'title' | 'date' | null; direction: 'asc' | 'desc' } = {
    field: 'title',
    direction: 'asc',
  };

  constructor(
    private gameService: GameService,
    categoryService: CategoryService,
    consoleFamilyService: ConsoleFamilyService,
    router: Router,
    route: ActivatedRoute,
    listReturn: ListReturnService
  ) {
    super(router, categoryService, consoleFamilyService, route, listReturn);
    this.limit = 12;
  }

  fetchItems(): void {
    const options: PaginationOptions = {
      page: this.currentPage,
      limit: this.limit,
    };

    // The search term is sent as part of the filter params (see collectFilterParams),
    // so a single unified endpoint handles search + category/console/date filters.
    this.gameService
      .getFilteredAndPaginatedGames(this.collectFilterParams(), options)
      .subscribe((result) => {
        this.games = result.data;
        this.applyPagination(result);
      });
  }

  private collectFilterParams(): any {
    const params: any = {
      query: this.currentSearchQuery,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      sortBy: `${this.currentSort.field}-${this.currentSort.direction}`,
    };

    // Add all active category IDs
    this.selectedCategoryIds().forEach(
      (id, index) => (params[`categoryId_${index}`] = id)
    );

    if (this.activeFilters['consoleFamily']) {
      params['consoleFamilyId'] = this.activeFilters['consoleFamily'];
    }

    return params;
  }

  protected override extraQueryParams(): Params {
    const sort = `${this.currentSort.field}-${this.currentSort.direction}`;
    return { sort: sort !== 'title-asc' ? sort : null };
  }

  protected override restoreExtraState(params: ParamMap): void {
    const sort = params.get('sort');
    if (sort) {
      const [field, direction] = sort.split('-');
      this.currentSort = {
        field: field as 'title' | 'date',
        direction: direction as 'asc' | 'desc',
      };
    }
  }

  toggleSort(field: 'title' | 'date'): void {
    if (this.currentSort.field === field) {
      // Same field, just reverse the direction
      this.currentSort = {
        field,
        direction: this.currentSort.direction === 'asc' ? 'desc' : 'asc',
      };
    } else {
      // New field, default to ascending
      this.currentSort = { field, direction: 'asc' };
    }
    this.currentPage = 1;
    this.fetchItems();
  }

  clearFilters(): void {
    this.resetCommonFilters();
    this.currentPage = 1;
    this.fetchItems();
  }

  viewGame(game: Game): void {
    if (game.isCompilation) {
      this.router.navigate(['/compilation', game.id]);
    } else {
      this.router.navigate(['/game', game.id]);
    }
  }
}
