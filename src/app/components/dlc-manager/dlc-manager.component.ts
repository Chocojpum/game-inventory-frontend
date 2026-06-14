import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DlcService, Dlc } from '../../services/dlc.service';

@Component({
  selector: 'app-dlc-manager',
  templateUrl: `./dlc-manager.component.html`,
  styleUrls: [`./dlc-manager.component.css`]
})
export class DlcManagerComponent implements OnInit {
  @Input() gameId!: string;
  @Input() dlc?: Dlc; // present => edit mode
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  dlcForm: FormGroup;
  isEditMode = false;
  newAttributeName = '';
  newAttributeValue = '';
  customAttributesObj: Record<string, any> = {};
  customAttributesArray: Array<{ key: string; value: any }> = [];

  constructor(private fb: FormBuilder, private dlcService: DlcService) {
    this.dlcForm = this.fb.group({
      title: ['', Validators.required],
      alternateTitles: this.fb.array([]),
      coverArt: ['', Validators.required],
      releaseDate: ['', Validators.required],
    });
  }

  get alternateTitles(): FormArray {
    return this.dlcForm.get('alternateTitles') as FormArray;
  }

  ngOnInit(): void {
    if (this.dlc) {
      this.isEditMode = true;
      this.dlcForm.patchValue({
        title: this.dlc.title,
        coverArt: this.dlc.coverArt,
        releaseDate: this.dlc.releaseDate ? this.dlc.releaseDate.split('T')[0] : '',
      });
      (this.dlc.alternateTitles || []).forEach(t =>
        this.alternateTitles.push(this.fb.control(t)),
      );
      this.customAttributesObj = { ...(this.dlc.customAttributes || {}) };
      this.updateCustomAttributesArray();
    }
  }

  addAlternateTitle(): void {
    this.alternateTitles.push(this.fb.control(''));
  }

  removeAlternateTitle(index: number): void {
    this.alternateTitles.removeAt(index);
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
      value,
    }));
  }

  onSubmit(): void {
    if (!this.dlcForm.valid) return;

    const payload: Partial<Dlc> = {
      gameId: this.gameId,
      ...this.dlcForm.value,
      customAttributes: this.customAttributesObj,
    };

    if (this.isEditMode && this.dlc) {
      this.dlcService.updateDlc(this.dlc.id, payload).subscribe(() => {
        this.saved.emit();
        this.close.emit();
      });
    } else {
      this.dlcService.createDlc(payload).subscribe(() => {
        this.saved.emit();
        this.close.emit();
      });
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
