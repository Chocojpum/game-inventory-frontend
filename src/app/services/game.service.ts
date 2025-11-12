import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Game {
  id: string;
  title: string;
  alternateTitles?: string[];
  coverArt: string;
  releaseDate: string;
  platform: string;
  customAttributes: Record<string, any>;
  categoryIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/games';

  constructor(private http: HttpClient) { }

  getAllGames(): Observable<Game[]> {
    return this.http.get<Game[]>(this.apiUrl);
  }

  getGame(id: string): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/${id}`);
  }

  searchGames(query: string): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}?search=${query}`);
  }

  getGamesByCategory(categoryId: string): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  createGame(game: Partial<Game>): Observable<Game> {
    return this.http.post<Game>(this.apiUrl, game);
  }

  updateGame(id: string, game: Partial<Game>): Observable<Game> {
    return this.http.patch<Game>(`${this.apiUrl}/${id}`, game);
  }

  deleteGame(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}