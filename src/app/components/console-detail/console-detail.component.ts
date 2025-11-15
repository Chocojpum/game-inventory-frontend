import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';

@Component({
  selector: 'app-console-detail',
  template: `
    <div class="detail-container" *ngIf="console">
      <button class="back-button" (click)="goBack()">← Back</button>
      
      <div class="detail-card">
        <div class="header">
          <div class="image-container">
            <img [src]="console.picture" [alt]="getConsoleName()" />
          </div>
          
          <div class="main-info">
            <h1>{{ getConsoleName() }}</h1>
            <p class="subtitle" *ngIf="family">{{ family.developer }}</p>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Model:</span>
                <span class="value">{{ console.model }}</span>
              </div>
              <div class="info-item">
                <span class="label">Release Date:</span>
                <span class="value">{{ console.releaseDate | date: 'longDate' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Region:</span>
                <span class="value">{{ console.region }}</span>
              </div>
              <div class="info-item">
                <span class="label">Color:</span>
                <span class="value">{{ console.color }}</span>
              </div>
            </div>

            <div class="actions">
              <button class="edit-button" (click)="editConsole()">✏️ Edit</button>
              <button class="delete-button" (click)="deleteConsole()">🗑️ Delete</button>
            </div>
          </div>
        </div>

        <div class="custom-attributes" *ngIf="hasCustomAttributes()">
          <h2>Additional Information</h2>
          <div class="attributes-grid">
            <div class="attribute-item" *ngFor="let attr of getCustomAttributesArray()">
              <span class="attr-label">{{ attr.key }}:</span>
              <span class="attr-value">{{ attr.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="!console">
      <p>Loading...</p>
    </div>
  `,
  styles: [`
    .detail-container { max-width: 1200px; margin: 0 auto; }
    .back-button {
      background: white; border: none; padding: 0.75rem 1.5rem;
      border-radius: 25px; cursor: pointer; font-size: 1rem;
      margin-bottom: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: all 0.3s;
    }
    .back-button:hover { transform: translateX(-5px); }
    .detail-card {
      background: white; border-radius: 20px; overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
    .header {
      display: grid; grid-template-columns: 400px 1fr;
      gap: 2rem; padding: 2rem;
    }
    .image-container {
      width: 100%; height: 300px; background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem; border-radius: 15px;
    }
    .image-container img {
      max-width: 100%; max-height: 100%; object-fit: contain;
    }
    .main-info h1 { margin: 0 0 0.5rem 0; color: #333; font-size: 2.5rem; }
    .subtitle { color: #667eea; font-size: 1.2rem; font-weight: 600; margin: 0 0 1.5rem 0; }
    .info-grid { display: grid; gap: 1rem; margin: 1.5rem 0; }
    .info-item { display: flex; align-items: center; gap: 0.5rem; }
    .label { font-weight: 600; color: #667eea; min-width: 120px; }
    .value { color: #333; font-size: 1.1rem; }
    .actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .edit-button, .delete-button {
      padding: 0.75rem 1.5rem; border: none; border-radius: 25px;
      cursor: pointer; font-size: 1rem; font-weight: 600; transition: all 0.3s;
    }
    .edit-button { background: #667eea; color: white; }
    .edit-button:hover { background: #5568d3; transform: translateY(-2px); }
    .delete-button { background: #ff4757; color: white; }
    .delete-button:hover { background: #ee5a6f; transform: translateY(-2px); }
    .custom-attributes {
      padding: 2rem; background: #f8f9fa; border-top: 1px solid #e0e0e0;
    }
    .custom-attributes h2 { margin: 0 0 1.5rem 0; color: #333; }
    .attributes-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;
    }
    .attribute-item {
      background: white; padding: 1rem; border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .attr-label { display: block; font-weight: 600; color: #667eea; margin-bottom: 0.5rem; }
    .attr-value { color: #333; font-size: 1.05rem; }
    .loading { text-align: center; padding: 4rem; color: white; font-size: 1.5rem; }
    @media (max-width: 768px) {
      .header { grid-template-columns: 1fr; }
    }
  `]
})
export class ConsoleDetailComponent implements OnInit {
  console: Console | null = null;
  family: ConsoleFamily | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consoleService: ConsoleService,
    private familyService: ConsoleFamilyService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.consoleService.getConsole(id).subscribe(console => {
        this.console = console;
        this.loadFamily();
      });
    }
  }

  loadFamily(): void {
    if (this.console) {
      this.familyService.getFamily(this.console.consoleFamilyId).subscribe(
        family => this.family = family,
        error => console.error('Family not found', error)
      );
    }
  }

  getConsoleName(): string {
    return this.family ? `${this.family.name} - ${this.console!.model}` : this.console!.model;
  }

  hasCustomAttributes(): boolean {
    return this.console ? Object.keys(this.console.customAttributes).length > 0 : false;
  }

  getCustomAttributesArray(): Array<{key: string, value: any}> {
    if (!this.console) return [];
    return Object.entries(this.console.customAttributes).map(([key, value]) => ({ key, value }));
  }

  editConsole(): void {
    if (this.console) {
      this.router.navigate(['/edit-console', this.console.id]);
    }
  }

  deleteConsole(): void {
    if (this.console && confirm(`Are you sure you want to delete this console?`)) {
      this.consoleService.deleteConsole(this.console.id).subscribe(() => {
        this.router.navigate(['/consoles']);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/consoles']);
  }
}