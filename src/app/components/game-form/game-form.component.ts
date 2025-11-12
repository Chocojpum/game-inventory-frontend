import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';
import { AttributeService, Attribute } from '../../services/attribute.service';
import { ConsoleService, Console } from '../../services/console.service';

@Component({
  selector: 'app-game-form',
  template: `
    <div class="form-container">
      <h2>{{ isEditMode ? 'Edit Game' : 'Add New Game' }}</h2>
      
      <form [formGroup]="gameForm" (ngSubmit)="onSubmit()" class="game-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          
          <div class="form-group">
            <label>Title *</label>
            <input type="text" formControlName="title" placeholder="Enter game title" />
          </div>

          <div class="form-group">
            <label>Alternate Titles</label>
            <div formArrayName="alternateTitles">
              <div *ngFor="let title of alternateTitles.controls; let i = index" class="array-item">
                <input type="text" [formControlName]="i" placeholder="Alternate title" />
                <button type="button" class="remove-btn" (click)="removeAlternateTitle(i)">✕</button>
              </div>
            </div>
            <button type="button" class="add-btn" (click)="addAlternateTitle()">+ Add Alternate Title</button>
          </div>

          <div class="form-group">
            <label>Cover Art URL *</label>
            <input type="url" formControlName="coverArt" placeholder="https://example.com/cover.jpg" />
            <div class="cover-preview" *ngIf="gameForm.get('coverArt')?.value">
              <img [src]="gameForm.get('coverArt')?.value" alt="Cover preview" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Release Date *</label>
              <input type="date" formControlName="releaseDate" />
            </div>

            <div class="form-group">
              <label>Platform *</label>
              <input type="text" formControlName="platform" placeholder="e.g., PlayStation 5, PC, Xbox" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Console</label>
              <select formControlName="consoleId">
                <option value="">None</option>
                <option *ngFor="let console of consoles" [value]="console.id">
                  {{ console.name }} ({{ console.model }})
                </option>
              </select>
              <p class="hint">Select from your console inventory</p>
            </div>

            <div class="form-group">
              <label>Physical / Digital *</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" formControlName="physicalDigital" value="physical" />
                  📀 Physical
                </label>
                <label class="radio-label">
                  <input type="radio" formControlName="physicalDigital" value="digital" />
                  💾 Digital
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Categories</h3>
          
          <div class="category-type-section" *ngFor="let type of categoryTypes">
            <h4>{{ type | titlecase }}</h4>
            <input 
              type="text" 
              class="search-input"
              [(ngModel)]="categorySearchQueries[type]"
              [ngModelOptions]="{standalone: true}"
              placeholder="Search {{ type }}..."
            />
            <div class="categories-list">
              <label *ngFor="let category of getFilteredCategories(type)" class="checkbox-label">
                <input 
                  type="checkbox" 
                  [checked]="isCategorySelected(category.id)"
                  (change)="toggleCategory(category.id)"
                />
                {{ category.name }}
              </label>
              <p class="hint" *ngIf="getFilteredCategories(type).length === 0">
                No {{ type }} categories found
              </p>
            </div>
          </div>

          <p class="hint" *ngIf="categories.length === 0">
            No categories yet. <a routerLink="/categories">Create categories</a>
          </p>
        </div>

        <div class="form-section">
          <h3>Custom Attributes</h3>
          
          <div class="global-attributes" *ngIf="globalAttributes.length > 0">
            <h4>Global Attributes</h4>
            <div *ngFor="let attr of globalAttributes" class="form-group">
              <label>{{ attr.name }}</label>
              <input 
                *ngIf="attr.type === 'text'" 
                type="text" 
                [value]="getAttributeValue(attr.name)"
                (change)="setAttributeValue(attr.name, $event)"
              />
              <input 
                *ngIf="attr.type === 'number'" 
                type="number" 
                [value]="getAttributeValue(attr.name)"
                (change)="setAttributeValue(attr.name, $event)"
              />
              <input 
                *ngIf="attr.type === 'date'" 
                type="date" 
                [value]="getAttributeValue(attr.name)"
                (change)="setAttributeValue(attr.name, $event)"
              />
              <label *ngIf="attr.type === 'boolean'" class="checkbox-label">
                <input 
                  type="checkbox" 
                  [checked]="getAttributeValue(attr.name)"
                  (change)="setAttributeValue(attr.name, $event)"
                />
                Yes
              </label>
              <select 
                *ngIf="attr.type === 'select'" 
                [value]="getAttributeValue(attr.name)"
                (change)="setAttributeValue(attr.name, $event)"
              >
                <option value="">Select...</option>
                <option *ngFor="let opt of attr.options" [value]="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <div class="custom-attribute-builder">
            <h4>Add Custom Attribute for This Game</h4>
            <div class="inline-form">
              <input 
                type="text" 
                [(ngModel)]="newAttributeName" 
                [ngModelOptions]="{standalone: true}"
                placeholder="Attribute name"
              />
              <input 
                type="text" 
                [(ngModel)]="newAttributeValue" 
                [ngModelOptions]="{standalone: true}"
                placeholder="Value"
              />
              <button type="button" class="add-btn" (click)="addCustomAttribute()">Add</button>
            </div>
          </div>

          <div class="current-custom-attributes" *ngIf="customAttributesArray.length > 0">
            <h4>Current Custom Attributes</h4>
            <div *ngFor="let attr of customAttributesArray" class="attribute-row">
              <strong>{{ attr.key }}:</strong> {{ attr.value }}
              <button type="button" class="remove-btn" (click)="removeCustomAttribute(attr.key)">✕</button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn" [disabled]="!gameForm.valid">
            {{ isEditMode ? 'Update Game' : 'Add Game' }}
          </button>
          <button type="button" class="cancel-btn" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
    h2 {
      margin: 0 0 2rem 0;
      color: #333;
      font-size: 2rem;
    }
    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid #f0f0f0;
    }
    .form-section:last-of-type {
      border-bottom: none;
    }
    h3 {
      color: #667eea;
      margin: 0 0 1.5rem 0;
    }
    h4 {
      color: #555;
      margin: 1rem 0 0.75rem 0;
      font-size: 1.1rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 600;
    }
    input[type="text"],
    input[type="url"],
    input[type="date"],
    input[type="number"],
    select {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }
    .radio-group {
      display: flex;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }
    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: normal;
      cursor: pointer;
      padding: 0.75rem 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      transition: background 0.3s;
    }
    .radio-label:hover {
      background: #e9ecef;
    }
    .radio-label input[type="radio"] {
      width: auto;
      cursor: pointer;
    }
    .cover-preview {
      margin-top: 1rem;
      width: 200px;
      height: 280px;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .cover-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .array-item {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .array-item input {
      flex: 1;
    }
    .add-btn, .remove-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }
    .add-btn {
      background: #667eea;
      color: white;
      margin-top: 0.5rem;
    }
    .add-btn:hover {
      background: #5568d3;
    }
    .remove-btn {
      background: #ff4757;
      color: white;
    }
    .remove-btn:hover {
      background: #ee5a6f;
    }
    .hint {
      color: #999;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      font-style: italic;
    }
    .hint a {
      color: #667eea;
      text-decoration: underline;
    }
    .category-type-section {
      margin-bottom: 2rem;
    }
    .search-input {
      width: 100%;
      padding: 0.5rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.95rem;
    }
    .search-input:focus {
      outline: none;
      border-color: #667eea;
    }
    .categories-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 0.75rem;
      max-height: 200px;
      overflow-y: auto;
      padding: 0.5rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s;
      font-weight: normal;
    }
    .checkbox-label:hover {
      background: #e9ecef;
    }
    .checkbox-label input[type="checkbox"] {
      width: auto;
      cursor: pointer;
    }
    .inline-form {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .inline-form input {
      flex: 1;
    }
    .attribute-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }
    .attribute-row strong {
      color: #667eea;
      min-width: 150px;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }
    .submit-btn, .cancel-btn {
      padding: 1rem 2rem;
      border: none;
      border-radius: 25px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .submit-btn {
      background: #667eea;
      color: white;
      flex: 1;
    }
    .submit-btn:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .cancel-btn {
      background: #e0e0e0;
      color: #333;
    }
    .cancel-btn:hover {
      background: #d0d0d0;
    }
  `]
})
export class GameFormComponent implements OnInit {
  gameForm: FormGroup;
  isEditMode = false;
  gameId: string | null = null;
  categories: Category[] = [];
  categoryTypes = ['genre', 'franchise', 'saga', 'custom'];
  categorySearchQueries: { [key: string]: string } = {
    genre: '',
    franchise: '',
    saga: '',
    custom: ''
  };
  consoles: Console[] = [];
  globalAttributes: Attribute[] = [];
  selectedCategoryIds: string[] = [];
  customAttributesObj: Record<string, any> = {};
  customAttributesArray: Array<{key: string, value: any}> = [];
  newAttributeName = '';
  newAttributeValue = '';

  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private categoryService: CategoryService,
    private attributeService: AttributeService,
    private consoleService: ConsoleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.gameForm = this.fb.group({
      title: ['', Validators.required],
      alternateTitles: this.fb.array([]),
      coverArt: ['', Validators.required],
      releaseDate: ['', Validators.required],
      platform: ['', Validators.required],
      consoleId: [''],
      physicalDigital: ['physical', Validators.required],
    });
  }

  get alternateTitles(): FormArray {
    return this.gameForm.get('alternateTitles') as FormArray;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadConsoles();
    this.loadGlobalAttributes();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.gameId = id;
      this.loadGame(id);
    }
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadConsoles(): void {
    this.consoleService.getAllConsoles().subscribe(consoles => {
      this.consoles = consoles;
    });
  }

  loadGlobalAttributes(): void {
    this.attributeService.getGlobalAttributes().subscribe(attributes => {
      this.globalAttributes = attributes;
    });
  }

  loadGame(id: string): void {
    this.gameService.getGame(id).subscribe(game => {
      this.gameForm.patchValue({
        title: game.title,
        coverArt: game.coverArt,
        releaseDate: game.releaseDate.split('T')[0],
        platform: game.platform,
        consoleId: game.consoleId || '',
        physicalDigital: game.physicalDigital,
      });

      if (game.alternateTitles) {
        game.alternateTitles.forEach(title => {
          this.alternateTitles.push(this.fb.control(title));
        });
      }

      this.selectedCategoryIds = game.categoryIds || [];
      this.customAttributesObj = game.customAttributes || {};
      this.updateCustomAttributesArray();
    });
  }

  getFilteredCategories(type: string): Category[] {
    const query = this.categorySearchQueries[type].toLowerCase().trim();
    const typedCategories = this.categories.filter(c => c.type === type);
    if (!query) {
      return typedCategories;
    }
    return typedCategories.filter(cat => cat.name.toLowerCase().includes(query));
  }

  addAlternateTitle(): void {
    this.alternateTitles.push(this.fb.control(''));
  }

  removeAlternateTitle(index: number): void {
    this.alternateTitles.removeAt(index);
  }

  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategoryIds.includes(categoryId);
  }

  toggleCategory(categoryId: string): void {
    const index = this.selectedCategoryIds.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategoryIds.splice(index, 1);
    } else {
      this.selectedCategoryIds.push(categoryId);
    }
  }

  getAttributeValue(attrName: string): any {
    return this.customAttributesObj[attrName] || '';
  }

  setAttributeValue(attrName: string, event: any): void {
    const attr = this.globalAttributes.find(a => a.name === attrName);
    if (attr?.type === 'boolean') {
      this.customAttributesObj[attrName] = event.target.checked;
    } else if (attr?.type === 'number') {
      this.customAttributesObj[attrName] = parseFloat(event.target.value) || 0;
    } else {
      this.customAttributesObj[attrName] = event.target.value;
    }
    this.updateCustomAttributesArray();
  }

  addCustomAttribute(): void {
    if (this.newAttributeName && this.newAttributeValue) {
      this.customAttributesObj[this.newAttributeName] = this.newAttributeValue;
      this.updateCustomAttributesArray();
      this.newAttributeName = '';
      this.newAttributeValue = '';
    }
  }

  removeCustomAttribute(key: string): void {
    delete this.customAttributesObj[key];
    this.updateCustomAttributesArray();
  }

  updateCustomAttributesArray(): void {
    this.customAttributesArray = Object.entries(this.customAttributesObj).map(([key, value]) => ({
      key,
      value
    }));
  }

  onSubmit(): void {
    if (this.gameForm.valid) {
      const gameData = {
        ...this.gameForm.value,
        categoryIds: this.selectedCategoryIds,
        customAttributes: this.customAttributesObj,
      };

      if (this.isEditMode && this.gameId) {
        this.gameService.updateGame(this.gameId, gameData).subscribe(() => {
          this.router.navigate(['/game', this.gameId]);
        });
      } else {
        this.gameService.createGame(gameData).subscribe(game => {
          this.router.navigate(['/game', game.id]);
        });
      }
    }
  }

  cancel(): void {
    if (this.isEditMode && this.gameId) {
      this.router.navigate(['/game', this.gameId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}