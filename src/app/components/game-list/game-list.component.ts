import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-game-list',
  template: `
    <div class="game-list-container">
      <app-search-bar (searchQuery)="onSearch($event)"></app-search-bar>
      
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

        <button class="clear-filters-btn" (click)="clearFilters()">Clear Filters</button>
      </div>

      <div class="games-grid" *ngIf="games.length > 0">
        <div 
          class="game-card" 
          *ngFor="let game of games"
          (click)="viewGame(game.id)"
        >
          <div class="game-cover">
            <img [src]="game.coverArt" [alt]="game.title" />
            <div class="physical-badge" [class.digital]="game.physicalDigital === 'digital'">
              {{ game.physicalDigital === 'physical' ? '📀' : '💾' }}
            </div>
          </div>
          <div class="game-info">
            <h3>{{ game.title }}</h3>
            <p class="platform">{{ game.platform }}</p>
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
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
  `]
})
export class GameListComponent implements OnInit {
  games: Game[] = [];
  categories: Category[] = [];
  genreCategories: Category[] = [];
  franchiseCategories: Category[] = [];
  sagaCategories: Category[] = [];
  customCategories: Category[] = [];
  private allGames: Game[] = [];
  private activeFilters: { [key: string]: string } = {};

  constructor(
    private gameService: GameService,
    private categoryService: CategoryService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadGames();
    this.loadCategories();
  }

  loadGames(): void {
    this.gameService.getAllGames().subscribe(games => {
      this.games = games;
      this.allGames = games;
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
      this.genreCategories = categories.filter(c => c.type === 'genre');
      this.franchiseCategories = categories.filter(c => c.type === 'franchise');
      this.sagaCategories = categories.filter(c => c.type === 'saga');
      this.customCategories = categories.filter(c => c.type === 'custom');
    });
  }

  onSearch(query: string): void {
    if (query.trim() === '') {
      this.applyFilters();
    } else {
      this.gameService.searchGames(query).subscribe(games => {
        this.games = games;
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
    this.applyFilters();
  }

  applyFilters(): void {
    const filterIds = Object.values(this.activeFilters);
    if (filterIds.length === 0) {
      this.games = this.allGames;
    } else {
      this.games = this.allGames.filter(game => 
        filterIds.every(filterId => game.categoryIds.includes(filterId))
      );
    }
  }

  clearFilters(): void {
    this.activeFilters = {};
    this.games = this.allGames;
    // Reset all select elements
    const selects = document.querySelectorAll('.filter-select') as NodeListOf<HTMLSelectElement>;
    selects.forEach(select => select.value = '');
  }

  viewGame(id: string): void {
    this.router.navigate(['/game', id]);
  }
}