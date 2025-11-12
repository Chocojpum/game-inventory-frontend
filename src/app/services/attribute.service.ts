import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Attribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[];
  isGlobal: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AttributeService {
  private apiUrl = 'http://localhost:3000/attributes';

  constructor(private http: HttpClient) { }

  getAllAttributes(): Observable<Attribute[]> {
    return this.http.get<Attribute[]>(this.apiUrl);
  }

  getGlobalAttributes(): Observable<Attribute[]> {
    return this.http.get<Attribute[]>(`${this.apiUrl}/global`);
  }

  getAttribute(id: string): Observable<Attribute> {
    return this.http.get<Attribute>(`${this.apiUrl}/${id}`);
  }

  createAttribute(attribute: Partial<Attribute>): Observable<Attribute> {
    return this.http.post<Attribute>(this.apiUrl, attribute);
  }

  deleteAttribute(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}