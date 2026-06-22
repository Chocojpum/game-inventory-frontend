import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  templateUrl: `./search-bar.component.html`,
  styleUrls: [`./search-bar.component.css`]
})
export class SearchBarComponent {
  @Input() placeholder: string = '🔍 Search...';
  /** Initial/restored search term; reflected in the input. */
  @Input() set value(v: string) {
    this.query = v ?? '';
  }
  @Output() searchQuery = new EventEmitter<string>();

  query = '';
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.emit(query);
    });
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  clear() {
    this.query = '';
    this.searchSubject.next('');
  }
}