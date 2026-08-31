import { Component, OnInit } from '@angular/core';
import { AttributeService, Attribute } from '../../services/attribute.service';
import { CreationFlowService } from '../../services/creation-flow.service';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-attribute-manager',
  templateUrl: `./attribute-manager.component.html`,
  styleUrls: [`./attribute-manager.component.css`]
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

  constructor(
    private attributeService: AttributeService,
    public flow: CreationFlowService,
    private confirm: ConfirmService,
    private toast: ToastService
  ) { }

  finishFlow(): void {
    this.flow.finish();
  }

  cancelFlow(): void {
    this.flow.abort();
  }

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

      this.attributeService.createAttribute(attributeData).subscribe({
        next: () => {
          this.toast.success('Attribute created', `"${attributeData.name}" was added.`);
          this.loadAttributes();
          this.newAttribute = {
            name: '',
            type: 'text',
            options: [],
            isGlobal: true
          };
          this.optionsString = '';
        },
        error: (err) => this.toast.error('Could not create attribute', err?.error?.message ?? err?.message),
      });
    }
  }

  async deleteAttribute(id: string, name: string): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Delete attribute?',
      message: `"${name}" will be removed.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.attributeService.deleteAttribute(id).subscribe({
      next: () => {
        this.toast.success('Attribute deleted');
        this.loadAttributes();
      },
      error: (err) => this.toast.error('Could not delete', err?.message),
    });
  }
}