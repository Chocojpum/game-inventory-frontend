import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { PaginatedResult, PaginationOptions } from '../shared/pagination.interface';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-console-list',
  templateUrl: `./console-list.component.html`,
  styleUrls: [`./console-list.component.css`],
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
export class ConsoleListComponent implements OnInit {
  consoles: Console[] = [];
  families: ConsoleFamily[] = [];
  currentPage: number = 1;
  limit: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  currentSearchQuery: string = '';
  selectedFamilyId: string = '';

  constructor(
    private consoleService: ConsoleService,
    private familyService: ConsoleFamilyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchConsoles();
    this.loadFamilies();
  }

  fetchConsoles(): void {
    this.consoleService.getFilteredAndPaginatedConsoles(
      { search: this.currentSearchQuery, familyId: this.selectedFamilyId },
      { page: this.currentPage, limit: this.limit }
    ).subscribe((result: PaginatedResult<Console>) => {
      this.consoles = result.data;
      this.currentPage = result.page;
      this.limit = result.limit;
      this.totalItems = result.total;
      this.totalPages = result.totalPages;
    });
  }

  loadFamilies(): void {
    this.familyService.getAllFamilies().subscribe(families => {
      this.families = families;
    });
  }

  getConsoleName(console: Console): string {
    const family = this.families.find(f => f.id === console.consoleFamilyId);
    return family ? family.name : 'Unknown Console';
  }

  onSearch(query: string): void {
    this.currentSearchQuery = query;
    this.currentPage = 1;
    this.fetchConsoles();
  }

  onFamilyFilter(event: any): void {
    this.selectedFamilyId = event.target.value;
    this.currentPage = 1;
    this.fetchConsoles();
  }

  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchConsoles();
    }
  }

  onLimitChange(): void {
    this.currentPage = 1;
    this.fetchConsoles();
  }

  clearFilters(): void {
    // selectedFamilyId is bound via ngModel, so resetting it clears the select.
    this.selectedFamilyId = '';
    this.currentSearchQuery = '';
    this.currentPage = 1;
    this.fetchConsoles();
  }

  viewConsole(id: string): void {
    this.router.navigate(['/console', id]);
  }
}
