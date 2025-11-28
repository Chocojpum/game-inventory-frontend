import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PeripheralService, Peripheral } from '../../services/peripheral.service';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
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
  consoles: Console[] = [];
  families: ConsoleFamily[] = [];
  private allPeripherals: Peripheral[] = [];
  private selectedFamilyId: string = '';

  constructor(
    private peripheralService: PeripheralService,
    private consoleService: ConsoleService,
    private familyService: ConsoleFamilyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPeripherals();
    this.loadConsoles();
    this.loadFamilies();
  }

  loadPeripherals(): void {
    this.peripheralService.getAllPeripherals().subscribe(peripherals => {
      this.peripherals = peripherals;
      this.allPeripherals = peripherals;
    });
  }

  loadConsoles(): void {
    this.consoleService.getAllConsoles().subscribe(consoles => {
      this.consoles = consoles;
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
    if (query.trim() === '') {
      this.applyFilter();
    } else {
      this.peripheralService.searchPeripherals(query).subscribe(peripherals => {
        this.peripherals = this.filterByFamily(peripherals);
      });
    }
  }

  onFamilyFilter(event: any): void {
    this.selectedFamilyId = event.target.value;
    this.applyFilter();
  }

  applyFilter(): void {
    this.peripherals = this.filterByFamily(this.allPeripherals);
  }

  filterByFamily(peripherals: Peripheral[]): Peripheral[] {
    if (!this.selectedFamilyId) return peripherals;
    
    return peripherals.filter(p => p.consoleFamilyId === this.selectedFamilyId);
  }

  clearFilters(): void {
    this.selectedFamilyId = '';
    this.peripherals = this.allPeripherals;
    const select = document.querySelector('.filter-select') as HTMLSelectElement;
    if (select) select.value = '';
  }

  editPeripheral(id: string): void {
    this.router.navigate(['/edit-peripheral', id]);
  }

  deletePeripheral(event: Event, id: string): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this peripheral?')) {
      this.peripheralService.deletePeripheral(id).subscribe(() => {
        this.loadPeripherals();
      });
    }
  }
}