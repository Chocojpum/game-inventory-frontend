import { Directive } from '@angular/core';
import { Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { BacklogService, Backlog } from '../../services/backlog.service';
import { AddonService, Addon } from '../../services/addon.service';
import { ListReturnService } from '../../services/list-return.service';

/**
 * Shared logic for the game and compilation detail views: console-family
 * loading, the backlog (completions) panel, the Addon panel, custom-attribute
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

  addons: Addon[] = [];
  showAddonManager = false;
  editingAddon?: Addon;
  backlogAddonId?: string;
  backlogAddonTitle?: string;

  constructor(
    protected router: Router,
    protected gameService: GameService,
    protected consoleFamilyService: ConsoleFamilyService,
    protected backlogService: BacklogService,
    protected addonService: AddonService,
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

  loadAddons(): void {
    if (this.game) {
      this.addonService.getAddonsByGame(this.game.id).subscribe(addons => {
        this.addons = addons.sort((a, b) => a.title.localeCompare(b.title));
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

  hasAddonAttributes(addon: Addon): boolean {
    return Object.keys(addon.customAttributes || {}).length > 0;
  }

  getAddonAttributesArray(addon: Addon): Array<{ key: string; value: any }> {
    return Object.entries(addon.customAttributes || {}).map(([key, value]) => ({ key, value }));
  }

  // --- Backlog (completions) panel ---

  showBacklogManager(): void {
    this.backlogAddonId = undefined;
    this.backlogAddonTitle = undefined;
    this.showBacklog = true;
  }

  closeBacklogManager(): void {
    this.showBacklog = false;
    this.backlogAddonId = undefined;
    this.backlogAddonTitle = undefined;
    this.loadBacklogs();
  }

  deleteBacklogEntry(id: string): void {
    if (confirm('Are you sure you want to delete this completion entry?')) {
      this.backlogService.deleteBacklog(id).subscribe(() => this.loadBacklogs());
    }
  }

  // --- Addon panel ---

  openAddAddon(): void {
    this.editingAddon = undefined;
    this.showAddonManager = true;
  }

  openEditAddon(addon: Addon): void {
    this.editingAddon = addon;
    this.showAddonManager = true;
  }

  closeAddonManager(): void {
    this.showAddonManager = false;
    this.editingAddon = undefined;
    this.loadAddons();
  }

  deleteAddon(addon: Addon): void {
    if (confirm(`Are you sure you want to delete the Addon "${addon.title}"?`)) {
      this.addonService.deleteAddon(addon.id).subscribe(() => this.loadAddons());
    }
  }

  addAddonCompletion(addon: Addon): void {
    this.backlogAddonId = addon.id;
    this.backlogAddonTitle = addon.title;
    this.showBacklog = true;
  }

  getAddonTitle(addonId: string): string {
    const addon = this.addons.find(d => d.id === addonId);
    return addon ? addon.title : 'Addon';
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
