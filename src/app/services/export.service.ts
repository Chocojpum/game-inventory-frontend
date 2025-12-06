import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private apiUrl = 'http://localhost:3000/export';

  constructor(private http: HttpClient) {}

  exportToExcel(): Observable<any> {
    return this.http.get(`${this.apiUrl}/excel`, { responseType: 'text' });
  }

  importFromExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }
  
  importFromLocal(): Observable<any> {
    return this.http.post(`${this.apiUrl}/import`, {});
  }
}
