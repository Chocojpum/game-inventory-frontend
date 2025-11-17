import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PeripheralService, Peripheral } from '../../services/peripheral.service';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';

@Component({
  selector: 'app-peripheral-form',
  template: `
    <div class="form-container">
      <h2>{{ isEditMode ? 'Edit Peripheral' : 'Add New Peripheral' }}</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="item-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          
          <div class="form-group">
            <label>Name *</label>
            <input type="text" formControlName="name" placeholder="e.g., DualSense Controller" />
          </div>

          <div class="form-group">
            <label>Console Family *</label>
            <select formControlName="consoleFamilyId">
              <option value="">Select Console Family</option>
              <option *ngFor="let family of families" [value]="family.id">
                {{ family.name }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Quantity *</label>
              <input type="number" formControlName="quantity" min="1" />
            </div>

            <div class="form-group">
              <label>Color *</label>
              <input type="text" formControlName="color" placeholder="e.g., Black, White" />
            </div>
          </div>

          <div class="form-group">
            <label>Picture URL *</label>
            <input type="url" formControlName="picture" placeholder="https://example.com/peripheral.jpg" />
            <div class="picture-preview" *ngIf="form.get('picture')?.value">
              <img [src]="form.get('picture')?.value" alt="Image preview" />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn" [disabled]="!form.valid">
            {{ isEditMode ? 'Update Peripheral' : 'Add Peripheral' }}
          </button>
          <button type="button" class="cancel-btn" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 900px; margin: 0 auto; background: white;
      padding: 2rem; border-radius: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
    h2 { margin: 0 0 2rem 0; color: #333; font-size: 2rem; }
    .form-section {
      margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 2px solid #f0f0f0;
    }
    h3 { color: #667eea; margin: 0 0 1.5rem 0; }
    .form-group { margin-bottom: 1.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    label { display: block; margin-bottom: 0.5rem; color: #333; font-weight: 600; }
    input, select {
      width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0;
      border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;
    }
    input:focus, select:focus { outline: none; border-color: #667eea; }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .submit-btn, .cancel-btn {
      padding: 1rem 2rem; border: none; border-radius: 25px;
      font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;
    }
    .submit-btn { background: #667eea; color: white; flex: 1; }
    .submit-btn:hover:not(:disabled) {
      background: #5568d3; transform: translateY(-2px);
    }
    .submit-btn:disabled { background: #ccc; cursor: not-allowed; }
    .cancel-btn { background: #e0e0e0; color: #333; }
    .cancel-btn:hover { background: #d0d0d0; }
    .picture-preview {
      margin-top: 1rem; max-width: 500px; border-radius: 5px;
      overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .picture-preview img { display: block; width: 100%; height: auto; }
    .array-item { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .array-item input { flex: 1; }
    .add-btn, .remove-btn {
      padding: 0.5rem 1rem; border: none; border-radius: 5px;
      cursor: pointer; font-weight: 600; transition: all 0.3s;
    }
  `]
})
export class PeripheralFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  peripheralId: string | null = null;
  families: ConsoleFamily[] = [];

  constructor(
    private fb: FormBuilder,
    private peripheralService: PeripheralService,
    private familyService: ConsoleFamilyService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      consoleFamilyId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      color: ['', Validators.required],
      picture: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadFamilies();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.peripheralId = id;
      this.loadPeripheral(id);
    }
  }

  loadFamilies(): void {
    this.familyService.getAllFamilies().subscribe(families => {
      this.families = families;
    });
  }

  loadPeripheral(id: string): void {
    this.peripheralService.getPeripheral(id).subscribe(peripheral => {
      this.form.patchValue(peripheral);
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const data = { ...this.form.value, customAttributes: {} };

      if (this.isEditMode && this.peripheralId) {
        this.peripheralService.updatePeripheral(this.peripheralId, data).subscribe(() => {
          this.router.navigate(['/peripherals']);
        });
      } else {
        this.peripheralService.createPeripheral(data).subscribe(() => {
          this.router.navigate(['/peripherals']);
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/peripherals']);
  }
}