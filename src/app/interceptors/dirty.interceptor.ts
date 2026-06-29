import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DirtyService } from '../services/dirty.service';

/**
 * Marks the collection dirty on any data-changing request, and clean again
 * once an export succeeds. Export/import endpoints don't count as edits.
 */
@Injectable()
export class DirtyInterceptor implements HttpInterceptor {
  constructor(private dirty: DirtyService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isExportArea = req.url.includes('/api/export');
    if (req.method !== 'GET' && !isExportArea) {
      this.dirty.markDirty();
    }
    return next.handle(req).pipe(
      tap((event) => {
        if (
          event instanceof HttpResponse &&
          req.url.includes('/api/export/excel')
        ) {
          this.dirty.markClean();
        }
      }),
    );
  }
}
