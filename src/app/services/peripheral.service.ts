import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Peripheral {
  id: string;
  name: string;
  consoleFamilyId: string;
  quantity: number;
  color: string;
  picture: string;
  customAttributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PeripheralService {
  private apiUrl = 'http://localhost:3000/peripherals';

  constructor(private http: HttpClient) { }

  getAllPeripherals(): Observable<Peripheral[]> {
    return this.http.get<Peripheral[]>(this.apiUrl);
  }

  getPeripheral(id: string): Observable<Peripheral> {
    return this.http.get<Peripheral>(`${this.apiUrl}/${id}`);
  }

  searchPeripherals(query: string): Observable<Peripheral[]> {
    return this.http.get<Peripheral[]>(`${this.apiUrl}?search=${query}`);
  }

  getPeripheralsByConsole(consoleId: string): Observable<Peripheral[]> {
    return this.http.get<Peripheral[]>(`${this.apiUrl}/console/${consoleId}`);
  }

  createPeripheral(peripheral: Partial<Peripheral>): Observable<Peripheral> {
    return this.http.post<Peripheral>(this.apiUrl, peripheral);
  }

  updatePeripheral(id: string, peripheral: Partial<Peripheral>): Observable<Peripheral> {
    return this.http.patch<Peripheral>(`${this.apiUrl}/${id}`, peripheral);
  }

  deletePeripheral(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}