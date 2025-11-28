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
  @Output() searchQuery = new EventEmitter<string>();
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.emit(query);
    });
  }

  onSearchChange(event: any) {
    this.searchSubject.next(event.target.value);
  }
}