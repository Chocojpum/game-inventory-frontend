import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult, PaginationOptions } from '../components/shared/pagination.interface';

export interface Peripheral {
  id: string;
  name: string;
  consoleFamilyId: string;
  quantity: number;
  color: string;
  picture: string;
  customAttributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PeripheralService {
  private apiUrl = 'http://localhost:3000/api/peripherals';

  constructor(private http: HttpClient) { }

  getAllPeripherals(): Observable<Peripheral[]> {
    return this.http.get<PaginatedResult<Peripheral>>(this.apiUrl, {
      params: { limit: '9999' }
    }).pipe(map(r => r.data));
  }

  getFilteredAndPaginatedPeripherals(
    filters: { search?: string; consoleFamilyId?: string },
    options: PaginationOptions
  ): Observable<PaginatedResult<Peripheral>> {
    let params = new HttpParams()
      .set('page', options.page?.toString() || '1')
      .set('limit', options.limit?.toString() || '10');

    if (filters.search) params = params.set('search', filters.search);
    if (filters.consoleFamilyId) params = params.set('consoleFamilyId', filters.consoleFamilyId);

    return this.http.get<PaginatedResult<Peripheral>>(this.apiUrl, { params });
  }

  getPeripheral(id: string): Observable<Peripheral> {
    return this.http.get<Peripheral>(`${this.apiUrl}/${id}`);
  }

  searchPeripherals(query: string): Observable<Peripheral[]> {
    return this.http.get<PaginatedResult<Peripheral>>(this.apiUrl, {
      params: { search: query, limit: '9999' }
    }).pipe(map(r => r.data));
  }

  getPeripheralsByConsole(consoleId: string): Observable<Peripheral[]> {
    return this.http.get<Peripheral[]>(`${this.apiUrl}/console/${consoleId}`);
  }

  createPeripheral(peripheral: Partial<Peripheral>): Observable<Peripheral> {
    return this.http.post<Peripheral>(this.apiUrl, peripheral);
  }

  updatePeripheral(id: string, peripheral: Partial<Peripheral>): Observable<Peripheral> {
    return this.http.patch<Peripheral>(`${this.apiUrl}/${id}`, peripheral);
  }

  deletePeripheral(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
