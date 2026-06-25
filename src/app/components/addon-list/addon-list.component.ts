import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { AddonService, EnrichedAddon } from '../../services/addon.service';
import { CategoryService } from '../../services/category.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
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

/**
 * Addons list view. Mirrors the games list filters (search, categories, console,
 * format, ownership, PC platforms, date range, hide-compiled, completed/pending),
 * resolving each Addon's filterable attributes from its parent game on the
 * backend. Clicking an Addon opens its parent game's detail page.
 */
@Component({
  selector: 'app-addon-list',
  templateUrl: `./addon-list.component.html`,
  styleUrls: [`./addon-list.component.css`],
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
export class AddonListComponent extends InventoryListBaseComponent {
  addons: EnrichedAddon[] = [];
  currentSort: { field: 'title' | 'date'; direction: 'asc' | 'desc' } = {
    field: 'title',
    direction: 'asc',
  };

  /** PC-platform console families (bare "PC" plus storefronts like "PC (Steam)"). */
  pcFamilies: ConsoleFamily[] = [];
  /** IDs of PC platforms currently excluded from the list (unchecked). */
  excludedPcFamilyIds = new Set<string>();
  /** Whether the PC platform filter panel is expanded. */
  showPcFilter = false;
  /**
   * When true, also show Addons whose parent game isn't owned (no console attached).
   * Default false: only Addons of owned games are listed.
   */
  includeNotOwned = false;
  /**
   * When true, Addons whose parent game belongs to a compilation are hidden.
   * Default false: they're listed alongside everything else.
   */
  excludeCompilationMembers = false;
  /**
   * Completion-status filter: '' (all), 'completed', or 'pending'. An Addon is
   * "completed" when it has a completion (backlog) entry of its own.
   */
  completionStatus: '' | 'completed' | 'pending' = '';
  /**
   * True once the URL or the user explicitly drives the PC filter. While false,
   * the backend applies its default of hiding the pirated bare-"PC" games, so we
   * don't send the filter (and the URL stays clean).
   */
  private pcFilterApplied = false;

  constructor(
    private addonService: AddonService,
    categoryService: CategoryService,
    consoleFamilyService: ConsoleFamilyService,
    router: Router,
    route: ActivatedRoute,
    listReturn: ListReturnService
  ) {
    super(router, categoryService, consoleFamilyService, route, listReturn);
    this.limit = 10;
  }

  fetchItems(): void {
    const options: PaginationOptions = {
      page: this.currentPage,
      limit: this.limit,
    };

    this.addonService
      .getFilteredAndPaginatedAddons(this.collectFilterParams(), options)
      .subscribe((result) => {
        this.addons = result.data;
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

    this.selectedCategoryIds().forEach(
      (id, index) => (params[`categoryId_${index}`] = id)
    );

    if (this.activeFilters['consoleFamily']) {
      params['consoleFamilyId'] = this.activeFilters['consoleFamily'];
    }

    if (this.physicalDigital) {
      params['physicalDigital'] = this.physicalDigital;
    }

    if (this.includeNotOwned) {
      params['includeNotOwned'] = '1';
    }

    if (this.excludeCompilationMembers) {
      params['excludeCompiled'] = '1';
    }

    if (this.completionStatus) {
      params['completion'] = this.completionStatus;
    }

    if (this.pcFilterApplied) {
      params['pcFilter'] = '1';
      let i = 0;
      this.excludedPcFamilyIds.forEach(
        (id) => (params[`excludeConsoleFamilyId_${i++}`] = id),
      );
    }

    return params;
  }

  /** A console family on a PC platform (bare "PC" or a "PC (Store)" variant). */
  private isPcFamily(family: ConsoleFamily): boolean {
    const name = family.name.trim().toLowerCase();
    return name === 'pc' || name.startsWith('pc (');
  }

  /** The bare "PC" platform — the pirated, legacy-backlog games hidden by default. */
  isBarePcFamily(family: ConsoleFamily): boolean {
    return family.name.trim().toLowerCase() === 'pc';
  }

  /** IDs hidden by default: the pirated bare-"PC" platforms. */
  private defaultExcludedPcFamilyIds(): Set<string> {
    return new Set(
      this.pcFamilies.filter((f) => this.isBarePcFamily(f)).map((f) => f.id),
    );
  }

  protected override onConsoleFamiliesLoaded(): void {
    this.pcFamilies = this.consoleFamilies.filter((f) => this.isPcFamily(f));
    if (!this.pcFilterApplied) {
      this.excludedPcFamilyIds = this.defaultExcludedPcFamilyIds();
    }
  }

  isPcFamilyIncluded(familyId: string): boolean {
    return !this.excludedPcFamilyIds.has(familyId);
  }

  togglePcFamily(familyId: string): void {
    this.pcFilterApplied = true;
    if (this.excludedPcFamilyIds.has(familyId)) {
      this.excludedPcFamilyIds.delete(familyId);
    } else {
      this.excludedPcFamilyIds.add(familyId);
    }
    this.currentPage = 1;
    this.fetchItems();
  }

  /** Excludes every PC platform — "show everything except PC games". */
  hideAllPcFamilies(): void {
    this.pcFilterApplied = true;
    this.excludedPcFamilyIds = new Set(this.pcFamilies.map((f) => f.id));
    this.currentPage = 1;
    this.fetchItems();
  }

  /** Includes every PC platform, pirated bare-"PC" ones included. */
  showAllPcFamilies(): void {
    this.pcFilterApplied = true;
    this.excludedPcFamilyIds = new Set();
    this.currentPage = 1;
    this.fetchItems();
  }

  protected override extraQueryParams(): Params {
    const sort = `${this.currentSort.field}-${this.currentSort.direction}`;
    return {
      sort: sort !== 'title-asc' ? sort : null,
      // 'none' distinguishes "explicitly exclude nothing" from the default (absent).
      pcx: this.pcFilterApplied
        ? this.excludedPcFamilyIds.size
          ? [...this.excludedPcFamilyIds].join(',')
          : 'none'
        : null,
      notowned: this.includeNotOwned ? '1' : null,
      nocomp: this.excludeCompilationMembers ? '1' : null,
      completion: this.completionStatus || null,
    };
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

    const pcx = params.get('pcx');
    if (pcx !== null) {
      this.pcFilterApplied = true;
      this.excludedPcFamilyIds =
        pcx === 'none' ? new Set() : new Set(pcx.split(','));
    }

    this.includeNotOwned = params.get('notowned') === '1';
    this.excludeCompilationMembers = params.get('nocomp') === '1';

    const completion = params.get('completion');
    this.completionStatus =
      completion === 'completed' || completion === 'pending' ? completion : '';
  }

  toggleIncludeNotOwned(): void {
    this.includeNotOwned = !this.includeNotOwned;
    this.currentPage = 1;
    this.fetchItems();
  }

  toggleExcludeCompilationMembers(): void {
    this.excludeCompilationMembers = !this.excludeCompilationMembers;
    this.currentPage = 1;
    this.fetchItems();
  }

  onCompletionFilter(event: Event): void {
    this.completionStatus = (event.target as HTMLSelectElement).value as
      | ''
      | 'completed'
      | 'pending';
    this.currentPage = 1;
    this.fetchItems();
  }

  toggleSort(field: 'title' | 'date'): void {
    if (this.currentSort.field === field) {
      this.currentSort = {
        field,
        direction: this.currentSort.direction === 'asc' ? 'desc' : 'asc',
      };
    } else {
      this.currentSort = { field, direction: 'asc' };
    }
    this.currentPage = 1;
    this.fetchItems();
  }

  clearFilters(): void {
    this.resetCommonFilters();
    this.pcFilterApplied = false;
    this.excludedPcFamilyIds = this.defaultExcludedPcFamilyIds();
    this.includeNotOwned = false;
    this.excludeCompilationMembers = false;
    this.completionStatus = '';
    this.currentPage = 1;
    this.fetchItems();
  }

  override get activeFilterCount(): number {
    let count = super.activeFilterCount;
    if (this.includeNotOwned) count++;
    if (this.excludeCompilationMembers) count++;
    if (this.completionStatus) count++;
    if (this.pcFilterApplied) count++;
    return count;
  }

  /** Opens the parent game's detail page for the given Addon. */
  viewAddon(addon: EnrichedAddon): void {
    this.router.navigate(['/game', addon.gameId]);
  }
}
