import { Component, Input } from '@angular/core';

/**
 * Cover artwork that always shows the full image (never cropped) and fills any
 * leftover letterbox space with a blurred, scaled copy of the same art — so a
 * cover whose aspect ratio doesn't match its frame reads as intentional rather
 * than as empty bars (the Steam/Plex treatment).
 *
 * The host element supplies the frame: give it the size/rounding classes the
 * old <img> had (e.g. `class="h-full w-full"` inside a sized box, or
 * `class="h-32 w-24 rounded-lg"`). When the art happens to match the frame the
 * `object-contain` layer covers everything and no blur shows, so it degrades to
 * the previous look for on-ratio covers.
 */
@Component({
  selector: 'app-cover-art',
  template: `
    <ng-container *ngIf="src; else placeholder">
      <img
        [src]="src"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
      />
      <img
        [src]="src"
        [alt]="alt"
        class="relative z-[1] h-full w-full object-contain drop-shadow-md"
      />
    </ng-container>
    <ng-template #placeholder>
      <div class="flex h-full w-full items-center justify-center bg-surface-2 text-4xl" aria-hidden="true">🎮</div>
    </ng-template>
  `,
  host: {
    // `isolate` keeps the inner blur/cover z-index self-contained so overlay
    // badges (digital/physical, compilation…) painted as siblings stay on top.
    class: 'relative isolate block overflow-hidden',
  },
})
export class CoverArtComponent {
  @Input() src?: string | null;
  @Input() alt = '';
}
