import { Component, OnInit } from '@angular/core';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { CreationFlowService } from '../../services/creation-flow.service';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-console-family-manager',
  templateUrl: `./console-family-manager.component.html`,
  styleUrls: [`./console-family-manager.component.css`]
})
export class ConsoleFamilyManagerComponent implements OnInit {
  families: ConsoleFamily[] = [];
  searchQuery: string = '';
  newFamily = {
    name: '',
    developer: '',
    generation: ''
  };

  constructor(
    private familyService: ConsoleFamilyService,
    public flow: CreationFlowService,
    private confirm: ConfirmService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.loadFamilies();
  }

  getFilteredFamilies(): ConsoleFamily[] {
    const term = this.searchQuery.toLowerCase().trim();
    if (!term) return this.families;
    return this.families.filter(f =>
      f.name.toLowerCase().includes(term) ||
      f.developer.toLowerCase().includes(term) ||
      (f.generation?.toLowerCase().includes(term) ?? false)
    );
  }

  loadFamilies(): void {
    this.familyService.getAllFamilies().subscribe(families => {
      this.families = families;
    });
  }

  addFamily(): void {
    if (this.newFamily.name && this.newFamily.developer) {
      this.familyService.createFamily(this.newFamily).subscribe({
        next: (created) => {
          this.toast.success('Console family added', `"${created.name}" was created.`);
          this.loadFamilies();
          if (this.flow.active) {
            this.flow.select(created.id);
          }
          this.newFamily = {
            name: '',
            developer: '',
            generation: ''
          };
        },
        error: (err) => this.toast.error('Could not add family', err?.message),
      });
    }
  }

  finishFlow(): void {
    this.flow.finish();
  }

  cancelFlow(): void {
    this.flow.abort();
  }

  async deleteFamily(id: string, name: string): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Delete console family?',
      message: `"${name}" will be removed. Consoles and games referencing it may be affected.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.familyService.deleteFamily(id).subscribe({
      next: () => {
        this.toast.success('Console family deleted');
        this.loadFamilies();
      },
      error: (err) => this.toast.error('Could not delete', err?.message),
    });
  }
}