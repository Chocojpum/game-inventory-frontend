import { Component, OnInit } from '@angular/core';
import { AttributeService, Attribute } from '../../services/attribute.service';

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