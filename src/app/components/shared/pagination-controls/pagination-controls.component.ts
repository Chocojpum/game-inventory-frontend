import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Presentational pagination control: items-per-page selector, prev/next,
 * windowed numbered buttons with first/last jumps, and a jump-to-page input.
 *
 * Stateless — it renders the values it is given and emits the user's intent
 * ({@link pageChange} / {@link limitChange}); the host owns validation and
 * data fetching. Safe to render more than once on a page (e.g. top and bottom).
 */
@Component({
  selector: 'app-pagination-controls',
  templateUrl: './pagination-controls.component.html',
  styleUrls: ['./pagination-controls.component.css'],
})
export class PaginationControlsComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 0;
  @Input() pageNumbers: number[] = [];
  @Input() limit = 10;
  @Input() limitOptions: number[] = [10, 20, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() limitChange = new EventEmitter<number>();
}
