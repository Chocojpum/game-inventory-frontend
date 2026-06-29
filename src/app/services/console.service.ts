import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult, PaginationOptions } from '../components/shared/pagination.interface';

export interface Console {
  id: string;
  consoleFamilyId: string;
  // Additional families a backwards-compatible console can also play
  // (e.g. a PS2 that also runs PS1 games). The native family isn't repeated here.
  compatibleConsoleFamilyIds?: string[];
  releaseDate: string;
  picture: string;
  region: string;
  color: string;
  model: string;
  // Free-form completeness/condition detail of the owned console
  // (e.g. "Console only", "Boxed complete", "Missing power cable", "Includes 2 controllers").
  conditionDetails?: string;
  customAttributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ConsoleService {
  private apiUrl = 'http://localhost:3000/api/consoles';

  constructor(private http: HttpClient) { }

  getAllConsoles(): Observable<Console[]> {
    return this.http.get<PaginatedResult<Console>>(this.apiUrl, {
      params: { limit: '9999' }
    }).pipe(map(r => r.data));
  }

  getFilteredAndPaginatedConsoles(
    filters: { search?: string; familyId?: string },
    options: PaginationOptions
  ): Observable<PaginatedResult<Console>> {
    let params = new HttpParams()
      .set('page', options.page?.toString() || '1')
      .set('limit', options.limit?.toString() || '10');

    if (filters.search) params = params.set('search', filters.search);
    if (filters.familyId) params = params.set('familyId', filters.familyId);

    return this.http.get<PaginatedResult<Console>>(this.apiUrl, { params });
  }

  getConsole(id: string): Observable<Console> {
    return this.http.get<Console>(`${this.apiUrl}/${id}`);
  }

  searchConsoles(query: string): Observable<Console[]> {
    return this.http.get<PaginatedResult<Console>>(this.apiUrl, {
      params: { search: query, limit: '9999' }
    }).pipe(map(r => r.data));
  }

  getConsolesByFamily(familyId: string): Observable<Console[]> {
    return this.http.get<PaginatedResult<Console>>(this.apiUrl, {
      params: { familyId, limit: '9999' }
    }).pipe(map(r => r.data));
  }

  createConsole(console: Partial<Console>): Observable<Console> {
    return this.http.post<Console>(this.apiUrl, console);
  }

  updateConsole(id: string, console: Partial<Console>): Observable<Console> {
    return this.http.patch<Console>(`${this.apiUrl}/${id}`, console);
  }

  deleteConsole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
