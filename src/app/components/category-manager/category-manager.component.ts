import { Component, OnInit } from '@angular/core';
import { CategoryService, Category } from '../../services/category.service';
import { CreationFlowService } from '../../services/creation-flow.service';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

type CategoryType = 'franchise' | 'saga' | 'genre' | 'custom';

@Component({
  selector: 'app-category-manager',
  templateUrl: `./category-manager.component.html`,
  styleUrls: [`./category-manager.component.css`]
})
export class CategoryManagerComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: { [key: string]: Category[] } = {};
  categoryTypes: CategoryType[] = ['franchise', 'saga', 'genre', 'custom'];
  /** The currently selected tab; drives both the list shown and the add form. */
  activeType: CategoryType = 'genre';
  searchQueries: { [key: string]: string } = {
    franchise: '',
    saga: '',
    genre: '',
    custom: ''
  };
  newCategory = {
    name: '',
    type: 'genre' as CategoryType,
    description: ''
  };

  constructor(
    private categoryService: CategoryService,
    public flow: CreationFlowService,
    private confirm: ConfirmService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    // When opened from a "+ New ..." flow, default the tab to the one requested.
    const type = this.flow.active ? this.flow.current?.context?.categoryType : null;
    if (type) {
      this.setActiveType(type);
    }
  }

  /** Switches the active tab; the add form adds to this type too. */
  setActiveType(type: CategoryType): void {
    this.activeType = type;
    this.newCategory.type = type;
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
      // Always add to the active tab's type.
      this.newCategory.type = this.activeType;
      this.categoryService.createCategory(this.newCategory).subscribe({
        next: (created) => {
          this.toast.success('Category added', `"${created.name}" was created.`);
          this.loadCategories();
          // In a create-flow, auto-select the new category for the return.
          if (this.flow.active) {
            this.flow.select(created.id);
          }
          this.newCategory = {
            name: '',
            type: this.activeType,
            description: ''
          };
        },
        error: (err) => this.toast.error('Could not add category', err?.error?.message ?? err?.message),
      });
    }
  }

  finishFlow(): void {
    this.flow.finish();
  }

  cancelFlow(): void {
    this.flow.abort();
  }

  async deleteCategory(id: string, name: string): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Delete category?',
      message: `"${name}" will be removed. Games tagged with it will lose this category.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.toast.success('Category deleted');
        this.loadCategories();
      },
      error: (err) => this.toast.error('Could not delete', err?.message),
    });
  }
}