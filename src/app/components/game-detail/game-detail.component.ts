import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService } from '../../services/console-family.service';
import { BacklogService, Backlog } from '../../services/backlog.service';
import { AddonService } from '../../services/addon.service';
import { ListReturnService } from '../../services/list-return.service';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { GameDetailBaseComponent } from '../shared/game-detail-base.component';

@Component({
  selector: 'app-game-detail',
  templateUrl: `./game-detail.component.html`,
  styleUrls: [`./game-detail.component.css`],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class GameDetailComponent extends GameDetailBaseComponent implements OnInit {
  gameCategories: Category[] = [];
  gameConsole: Console | null = null;
  editingBacklogId: string | null = null;
  editingBacklogData: any = {};

  constructor(
    private route: ActivatedRoute,
    router: Router,
    gameService: GameService,
    private categoryService: CategoryService,
    private consoleService: ConsoleService,
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.gameService.getGame(id).subscribe(game => {
        // Compilations have their own dedicated detail view. Replace the URL so
        // "back" returns to the list rather than bouncing through this redirect.
        if (game.isCompilation) {
          this.router.navigate(['/compilation', game.id], { replaceUrl: true });
          return;
        }
        this.game = game;
        this.loadCategories();
        this.loadConsole();
        this.loadConsoleFamily();
        this.loadBacklogs();
        this.loadAddons();
      });
    }
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

  loadConsole(): void {
    if (this.game && this.game.consoleId) {
      this.consoleService.getConsole(this.game.consoleId).subscribe(
        console => {
          this.gameConsole = console;
        },
        error => {
          console.error('Console not found', error);
        }
      );
    }
  }

  isEditingBacklog(id: string): boolean {
    return this.editingBacklogId === id;
  }

  startEditingBacklog(backlog: Backlog): void {
    this.editingBacklogId = backlog.id;
    this.editingBacklogData = {
      completionDate: backlog.completionDate ? backlog.completionDate.split('T')[0] : '',
      endingType: backlog.endingType,
      completionType: backlog.completionType,
      unknownDate: !backlog.completionDate
    };
  }

  saveBacklogEdit(id: string): void {
    this.backlogService.updateBacklog(id, {
      completionDate: this.editingBacklogData.unknownDate ? null : this.editingBacklogData.completionDate,
      endingType: this.editingBacklogData.endingType,
      completionType: this.editingBacklogData.completionType
    }).subscribe(() => {
      this.editingBacklogId = null;
      this.loadBacklogs();
    });
  }

  cancelBacklogEdit(): void {
    this.editingBacklogId = null;
    this.editingBacklogData = {};
  }

  getConsoleFamilyName(): string {
    return this.consoleFamily ? this.consoleFamily.name : 'Unknown';
  }

  getCategoriesByType(type: string): Category[] {
    return this.gameCategories.filter(cat => cat.type === type);
  }

  /** Opens the library filtered by the clicked category. */
  filterByCategory(category: Category): void {
    this.router.navigate(['/'], { queryParams: { [category.type]: category.id } });
  }
}
