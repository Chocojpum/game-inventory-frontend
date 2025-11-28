import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { BacklogService, Backlog } from '../../services/backlog.service';
import { trigger, transition, style, animate } from '@angular/animations';

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
export class GameDetailComponent implements OnInit {
  game: Game | null = null;
  gameCategories: Category[] = [];
  gameConsole: Console | null = null;
  consoleFamily: ConsoleFamily | null = null;
  backlogs: Backlog[] = [];
  showBacklog = false;
  editingBacklogId: string | null = null;
  editingBacklogData: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private categoryService: CategoryService,
    private consoleService: ConsoleService,
    private consoleFamilyService: ConsoleFamilyService,
    private backlogService: BacklogService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.gameService.getGame(id).subscribe(game => {
        this.game = game;
        this.loadCategories();
        this.loadConsole();
        this.loadConsoleFamily();
        this.loadBacklogs();
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

  loadConsoleFamily(): void {
    if (this.game) {
      this.consoleFamilyService.getFamily(this.game.consoleFamilyId).subscribe(
        family => {
          this.consoleFamily = family;
        },
        error => {
          console.error('Console family not found', error);
        }
      );
    }
  }

  loadBacklogs(): void {
    if (this.game) {
      this.backlogService.getBacklogsByGame(this.game.id).subscribe(backlogs => {
        this.backlogs = backlogs.sort((a, b) => {
          if (!a.completionDate) return 1;
          if (!b.completionDate) return -1;
          return new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
        });
      });
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

  hasCustomAttributes(): boolean {
    return this.game ? Object.keys(this.game.customAttributes).length > 0 : false;
  }

  getCustomAttributesArray(): Array<{key: string, value: any}> {
    if (!this.game) return [];
    return Object.entries(this.game.customAttributes).map(([key, value]) => ({
      key,
      value
    }));
  }

  formatAttributeValue(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  }

  hasBacklogAttributes(backlog: Backlog): boolean {
    return Object.keys(backlog.customAttributes).length > 0;
  }

  getBacklogAttributesArray(backlog: Backlog): Array<{key: string, value: any}> {
    return Object.entries(backlog.customAttributes).map(([key, value]) => ({
      key,
      value
    }));
  }

  editGame(): void {
    if (this.game) {
      this.router.navigate(['/edit-game', this.game.id]);
    }
  }

  showBacklogManager(): void {
    this.showBacklog = true;
  }

  closeBacklogManager(): void {
    this.showBacklog = false;
    this.loadBacklogs();
  }

  deleteBacklogEntry(id: string): void {
    if (confirm('Are you sure you want to delete this completion entry?')) {
      this.backlogService.deleteBacklog(id).subscribe(() => {
        this.loadBacklogs();
      });
    }
  }

  deleteGame(): void {
    if (this.game && confirm(`Are you sure you want to delete "${this.game.title}"?`)) {
      this.gameService.deleteGame(this.game.id).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}