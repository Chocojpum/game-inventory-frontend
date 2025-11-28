import { Directive, ElementRef, OnInit, Renderer2, HostListener, Input, NgZone } from '@angular/core';

@Directive({
  selector: '[appOverflowClass]',
})
export class OverflowClassDirective implements OnInit {
  @Input('appOverflowClass') overflowClass: string = 'title-text-animated';
  
  private textElement: HTMLElement | null = null;
  private containerElement: HTMLElement;

  constructor(
    private el: ElementRef, 
    private renderer: Renderer2,
    private zone: NgZone // Use NgZone to ensure check runs in Angular's zone if needed
  ) {
    this.containerElement = this.el.nativeElement;
  }

  ngOnInit(): void {
    this.textElement = this.containerElement.querySelector('.title-text');
    
    // Use a small delay to ensure rendering is complete, especially after data binding
    // Running outside Angular's zone can prevent excessive change detection cycles
    this.zone.runOutsideAngular(() => {
      setTimeout(() => this.checkOverflow(), 50); 
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkOverflow();
  }

  /**
   * Checks if the text content overflows the container's visible area.
   */
  private checkOverflow(): void {
    if (!this.textElement) {
        console.warn('OverflowClassDirective: Inner span with class .title-text not found.');
        return;
    }

    const contentWidth = this.textElement.scrollWidth;
    const containerVisibleWidth = this.containerElement.clientWidth;

    const isOverflowing = contentWidth > containerVisibleWidth;

    if (isOverflowing) {
      this.renderer.addClass(this.textElement, this.overflowClass);
    } else {
      this.renderer.removeClass(this.textElement, this.overflowClass);
    }
  }
}