import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Console {
  id: string;
  name: string;
  developer: string;
  releaseDate: string;
  picture: string;
  region: string;
  color: string;
  model: string;
  customAttributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ConsoleService {
  private apiUrl = 'http://localhost:3000/consoles';

  constructor(private http: HttpClient) { }

  getAllConsoles(): Observable<Console[]> {
    return this.http.get<Console[]>(this.apiUrl);
  }

  getConsole(id: string): Observable<Console> {
    return this.http.get<Console>(`${this.apiUrl}/${id}`);
  }

  searchConsoles(query: string): Observable<Console[]> {
    return this.http.get<Console[]>(`${this.apiUrl}?search=${query}`);
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