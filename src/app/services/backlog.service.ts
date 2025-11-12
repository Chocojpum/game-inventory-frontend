import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Backlog {
  id: string;
  gameId: string;
  completionDate: string;
  endingType: string;
  completionType: string;
  customAttributes: Record<string, any>;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BacklogService {
  private apiUrl = 'http://localhost:3000/backlog';

  constructor(private http: HttpClient) { }

  getAllBacklogs(): Observable<Backlog[]> {
    return this.http.get<Backlog[]>(this.apiUrl);
  }

  getBacklog(id: string): Observable<Backlog> {
    return this.http.get<Backlog>(`${this.apiUrl}/${id}`);
  }

  getBacklogsByGame(gameId: string): Observable<Backlog[]> {
    return this.http.get<Backlog[]>(`${this.apiUrl}/game/${gameId}`);
  }

  createBacklog(backlog: Partial<Backlog>): Observable<Backlog> {
    return this.http.post<Backlog>(this.apiUrl, backlog);
  }

  updateBacklog(id: string, backlog: Partial<Backlog>): Observable<Backlog> {
    return this.http.patch<Backlog>(`${this.apiUrl}/${id}`, backlog);
  }

  deleteBacklog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
