import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ExportService } from './services/export.service';

@Component({
  selector: 'app-root',
  templateUrl: `./app.component.html`,
  styleUrls: [`./app.component.css`],
})
export class AppComponent implements OnInit {
  /** Path (without query params) of the last navigation, to detect real route changes. */
  private lastPath = '';

  constructor(
    private exportService: ExportService,
    private router: Router,
    private viewportScroller: ViewportScroller,
  ) {}

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

  exportData(): void {
    this.exportService.exportToExcel().subscribe(
      (result) => {
        alert(result);
      },
      (error) => {
        alert('Import failed: ' + error.message);
      }
    );
  }

  importData(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.exportService.importFromExcel(file).subscribe(
        (result) => {
          alert(
            `Import successful!\nGames: ${result.imported.games}\nConsoles: ${result.imported.consoles}\nPeripherals: ${result.imported.peripherals}\nBacklog: ${result.imported.backlogs}\nCategories: ${result.imported.categories}\nAttributes: ${result.imported.attributes}`
          );
          window.location.reload();
        },
        (error) => {
          alert('Import failed: ' + error.message);
        }
      );
    }
  }

  importDataFirst(): void {
    this.exportService.importFromLocal().subscribe();
  }
}
