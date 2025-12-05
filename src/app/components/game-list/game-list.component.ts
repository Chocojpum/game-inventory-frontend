import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';
import {
  ConsoleFamilyService,
  ConsoleFamily,
} from '../../services/console-family.service';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import {
  PaginatedResult,
  PaginationOptions,
} from '../shared/pagination.interface';
import { Observable } from 'rxjs';

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
export class GameListComponent implements OnInit {
  games: Game[] = [];
  categories: Category[] = [];
  genreCategories: Category[] = [];
  franchiseCategories: Category[] = [];
  sagaCategories: Category[] = [];
  customCategories: Category[] = [];
  consoleFamilies: ConsoleFamily[] = [];
  currentPage: number = 1;
  limit: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  private activeFilters: { [key: string]: string } = {}; // Holds Category/Console IDs
  currentSearchQuery: string = ''; // Holds the current search term
  currentSort: { field: 'title' | 'date' | null; direction: 'asc' | 'desc' } = {
    field: 'title',
    direction: 'asc',
  };

  dateFrom: string = '';
  dateTo: string = '';
  dateRangeText: string = '';
  showDatePicker: boolean = false;

  constructor(
    private gameService: GameService,
    private categoryService: CategoryService,
    private consoleFamilyService: ConsoleFamilyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchGames();
    this.loadCategories();
    this.loadConsoleFamilies();
  }

  fetchGames(): void {
    const options: PaginationOptions = {
      page: this.currentPage,
      limit: this.limit,
    };

    // Determine which service method to call based on active state
    let games$: Observable<PaginatedResult<Game>>;

    // 1. Prioritize Search
    if (this.currentSearchQuery) {
      games$ = this.gameService.searchPaginatedGames(
        this.currentSearchQuery,
        options
      );
    }
    // 2. Combine all category/console filters

    const filterParams = this.collectFilterParams();

    // Fetch ALL results for the current search/primary filter
    games$ = this.gameService.getFilteredAndPaginatedGames(
      filterParams,
      options
    );

    games$.subscribe((result) => {
      this.games = result.data;
      this.currentPage = result.page;
      this.limit = result.limit;
      this.totalItems = result.total;
      this.totalPages = result.totalPages;
    });
  }

  private collectFilterParams(): any {
    const params: any = {
      query: this.currentSearchQuery,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      sortBy: new String(
        this.currentSort.field + '-' + this.currentSort.direction
      ),
    };

    // Add all active category IDs
    Object.entries(this.activeFilters)
      .filter(([key]) => key !== 'consoleFamily')
      .map(([, value]) => value)
      .forEach((id, index) => (params[`categoryId_${index}`] = id));

    if (this.activeFilters['consoleFamily']) {
      params['consoleFamilyId'] = this.activeFilters['consoleFamily'];
    }

    return params;
  }

  // --- PAGINATION HANDLERS ---

  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchGames();
    }
  }

  onLimitChange(): void {
    this.currentPage = 1; // Reset to the first page when the limit changes
    this.fetchGames();
  }

  onSearch(query: string): void {
    this.currentSearchQuery = query; // Store the query
    this.currentPage = 1; // Reset page on new search
    this.fetchGames();
  }

  onCategoryFilter(event: any, type: string): void {
    const categoryId = event.target.value;
    if (categoryId === '') {
      delete this.activeFilters[type];
    } else {
      this.activeFilters[type] = categoryId;
    }
    this.currentPage = 1; // Reset page on new filter
    this.fetchGames();
  }

  onConsoleFamilyFilter(event: any): void {
    const familyId = event.target.value;
    if (familyId === '') {
      delete this.activeFilters['consoleFamily'];
    } else {
      this.activeFilters['consoleFamily'] = familyId;
    }
    this.currentPage = 1; // Reset page on new filter
    this.fetchGames();
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
    this.currentPage = 1; // Reset page on new date filter
    this.fetchGames();
  }

  clearDateRange(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.dateRangeText = '';
    this.showDatePicker = false;
    this.currentPage = 1; // Reset page on clearing date filter
    this.fetchGames();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe((categories) => {
      this.categories = categories;
      this.genreCategories = categories
        .filter((c) => c.type === 'genre')
        .sort((a, b) => a.name.localeCompare(b.name));
      this.franchiseCategories = categories
        .filter((c) => c.type === 'franchise')
        .sort((a, b) => a.name.localeCompare(b.name));
      this.sagaCategories = categories
        .filter((c) => c.type === 'saga')
        .sort((a, b) => a.name.localeCompare(b.name));
      this.customCategories = categories
        .filter((c) => c.type === 'custom')
        .sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  loadConsoleFamilies(): void {
    this.consoleFamilyService.getAllFamilies().subscribe((families) => {
      this.consoleFamilies = families.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    });
  }

  getConsoleFamilyName(familyId: string): string {
    const family = this.consoleFamilies.find((f) => f.id === familyId);
    return family ? family.name : 'Unknown';
  }

  toggleSort(field: 'title' | 'date'): void {
    let newDirection: 'asc' | 'desc';

    if (this.currentSort.field === field) {
      // Same field, just reverse the direction
      newDirection = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // New field, default to ascending
      newDirection = 'asc';
    }

    this.currentSort = { field: field, direction: newDirection };

    // Reset to page 1 on any sort change
    this.currentPage = 1;

    this.fetchGames();
  }

  // --- Utility Methods ---

  clearFilters(): void {
    this.activeFilters = {};
    this.dateFrom = '';
    this.dateTo = '';
    this.dateRangeText = '';
    this.currentSearchQuery = '';

    // Reset page and fetch
    this.currentPage = 1;
    this.fetchGames();

    // Reset select inputs (client-side DOM manipulation)
    const selects = document.querySelectorAll(
      '.filter-select'
    ) as NodeListOf<HTMLSelectElement>;
    selects.forEach((select) => (select.value = ''));
  }

  viewGame(id: string): void {
    this.router.navigate(['/game', id]);
  }
}
