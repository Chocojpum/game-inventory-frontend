import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { BacklogService, Backlog } from '../../services/backlog.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

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
export class CompilationDetailComponent implements OnInit {
  game: Game | null = null;
  includedGames: Game[] = [];
  consoleFamily: ConsoleFamily | null = null;
  consoleFamilies: ConsoleFamily[] = [];
  backlogs: Backlog[] = [];
  showBacklog = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private consoleFamilyService: ConsoleFamilyService,
    private backlogService: BacklogService
  ) {}

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
      this.loadConsoleFamily();
      this.loadBacklogs();
      this.gameService.getIncludedGames(game.id).subscribe(games => {
        this.includedGames = games;
      });
    });
  }

  loadConsoleFamily(): void {
    if (this.game) {
      this.consoleFamilyService.getFamily(this.game.consoleFamilyId).subscribe(
        family => (this.consoleFamily = family),
        error => console.error('Console family not found', error)
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

  getConsoleFamilyName(familyId: string): string {
    const family = this.consoleFamilies.find(f => f.id === familyId);
    return family ? family.name : 'Unknown';
  }

  hasCustomAttributes(): boolean {
    return this.game ? Object.keys(this.game.customAttributes).length > 0 : false;
  }

  getCustomAttributesArray(): Array<{ key: string; value: any }> {
    if (!this.game) return [];
    return Object.entries(this.game.customAttributes).map(([key, value]) => ({ key, value }));
  }

  formatAttributeValue(value: any): string {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  }

  hasBacklogAttributes(backlog: Backlog): boolean {
    return Object.keys(backlog.customAttributes).length > 0;
  }

  getBacklogAttributesArray(backlog: Backlog): Array<{ key: string; value: any }> {
    return Object.entries(backlog.customAttributes).map(([key, value]) => ({ key, value }));
  }

  viewIncludedGame(gameId: string): void {
    this.router.navigate(['/game', gameId]);
  }

  editGame(): void {
    if (this.game) {
      this.router.navigate(['/edit-game', this.game.id]);
    }
  }

  deleteGame(): void {
    if (this.game && confirm(`Are you sure you want to delete "${this.game.title}"?`)) {
      this.gameService.deleteGame(this.game.id).subscribe(() => {
        this.router.navigate(['/']);
      });
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
      this.backlogService.deleteBacklog(id).subscribe(() => this.loadBacklogs());
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
