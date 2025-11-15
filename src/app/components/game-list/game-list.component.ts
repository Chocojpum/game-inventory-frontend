import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-game-list',
  template: `
    <div class="game-list-container">
      <app-search-bar [placeholder]="'🔍 Search games by title...'" (searchQuery)="onSearch($event)"></app-search-bar>
      
      <div class="filters">
        <div class="filter-group">
          <label>Genre:</label>
          <select (change)="onCategoryFilter($event, 'genre')" class="filter-select">
            <option value="">All</option>
            <option *ngFor="let cat of genreCategories" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Franchise:</label>
          <select (change)="onCategoryFilter($event, 'franchise')" class="filter-select">
            <option value="">All</option>
            <option *ngFor="let cat of franchiseCategories" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Saga:</label>
          <select (change)="onCategoryFilter($event, 'saga')" class="filter-select">
            <option value="">All</option>
            <option *ngFor="let cat of sagaCategories" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Custom:</label>
          <select (change)="onCategoryFilter($event, 'custom')" class="filter-select">
            <option value="">All</option>
            <option *ngFor="let cat of customCategories" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Console:</label>
          <select (change)="onConsoleFamilyFilter($event)" class="filter-select">
            <option value="">All</option>
            <option *ngFor="let family of consoleFamilies" [value]="family.id">{{ family.name }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Release Date From:</label>
          <input type="date" [(ngModel)]="dateFrom" (change)="onDateRangeChange()" class="date-input" />
        </div>

        <div class="filter-group">
          <label>Release Date To:</label>
          <input type="date" [(ngModel)]="dateTo" (change)="onDateRangeChange()" class="date-input" />
        </div>

        <button class="clear-filters-btn" (click)="clearFilters()">Clear Filters</button>
      </div>

      <div class="list-info">
        <span class="item-count">Showing {{ games.length }} of {{ allGames.length }} games</span>
      </div>

      <div class="sort-controls">
        <label>Sort by:</label>
        <button (click)="toggleSort('title')" [class.active]="currentSort.startsWith('title')">
          Title {{ currentSort === 'title-asc' ? '↑' : currentSort === 'title-desc' ? '↓' : '' }}
        </button>
        <button (click)="toggleSort('date')" [class.active]="currentSort.startsWith('date')">
          Date {{ currentSort === 'date-asc' ? '↑' : currentSort === 'date-desc' ? '↓' : '' }}
        </button>
      </div>

      <div class="games-grid" *ngIf="games.length > 0" [@listAnimation]="games.length">
        <div 
          class="game-card" 
          *ngFor="let game of games"
          (click)="viewGame(game.id)"
          [@cardAnimation]
        >
          <div class="game-cover">
            <img [src]="game.coverArt" [alt]="game.title" />
            <div class="physical-badge" [class.digital]="game.physicalDigital === 'digital'">
              {{ game.physicalDigital === 'physical' ? '📀' : '💾' }}
            </div>
          </div>
          <div class="game-info">
            <h3 [title]="game.title">
              <span class="title-text">{{ game.title }}</span>
            </h3>
            <p class="platform">{{ getConsoleFamilyName(game.consoleFamilyId) }}</p>
            <p class="release-date">{{ game.releaseDate | date }}</p>
          </div>
        </div>
      </div>

      <div class="no-games" *ngIf="games.length === 0">
        <p>No games found. Add your first game!</p>
      </div>
    </div>
  `,
  styles: [`
    .game-list-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: flex-end;
      margin-bottom: 1rem;
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
      min-width: 120px;
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
    .date-input {
      padding: 0.5rem;
      border-radius: 5px;
      border: 2px solid #667eea;
      font-size: 1rem;
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
    .sort-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .sort-controls label {
      font-weight: 600;
      color: #333;
      margin-right: 0.5rem;
    }
    .sort-controls button {
      padding: 0.5rem 1rem;
      background: #f0f0f0;
      color: #333;
      border: 2px solid #e0e0e0;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .sort-controls button:hover {
      background: #e0e0e0;
    }
    .sort-controls button.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
    .list-info {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
      padding: 0.5rem 1rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .item-count {
      font-weight: 600;
      color: #667eea;
    }
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 2rem;
    }
    .game-card {
      background: white;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
    }
    .game-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    .game-cover {
      width: 100%;
      height: 280px;
      overflow: hidden;
      background: #f0f0f0;
      position: relative;
    }
    .game-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .physical-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(102, 126, 234, 0.9);
      padding: 0.5rem;
      border-radius: 50%;
      font-size: 1.2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    .physical-badge.digital {
      background: rgba(118, 75, 162, 0.9);
    }
    .game-info {
      padding: 1rem;
    }
    .game-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1rem;
      height: 2.4em;
      overflow: hidden;
      position: relative;
    }
    .title-text {
      display: block;
      white-space: nowrap;
    }
    .game-card:hover .title-text {
      animation: scrollTitle 2s linear;
      animation-fill-mode: forwards;
    }
    @keyframes scrollTitle {
      0%, 10% { transform: translateX(0); }
      90%, 100% { transform: translateX(calc(-100% + 168px)); }
    }
    .platform {
      color: #667eea;
      font-weight: 600;
      margin: 0.25rem 0;
      font-size: 0.85rem;
    }
    .release-date {
      color: #999;
      font-size: 0.8rem;
      margin: 0.25rem 0;
    }
    .no-games {
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
export class GameListComponent implements OnInit {
  games: Game[] = [];
  categories: Category[] = [];
  genreCategories: Category[] = [];
  franchiseCategories: Category[] = [];
  sagaCategories: Category[] = [];
  customCategories: Category[] = [];
  consoleFamilies: ConsoleFamily[] = [];
  allGames: Game[] = [];
  private activeFilters: { [key: string]: string } = {};
  dateFrom: string = '';
  dateTo: string = '';
  currentSort: string = 'title-asc';

  constructor(
    private gameService: GameService,
    private categoryService: CategoryService,
    private consoleFamilyService: ConsoleFamilyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadGames();
    this.loadCategories();
    this.loadConsoleFamilies();
  }

  loadGames(): void {
    this.gameService.getAllGames().subscribe(games => {
      this.allGames = games;
      this.applyFiltersAndSort();
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
      this.genreCategories = categories.filter(c => c.type === 'genre').sort((a, b) => a.name.localeCompare(b.name));
      this.franchiseCategories = categories.filter(c => c.type === 'franchise').sort((a, b) => a.name.localeCompare(b.name));
      this.sagaCategories = categories.filter(c => c.type === 'saga').sort((a, b) => a.name.localeCompare(b.name));
      this.customCategories = categories.filter(c => c.type === 'custom').sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  loadConsoleFamilies(): void {
    this.consoleFamilyService.getAllFamilies().subscribe(families => {
      this.consoleFamilies = families.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  getConsoleFamilyName(familyId: string): string {
    const family = this.consoleFamilies.find(f => f.id === familyId);
    return family ? family.name : 'Unknown';
  }

  onSearch(query: string): void {
    if (query.trim() === '') {
      this.applyFiltersAndSort();
    } else {
      this.gameService.searchGames(query).subscribe(games => {
        this.games = this.sortGames(games);
      });
    }
  }

  onCategoryFilter(event: any, type: string): void {
    const categoryId = event.target.value;
    if (categoryId === '') {
      delete this.activeFilters[type];
    } else {
      this.activeFilters[type] = categoryId;
    }
    this.applyFiltersAndSort();
  }

  onConsoleFamilyFilter(event: any): void {
    const familyId = event.target.value;
    if (familyId === '') {
      delete this.activeFilters['consoleFamily'];
    } else {
      this.activeFilters['consoleFamily'] = familyId;
    }
    this.applyFiltersAndSort();
  }

  onDateRangeChange(): void {
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    let filtered = this.allGames;

    // Apply category filters
    const categoryFilterIds = Object.entries(this.activeFilters)
      .filter(([key]) => key !== 'consoleFamily')
      .map(([, value]) => value);

    if (categoryFilterIds.length > 0) {
      filtered = filtered.filter(game => 
        categoryFilterIds.every(filterId => game.categoryIds.includes(filterId))
      );
    }

    // Apply console family filter
    if (this.activeFilters['consoleFamily']) {
      filtered = filtered.filter(game => 
        game.consoleFamilyId === this.activeFilters['consoleFamily']
      );
    }

    // Apply date range filter
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(game => new Date(game.releaseDate) >= fromDate);
    }
    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      filtered = filtered.filter(game => new Date(game.releaseDate) <= toDate);
    }

    this.games = this.sortGames(filtered);
  }

  sortBy(sortType: string): void {
    this.currentSort = sortType;
    this.games = this.sortGames(this.games);
  }

  toggleSort(type: 'title' | 'date'): void {
    if (this.currentSort.startsWith(type)) {
      // Toggle between asc and desc
      this.currentSort = this.currentSort.endsWith('asc') ? `${type}-desc` : `${type}-asc`;
    } else {
      // Start with asc
      this.currentSort = `${type}-asc`;
    }
    this.games = this.sortGames(this.games);
  }

  sortGames(games: Game[]): Game[] {
    const sorted = [...games];
    
    switch(this.currentSort) {
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
      default:
        return sorted;
    }
  }

  clearFilters(): void {
    this.activeFilters = {};
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFiltersAndSort();
    const selects = document.querySelectorAll('.filter-select') as NodeListOf<HTMLSelectElement>;
    selects.forEach(select => select.value = '');
    const dateInputs = document.querySelectorAll('.date-input') as NodeListOf<HTMLInputElement>;
    dateInputs.forEach(input => input.value = '');
  }

  viewGame(id: string): void {
    this.router.navigate(['/game', id]);
  }
}