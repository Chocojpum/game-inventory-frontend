import { Directive, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { CategoryService, Category } from '../../services/category.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { ListReturnService } from '../../services/list-return.service';
import { PaginatedResult } from './pagination.interface';

/** Category filters that map directly to an active-filter/query-param key. */
const CATEGORY_FILTER_KEYS = ['genre', 'franchise', 'saga', 'custom'] as const;

/**
 * Shared logic for the paginated, filterable list views (games and backlog):
 * category/console-family loading, search, category/console/date-range filters,
 * and pagination. Subclasses implement {@link fetchItems} (the actual data
 * request) and own any view-specific state such as the sort model.
 *
 * The full filter/search/sort/page state is mirrored to the URL query params on
 * every fetch and restored on init. The resulting URL is also recorded in
 * {@link ListReturnService} so detail views can navigate back to this exact
 * view (filters and all) regardless of the browser history stack.
 */
@Directive()
export abstract class InventoryListBaseComponent implements OnInit {
  currentPage = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 0;

  /** Subclass-configured page size, used to keep the URL clean at the default. */
  private defaultLimit = 10;

  currentSearchQuery = '';
  dateFrom = '';
  dateTo = '';
  dateRangeText = '';
  showDatePicker = false;

  /** Format filter: '' (all), 'physical' or 'digital'. */
  physicalDigital = '';

  categories: Category[] = [];
  genreCategories: Category[] = [];
  franchiseCategories: Category[] = [];
  sagaCategories: Category[] = [];
  customCategories: Category[] = [];
  consoleFamilies: ConsoleFamily[] = [];

  activeFilters: { [key: string]: string } = {}; // Holds Category/Console IDs (read in templates)

  constructor(
    protected router: Router,
    protected categoryService: CategoryService,
    protected consoleFamilyService: ConsoleFamilyService,
    protected route: ActivatedRoute,
    protected listReturn: ListReturnService,
  ) {}

  ngOnInit(): void {
    this.defaultLimit = this.limit;
    this.restoreStateFromQueryParams();
    this.fetchItems();
    this.loadCategories();
    this.loadConsoleFamilies();
  }

  /** Performs the data request and assigns the result (via {@link applyPagination}). */
  abstract fetchItems(): void;

  protected applyPagination(result: PaginatedResult<unknown>): void {
    this.currentPage = result.page;
    this.limit = result.limit;
    this.totalItems = result.total;
    this.totalPages = result.totalPages;
    this.syncStateToUrl();
  }

  /**
   * Mirrors the current filter/search/sort/page state into the URL query params
   * (replacing the entry rather than pushing, so it stays out of back history).
   * Defaults are omitted to keep the URL clean.
   */
  private syncStateToUrl(): void {
    const params: Params = {
      q: this.currentSearchQuery || null,
      page: this.currentPage > 1 ? this.currentPage : null,
      limit: this.limit !== this.defaultLimit ? this.limit : null,
      dateFrom: this.dateFrom || null,
      dateTo: this.dateTo || null,
      console: this.activeFilters['consoleFamily'] || null,
      pd: this.physicalDigital || null,
      ...this.extraQueryParams(),
    };
    for (const key of CATEGORY_FILTER_KEYS) {
      params[key] = this.activeFilters[key] || null;
    }

    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: params,
    });
    // Remember this list view so detail "back" buttons can return to it with
    // state intact, even when the browser history holds an edit form in between.
    this.listReturn.url = this.router.serializeUrl(urlTree);
    this.router.navigateByUrl(urlTree, { replaceUrl: true });
  }

  /** Restores the shared state from the URL query params (called once on init). */
  private restoreStateFromQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;

    this.currentSearchQuery = params.get('q') ?? '';

    const page = Number(params.get('page'));
    if (page > 0) this.currentPage = page;

    const limit = Number(params.get('limit'));
    if (limit > 0) this.limit = limit;

    this.dateFrom = params.get('dateFrom') ?? '';
    this.dateTo = params.get('dateTo') ?? '';
    this.updateDateRangeText();

    for (const key of CATEGORY_FILTER_KEYS) {
      const value = params.get(key);
      if (value) this.activeFilters[key] = value;
    }
    const consoleFamily = params.get('console');
    if (consoleFamily) this.activeFilters['consoleFamily'] = consoleFamily;

    this.physicalDigital = params.get('pd') ?? '';

    this.restoreExtraState(params);
  }

  /**
   * View-specific query params to persist (e.g. the sort model). Return `null`
   * for a value to omit it from the URL. Overridden by subclasses.
   */
  protected extraQueryParams(): Params {
    return {};
  }

  /** Restores view-specific state (e.g. the sort model) from the URL. */
  protected restoreExtraState(_params: ParamMap): void {}

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe((categories) => {
      this.categories = categories;
      this.genreCategories = this.sortedByName(categories, 'genre');
      this.franchiseCategories = this.sortedByName(categories, 'franchise');
      this.sagaCategories = this.sortedByName(categories, 'saga');
      this.customCategories = this.sortedByName(categories, 'custom');
    });
  }

  private sortedByName(categories: Category[], type: string): Category[] {
    return categories
      .filter((c) => c.type === type)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  loadConsoleFamilies(): void {
    this.consoleFamilyService.getAllFamilies().subscribe((families) => {
      this.consoleFamilies = families.sort((a, b) => a.name.localeCompare(b.name));
      this.onConsoleFamiliesLoaded();
    });
  }

  /** Hook run after the console families load; overridden by subclasses. */
  protected onConsoleFamiliesLoaded(): void {}

  getConsoleFamilyName(familyId: string): string {
    const family = this.consoleFamilies.find((f) => f.id === familyId);
    return family ? family.name : 'Unknown';
  }

  onSearch(query: string): void {
    this.currentSearchQuery = query;
    this.currentPage = 1;
    this.fetchItems();
  }

  onCategoryFilter(event: any, type: string): void {
    const categoryId = event.target.value;
    if (categoryId === '') {
      delete this.activeFilters[type];
    } else {
      this.activeFilters[type] = categoryId;
    }
    this.currentPage = 1;
    this.fetchItems();
  }

  onConsoleFamilyFilter(event: any): void {
    const familyId = event.target.value;
    if (familyId === '') {
      delete this.activeFilters['consoleFamily'];
    } else {
      this.activeFilters['consoleFamily'] = familyId;
    }
    this.currentPage = 1;
    this.fetchItems();
  }

  onPhysicalDigitalFilter(event: any): void {
    this.physicalDigital = event.target.value;
    this.currentPage = 1;
    this.fetchItems();
  }

  /** Category IDs currently selected (excludes the console-family filter). */
  protected selectedCategoryIds(): string[] {
    return Object.entries(this.activeFilters)
      .filter(([key]) => key !== 'consoleFamily')
      .map(([, value]) => value);
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
    this.fetchItems();
  }

  clearDateRange(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.dateRangeText = '';
    this.showDatePicker = false;
    this.currentPage = 1;
    this.fetchItems();
  }

  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.fetchItems();
    }
  }

  /**
   * Page numbers to render as direct-jump buttons, windowed around the current
   * page so the control stays a fixed width on collections with many pages.
   */
  get pageNumbers(): number[] {
    const maxButtons = 5;
    if (this.totalPages <= maxButtons) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(maxButtons / 2);
    const end = Math.min(this.totalPages, Math.max(this.currentPage + half, maxButtons));
    const start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  onLimitChange(): void {
    this.currentPage = 1;
    this.fetchItems();
  }

  /** Number of filters currently narrowing the list (drives the "Clear" UI). */
  get activeFilterCount(): number {
    let count = Object.keys(this.activeFilters).length;
    if (this.currentSearchQuery) count++;
    if (this.dateFrom || this.dateTo) count++;
    if (this.physicalDigital) count++;
    return count;
  }

  get hasActiveFilters(): boolean {
    return this.activeFilterCount > 0;
  }

  /**
   * Resets the filters shared by every list view. The filter-select and search
   * inputs are bound to this state, so they clear via change detection.
   */
  protected resetCommonFilters(): void {
    this.activeFilters = {};
    this.currentSearchQuery = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.dateRangeText = '';
    this.physicalDigital = '';
  }
}
