import { Component, OnInit } from '@angular/core';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-category-manager',
  template: `
    <div class="manager-container">
      <h2>Category Manager</h2>
      
      <div class="add-category-form">
        <h3>Add New Category</h3>
        <div class="form-inline">
          <input 
            type="text" 
            [(ngModel)]="newCategory.name" 
            placeholder="Category name"
          />
          <select [(ngModel)]="newCategory.type">
            <option value="franchise">Franchise</option>
            <option value="saga">Saga</option>
            <option value="genre">Genre</option>
            <option value="custom">Custom</option>
          </select>
          <input 
            type="text" 
            [(ngModel)]="newCategory.description" 
            placeholder="Description (optional)"
          />
          <button (click)="addCategory()" [disabled]="!newCategory.name">
            Add Category
          </button>
        </div>
      </div>

      <div class="categories-display">
        <div class="category-group" *ngFor="let type of categoryTypes">
          <div class="group-header">
            <h3>{{ type | titlecase }}</h3>
            <input 
              type="text" 
              class="search-input"
              [(ngModel)]="searchQueries[type]"
              (input)="onSearch(type)"
              placeholder="Search {{ type }}..."
            />
          </div>
          <div class="category-list">
            <div 
              class="category-item" 
              *ngFor="let category of getFilteredCategories(type)"
            >
              <div class="category-content">
                <strong>{{ category.name }}</strong>
                <p *ngIf="category.description">{{ category.description }}</p>
                <span class="date">Created: {{ category.createdAt | date }}</span>
              </div>
              <button class="delete-btn" (click)="deleteCategory(category.id, category.name)">
                🗑️
              </button>
            </div>
            <p class="empty-message" *ngIf="getFilteredCategories(type).length === 0">
              No {{ type }} categories found
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manager-container {
      max-width: 1000px;
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
    h3 {
      color: #667eea;
      margin: 0 0 1rem 0;
    }
    .add-category-form {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 15px;
      margin-bottom: 2rem;
    }
    .form-inline {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .form-inline input,
    .form-inline select {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
    }
    .form-inline input {
      flex: 1;
      min-width: 200px;
    }
    .form-inline select {
      min-width: 150px;
    }
    .form-inline button {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .form-inline button:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }
    .form-inline button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .categories-display {
      display: grid;
      gap: 2rem;
    }
    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      gap: 1rem;
    }
    .group-header h3 {
      font-size: 1.3rem;
      margin: 0;
    }
    .search-input {
      padding: 0.5rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.9rem;
      min-width: 250px;
      transition: border-color 0.3s;
    }
    .search-input:focus {
      outline: none;
      border-color: #667eea;
    }
    .category-list {
      display: grid;
      gap: 1rem;
    }
    .category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 10px;
      border-left: 4px solid #667eea;
      transition: all 0.3s;
    }
    .category-item:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .category-content {
      flex: 1;
    }
    .category-content strong {
      display: block;
      color: #333;
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
    }
    .category-content p {
      margin: 0.5rem 0;
      color: #666;
      font-size: 0.95rem;
    }
    .date {
      font-size: 0.85rem;
      color: #999;
    }
    .delete-btn {
      padding: 0.5rem 1rem;
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1.2rem;
    }
    .delete-btn:hover {
      background: #ee5a6f;
      transform: scale(1.1);
    }
    .empty-message {
      color: #999;
      font-style: italic;
      padding: 1rem;
      text-align: center;
    }
  `]
})
export class CategoryManagerComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: { [key: string]: Category[] } = {};
  categoryTypes = ['franchise', 'saga', 'genre', 'custom'];
  searchQueries: { [key: string]: string } = {
    franchise: '',
    saga: '',
    genre: '',
    custom: ''
  };
  newCategory = {
    name: '',
    type: 'genre' as 'franchise' | 'saga' | 'genre' | 'custom',
    description: ''
  };

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
      this.updateFilteredCategories();
    });
  }

  updateFilteredCategories(): void {
    this.categoryTypes.forEach(type => {
      this.filteredCategories[type] = this.categories.filter(cat => cat.type === type);
    });
  }

  getFilteredCategories(type: string): Category[] {
    const query = this.searchQueries[type].toLowerCase().trim();
    if (!query) {
      return this.filteredCategories[type] || [];
    }
    return (this.filteredCategories[type] || []).filter(cat =>
      cat.name.toLowerCase().includes(query)
    );
  }

  onSearch(type: string): void {
    // Filtering is handled by getFilteredCategories()
  }

  addCategory(): void {
    if (this.newCategory.name) {
      this.categoryService.createCategory(this.newCategory).subscribe(() => {
        this.loadCategories();
        this.newCategory = {
          name: '',
          type: 'genre',
          description: ''
        };
      });
    }
  }

  deleteCategory(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      this.categoryService.deleteCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }
}