import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:3000/categories';

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoriesByType(type: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}?type=${type}`);
  }

  searchCategories(query: string, type?: string): Observable<Category[]> {
    let url = `${this.apiUrl}?search=${query}`;
    if (type) {
      url += `&type=${type}`;
    }
    return this.http.get<Category[]>(url);
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