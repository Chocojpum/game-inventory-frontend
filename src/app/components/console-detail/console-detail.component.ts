import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-console-detail',
  templateUrl: `./console-detail.component.html`,
  styleUrls: [`./console-detail.component.css`]
})
export class ConsoleDetailComponent implements OnInit {
  console: Console | null = null;
  family: ConsoleFamily | null = null;
  /** Families this console is backwards-compatible with, resolved for display. */
  compatibleFamilies: ConsoleFamily[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consoleService: ConsoleService,
    private familyService: ConsoleFamilyService,
    private confirm: ConfirmService,
    private toast: ToastService
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
    if (!this.console) return;
    const compatibleIds = this.console.compatibleConsoleFamilyIds || [];
    // One call resolves both the primary family and the compatible ones for display.
    this.familyService.getAllFamilies().subscribe(
      families => {
        this.family = families.find(f => f.id === this.console!.consoleFamilyId) || null;
        this.compatibleFamilies = compatibleIds
          .map(id => families.find(f => f.id === id))
          .filter((f): f is ConsoleFamily => !!f);
      },
      error => console.error('Families not found', error)
    );
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

  async deleteConsole(): Promise<void> {
    if (!this.console) return;
    const ok = await this.confirm.ask({
      title: 'Delete console?',
      message: 'This console will be permanently removed from your inventory.',
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.consoleService.deleteConsole(this.console.id).subscribe({
      next: () => {
        this.toast.success('Console deleted');
        this.router.navigate(['/consoles']);
      },
      error: (err) => this.toast.error('Could not delete', err?.message),
    });
  }

  goBack(): void {
    this.router.navigate(['/consoles']);
  }
}