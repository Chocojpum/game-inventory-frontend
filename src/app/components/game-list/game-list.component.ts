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
        <label>
          Filter by Category:
          <select (change)="onCategoryFilter($event)" class="filter-select">
            <option value="">All Games</option>
            <option *ngFor="let cat of categories" [value]="cat.id">
              {{ cat.name }} ({{ cat.type }})
            </option>
          </select>
        </label>
      </div>

      <div class="games-grid" *ngIf="games.length > 0">
        <div 
          class="game-card" 
          *ngFor="let game of games"
          (click)="viewGame(game.id)"
        >
          <div class="game-cover">
            <img [src]="game.coverArt" [alt]="game.title" />
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
      margin-bottom: 2rem;
      background: white;
      padding: 1rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .filter-select {
      margin-left: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      border: 2px solid #667eea;
      font-size: 1rem;
    }
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }
    .game-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s;
    }
    .game-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    .game-cover {
      width: 100%;
      height: 300px;
      overflow: hidden;
      background: #f0f0f0;
    }
    .game-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .game-info {
      padding: 1rem;
    }
    .game-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.2rem;
    }
    .platform {
      color: #667eea;
      font-weight: 600;
      margin: 0.25rem 0;
    }
    .release-date {
      color: #999;
      font-size: 0.9rem;
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
  private allGames: Game[] = [];

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
    });
  }

  onSearch(query: string): void {
    if (query.trim() === '') {
      this.games = this.allGames;
    } else {
      this.gameService.searchGames(query).subscribe(games => {
        this.games = games;
      });
    }
  }

  onCategoryFilter(event: any): void {
    const categoryId = event.target.value;
    if (categoryId === '') {
      this.games = this.allGames;
    } else {
      this.gameService.getGamesByCategory(categoryId).subscribe(games => {
        this.games = games;
      });
    }
  }

  viewGame(id: string): void {
    this.router.navigate(['/game', id]);
  }
}