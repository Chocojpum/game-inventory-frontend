import { Directive } from '@angular/core';
import { Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { BacklogService, Backlog } from '../../services/backlog.service';
import { DlcService, Dlc } from '../../services/dlc.service';
import { ListReturnService } from '../../services/list-return.service';

/**
 * Shared logic for the game and compilation detail views: console-family
 * loading, the backlog (completions) panel, the DLC panel, custom-attribute
 * helpers, and the common game actions (edit/delete/back).
 *
 * Subclasses provide their own routing/load orchestration plus any extra,
 * view-specific behaviour (categories, included games, inline backlog editing).
 */
@Directive()
export abstract class GameDetailBaseComponent {
  game: Game | null = null;
  consoleFamily: ConsoleFamily | null = null;
  backlogs: Backlog[] = [];
  showBacklog = false;

  dlcs: Dlc[] = [];
  showDlcManager = false;
  editingDlc?: Dlc;
  backlogDlcId?: string;
  backlogDlcTitle?: string;

  constructor(
    protected router: Router,
    protected gameService: GameService,
    protected consoleFamilyService: ConsoleFamilyService,
    protected backlogService: BacklogService,
    protected dlcService: DlcService,
    protected listReturn: ListReturnService,
  ) {}

  // --- Loading ---

  loadConsoleFamily(): void {
    if (this.game) {
      this.consoleFamilyService.getFamily(this.game.consoleFamilyId).subscribe(
        family => (this.consoleFamily = family),
        error => console.error('Console family not found', error),
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

  loadDlcs(): void {
    if (this.game) {
      this.dlcService.getDlcsByGame(this.game.id).subscribe(dlcs => {
        this.dlcs = dlcs.sort((a, b) => a.title.localeCompare(b.title));
      });
    }
  }

  // --- Custom-attribute helpers ---

  formatAttributeValue(value: any): string {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  }

  hasCustomAttributes(): boolean {
    return this.game ? Object.keys(this.game.customAttributes).length > 0 : false;
  }

  getCustomAttributesArray(): Array<{ key: string; value: any }> {
    if (!this.game) return [];
    return Object.entries(this.game.customAttributes).map(([key, value]) => ({ key, value }));
  }

  hasBacklogAttributes(backlog: Backlog): boolean {
    return Object.keys(backlog.customAttributes).length > 0;
  }

  getBacklogAttributesArray(backlog: Backlog): Array<{ key: string; value: any }> {
    return Object.entries(backlog.customAttributes).map(([key, value]) => ({ key, value }));
  }

  hasDlcAttributes(dlc: Dlc): boolean {
    return Object.keys(dlc.customAttributes || {}).length > 0;
  }

  getDlcAttributesArray(dlc: Dlc): Array<{ key: string; value: any }> {
    return Object.entries(dlc.customAttributes || {}).map(([key, value]) => ({ key, value }));
  }

  // --- Backlog (completions) panel ---

  showBacklogManager(): void {
    this.backlogDlcId = undefined;
    this.backlogDlcTitle = undefined;
    this.showBacklog = true;
  }

  closeBacklogManager(): void {
    this.showBacklog = false;
    this.backlogDlcId = undefined;
    this.backlogDlcTitle = undefined;
    this.loadBacklogs();
  }

  deleteBacklogEntry(id: string): void {
    if (confirm('Are you sure you want to delete this completion entry?')) {
      this.backlogService.deleteBacklog(id).subscribe(() => this.loadBacklogs());
    }
  }

  // --- DLC panel ---

  openAddDlc(): void {
    this.editingDlc = undefined;
    this.showDlcManager = true;
  }

  openEditDlc(dlc: Dlc): void {
    this.editingDlc = dlc;
    this.showDlcManager = true;
  }

  closeDlcManager(): void {
    this.showDlcManager = false;
    this.editingDlc = undefined;
    this.loadDlcs();
  }

  deleteDlc(dlc: Dlc): void {
    if (confirm(`Are you sure you want to delete the DLC "${dlc.title}"?`)) {
      this.dlcService.deleteDlc(dlc.id).subscribe(() => this.loadDlcs());
    }
  }

  addDlcCompletion(dlc: Dlc): void {
    this.backlogDlcId = dlc.id;
    this.backlogDlcTitle = dlc.title;
    this.showBacklog = true;
  }

  getDlcTitle(dlcId: string): string {
    const dlc = this.dlcs.find(d => d.id === dlcId);
    return dlc ? dlc.title : 'DLC';
  }

  // --- Game actions ---

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

  goBack(): void {
    // Always return to the last list view the user was on, with its filters,
    // search, sort and page intact (via the stored URL). Navigating explicitly
    // rather than using browser history avoids landing on an edit form that may
    // sit between this view and the list in the history stack.
    this.router.navigateByUrl(this.listReturn.url ?? '/');
  }
}
