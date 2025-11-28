import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[clickOutside]'
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

    @HostListener('document:mousedown', ['$event'])
    public onMouseDown(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      const clickedInside = this.elementRef.nativeElement.contains(target);
      const isDateInput = target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'date';
      
      if (!clickedInside && !isDateInput) {
        this.clickOutside.emit();
      }
    }
    
    @HostListener('document:click', ['$event'])
    public onClick(event: MouseEvent): void {
      // Check if any date input within the directive's element is focused
      const dateInputs = this.elementRef.nativeElement.querySelectorAll('input[type="date"]');
      const anyDateInputFocused = Array.from(dateInputs).some((input: any) => input === document.activeElement);
      
      if (anyDateInputFocused) {
        event.stopPropagation();
        return;
      }
    }
}