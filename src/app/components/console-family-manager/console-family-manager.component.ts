import { Component, OnInit } from '@angular/core';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';

@Component({
  selector: 'app-console-family-manager',
  template: `
    <div class="manager-container">
      <h2>Console Family Manager</h2>
      
      <div class="info-box">
        <p><strong>Console Families</strong> represent console platforms (e.g., PlayStation 5, Nintendo Switch).</p>
        <p>Create families here, then add your specific owned console instances in the Consoles section.</p>
      </div>

      <div class="add-form">
        <h3>Add New Console Family</h3>
        <div class="form-inline">
          <input 
            type="text" 
            [(ngModel)]="newFamily.name" 
            placeholder="Console name (e.g., PlayStation 5)"
          />
          <input 
            type="text" 
            [(ngModel)]="newFamily.developer" 
            placeholder="Developer (e.g., Sony)"
          />
          <input 
            type="text" 
            [(ngModel)]="newFamily.generation" 
            placeholder="Generation (optional)"
          />
          <button (click)="addFamily()" [disabled]="!newFamily.name || !newFamily.developer">
            Add Family
          </button>
        </div>
      </div>

      <div class="families-display">
        <h3>Console Families</h3>
        <div class="families-list">
          <div 
            class="family-item" 
            *ngFor="let family of families"
          >
            <div class="family-content">
              <strong>{{ family.name }}</strong>
              <p class="developer">{{ family.developer }}</p>
              <p class="generation" *ngIf="family.generation">Generation: {{ family.generation }}</p>
              <span class="date">Created: {{ family.createdAt | date }}</span>
            </div>
            <button class="delete-btn" (click)="deleteFamily(family.id, family.name)">
              🗑️
            </button>
          </div>
          <p class="empty-message" *ngIf="families.length === 0">
            No console families yet
          </p>
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
      margin: 0 0 1.5rem 0;
      color: #333;
      font-size: 2rem;
    }
    h3 {
      color: #667eea;
      margin: 0 0 1rem 0;
    }
    .info-box {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      padding: 1rem 1.5rem;
      border-radius: 10px;
      margin-bottom: 2rem;
      border-left: 4px solid #2196f3;
    }
    .info-box p {
      margin: 0.5rem 0;
      color: #1565c0;
    }
    .add-form {
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
    .form-inline input {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      flex: 1;
      min-width: 150px;
    }
    .form-inline input:focus {
      outline: none;
      border-color: #667eea;
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
    .families-display {
      margin-top: 2rem;
    }
    .families-list {
      display: grid;
      gap: 1rem;
    }
    .family-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 10px;
      border-left: 4px solid #667eea;
      transition: all 0.3s;
    }
    .family-item:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .family-content {
      flex: 1;
    }
    .family-content strong {
      display: block;
      color: #333;
      font-size: 1.2rem;
      margin-bottom: 0.25rem;
    }
    .developer {
      color: #667eea;
      font-weight: 600;
      margin: 0.25rem 0;
    }
    .generation {
      color: #666;
      margin: 0.25rem 0;
      font-size: 0.9rem;
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
export class ConsoleFamilyManagerComponent implements OnInit {
  families: ConsoleFamily[] = [];
  newFamily = {
    name: '',
    developer: '',
    generation: ''
  };

  constructor(private familyService: ConsoleFamilyService) { }

  ngOnInit(): void {
    this.loadFamilies();
  }

  loadFamilies(): void {
    this.familyService.getAllFamilies().subscribe(families => {
      this.families = families;
    });
  }

  addFamily(): void {
    if (this.newFamily.name && this.newFamily.developer) {
      this.familyService.createFamily(this.newFamily).subscribe(() => {
        this.loadFamilies();
        this.newFamily = {
          name: '',
          developer: '',
          generation: ''
        };
      });
    }
  }

  deleteFamily(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete the console family "${name}"?`)) {
      this.familyService.deleteFamily(id).subscribe(() => {
        this.loadFamilies();
      });
    }
  }
}