import { Injectable } from '@angular/core';

/**
 * Tracks whether the collection has unsaved changes since the last export.
 * Used to decide whether to auto-export (and warn) when the app is closed.
 */
@Injectable({ providedIn: 'root' })
export class DirtyService {
  private dirty = false;

  markDirty(): void {
    this.dirty = true;
  }

  markClean(): void {
    this.dirty = false;
  }

  isDirty(): boolean {
    return this.dirty;
  }
}
