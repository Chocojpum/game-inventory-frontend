import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { GameService, Game, GameVersion } from '../../services/game.service';
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

  /** PC-platform console families (bare "PC" plus storefronts like "PC (Steam)"). */
  pcFamilies: ConsoleFamily[] = [];
  /** IDs of PC platforms currently excluded from the list (unchecked). */
  excludedPcFamilyIds = new Set<string>();
  /** Whether the PC platform filter panel is expanded. */
  showPcFilter = false;
  /**
   * When true, also show not-owned games (those without a console attached).
   * Default false: only owned games are listed.
   */
  includeNotOwned = false;
  /**
   * When true, games that belong to a compilation are hidden from the list
   * (the compilations themselves and standalone games still show).
   * Default true: compilation members are hidden until the user opts in.
   */
  excludeCompilationMembers = true;
  /**
   * Backlog completion-status filter: '' (all), 'completed', or 'pending'.
   * A game is "completed" when it has a completion entry, when it's a
   * compilation whose every member is completed, or when it's a member of a
   * completed compilation; "pending" is the complement.
   */
  completionStatus: '' | 'completed' | 'pending' = '';
  /**
   * True once the URL or the user explicitly drives the PC filter. While false,
   * the backend applies its default of hiding the pirated bare-"PC" games, so we
   * don't send the filter (and the URL stays clean).
   */
  private pcFilterApplied = false;

  constructor(
    private gameService: GameService,
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

    if (this.physicalDigital) {
      params['physicalDigital'] = this.physicalDigital;
    }

    // By default the backend returns only owned games; opt into the not-owned ones.
    if (this.includeNotOwned) {
      params['includeNotOwned'] = '1';
    }

    // Hide games that are part of a compilation when the filter is on.
    if (this.excludeCompilationMembers) {
      params['excludeCompiled'] = '1';
    }

    // Narrow to completed or pending games by backlog status.
    if (this.completionStatus) {
      params['completion'] = this.completionStatus;
    }

    // Only send the PC filter once it's explicitly driven; otherwise the backend
    // applies its default (hide the pirated bare-"PC" games).
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
    // Reflect the backend default in the checkboxes unless the URL/user already
    // took control (in which case the restored selection stands).
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
      // Default is ON, so the param only appears to mark the opt-out (show members).
      nocomp: this.excludeCompilationMembers ? null : '0',
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
    this.excludeCompilationMembers = params.get('nocomp') !== '0';

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
    // Back to the default: backend hides pirated bare-"PC" games, panel reflects it.
    this.pcFilterApplied = false;
    this.excludedPcFamilyIds = this.defaultExcludedPcFamilyIds();
    this.includeNotOwned = false;
    this.excludeCompilationMembers = true;
    this.completionStatus = '';
    this.currentPage = 1;
    this.fetchItems();
  }

  override get activeFilterCount(): number {
    let count = super.activeFilterCount;
    if (this.includeNotOwned) count++;
    if (!this.excludeCompilationMembers) count++;
    if (this.completionStatus) count++;
    if (this.pcFilterApplied) count++;
    return count;
  }

  /** The collapsed game whose platform picker is open, or null. */
  versionPickerGame: Game | null = null;

  viewGame(game: Game): void {
    if ((game.versions?.length ?? 0) > 1) {
      // Same title owned on several platforms: ask which copy to open.
      this.versionPickerGame = game;
    } else if (game.isCompilation) {
      this.router.navigate(['/compilation', game.id]);
    } else {
      this.router.navigate(['/game', game.id]);
    }
  }

  openVersion(version: GameVersion): void {
    this.versionPickerGame = null;
    this.router.navigate([version.isCompilation ? '/compilation' : '/game', version.id]);
  }
}
