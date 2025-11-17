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
      
      // Check if the target is a date input
      const isDateInput = target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'date';
      
      if (!clickedInside && !isDateInput) {
        this.clickOutside.emit();
      }
    }
    
    // Also add this to handle when the calendar is open
    @HostListener('document:click', ['$event'])
    public onClick(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      
      // Check if any date input within the directive's element is focused
      const dateInputs = this.elementRef.nativeElement.querySelectorAll('input[type="date"]');
      const anyDateInputFocused = Array.from(dateInputs).some((input: any) => input === document.activeElement);
      
      if (anyDateInputFocused) {
        event.stopPropagation();
        return;
      }
    }
}