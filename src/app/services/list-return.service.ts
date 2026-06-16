import { Injectable } from '@angular/core';

/**
 * Remembers the last list view the user was on (its full URL, including the
 * filter/search/sort/page query params). Detail views use this for their
 * "back" button so it always returns to the list with state intact, regardless
 * of what's in the browser history (e.g. an edit form visited in between).
 */
@Injectable({ providedIn: 'root' })
export class ListReturnService {
  /** Serialized URL of the last list view, or null if none has been visited. */
  url: string | null = null;
}
