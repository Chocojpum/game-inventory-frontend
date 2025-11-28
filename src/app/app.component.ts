import { Component } from '@angular/core';
import { ExportService } from './services/export.service';

@Component({
  selector: 'app-root',
  templateUrl: `./app.component.html`,
  styleUrls: [`./app.component.css`]
})
export class AppComponent {
  constructor(private exportService: ExportService) {}

  exportData(): void {
    this.exportService.exportToExcel().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'game-inventory.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  importData(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.exportService.importFromExcel(file).subscribe(
        result => {
          alert(`Import successful!\nGames: ${result.imported.games}\nConsoles: ${result.imported.consoles}\nPeripherals: ${result.imported.peripherals}\nBacklog: ${result.imported.backlogs}\nCategories: ${result.imported.categories}\nAttributes: ${result.imported.attributes}`);
          window.location.reload();
        },
        error => {
          alert('Import failed: ' + error.message);
        }
      );
    }
  }
}