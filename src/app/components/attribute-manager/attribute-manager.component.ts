import { Component, OnInit } from '@angular/core';
import { AttributeService, Attribute } from '../../services/attribute.service';

@Component({
  selector: 'app-attribute-manager',
  template: `
    <div class="manager-container">
      <h2>Attribute Manager</h2>
      
      <div class="info-box">
        <p><strong>Global Attributes</strong> will be available for all games when adding/editing.</p>
        <p><strong>Non-global Attributes</strong> are just saved as templates for reference.</p>
      </div>

      <div class="add-attribute-form">
        <h3>Create New Attribute</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Attribute Name</label>
            <input 
              type="text" 
              [(ngModel)]="newAttribute.name" 
              placeholder="e.g., Developer, Completion Time"
            />
          </div>

          <div class="form-group">
            <label>Data Type</label>
            <select [(ngModel)]="newAttribute.type" (change)="onTypeChange()">
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="boolean">Yes/No</option>
              <option value="select">Dropdown</option>
            </select>
          </div>

          <div class="form-group full-width" *ngIf="newAttribute.type === 'select'">
            <label>Options (comma-separated)</label>
            <input 
              type="text" 
              [(ngModel)]="optionsString" 
              placeholder="e.g., Single Player, Multiplayer, Co-op"
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [(ngModel)]="newAttribute.isGlobal"
              />
              Make this a global attribute (available for all games)
            </label>
          </div>
        </div>

        <button 
          (click)="addAttribute()" 
          [disabled]="!newAttribute.name"
          class="submit-btn"
        >
          Create Attribute
        </button>
      </div>

      <div class="attributes-display">
        <div class="attribute-section">
          <h3>🌐 Global Attributes</h3>
          <div class="attribute-list">
            <div 
              class="attribute-item" 
              *ngFor="let attr of getGlobalAttributes()"
            >
              <div class="attribute-info">
                <strong>{{ attr.name }}</strong>
                <span class="type-badge">{{ attr.type }}</span>
                <span class="options" *ngIf="attr.options && attr.options.length > 0">
                  Options: {{ attr.options.join(', ') }}
                </span>
              </div>
              <button class="delete-btn" (click)="deleteAttribute(attr.id, attr.name)">
                🗑️
              </button>
            </div>
            <p class="empty-message" *ngIf="getGlobalAttributes().length === 0">
              No global attributes yet
            </p>
          </div>
        </div>

        <div class="attribute-section">
          <h3>📝 Template Attributes</h3>
          <div class="attribute-list">
            <div 
              class="attribute-item" 
              *ngFor="let attr of getNonGlobalAttributes()"
            >
              <div class="attribute-info">
                <strong>{{ attr.name }}</strong>
                <span class="type-badge">{{ attr.type }}</span>
                <span class="options" *ngIf="attr.options && attr.options.length > 0">
                  Options: {{ attr.options.join(', ') }}
                </span>
              </div>
              <button class="delete-btn" (click)="deleteAttribute(attr.id, attr.name)">
                🗑️
              </button>
            </div>
            <p class="empty-message" *ngIf="getNonGlobalAttributes().length === 0">
              No template attributes yet
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
    .add-attribute-form {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 15px;
      margin-bottom: 2rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .form-group.full-width {
      grid-column: 1 / -1;
    }
    label {
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 600;
      font-size: 0.95rem;
    }
    input[type="text"],
    select {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: normal;
    }
    .checkbox-label input[type="checkbox"] {
      width: auto;
      cursor: pointer;
      margin: 0;
    }
    .submit-btn {
      width: 100%;
      padding: 1rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .submit-btn:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .attributes-display {
      display: grid;
      gap: 2rem;
    }
    .attribute-section h3 {
      font-size: 1.3rem;
    }
    .attribute-list {
      display: grid;
      gap: 0.75rem;
    }
    .attribute-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 10px;
      border-left: 4px solid #667eea;
      transition: all 0.3s;
    }
    .attribute-item:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .attribute-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .attribute-info strong {
      color: #333;
      font-size: 1.1rem;
    }
    .type-badge {
      background: #667eea;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .options {
      color: #666;
      font-size: 0.9rem;
      font-style: italic;
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
export class AttributeManagerComponent implements OnInit {
  attributes: Attribute[] = [];
  newAttribute = {
    name: '',
    type: 'text' as 'text' | 'number' | 'date' | 'boolean' | 'select',
    options: [] as string[],
    isGlobal: true
  };
  optionsString = '';

  constructor(private attributeService: AttributeService) { }

  ngOnInit(): void {
    this.loadAttributes();
  }

  loadAttributes(): void {
    this.attributeService.getAllAttributes().subscribe(attributes => {
      this.attributes = attributes;
    });
  }

  getGlobalAttributes(): Attribute[] {
    return this.attributes.filter(attr => attr.isGlobal);
  }

  getNonGlobalAttributes(): Attribute[] {
    return this.attributes.filter(attr => !attr.isGlobal);
  }

  onTypeChange(): void {
    if (this.newAttribute.type !== 'select') {
      this.optionsString = '';
      this.newAttribute.options = [];
    }
  }

  addAttribute(): void {
    if (this.newAttribute.name) {
      const attributeData = { ...this.newAttribute };
      
      if (this.newAttribute.type === 'select' && this.optionsString) {
        attributeData.options = this.optionsString
          .split(',')
          .map(opt => opt.trim())
          .filter(opt => opt.length > 0);
      }

      this.attributeService.createAttribute(attributeData).subscribe(() => {
        this.loadAttributes();
        this.newAttribute = {
          name: '',
          type: 'text',
          options: [],
          isGlobal: true
        };
        this.optionsString = '';
      });
    }
  }

  deleteAttribute(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete the attribute "${name}"?`)) {
      this.attributeService.deleteAttribute(id).subscribe(() => {
        this.loadAttributes();
      });
    }
  }
}