import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleService, Console } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';

@Component({
  selector: 'app-console-detail',
  templateUrl: `./console-detail.component.html`,
  styleUrls: [`./console-detail.component.css`]
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