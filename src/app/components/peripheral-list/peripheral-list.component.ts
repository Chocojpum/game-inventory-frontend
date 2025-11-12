import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PeripheralService, Peripheral } from '../../services/peripheral.service';
import { ConsoleService, Console } from '../../services/console.service';

@Component({
  selector: 'app-peripheral-list',
  template: `
    <div class="peripheral-list-container">
      <div class="header-actions">
        <h2>🕹️ Peripheral Inventory</h2>
        <button class="add-btn" routerLink="/add-peripheral">+ Add Peripheral</button>
      </div>
      
      <app-search-bar (searchQuery)="onSearch($event)"></app-search-bar>

      <div class="peripherals-grid" *ngIf="peripherals.length > 0">
        <div 
          class="peripheral-card" 
          *ngFor="let peripheral of peripherals"
          (click)="editPeripheral(peripheral.id)"
        >
          <div class="peripheral-icon">🕹️</div>
          <div class="peripheral-info">
            <h3>{{ peripheral.name }}</h3>
            <p class="console-name">{{ getConsoleName(peripheral.consoleId) }}</p>
            <p class="quantity">Quantity: {{ peripheral.quantity }}</p>
            <p class="color">Color: {{ peripheral.color }}</p>
          </div>
          <button class="delete-btn" (click)="deletePeripheral($event, peripheral.id)">🗑️</button>
        </div>
      </div>

      <div class="no-peripherals" *ngIf="peripherals.length === 0">
        <p>No peripherals in inventory. Add your first peripheral!</p>
      </div>
    </div>
  `,
  styles: [`
    .peripheral-list-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem 2rem;
      border-radius: 15px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h2 {
      margin: 0;
      color: #333;
      font-size: 2rem;
    }
    .add-btn {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .add-btn:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }
    .peripherals-grid {
      display: grid;
      gap: 1rem;
    }
    .peripheral-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
    }
    .peripheral-card:hover {
      transform: translateX(10px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
    }
    .peripheral-icon {
      font-size: 3rem;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
    }
    .peripheral-info {
      flex: 1;
    }
    .peripheral-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.3rem;
    }
    .console-name {
      color: #667eea;
      font-weight: 600;
      margin: 0.25rem 0;
    }
    .quantity, .color {
      color: #666;
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }
    .delete-btn {
      padding: 0.5rem 1rem;
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.3s;
    }
    .delete-btn:hover {
      background: #ee5a6f;
      transform: scale(1.1);
    }
    .no-peripherals {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 15px;
      color: #999;
      font-size: 1.2rem;
    }
  `]
})
export class PeripheralListComponent implements OnInit {
  peripherals: Peripheral[] = [];
  consoles: Console[] = [];
  private allPeripherals: Peripheral[] = [];

  constructor(
    private peripheralService: PeripheralService,
    private consoleService: ConsoleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPeripherals();
    this.loadConsoles();
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

  getConsoleName(consoleId: string): string {
    const console = this.consoles.find(c => c.id === consoleId);
    return console ? console.name : 'Unknown Console';
  }

  onSearch(query: string): void {
    if (query.trim() === '') {
      this.peripherals = this.allPeripherals;
    } else {
      this.peripheralService.searchPeripherals(query).subscribe(peripherals => {
        this.peripherals = peripherals;
      });
    }
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