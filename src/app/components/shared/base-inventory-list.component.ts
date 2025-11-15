import { Directive, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Directive()
export abstract class BaseInventoryListComponent<T extends { id: string }> implements OnInit {
  items: T[] = [];
  protected allItems: T[] = [];

  constructor(protected router: Router) {}

  ngOnInit(): void {
    this.loadItems();
  }

  abstract loadItems(): void;
  abstract onSearch(query: string): void;
  abstract getItemDisplayName(item: T): string;

  protected setItems(items: T[]): void {
    this.items = items;
    this.allItems = items;
  }
}