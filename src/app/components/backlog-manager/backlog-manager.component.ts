import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { BacklogService, Backlog } from '../../services/backlog.service';
import { CompletionTypeService, CompletionType } from '../../services/completion-type.service';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-backlog-manager',
  templateUrl: `./backlog-manager.component.html`,
  styleUrls: [`./backlog-manager.component.css`]
})
export class BacklogManagerComponent implements OnInit {
  @Input() gameId!: string;
  @Input() gameTitle!: string;
  @Input() addonId?: string;
  @Output() close = new EventEmitter<void>();

  backlogs: Backlog[] = [];
  completionTypes: CompletionType[] = [];
  newBacklog = {
    completionDate: '',
    endingType: '',
    completionType: ''
  };
  unknownDate = false;
  newCompletionTypeName = '';
  newAttributeName = '';
  newAttributeValue = '';
  customAttributesObj: Record<string, any> = {};
  customAttributesArray: Array<{key: string, value: any}> = [];

  constructor(
    private backlogService: BacklogService,
    private completionTypeService: CompletionTypeService,
    private confirm: ConfirmService,
    private toast: ToastService
  ) {}

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal();
  }

  ngOnInit(): void {
    this.loadBacklogs();
    this.loadCompletionTypes();
  }

  loadBacklogs(): void {
    this.backlogService.getBacklogsByGame(this.gameId).subscribe(backlogs => {
      this.backlogs = backlogs.sort((a, b) => {
        if (!a.completionDate) return 1;
        if (!b.completionDate) return -1;
        return new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
      });
    });
  }

  onUnknownDateChange(): void {
    if (this.unknownDate) {
      this.newBacklog.completionDate = '';
    }
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
    if (this.newBacklog.completionDate || this.unknownDate) {
      this.backlogService.createBacklog({
        gameId: this.gameId,
        addonId: this.addonId,
        completionDate: this.unknownDate ? null : this.newBacklog.completionDate,
        endingType: this.newBacklog.endingType,
        completionType: this.newBacklog.completionType || undefined,
        customAttributes: this.customAttributesObj
      }).subscribe({
        next: () => {
          this.toast.success('Completion logged', `Added to "${this.gameTitle}".`);
          this.newBacklog = {
            completionDate: '',
            endingType: '',
            completionType: ''
          };
          this.unknownDate = false;
          this.customAttributesObj = {};
          this.customAttributesArray = [];
          this.closeModal();
        },
        error: (err) => this.toast.error('Could not save', err?.message),
      });
    }
  }

  async deleteBacklog(id: string): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Delete completion entry?',
      message: 'This completion record will be permanently removed.',
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.backlogService.deleteBacklog(id).subscribe({
      next: () => {
        this.toast.success('Completion entry deleted');
        this.loadBacklogs();
      },
      error: (err) => this.toast.error('Could not delete', err?.message),
    });
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