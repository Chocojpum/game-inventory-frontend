import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { BacklogService } from '../../services/backlog.service';
import { AddonService } from '../../services/addon.service';
import { ListReturnService } from '../../services/list-return.service';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { GameDetailBaseComponent } from '../shared/game-detail-base.component';

@Component({
  selector: 'app-compilation-detail',
  templateUrl: `./compilation-detail.component.html`,
  styleUrls: [`./compilation-detail.component.css`],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.8)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class CompilationDetailComponent extends GameDetailBaseComponent implements OnInit {
  includedGames: Game[] = [];
  consoleFamilies: ConsoleFamily[] = [];
  gameCategories: Category[] = [];
  /** Sort applied to the included-games grid (client-side; the full list is loaded). */
  includedSort: { field: 'title' | 'date'; direction: 'asc' | 'desc' } = {
    field: 'date',
    direction: 'asc',
  };

  constructor(
    private route: ActivatedRoute,
    router: Router,
    gameService: GameService,
    private categoryService: CategoryService,
    consoleFamilyService: ConsoleFamilyService,
    backlogService: BacklogService,
    addonService: AddonService,
    listReturn: ListReturnService,
    confirm: ConfirmService,
    toast: ToastService
  ) {
    super(router, gameService, consoleFamilyService, backlogService, addonService, listReturn, confirm, toast);
  }

  ngOnInit(): void {
    this.consoleFamilyService.getAllFamilies().subscribe(families => {
      this.consoleFamilies = families;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCompilation(id);
      }
    });
  }

  loadCompilation(id: string): void {
    this.gameService.getGame(id).subscribe(game => {
      // If this isn't actually a compilation, fall back to the normal detail view.
      if (!game.isCompilation) {
        this.router.navigate(['/game', game.id]);
        return;
      }
      this.game = game;
      this.loadCategories();
      this.loadConsoleFamily();
      this.loadBacklogs();
      this.loadAddons();
      this.gameService.getIncludedGames(game.id).subscribe(games => {
        this.includedGames = games;
        this.applyIncludedSort();
      });
    });
  }

  loadCategories(): void {
    if (this.game && this.game.categoryIds.length > 0) {
      this.categoryService.getAllCategories().subscribe(categories => {
        this.gameCategories = categories.filter(cat =>
          this.game!.categoryIds.includes(cat.id)
        );
      });
    }
  }

  getConsoleFamilyName(familyId: string): string {
    const family = this.consoleFamilies.find(f => f.id === familyId);
    return family ? family.name : 'Unknown';
  }

  getCategoriesByType(type: string): Category[] {
    return this.gameCategories.filter(cat => cat.type === type);
  }

  /** Opens the library filtered by the clicked category. */
  filterByCategory(category: Category): void {
    this.router.navigate(['/'], { queryParams: { [category.type]: category.id } });
  }

  viewIncludedGame(gameId: string): void {
    this.router.navigate(['/game', gameId]);
  }

  /** Switches the sort field, or flips direction when the field is unchanged. */
  toggleIncludedSort(field: 'title' | 'date'): void {
    if (this.includedSort.field === field) {
      this.includedSort.direction = this.includedSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.includedSort = { field, direction: 'asc' };
    }
    this.applyIncludedSort();
  }

  /** Reorders the included games (by title or release date) per the current sort. */
  private applyIncludedSort(): void {
    const { field, direction } = this.includedSort;
    const dir = direction === 'asc' ? 1 : -1;
    this.includedGames = [...this.includedGames].sort((a, b) => {
      if (field === 'title') {
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }) * dir;
      }
      // Release date: missing/invalid dates always sort last, regardless of direction.
      const ta = this.releaseTime(a.releaseDate);
      const tb = this.releaseTime(b.releaseDate);
      if (ta === tb) return 0;
      if (isNaN(ta)) return 1;
      if (isNaN(tb)) return -1;
      return (ta - tb) * dir;
    });
  }

  private releaseTime(date: string): number {
    return date ? new Date(date).getTime() : NaN;
  }
}
