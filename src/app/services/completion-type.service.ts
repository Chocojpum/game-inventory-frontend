import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CompletionType {
  id: string;
  name: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CompletionTypeService {
  private apiUrl = 'http://localhost:3000/completion-types';

  constructor(private http: HttpClient) { }

  getAllCompletionTypes(): Observable<CompletionType[]> {
    return this.http.get<CompletionType[]>(this.apiUrl);
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