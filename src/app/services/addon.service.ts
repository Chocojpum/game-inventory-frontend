import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResult, PaginationOptions } from '../components/shared/pagination.interface';

export interface Addon {
  id: string;
  gameId: string;
  title: string;
  alternateTitles?: string[];
  coverArt: string;
  releaseDate: string;
  canBeCompleted?: boolean;
  customAttributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/** An Addon decorated with parent-game data and completion status (Addons list view). */
export interface EnrichedAddon extends Addon {
  parentGameTitle: string;
  consoleFamilyId: string;
  consoleFamilyName: string;
  gameDeveloper: string;
  gameRegion: string;
  gamePhysicalDigital: string;
  gameCategoryIds: string[];
  gameConsoleId?: string;
  parentCompilationId?: string;
  parentCompilationTitle?: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AddonService {
  private apiUrl = 'http://localhost:3000/api/addons';
  private listUrl = 'http://localhost:3000/api/addon-list';

  constructor(private http: HttpClient) { }

  /**
   * Fetches Addons through the unified list endpoint that accepts the same
   * filtering/search/sort/pagination shape as the games list (filter keys are
   * pre-flattened by the caller, e.g. categoryId_0, excludeConsoleFamilyId_0).
   */
  getFilteredAndPaginatedAddons(
    filters: Record<string, any>,
    options: PaginationOptions
  ): Observable<PaginatedResult<EnrichedAddon>> {
    let params = new HttpParams()
      .set('page', options.page?.toString() || '1')
      .set('limit', options.limit?.toString() || '10');

    for (const key in filters) {
      const value = filters[key];
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(item => (params = params.append(key, item)));
        } else {
          params = params.set(key, value.toString());
        }
      }
    }

    return this.http.get<PaginatedResult<EnrichedAddon>>(this.listUrl, { params });
  }

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
