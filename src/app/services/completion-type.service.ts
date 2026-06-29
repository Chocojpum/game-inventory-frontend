import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult, PaginationOptions } from '../components/shared/pagination.interface';

export interface CompletionType {
  id: string;
  name: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CompletionTypeService {
  private apiUrl = 'http://localhost:3000/api/completion-types';

  constructor(private http: HttpClient) { }

  getAllCompletionTypes(): Observable<CompletionType[]> {
    return this.http.get<PaginatedResult<CompletionType>>(this.apiUrl, {
      params: { limit: '9999' }
    }).pipe(map(r => r.data));
  }

  getFilteredAndPaginatedCompletionTypes(options: PaginationOptions): Observable<PaginatedResult<CompletionType>> {
    return this.http.get<PaginatedResult<CompletionType>>(this.apiUrl, {
      params: {
        page: options.page?.toString() || '1',
        limit: options.limit?.toString() || '10',
      }
    });
  }

  getCompletionType(id: string): Observable<CompletionType> {
    return this.http.get<CompletionType>(`${this.apiUrl}/${id}`);
  }

  createCompletionType(completionType: Partial<CompletionType>): Observable<CompletionType> {
    return this.http.post<CompletionType>(this.apiUrl, completionType);
  }

  deleteCompletionType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
