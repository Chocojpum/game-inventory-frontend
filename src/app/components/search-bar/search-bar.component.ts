import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  template: `
    <div class="search-container">
      <input 
        type="text" 
        class="search-input" 
        [placeholder]="placeholder"
        (input)="onSearchChange($event)"
      />
    </div>
  `,
  styles: [`
    .search-container {
      margin-bottom: 2rem;
    }
    .search-input {
      width: 100%;
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
      border: none;
      border-radius: 50px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: all 0.3s;
    }
    .search-input:focus {
      outline: none;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      transform: translateY(-2px);
    }
  `]
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