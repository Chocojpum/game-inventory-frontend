import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult, PaginationOptions } from '../components/shared/pagination.interface';

export interface Category {
  id: string;
  name: string;
  type: 'franchise' | 'saga' | 'genre' | 'custom';
  description?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<PaginatedResult<Category>>(this.apiUrl, {
      params: { limit: '9999' }
    }).pipe(map(r => r.data));
  }

  getFilteredAndPaginatedCategories(
    filters: { search?: string; type?: string },
    options: PaginationOptions
  ): Observable<PaginatedResult<Category>> {
    let params = new HttpParams()
      .set('page', options.page?.toString() || '1')
      .set('limit', options.limit?.toString() || '10');

    if (filters.search) params = params.set('search', filters.search);
    if (filters.type) params = params.set('type', filters.type);

    return this.http.get<PaginatedResult<Category>>(this.apiUrl, { params });
  }

  getCategoriesByType(type: string): Observable<Category[]> {
    return this.http.get<PaginatedResult<Category>>(this.apiUrl, {
      params: { type, limit: '9999' }
    }).pipe(map(r => r.data));
  }

  searchCategories(query: string, type?: string): Observable<Category[]> {
    let params: any = { search: query, limit: '9999' };
    if (type) params['type'] = type;
    return this.http.get<PaginatedResult<Category>>(this.apiUrl, { params })
      .pipe(map(r => r.data));
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
