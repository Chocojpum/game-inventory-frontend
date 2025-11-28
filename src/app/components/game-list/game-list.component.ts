import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { CategoryService, Category } from '../../services/category.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-game-list',
  templateUrl: `./game-list.component.html`,
  styleUrls: [`./game-list.component.css`],
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
  dateRangeText: string = '';
  showDatePicker: boolean = false;
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

  updateDateRangeText(): void {
    if (this.dateFrom && this.dateTo) {
      this.dateRangeText = `${this.dateFrom} to ${this.dateTo}`;
    } else if (this.dateFrom) {
      this.dateRangeText = `From ${this.dateFrom}`;
    } else if (this.dateTo) {
      this.dateRangeText = `Until ${this.dateTo}`;
    } else {
      this.dateRangeText = '';
    }
  }

  applyDateRange(): void {
    this.updateDateRangeText();
    this.showDatePicker = false;
    this.applyFiltersAndSort();
  }

  clearDateRange(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.dateRangeText = '';
    this.showDatePicker = false;
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
    this.dateRangeText = '';
    this.applyFiltersAndSort();
    const selects = document.querySelectorAll('.filter-select') as NodeListOf<HTMLSelectElement>;
    selects.forEach(select => select.value = '');
  }

  viewGame(id: string): void {
    this.router.navigate(['/game', id]);
  }
}