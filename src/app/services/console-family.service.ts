import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:3000/console-families';

  constructor(private http: HttpClient) { }

  getAllFamilies(): Observable<ConsoleFamily[]> {
    return this.http.get<ConsoleFamily[]>(this.apiUrl);
  }

  getFamily(id: string): Observable<ConsoleFamily> {
    return this.http.get<ConsoleFamily>(`${this.apiUrl}/${id}`);
  }

  searchFamilies(query: string): Observable<ConsoleFamily[]> {
    return this.http.get<ConsoleFamily[]>(`${this.apiUrl}?search=${query}`);
  }

  createFamily(family: Partial<ConsoleFamily>): Observable<ConsoleFamily> {
    return this.http.post<ConsoleFamily>(this.apiUrl, family);
  }

  deleteFamily(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}