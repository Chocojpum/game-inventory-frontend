import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AddonService, Addon } from '../../services/addon.service';

@Component({
  selector: 'app-addon-manager',
  templateUrl: `./addon-manager.component.html`,
  styleUrls: [`./addon-manager.component.css`]
})
export class AddonManagerComponent implements OnInit {
  @Input() gameId!: string;
  @Input() addon?: Addon; // present => edit mode
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  addonForm: FormGroup;
  isEditMode = false;
  newAttributeName = '';
  newAttributeValue = '';
  customAttributesObj: Record<string, any> = {};
  customAttributesArray: Array<{ key: string; value: any }> = [];

  constructor(private fb: FormBuilder, private addonService: AddonService) {
    this.addonForm = this.fb.group({
      title: ['', Validators.required],
      alternateTitles: this.fb.array([]),
      coverArt: ['', Validators.required],
      releaseDate: ['', Validators.required],
    });
  }

  get alternateTitles(): FormArray {
    return this.addonForm.get('alternateTitles') as FormArray;
  }

  ngOnInit(): void {
    if (this.addon) {
      this.isEditMode = true;
      this.addonForm.patchValue({
        title: this.addon.title,
        coverArt: this.addon.coverArt,
        releaseDate: this.addon.releaseDate ? this.addon.releaseDate.split('T')[0] : '',
      });
      (this.addon.alternateTitles || []).forEach(t =>
        this.alternateTitles.push(this.fb.control(t)),
      );
      this.customAttributesObj = { ...(this.addon.customAttributes || {}) };
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
    if (!this.addonForm.valid) return;

    const payload: Partial<Addon> = {
      gameId: this.gameId,
      ...this.addonForm.value,
      customAttributes: this.customAttributesObj,
    };

    if (this.isEditMode && this.addon) {
      this.addonService.updateAddon(this.addon.id, payload).subscribe(() => {
        this.saved.emit();
        this.close.emit();
      });
    } else {
      this.addonService.createAddon(payload).subscribe(() => {
        this.saved.emit();
        this.close.emit();
      });
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
