import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { BacklogService, Backlog } from '../../services/backlog.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-game-detail',
  template: `
    <div class="game-detail-container" *ngIf="game" [@fadeIn]>
      <button class="back-button" (click)="goBack()">← Back to Library</button>
      
      <div class="game-detail-card">
        <div class="game-header">
          <div class="game-cover-large">
            <img [src]="game.coverArt" [alt]="game.title" />
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
                <span class="label">Console:</span>
                <span class="value">{{ getConsoleFamilyName() }}</span>
              </div>
              <div class="info-item" *ngIf="gameConsole">
                <span class="label">Owned Model:</span>
                <span class="value">{{ gameConsole.model }}</span>
              </div>
              <div class="info-item">
                <span class="label">Release Date:</span>
                <span class="value">{{ game.releaseDate | date: 'longDate' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Developer:</span>
                <span class="value">{{ game.developer }}</span>
              </div>
              <div class="info-item">
                <span class="label">Region:</span>
                <span class="value">{{ game.region }}</span>
              </div>
              <div class="info-item">
                <span class="label">Format:</span>
                <span class="value">{{ game.physicalDigital }}</span>
              </div>
            </div>

            <div class="categories-section" *ngIf="gameCategories.length > 0">
              <h3>Categories</h3>
              
              <div class="category-subsection" *ngIf="getCategoriesByType('genre').length > 0">
                <h4>Genres</h4>
                <div class="category-tags">
                  <span class="category-tag" *ngFor="let cat of getCategoriesByType('genre')">
                    {{ cat.name }}
                  </span>
                </div>
              </div>

              <div class="category-subsection" *ngIf="getCategoriesByType('franchise').length > 0">
                <h4>Franchises</h4>
                <div class="category-tags">
                  <span class="category-tag" *ngFor="let cat of getCategoriesByType('franchise')">
                    {{ cat.name }}
                  </span>
                </div>
              </div>

              <div class="category-subsection" *ngIf="getCategoriesByType('saga').length > 0">
                <h4>Sagas</h4>
                <div class="category-tags">
                  <span class="category-tag" *ngFor="let cat of getCategoriesByType('saga')">
                    {{ cat.name }}
                  </span>
                </div>
              </div>

              <div class="category-subsection" *ngIf="getCategoriesByType('custom').length > 0">
                <h4>Custom</h4>
                <div class="category-tags">
                  <span class="category-tag" *ngFor="let cat of getCategoriesByType('custom')">
                    {{ cat.name }}
                  </span>
                </div>
              </div>
            </div>

            <div class="actions">
              <button class="edit-button" (click)="editGame()">✏️ Edit</button>
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

        <div class="backlog-section">
          <div class="backlog-header">
            <h2>🎯 Completion History</h2>
            <button class="add-backlog-btn" (click)="showBacklogManager()">
              <span class="btn-icon">+</span>
              <span class="btn-text">Add Entry</span>
            </button>
          </div>

          <div *ngIf="backlogs.length > 0" class="backlog-list">
            <div *ngFor="let backlog of backlogs" class="backlog-item">
              <div class="backlog-content" *ngIf="!isEditingBacklog(backlog.id)">
                <div class="backlog-main">
                  <strong>{{ backlog.completionDate ? (backlog.completionDate | date: 'yyyy-MM-dd') : 'Unknown date' }}</strong>
                  <span class="completion-type-badge">{{ backlog.completionType }}</span>
                </div>
                <div class="backlog-details" *ngIf="backlog.endingType">
                  <span class="label">Ending:</span> {{ backlog.endingType }}
                </div>
                <div class="backlog-attributes" *ngIf="hasBacklogAttributes(backlog)">
                  <div *ngFor="let attr of getBacklogAttributesArray(backlog)" class="attr-display">
                    <span class="attr-label">{{ attr.key }}:</span> {{ attr.value }}
                  </div>
                </div>
              </div>

              <div class="backlog-edit-form" *ngIf="isEditingBacklog(backlog.id)">
                <div class="edit-field">
                  <label>Completion Date</label>
                  <input 
                    type="date" 
                    [(ngModel)]="editingBacklogData.completionDate"
                    [disabled]="editingBacklogData.unknownDate"
                  />
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="editingBacklogData.unknownDate"
                    />
                    Unknown date
                  </label>
                </div>
                <div class="edit-field">
                  <label>Ending Type</label>
                  <input type="text" [(ngModel)]="editingBacklogData.endingType" />
                </div>
                <div class="edit-field">
                  <label>Completion Type</label>
                  <input type="text" [(ngModel)]="editingBacklogData.completionType" />
                </div>
                <div class="edit-actions">
                  <button class="save-btn" (click)="saveBacklogEdit(backlog.id)">Save</button>
                  <button class="cancel-edit-btn" (click)="cancelBacklogEdit()">Cancel</button>
                </div>
              </div>

              <div class="backlog-actions">
                <button class="edit-btn-small" (click)="startEditingBacklog(backlog)" *ngIf="!isEditingBacklog(backlog.id)">✏️</button>
                <button class="delete-btn-small" (click)="deleteBacklogEntry(backlog.id)" *ngIf="!isEditingBacklog(backlog.id)">✕</button>
              </div>
            </div>
          </div>

          <div *ngIf="backlogs.length === 0" class="empty-backlog">
            <p>No completions recorded yet.</p>
          </div>
        </div>

        <app-backlog-manager 
          *ngIf="showBacklog" 
          [gameId]="game.id"
          [gameTitle]="game.title"
          (close)="closeBacklogManager()">
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
      grid-template-columns: auto 1fr;
      gap: 2rem;
      padding: 2rem;
    }
    .game-cover-large {
      position: relative;
      background: #f0f0f0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    .game-cover-large img {
      display: block;
      max-width: 400px;
      height: auto;
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
    .category-subsection {
      margin-bottom: 1rem;
    }
    .category-subsection h4 {
      margin: 0 0 0.5rem 0;
      color: #667eea;
      font-size: 1rem;
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
    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }
    .edit-button, .delete-button {
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
    .backlog-section {
      padding: 2rem;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;
    }
    .backlog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .backlog-header h2 {
      margin: 0;
      color: #333;
    }
    .add-backlog-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      color: white;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
    }
    .add-backlog-btn:hover {
      background: linear-gradient(135deg, #27ae60, #229954);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
    }
    .btn-icon {
      font-size: 1.3rem;
      font-weight: bold;
    }
    .backlog-list {
      display: grid;
      gap: 1rem;
    }
    .backlog-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      background: white;
      border-radius: 15px;
      border-left: 5px solid #2ecc71;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      transition: all 0.3s;
    }
    .backlog-item:hover {
      box-shadow: 0 4px 15px rgba(46, 204, 113, 0.2);
      transform: translateX(5px);
    }
    .backlog-content {
      flex: 1;
    }
    .backlog-main {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }
    .backlog-main strong {
      color: #333;
      font-size: 1.1rem;
    }
    .completion-type-badge {
      background: #2ecc71;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .backlog-details {
      color: #666;
      margin-bottom: 0.5rem;
    }
    .backlog-attributes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 0.75rem;
    }
    .attr-display {
      background: #f8f9fa;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .delete-btn-small,
    .edit-btn-small {
      background: #ff4757;
      color: white;
      border: none;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s;
    }
    .delete-btn-small:hover,
    .edit-btn-small:hover {
      background: #ee5a6f;
      transform: scale(1.1);
    }
    .edit-btn-small {
      background: #667eea;
    }
    .edit-btn-small:hover {
      background: #667eea;
    }
    .empty-backlog {
      text-align: center;
      padding: 2rem;
      color: #999;
      font-style: italic;
    }
    .backlog-edit-form {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin: 16px 0;
    }
      
    .edit-field {
      margin-bottom: 16px;
    }
      
    .edit-field label {
      display: block;
      font-weight: 600;
      font-size: 14px;
      color: #333;
      margin-bottom: 6px;
    }
      
    .edit-field input[type="text"],
    .edit-field input[type="date"] {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d0d0d0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
      
    .edit-field input[type="text"]:focus,
    .edit-field input[type="date"]:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }
      
    .edit-field input[type="text"]:disabled,
    .edit-field input[type="date"]:disabled {
      background-color: #f0f0f0;
      cursor: not-allowed;
      opacity: 0.6;
    }
      
    .checkbox-label {
      display: flex;
      align-items: center;
      font-weight: 400 !important;
      margin-top: 8px;
      cursor: pointer;
    }
      
    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
      cursor: pointer;
    }
      
    .edit-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
      
    .save-btn,
    .cancel-edit-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
    }
      
    .save-btn {
      background-color: #4a90e2;
      color: white;
    }
      
    .save-btn:hover {
      background-color: #3a7bc8;
    }
      
    .save-btn:active {
      transform: scale(0.98);
    }
      
    .cancel-edit-btn {
      background-color: #e0e0e0;
      color: #333;
    }
      
    .cancel-edit-btn:hover {
      background-color: #d0d0d0;
    }
      
    .cancel-edit-btn:active {
      transform: scale(0.98);
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
      .game-cover-large img {
        max-width: 100%;
      }
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class GameDetailComponent implements OnInit {
  game: Game | null = null;
  gameCategories: Category[] = [];
  gameConsole: Console | null = null;
  consoleFamily: ConsoleFamily | null = null;
  backlogs: Backlog[] = [];
  showBacklog = false;
  editingBacklogId: string | null = null;
  editingBacklogData: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private categoryService: CategoryService,
    private consoleService: ConsoleService,
    private consoleFamilyService: ConsoleFamilyService,
    private backlogService: BacklogService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.gameService.getGame(id).subscribe(game => {
        this.game = game;
        this.loadCategories();
        this.loadConsole();
        this.loadConsoleFamily();
        this.loadBacklogs();
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

  loadConsoleFamily(): void {
    if (this.game) {
      this.consoleFamilyService.getFamily(this.game.consoleFamilyId).subscribe(
        family => {
          this.consoleFamily = family;
        },
        error => {
          console.error('Console family not found', error);
        }
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

  isEditingBacklog(id: string): boolean {
    return this.editingBacklogId === id;
  }

  startEditingBacklog(backlog: Backlog): void {
    this.editingBacklogId = backlog.id;
    this.editingBacklogData = {
      completionDate: backlog.completionDate ? backlog.completionDate.split('T')[0] : '',
      endingType: backlog.endingType,
      completionType: backlog.completionType,
      unknownDate: !backlog.completionDate
    };
  }

  saveBacklogEdit(id: string): void {
    this.backlogService.updateBacklog(id, {
      completionDate: this.editingBacklogData.unknownDate ? null : this.editingBacklogData.completionDate,
      endingType: this.editingBacklogData.endingType,
      completionType: this.editingBacklogData.completionType
    }).subscribe(() => {
      this.editingBacklogId = null;
      this.loadBacklogs();
    });
  }

  cancelBacklogEdit(): void {
    this.editingBacklogId = null;
    this.editingBacklogData = {};
  }

  getConsoleFamilyName(): string {
    return this.consoleFamily ? this.consoleFamily.name : 'Unknown';
  }

  getCategoriesByType(type: string): Category[] {
    return this.gameCategories.filter(cat => cat.type === type);
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

  hasBacklogAttributes(backlog: Backlog): boolean {
    return Object.keys(backlog.customAttributes).length > 0;
  }

  getBacklogAttributesArray(backlog: Backlog): Array<{key: string, value: any}> {
    return Object.entries(backlog.customAttributes).map(([key, value]) => ({
      key,
      value
    }));
  }

  editGame(): void {
    if (this.game) {
      this.router.navigate(['/edit-game', this.game.id]);
    }
  }

  showBacklogManager(): void {
    this.showBacklog = true;
  }

  closeBacklogManager(): void {
    this.showBacklog = false;
    this.loadBacklogs();
  }

  deleteBacklogEntry(id: string): void {
    if (confirm('Are you sure you want to delete this completion entry?')) {
      this.backlogService.deleteBacklog(id).subscribe(() => {
        this.loadBacklogs();
      });
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
    this.router.navigate(['/']);
  }
}