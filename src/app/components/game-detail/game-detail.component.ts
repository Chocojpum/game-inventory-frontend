import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';
import { ConsoleService, Console } from '../../services/console.service';

@Component({
  selector: 'app-game-detail',
  template: `
    <div class="game-detail-container" *ngIf="game">
      <button class="back-button" (click)="goBack()">← Back to Library</button>
      
      <div class="game-detail-card">
        <div class="game-header">
          <div class="game-cover-large">
            <img [src]="game.coverArt" [alt]="game.title" />
            <div class="physical-badge" [class.digital]="game.physicalDigital === 'digital'">
              {{ game.physicalDigital === 'physical' ? '📀 Physical' : '💾 Digital' }}
            </div>
          </div>
          
          <div class="game-main-info">
            <h1>{{ game.title }}</h1>
            
            <div class="alt-titles" *ngIf="game.alternateTitles && game.alternateTitles.length > 0">
              <strong>Also known as:</strong>
              <span *ngFor="let alt of game.alternateTitles; let last = last">
                {{ alt }}<span *ngIf="!last">, </span>
              </span>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Platform:</span>
                <span class="value">{{ game.platform }}</span>
              </div>
              <div class="info-item" *ngIf="gameConsole">
                <span class="label">Console:</span>
                <span class="value">{{ gameConsole.name }} ({{ gameConsole.model }})</span>
              </div>
              <div class="info-item">
                <span class="label">Release Date:</span>
                <span class="value">{{ game.releaseDate | date: 'longDate' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Format:</span>
                <span class="value">{{ game.physicalDigital }}</span>
              </div>
            </div>

            <div class="categories-section" *ngIf="gameCategories.length > 0">
              <h3>Categories</h3>
              <div class="category-tags">
                <span class="category-tag" *ngFor="let cat of gameCategories">
                  {{ cat.name }}
                  <span class="category-type">({{ cat.type }})</span>
                </span>
              </div>
            </div>

            <div class="actions">
              <button class="edit-button" (click)="editGame()">✏️ Edit</button>
              <button class="backlog-button" (click)="showBacklogManager()">
                🎯 Manage Backlog
              </button>
              <button class="delete-button" (click)="deleteGame()">🗑️ Delete</button>
            </div>
          </div>
        </div>

        <div class="custom-attributes" *ngIf="hasCustomAttributes()">
          <h2>Additional Information</h2>
          <div class="attributes-grid">
            <div class="attribute-item" *ngFor="let attr of getCustomAttributesArray()">
              <span class="attr-label">{{ attr.key }}:</span>
              <span class="attr-value">{{ formatAttributeValue(attr.value) }}</span>
            </div>
          </div>
        </div>

        <app-backlog-manager 
          *ngIf="showBacklog" 
          [gameId]="game.id"
          [gameTitle]="game.title"
          (close)="showBacklog = false">
        </app-backlog-manager>
      </div>
    </div>

    <div class="loading" *ngIf="!game">
      <p>Loading game details...</p>
    </div>
  `,
  styles: [`
    .game-detail-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .back-button {
      background: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-size: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: all 0.3s;
    }
    .back-button:hover {
      transform: translateX(-5px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    .game-detail-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
    .game-header {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 2rem;
      padding: 2rem;
    }
    .game-cover-large {
      width: 100%;
      height: 500px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      position: relative;
      background: #f0f0f0;
    }
    .game-cover-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .physical-badge {
      position: absolute;
      bottom: 15px;
      right: 15px;
      background: rgba(102, 126, 234, 0.95);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 25px;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .physical-badge.digital {
      background: rgba(118, 75, 162, 0.95);
    }
    .game-main-info h1 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 2.5rem;
    }
    .alt-titles {
      color: #666;
      margin-bottom: 1.5rem;
      font-style: italic;
    }
    .info-grid {
      display: grid;
      gap: 1rem;
      margin: 1.5rem 0;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .label {
      font-weight: 600;
      color: #667eea;
      min-width: 120px;
    }
    .value {
      color: #333;
      font-size: 1.1rem;
      text-transform: capitalize;
    }
    .categories-section {
      margin: 2rem 0;
    }
    .categories-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    .category-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .category-tag {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }
    .category-type {
      opacity: 0.8;
      font-size: 0.85rem;
    }
    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }
    .edit-button, .backlog-button, .delete-button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s;
    }
    .edit-button {
      background: #667eea;
      color: white;
    }
    .edit-button:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .backlog-button {
      background: #2ecc71;
      color: white;
    }
    .backlog-button:hover {
      background: #27ae60;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
    }
    .delete-button {
      background: #ff4757;
      color: white;
    }
    .delete-button:hover {
      background: #ee5a6f;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
    }
    .custom-attributes {
      padding: 2rem;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;
    }
    .custom-attributes h2 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }
    .attributes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    .attribute-item {
      background: white;
      padding: 1rem;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .attr-label {
      display: block;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 0.5rem;
    }
    .attr-value {
      color: #333;
      font-size: 1.05rem;
    }
    .loading {
      text-align: center;
      padding: 4rem;
      color: white;
      font-size: 1.5rem;
    }
    @media (max-width: 768px) {
      .game-header {
        grid-template-columns: 1fr;
      }
      .game-cover-large {
        height: 400px;
      }
    }
  `]
})
export class GameDetailComponent implements OnInit {
  game: Game | null = null;
  gameCategories: Category[] = [];
  gameConsole: Console | null = null;
  showBacklog = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private categoryService: CategoryService,
    private consoleService: ConsoleService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.gameService.getGame(id).subscribe(game => {
        this.game = game;
        this.loadCategories();
        this.loadConsole();
      });
    }
  }

  loadCategories(): void {
    if (this.game && this.game.categoryIds.length > 0) {
      this.categoryService.getAllCategories().subscribe(categories => {
        this.gameCategories = categories.filter(cat => 
          this.game!.categoryIds.includes(cat.id)
        );
      });
    }
  }

  loadConsole(): void {
    if (this.game && this.game.consoleId) {
      this.consoleService.getConsole(this.game.consoleId).subscribe(
        console => {
          this.gameConsole = console;
        },
        error => {
          console.error('Console not found', error);
        }
      );
    }
  }

  hasCustomAttributes(): boolean {
    return this.game ? Object.keys(this.game.customAttributes).length > 0 : false;
  }

  getCustomAttributesArray(): Array<{key: string, value: any}> {
    if (!this.game) return [];
    return Object.entries(this.game.customAttributes).map(([key, value]) => ({
      key,
      value
    }));
  }

  formatAttributeValue(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  }

  editGame(): void {
    if (this.game) {
      this.router.navigate(['/edit-game', this.game.id]);
    }
  }

  showBacklogManager(): void {
    this.showBacklog = true;
  }

  deleteGame(): void {
    if (this.game && confirm(`Are you sure you want to delete "${this.game.title}"?`)) {
      this.gameService.deleteGame(this.game.id).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}