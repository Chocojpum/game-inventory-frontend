import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OneDriveStatus {
  available: boolean; // a backup folder could be resolved on this device
  oneDriveDetected: boolean; // %OneDrive% root exists
  backupDir: string | null;
  backupExists: boolean;
  lastModified: string | null;
}

export interface OneDriveCheck {
  available: boolean;
  newer: boolean;
  remoteModified?: string;
}

@Injectable({ providedIn: 'root' })
export class OneDriveService {
  private apiUrl = 'http://localhost:3000/api/onedrive';
  private exportUrl = 'http://localhost:3000/api/export';

  constructor(private http: HttpClient) {}

  status(): Observable<OneDriveStatus> {
    return this.http.get<OneDriveStatus>(`${this.apiUrl}/status`);
  }

  /** Whether the OneDrive backup is newer than the copy we last synced from. */
  check(): Observable<OneDriveCheck> {
    return this.http.get<OneDriveCheck>(`${this.apiUrl}/check`);
  }

  /** Read the OneDrive backup and replace the local collection with it. */
  pull(): Observable<any> {
    return this.http.post(`${this.exportUrl}/onedrive/pull`, {});
  }

  /** Save locally and mirror into the OneDrive folder now. */
  backupNow(): Observable<any> {
    return this.http.post(`${this.exportUrl}/save`, {});
  }
}
