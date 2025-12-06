import { Component, OnInit } from '@angular/core';
import { ExportService } from './services/export.service';

@Component({
  selector: 'app-root',
  templateUrl: `./app.component.html`,
  styleUrls: [`./app.component.css`],
})
export class AppComponent implements OnInit {
  constructor(private exportService: ExportService) {}

  ngOnInit(): void {
    this.importDataFirst();
  }

  exportData(): void {
    this.exportService.exportToExcel().subscribe(
      (result) => {
        alert(result);
      },
      (error) => {
        alert('Import failed: ' + error.message);
      }
    );
  }

  importData(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.exportService.importFromExcel(file).subscribe(
        (result) => {
          alert(
            `Import successful!\nGames: ${result.imported.games}\nConsoles: ${result.imported.consoles}\nPeripherals: ${result.imported.peripherals}\nBacklog: ${result.imported.backlogs}\nCategories: ${result.imported.categories}\nAttributes: ${result.imported.attributes}`
          );
          window.location.reload();
        },
        (error) => {
          alert('Import failed: ' + error.message);
        }
      );
    }
  }

  importDataFirst(): void {
    this.exportService.importFromLocal().subscribe();
  }
}
