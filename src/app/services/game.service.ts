import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResult, PaginationOptions } from '../components/shared/pagination.interface';

export interface Game {
  id: string;
  title: string;
  alternateTitles?: string[];
  coverArt: string;
  releaseDate: string;
  consoleFamilyId: string;
  consoleId?: string;
  developer: string;
  publisher?: string;
  region: string;
  physicalDigital: 'physical' | 'digital';
  // Free-form completeness/condition detail of the owned copy
  // (e.g. "Cart only", "Complete in box", "Missing manual", "Includes goods").
  conditionDetails?: string;
  customAttributes: Record<string, any>;
  categoryIds: string[];
  canHaveAddon?: boolean;
  // True when this game is a port from another console platform.
  isPort?: boolean;
  // When isPort, the console family this game was ported from.
  portedFromConsoleFamilyId?: string;
  isCompilation?: boolean;
  includedGameIds?: string[];
  // Derived by the backend for games that belong to a compilation.
  compilationId?: string;
  compilationTitle?: string;
  // Set by the backend on a collapsed list card when the same title is owned on
  // several platforms; lists each copy so the UI can ask which one to open.
  versions?: GameVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GameVersion {
  id: string;
  consoleFamilyId: string;
  physicalDigital: 'physical' | 'digital';
  region?: string;
  isCompilation?: boolean;
}

export interface GameFilterParams {
  query?: string; // For search
  categoryId?: string; // For single category filter
  consoleFamilyId?: string;
  dateFrom?: string;
  dateTo?: string;
  // Note: For multi-category filtering, the backend usually expects an array,
  // e.g., categoryIds: string[]
  // Since the component uses an object-based filter, we'll simplify the client
  // service by focusing on sending query params.
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/games';

  constructor(private http: HttpClient) { }

  // --- NEW PAGINATION AND FILTER METHODS ---

  /**
   * Fetches games using a unified endpoint that accepts filtering, search, and pagination.
   * This replaces the need for separate search, category, and simple getAllGames methods
   * when filters are applied.
   * * Assumes a backend endpoint like: GET /games?page=1&limit=10&query=searchterm&dateFrom=...
   * * @param filters All active filters (search term, category IDs, date range).
   * @param options Pagination parameters (page number and limit).
   * @returns An observable of a paginated result object.
   */
  getFilteredAndPaginatedGames(
    filters: GameFilterParams & Record<string, any>, 
    options: PaginationOptions
  ): Observable<PaginatedResult<Game>> {
    
    let params = new HttpParams();

    // 1. Add Pagination Parameters
    params = params.set('page', options.page?.toString() || '1');
    params = params.set('limit', options.limit?.toString() || '10');

    // 2. Add Filter Parameters
    for (const key in filters) {
      const value = filters[key];
      if (value) {
        // Handle array values (e.g., multiple category IDs) by joining or repeating keys
        if (Array.isArray(value)) {
           value.forEach(item => {
             params = params.append(key, item);
           });
        } else {
           params = params.set(key, value.toString());
        }
      }
    }
    
    return this.http.get<PaginatedResult<Game>>(this.apiUrl, { params });
  }

  getGame(id: string): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/${id}`);
  }

  /** Distinct publisher names across the collection, for the filter dropdown. */
  getPublishers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/publishers`);
  }

  getIncludedGames(id: string): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/${id}/included`);
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