import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dlc {
  id: string;
  gameId: string;
  title: string;
  alternateTitles?: string[];
  coverArt: string;
  releaseDate: string;
  customAttributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DlcService {
  private apiUrl = 'http://localhost:3000/dlcs';

  constructor(private http: HttpClient) { }

  getDlcsByGame(gameId: string): Observable<Dlc[]> {
    return this.http.get<Dlc[]>(`${this.apiUrl}/game/${gameId}`);
  }

  getDlc(id: string): Observable<Dlc> {
    return this.http.get<Dlc>(`${this.apiUrl}/${id}`);
  }

  createDlc(dlc: Partial<Dlc>): Observable<Dlc> {
    return this.http.post<Dlc>(this.apiUrl, dlc);
  }

  updateDlc(id: string, dlc: Partial<Dlc>): Observable<Dlc> {
    return this.http.patch<Dlc>(`${this.apiUrl}/${id}`, dlc);
  }

  deleteDlc(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
