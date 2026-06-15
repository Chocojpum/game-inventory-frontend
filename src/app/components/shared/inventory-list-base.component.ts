import { Directive, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService, Category } from '../../services/category.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { PaginatedResult } from './pagination.interface';

/**
 * Shared logic for the paginated, filterable list views (games and backlog):
 * category/console-family loading, search, category/console/date-range filters,
 * and pagination. Subclasses implement {@link fetchItems} (the actual data
 * request) and own any view-specific state such as the sort model.
 */
@Directive()
export abstract class InventoryListBaseComponent implements OnInit {
  currentPage = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 0;

  currentSearchQuery = '';
  dateFrom = '';
  dateTo = '';
  dateRangeText = '';
  showDatePicker = false;

  categories: Category[] = [];
  genreCategories: Category[] = [];
  franchiseCategories: Category[] = [];
  sagaCategories: Category[] = [];
  customCategories: Category[] = [];
  consoleFamilies: ConsoleFamily[] = [];

  protected activeFilters: { [key: string]: string } = {}; // Holds Category/Console IDs

  constructor(
    protected router: Router,
    protected categoryService: CategoryService,
    protected consoleFamilyService: ConsoleFamilyService,
  ) {}

  ngOnInit(): void {
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
  }

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
    });
  }

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

  /** Resets the filters shared by every list view and the filter-select inputs. */
  protected resetCommonFilters(): void {
    this.activeFilters = {};
    this.currentSearchQuery = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.dateRangeText = '';

    // Reset select inputs (client-side DOM manipulation)
    const selects = document.querySelectorAll(
      '.filter-select'
    ) as NodeListOf<HTMLSelectElement>;
    selects.forEach((select) => (select.value = ''));
  }
}
