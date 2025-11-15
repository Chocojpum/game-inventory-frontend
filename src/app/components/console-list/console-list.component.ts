import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-console-list',
  template: `
    <div class="console-list-container">
      <div class="header-actions">
        <h2>🎮 Console Inventory</h2>
        <button class="add-btn" routerLink="/add-console">+ Add Console</button>
      </div>
      
      <app-search-bar [placeholder]="'🔍 Search consoles...'" (searchQuery)="onSearch($event)"></app-search-bar>

      <div class="filters">
        <div class="filter-group">
          <label>Console Family:</label>
          <select (change)="onFamilyFilter($event)" class="filter-select">
            <option value="">All</option>
            <option *ngFor="let family of families" [value]="family.id">{{ family.name }}</option>
          </select>
        </div>

        <button class="clear-filters-btn" (click)="clearFilters()">Clear Filters</button>
      </div>

      <div class="consoles-grid" *ngIf="consoles.length > 0" [@listAnimation]="consoles.length">
        <div 
          class="console-card" 
          *ngFor="let console of consoles"
          (click)="viewConsole(console.id)"
          [@cardAnimation]
        >
          <div class="console-image">
            <img [src]="console.picture" [alt]="getConsoleName(console)" />
          </div>
          <div class="console-info">
            <h3>{{ getConsoleName(console) }}</h3>
            <p class="model">{{ console.model }}</p>
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
    .filters {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
      min-width: 150px;
    }
    .filter-group label {
      font-weight: 600;
      color: #667eea;
      font-size: 0.9rem;
    }
    .filter-select {
      padding: 0.5rem;
      border-radius: 5px;
      border: 2px solid #667eea;
      font-size: 1rem;
      cursor: pointer;
    }
    .clear-filters-btn {
      padding: 0.5rem 1rem;
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      height: fit-content;
    }
    .clear-filters-btn:hover {
      background: #ee5a6f;
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
    .region {
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
  `],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ConsoleListComponent implements OnInit {
  consoles: Console[] = [];
  families: ConsoleFamily[] = [];
  private allConsoles: Console[] = [];
  private selectedFamilyId: string = '';

  constructor(
    private consoleService: ConsoleService,
    private familyService: ConsoleFamilyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadConsoles();
    this.loadFamilies();
  }

  loadConsoles(): void {
    this.consoleService.getAllConsoles().subscribe(consoles => {
      this.consoles = consoles;
      this.allConsoles = consoles;
    });
  }

  loadFamilies(): void {
    this.familyService.getAllFamilies().subscribe(families => {
      this.families = families;
    });
  }

  getConsoleName(console: Console): string {
    const family = this.families.find(f => f.id === console.consoleFamilyId);
    return family ? `${family.name}` : 'Unknown Console';
  }

  onSearch(query: string): void {
    if (query.trim() === '') {
      this.applyFilter();
    } else {
      this.consoleService.searchConsoles(query).subscribe(consoles => {
        this.consoles = this.selectedFamilyId 
          ? consoles.filter(c => c.consoleFamilyId === this.selectedFamilyId)
          : consoles;
      });
    }
  }

  onFamilyFilter(event: any): void {
    this.selectedFamilyId = event.target.value;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedFamilyId) {
      this.consoles = this.allConsoles.filter(c => c.consoleFamilyId === this.selectedFamilyId);
    } else {
      this.consoles = this.allConsoles;
    }
  }

  clearFilters(): void {
    this.selectedFamilyId = '';
    this.consoles = this.allConsoles;
    const select = document.querySelector('.filter-select') as HTMLSelectElement;
    if (select) select.value = '';
  }

  viewConsole(id: string): void {
    this.router.navigate(['/console', id]);
  }
}