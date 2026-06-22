import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Addon {
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
export class AddonService {
  private apiUrl = 'http://localhost:3000/addons';

  constructor(private http: HttpClient) { }

  getAddonsByGame(gameId: string): Observable<Addon[]> {
    return this.http.get<Addon[]>(`${this.apiUrl}/game/${gameId}`);
  }

  getAddon(id: string): Observable<Addon> {
    return this.http.get<Addon>(`${this.apiUrl}/${id}`);
  }

  createAddon(addon: Partial<Addon>): Observable<Addon> {
    return this.http.post<Addon>(this.apiUrl, addon);
  }

  updateAddon(id: string, addon: Partial<Addon>): Observable<Addon> {
    return this.http.patch<Addon>(`${this.apiUrl}/${id}`, addon);
  }

  deleteAddon(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
