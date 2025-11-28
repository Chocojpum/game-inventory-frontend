import { Component, OnInit } from '@angular/core';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-category-manager',
  templateUrl: `./category-manager.component.html`,
  styleUrls: [`./category-manager.component.css`]
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