import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConsoleService, Console } from '../../services/console.service';

@Component({
  selector: 'app-console-list',
  template: `
    <div class="console-list-container">
      <div class="header-actions">
        <h2>🎮 Console Inventory</h2>
        <button class="add-btn" routerLink="/add-console">+ Add Console</button>
      </div>
      
      <app-search-bar (searchQuery)="onSearch($event)"></app-search-bar>

      <div class="consoles-grid" *ngIf="consoles.length > 0">
        <div 
          class="console-card" 
          *ngFor="let console of consoles"
          (click)="viewConsole(console.id)"
        >
          <div class="console-image">
            <img [src]="console.picture" [alt]="console.name" />
          </div>
          <div class="console-info">
            <h3>{{ console.name }}</h3>
            <p class="model">{{ console.model }}</p>
            <p class="developer">{{ console.developer }}</p>
            <p class="region">Region: {{ console.region }}</p>
          </div>
        </div>
      </div>

      <div class="no-consoles" *ngIf="consoles.length === 0">
        <p>No consoles in inventory. Add your first console!</p>
      </div>
    </div>
  `,
  styles: [`
    .console-list-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem 2rem;
      border-radius: 15px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h2 {
      margin: 0;
      color: #333;
      font-size: 2rem;
    }
    .add-btn {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .add-btn:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }
    .consoles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }
    .console-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s;
    }
    .console-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    .console-image {
      width: 100%;
      height: 200px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .console-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .console-info {
      padding: 1.5rem;
    }
    .console-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.3rem;
    }
    .model {
      color: #667eea;
      font-weight: 600;
      margin: 0.5rem 0;
    }
    .developer, .region {
      color: #666;
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }
    .no-consoles {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 15px;
      color: #999;
      font-size: 1.2rem;
    }
  `]
})
export class ConsoleListComponent implements OnInit {
  consoles: Console[] = [];
  private allConsoles: Console[] = [];

  constructor(
    private consoleService: ConsoleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadConsoles();
  }

  loadConsoles(): void {
    this.consoleService.getAllConsoles().subscribe(consoles => {
      this.consoles = consoles;
      this.allConsoles = consoles;
    });
  }

  onSearch(query: string): void {
    if (query.trim() === '') {
      this.consoles = this.allConsoles;
    } else {
      this.consoleService.searchConsoles(query).subscribe(consoles => {
        this.consoles = consoles;
      });
    }
  }

  viewConsole(id: string): void {
    this.router.navigate(['/console', id]);
  }
}
