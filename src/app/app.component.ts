import { Component, HostListener, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ExportService } from './services/export.service';
import { ToastService } from './services/toast.service';
import { ConfirmService } from './services/confirm.service';
import { DirtyService } from './services/dirty.service';

@Component({
  selector: 'app-root',
  templateUrl: `./app.component.html`,
  styleUrls: [`./app.component.css`],
})
export class AppComponent implements OnInit {
  /** Path (without query params) of the last navigation, to detect real route changes. */
  private lastPath = '';

  /** True while an export/import is running, to disable the data buttons. */
  busy = false;

  /** Whether the nav row is collapsed to reclaim vertical space. */
  navCollapsed = localStorage.getItem('navCollapsed') === 'true';

  constructor(
    private exportService: ExportService,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private toast: ToastService,
    private confirm: ConfirmService,
    private dirty: DirtyService,
  ) {}

  /** Set while we trigger our own reload (e.g. after import) to skip the quit nag. */
  private suppressQuitPrompt = false;

  /**
   * On quit: if there are unsaved changes, auto-export to the local data file via
   * a beacon (the only request that survives unload) and warn before leaving.
   * Skipped entirely when the last action was already an export (nothing to save).
   */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    // Inside the Electron app the native close dialog handles this instead.
    if (navigator.userAgent.includes('Electron')) {
      return;
    }
    if (!this.dirty.isDirty()) {
      return;
    }
    navigator.sendBeacon('http://localhost:3000/api/export/save');
    if (this.suppressQuitPrompt) {
      return;
    }
    event.preventDefault();
    event.returnValue = '';
  }

  ngOnInit(): void {
    this.importDataFirst();
    this.scrollToTopOnRouteChange();
  }

  /**
   * Scrolls to the top only when the route path changes, so a list view
   * updating its query params (pagination, filters, search, sort) keeps the
   * current scroll position.
   */
  private scrollToTopOnRouteChange(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        const path = event.urlAfterRedirects.split('?')[0];
        if (path !== this.lastPath) {
          this.viewportScroller.scrollToPosition([0, 0]);
          this.lastPath = path;
        }
      });
  }

  scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  toggleNav(): void {
    this.navCollapsed = !this.navCollapsed;
    localStorage.setItem('navCollapsed', String(this.navCollapsed));
  }

  exportData(): void {
    if (this.busy) {
      return;
    }
    this.busy = true;
    const pending = this.toast.loading('Exporting…', 'Building your collection spreadsheet.');
    this.exportService.exportToExcel().subscribe({
      next: (result) => {
        this.toast.dismiss(pending);
        this.toast.success('Export complete', typeof result === 'string' ? result : undefined);
        this.busy = false;
      },
      error: (error) => {
        this.toast.dismiss(pending);
        this.toast.error('Export failed', error?.message || 'Something went wrong while exporting.');
        this.busy = false;
      },
    });
  }

  async importData(event: any): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const confirmed = await this.confirm.ask({
      title: 'Import and replace data?',
      message:
        `Importing "${file.name}" will merge its contents into your collection ` +
        `and reload the app. This cannot be undone.`,
      confirmText: 'Import',
      cancelText: 'Cancel',
    });

    // Allow re-selecting the same file later whether or not we proceed.
    input.value = '';

    if (!confirmed) {
      return;
    }

    this.busy = true;
    const pending = this.toast.loading('Importing…', `Reading ${file.name}.`);
    this.exportService.importFromExcel(file).subscribe({
      next: (result) => {
        this.toast.dismiss(pending);
        const i = result.imported;
        this.toast.success(
          'Import successful',
          `Games ${i.games} · Consoles ${i.consoles} · Peripherals ${i.peripherals} · ` +
            `Backlog ${i.backlogs} · Categories ${i.categories} · Attributes ${i.attributes}. Reloading…`
        );
        // The merged collection now lives only in memory; mark dirty so it is
        // persisted on quit, but don't nag on the reload we trigger here.
        this.dirty.markDirty();
        this.suppressQuitPrompt = true;
        setTimeout(() => window.location.reload(), 1200);
      },
      error: (error) => {
        this.toast.dismiss(pending);
        this.toast.error('Import failed', error?.message || 'The file could not be imported.');
        this.busy = false;
      },
    });
  }

  importDataFirst(): void {
    this.exportService.importFromLocal().subscribe();
  }
}
