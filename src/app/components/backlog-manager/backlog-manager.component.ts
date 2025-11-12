import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BacklogService, Backlog } from '../../services/backlog.service';
import { CompletionTypeService, CompletionType } from '../../services/completion-type.service';

@Component({
  selector: 'app-backlog-manager',
  template: `
    <div class="backlog-overlay" (click)="closeModal()">
      <div class="backlog-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>🎯 Backlog: {{ gameTitle }}</h2>
          <button class="close-btn" (click)="closeModal()">✕</button>
        </div>

        <div class="add-backlog-form">
          <h3>Add Completion Entry</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Completion Date *</label>
              <input type="date" [(ngModel)]="newBacklog.completionDate" />
            </div>

            <div class="form-group">
              <label>Ending Type</label>
              <input type="text" [(ngModel)]="newBacklog.endingType" placeholder="e.g., True Ending, Bad Ending" />
            </div>

            <div class="form-group">
              <label>Completion Type *</label>
              <select [(ngModel)]="newBacklog.completionType">
                <option value="">Select...</option>
                <option *ngFor="let ct of completionTypes" [value]="ct.name">{{ ct.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Add New Completion Type</label>
              <div class="inline-add">
                <input type="text" [(ngModel)]="newCompletionTypeName" placeholder="New type" />
                <button (click)="addCompletionType()" [disabled]="!newCompletionTypeName">+</button>
              </div>
            </div>
          </div>

          <div class="custom-attribute-section">
            <h4>Custom Attributes</h4>
            <div class="inline-form">
              <input 
                type="text" 
                [(ngModel)]="newAttributeName" 
                placeholder="Attribute name"
              />
              <input 
                type="text" 
                [(ngModel)]="newAttributeValue" 
                placeholder="Value"
              />
              <button (click)="addCustomAttribute()">Add</button>
            </div>
            <div class="current-attributes" *ngIf="customAttributesArray.length > 0">
              <div *ngFor="let attr of customAttributesArray" class="attr-tag">
                <strong>{{ attr.key }}:</strong> {{ attr.value }}
                <button (click)="removeCustomAttribute(attr.key)">✕</button>
              </div>
            </div>
          </div>

          <button 
            class="submit-btn" 
            (click)="addBacklogEntry()"
            [disabled]="!newBacklog.completionDate || !newBacklog.completionType"
          >
            Add Entry
          </button>
        </div>

        <div class="backlog-list">
          <h3>Completion History</h3>
          <div *ngIf="backlogs.length === 0" class="empty-message">
            No completions recorded yet.
          </div>
          <div *ngFor="let backlog of backlogs" class="backlog-item">
            <div class="backlog-content">
              <div class="backlog-main">
                <strong>{{ backlog.completionDate | date: 'mediumDate' }}</strong>
                <span class="completion-type-badge">{{ backlog.completionType }}</span>
              </div>
              <div class="backlog-details" *ngIf="backlog.endingType">
                <span class="label">Ending:</span> {{ backlog.endingType }}
              </div>
              <div class="backlog-attributes" *ngIf="hasAttributes(backlog)">
                <div *ngFor="let attr of getAttributesArray(backlog)" class="attr-display">
                  <span class="attr-label">{{ attr.key }}:</span> {{ attr.value }}
                </div>
              </div>
            </div>
            <button class="delete-btn" (click)="deleteBacklog(backlog.id)">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backlog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 2rem;
    }
    .backlog-modal {
      background: white;
      border-radius: 20px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 2px solid #f0f0f0;
      position: sticky;
      top: 0;
      background: white;
      z-index: 10;
    }
    .modal-header h2 {
      margin: 0;
      color: #333;
    }
    .close-btn {
      background: #ff4757;
      color: white;
      border: none;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .close-btn:hover {
      background: #ee5a6f;
      transform: rotate(90deg);
    }
    .add-backlog-form {
      padding: 2rem;
      background: #f8f9fa;
      border-bottom: 2px solid #e0e0e0;
    }
    h3 {
      margin: 0 0 1.5rem 0;
      color: #667eea;
    }
    h4 {
      margin: 1.5rem 0 1rem 0;
      color: #555;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    label {
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 600;
      font-size: 0.9rem;
    }
    input, select {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }
    .inline-add, .inline-form {
      display: flex;
      gap: 0.5rem;
    }
    .inline-add input, .inline-form input {
      flex: 1;
    }
    .inline-add button, .inline-form button {
      padding: 0.75rem 1rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    .inline-add button:hover, .inline-form button:hover {
      background: #5568d3;
    }
    .inline-add button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .current-attributes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    .attr-tag {
      background: white;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 2px solid #667eea;
    }
    .attr-tag button {
      background: #ff4757;
      color: white;
      border: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.8rem;
    }
    .submit-btn {
      width: 100%;
      padding: 1rem;
      background: #2ecc71;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 1rem;
    }
    .submit-btn:hover:not(:disabled) {
      background: #27ae60;
      transform: translateY(-2px);
    }
    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .backlog-list {
      padding: 2rem;
    }
    .empty-message {
      text-align: center;
      color: #999;
      padding: 2rem;
      font-style: italic;
    }
    .backlog-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 10px;
      margin-bottom: 1rem;
      border-left: 4px solid #2ecc71;
    }
    .backlog-content {
      flex: 1;
    }
    .backlog-main {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }
    .backlog-main strong {
      color: #333;
      font-size: 1.1rem;
    }
    .completion-type-badge {
      background: #2ecc71;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .backlog-details {
      color: #666;
      margin-bottom: 0.5rem;
    }
    .label {
      font-weight: 600;
      color: #667eea;
    }
    .backlog-attributes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 0.75rem;
    }
    .attr-display {
      background: white;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .attr-label {
      font-weight: 600;
      color: #667eea;
    }
    .delete-btn {
      padding: 0.5rem 1rem;
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1.2rem;
    }
    .delete-btn:hover {
      background: #ee5a6f;
    }
  `]
})
export class BacklogManagerComponent implements OnInit {
  @Input() gameId!: string;
  @Input() gameTitle!: string;
  @Output() close = new EventEmitter<void>();

  backlogs: Backlog[] = [];
  completionTypes: CompletionType[] = [];
  newBacklog = {
    completionDate: '',
    endingType: '',
    completionType: ''
  };
  newCompletionTypeName = '';
  newAttributeName = '';
  newAttributeValue = '';
  customAttributesObj: Record<string, any> = {};
  customAttributesArray: Array<{key: string, value: any}> = [];

  constructor(
    private backlogService: BacklogService,
    private completionTypeService: CompletionTypeService
  ) {}

  ngOnInit(): void {
    this.loadBacklogs();
    this.loadCompletionTypes();
  }

  loadBacklogs(): void {
    this.backlogService.getBacklogsByGame(this.gameId).subscribe(backlogs => {
      this.backlogs = backlogs.sort((a, b) => 
        new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()
      );
    });
  }

  loadCompletionTypes(): void {
    this.completionTypeService.getAllCompletionTypes().subscribe(types => {
      this.completionTypes = types;
    });
  }

  addCompletionType(): void {
    if (this.newCompletionTypeName.trim()) {
      this.completionTypeService.createCompletionType({
        name: this.newCompletionTypeName
      }).subscribe(() => {
        this.loadCompletionTypes();
        this.newCompletionTypeName = '';
      });
    }
  }

  addCustomAttribute(): void {
    if (this.newAttributeName && this.newAttributeValue) {
      this.customAttributesObj[this.newAttributeName] = this.newAttributeValue;
      this.updateCustomAttributesArray();
      this.newAttributeName = '';
      this.newAttributeValue = '';
    }
  }

  removeCustomAttribute(key: string): void {
    delete this.customAttributesObj[key];
    this.updateCustomAttributesArray();
  }

  updateCustomAttributesArray(): void {
    this.customAttributesArray = Object.entries(this.customAttributesObj).map(([key, value]) => ({
      key,
      value
    }));
  }

  addBacklogEntry(): void {
    if (this.newBacklog.completionDate && this.newBacklog.completionType) {
      this.backlogService.createBacklog({
        gameId: this.gameId,
        completionDate: this.newBacklog.completionDate,
        endingType: this.newBacklog.endingType,
        completionType: this.newBacklog.completionType,
        customAttributes: this.customAttributesObj
      }).subscribe(() => {
        this.loadBacklogs();
        this.newBacklog = {
          completionDate: '',
          endingType: '',
          completionType: ''
        };
        this.customAttributesObj = {};
        this.customAttributesArray = [];
      });
    }
  }

  deleteBacklog(id: string): void {
    if (confirm('Are you sure you want to delete this completion entry?')) {
      this.backlogService.deleteBacklog(id).subscribe(() => {
        this.loadBacklogs();
      });
    }
  }

  hasAttributes(backlog: Backlog): boolean {
    return Object.keys(backlog.customAttributes).length > 0;
  }

  getAttributesArray(backlog: Backlog): Array<{key: string, value: any}> {
    return Object.entries(backlog.customAttributes).map(([key, value]) => ({
      key,
      value
    }));
  }

  closeModal(): void {
    this.close.emit();
  }
}