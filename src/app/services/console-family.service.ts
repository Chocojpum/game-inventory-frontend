import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult, PaginationOptions } from '../components/shared/pagination.interface';

export interface ConsoleFamily {
  id: string;
  name: string;
  developer: string;
  generation?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ConsoleFamilyService {
  private apiUrl = 'http://localhost:3000/api/console-families';

  constructor(private http: HttpClient) { }

  getAllFamilies(): Observable<ConsoleFamily[]> {
    return this.http.get<PaginatedResult<ConsoleFamily>>(this.apiUrl, {
      params: { limit: '9999' }
    }).pipe(map(r => r.data));
  }

  getFilteredAndPaginatedFamilies(
    filters: { search?: string },
    options: PaginationOptions
  ): Observable<PaginatedResult<ConsoleFamily>> {
    let params = new HttpParams()
      .set('page', options.page?.toString() || '1')
      .set('limit', options.limit?.toString() || '10');

    if (filters.search) params = params.set('search', filters.search);

    return this.http.get<PaginatedResult<ConsoleFamily>>(this.apiUrl, { params });
  }

  getFamily(id: string): Observable<ConsoleFamily> {
    return this.http.get<ConsoleFamily>(`${this.apiUrl}/${id}`);
  }

  searchFamilies(query: string): Observable<ConsoleFamily[]> {
    return this.http.get<PaginatedResult<ConsoleFamily>>(this.apiUrl, {
      params: { search: query, limit: '9999' }
    }).pipe(map(r => r.data));
  }

  createFamily(family: Partial<ConsoleFamily>): Observable<ConsoleFamily> {
    return this.http.post<ConsoleFamily>(this.apiUrl, family);
  }

  deleteFamily(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
