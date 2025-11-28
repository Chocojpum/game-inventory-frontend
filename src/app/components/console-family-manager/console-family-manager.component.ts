import { Component, OnInit } from '@angular/core';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';

@Component({
  selector: 'app-console-family-manager',
  templateUrl: `./console-family-manager.component.html`,
  styleUrls: [`./console-family-manager.component.css`]
})
export class ConsoleFamilyManagerComponent implements OnInit {
  families: ConsoleFamily[] = [];
  newFamily = {
    name: '',
    developer: '',
    generation: ''
  };

  constructor(private familyService: ConsoleFamilyService) { }

  ngOnInit(): void {
    this.loadFamilies();
  }

  loadFamilies(): void {
    this.familyService.getAllFamilies().subscribe(families => {
      this.families = families;
    });
  }

  addFamily(): void {
    if (this.newFamily.name && this.newFamily.developer) {
      this.familyService.createFamily(this.newFamily).subscribe(() => {
        this.loadFamilies();
        this.newFamily = {
          name: '',
          developer: '',
          generation: ''
        };
      });
    }
  }

  deleteFamily(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete the console family "${name}"?`)) {
      this.familyService.deleteFamily(id).subscribe(() => {
        this.loadFamilies();
      });
    }
  }
}