import { Component } from '@angular/core';
import { ExportService } from './services/export.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header>
        <div class="header-top">
          <h1>🎮 My Game Inventory</h1>
          <div class="export-buttons">
            <button class="export-btn" (click)="exportData()">📥 Export Data</button>
            <label class="import-btn">
              📤 Import Data
              <input type="file" accept=".xlsx" (change)="importData($event)" style="display: none;">
            </label>
          </div>
        </div>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Games</a>
          <a routerLink="/add-game" routerLinkActive="active">Add Game</a>
          <a routerLink="/consoles" routerLinkActive="active">Consoles</a>
          <a routerLink="/peripherals" routerLinkActive="active">Peripherals</a>
          <a routerLink="/categories" routerLinkActive="active">Categories</a>
          <a routerLink="/attributes" routerLinkActive="active">Attributes</a>
        </nav>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    header {
      background: rgba(255, 255, 255, 0.95);
      padding: 1.5rem 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    h1 {
      margin: 0;
      color: #333;
      font-size: 2rem;
    }
    .export-buttons {
      display: flex;
      gap: 0.5rem;
    }
    .export-btn, .import-btn {
      padding: 0.5rem 1rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }
    .export-btn:hover, .import-btn:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }
    nav {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    nav a {
      padding: 0.5rem 1rem;
      text-decoration: none;
      color: #667eea;
      border-radius: 5px;
      transition: all 0.3s;
      font-weight: 500;
    }
    nav a:hover {
      background: #667eea;
      color: white;
    }
    nav a.active {
      background: #667eea;
      color: white;
    }
    main {
      padding: 2rem;
    }
  `]
})
export class AppComponent {
  constructor(private exportService: ExportService) {}

  exportData(): void {
    this.exportService.exportToExcel().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'game-inventory.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  importData(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.exportService.importFromExcel(file).subscribe(
        result => {
          alert(`Import successful!\nGames: ${result.imported.games}\nConsoles: ${result.imported.consoles}\nPeripherals: ${result.imported.peripherals}\nBacklog: ${result.imported.backlogs}\nCategories: ${result.imported.categories}\nAttributes: ${result.imported.attributes}`);
          window.location.reload();
        },
        error => {
          alert('Import failed: ' + error.message);
        }
      );
    }
  }
}