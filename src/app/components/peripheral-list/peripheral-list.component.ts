import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PeripheralService, Peripheral } from '../../services/peripheral.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { PaginatedResult, PaginationOptions } from '../shared/pagination.interface';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-peripheral-list',
  templateUrl: `./peripheral-list.component.html`,
  styleUrls: [`./peripheral-list.component.css`],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class PeripheralListComponent implements OnInit {
  peripherals: Peripheral[] = [];
  families: ConsoleFamily[] = [];
  currentPage: number = 1;
  limit: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  currentSearchQuery: string = '';
  selectedFamilyId: string = '';

  constructor(
    private peripheralService: PeripheralService,
    private familyService: ConsoleFamilyService,
    private router: Router,
    private confirm: ConfirmService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.fetchPeripherals();
    this.loadFamilies();
  }

  fetchPeripherals(): void {
    this.peripheralService.getFilteredAndPaginatedPeripherals(
      { search: this.currentSearchQuery, consoleFamilyId: this.selectedFamilyId },
      { page: this.currentPage, limit: this.limit }
    ).subscribe((result: PaginatedResult<Peripheral>) => {
      this.peripherals = result.data;
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

  getConsoleName(familyId: string): string {
    const family = this.families.find(f => f.id === familyId);
    return family ? family.name : 'Unknown Console';
  }

  onSearch(query: string): void {
    this.currentSearchQuery = query;
    this.currentPage = 1;
    this.fetchPeripherals();
  }

  onFamilyFilter(event: any): void {
    this.selectedFamilyId = event.target.value;
    this.currentPage = 1;
    this.fetchPeripherals();
  }

  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchPeripherals();
    }
  }

  onLimitChange(): void {
    this.currentPage = 1;
    this.fetchPeripherals();
  }

  clearFilters(): void {
    // selectedFamilyId is bound via ngModel, so resetting it clears the select.
    this.selectedFamilyId = '';
    this.currentSearchQuery = '';
    this.currentPage = 1;
    this.fetchPeripherals();
  }

  editPeripheral(id: string): void {
    this.router.navigate(['/edit-peripheral', id]);
  }

  async deletePeripheral(event: Event, id: string): Promise<void> {
    event.stopPropagation();
    const confirmed = await this.confirm.ask({
      title: 'Delete peripheral?',
      message: 'This will permanently remove the peripheral from your inventory.',
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.peripheralService.deletePeripheral(id).subscribe({
      next: () => {
        this.toast.success('Peripheral deleted');
        this.fetchPeripherals();
      },
      error: (err) => this.toast.error('Could not delete', err?.message),
    });
  }
}
