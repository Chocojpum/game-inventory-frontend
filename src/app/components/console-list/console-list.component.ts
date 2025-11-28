import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
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
  private allConsoles: Console[] = [];
  private selectedFamilyId: string = '';

  constructor(
    private consoleService: ConsoleService,
    private familyService: ConsoleFamilyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadConsoles();
    this.loadFamilies();
  }

  loadConsoles(): void {
    this.consoleService.getAllConsoles().subscribe(consoles => {
      this.consoles = consoles;
      this.allConsoles = consoles;
    });
  }

  loadFamilies(): void {
    this.familyService.getAllFamilies().subscribe(families => {
      this.families = families;
    });
  }

  getConsoleName(console: Console): string {
    const family = this.families.find(f => f.id === console.consoleFamilyId);
    return family ? `${family.name}` : 'Unknown Console';
  }

  onSearch(query: string): void {
    if (query.trim() === '') {
      this.applyFilter();
    } else {
      this.consoleService.searchConsoles(query).subscribe(consoles => {
        this.consoles = this.selectedFamilyId 
          ? consoles.filter(c => c.consoleFamilyId === this.selectedFamilyId)
          : consoles;
      });
    }
  }

  onFamilyFilter(event: any): void {
    this.selectedFamilyId = event.target.value;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedFamilyId) {
      this.consoles = this.allConsoles.filter(c => c.consoleFamilyId === this.selectedFamilyId);
    } else {
      this.consoles = this.allConsoles;
    }
  }

  clearFilters(): void {
    this.selectedFamilyId = '';
    this.consoles = this.allConsoles;
    const select = document.querySelector('.filter-select') as HTMLSelectElement;
    if (select) select.value = '';
  }

  viewConsole(id: string): void {
    this.router.navigate(['/console', id]);
  }
}