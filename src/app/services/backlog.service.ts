import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResult, PaginationOptions } from '../components/shared/pagination.interface';

export interface Backlog {
  id: string;
  gameId: string;
  dlcId?: string;
  completionDate: string | null;
  endingType: string;
  completionType: string;
  customAttributes: Record<string, any>;
  createdAt: Date;
}

export interface EnrichedBacklog extends Backlog {
  isDlc?: boolean;
  parentGameTitle?: string;
  gameTitle: string;
  gameCoverArt: string;
  gameDeveloper: string;
  gameRegion: string;
  gameCustomAttributes: Record<string, any>;
  consoleFamilyId: string;
  consoleFamilyName: string;
}

@Injectable({
  providedIn: 'root'
})
export class BacklogService {
  private apiUrl = 'http://localhost:3000/backlog';

  constructor(private http: HttpClient) { }

  getEnrichedAndPaginatedBacklogs(
    filters: {
      gameId?: string;
      search?: string;
      consoleFamilyId?: string;
      categoryIds?: string[];
      dateFrom?: string;
      dateTo?: string;
      sortBy?: string;
    },
    options: PaginationOptions
  ): Observable<PaginatedResult<EnrichedBacklog>> {
    let params = new HttpParams()
      .set('page', options.page?.toString() || '1')
      .set('limit', options.limit?.toString() || '10');

    if (filters.gameId) params = params.set('gameId', filters.gameId);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.consoleFamilyId) params = params.set('consoleFamilyId', filters.consoleFamilyId);
    if (filters.categoryIds) {
      // Send each category as a generic key (categoryId_0, categoryId_1, ...)
      filters.categoryIds.forEach((id, index) => {
        params = params.set(`categoryId_${index}`, id);
      });
    }
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);

    return this.http.get<PaginatedResult<EnrichedBacklog>>(this.apiUrl, { params });
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
