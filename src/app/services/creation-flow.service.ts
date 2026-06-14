import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**
 * One frame of an in-progress "create a missing value" flow.
 *
 * Frames are kept on a stack so flows can nest (e.g. building a compilation
 * game -> creating a member game -> creating that game's console family).
 */
export interface CreationFlowFrame {
  /** Route to return to when the child flow finishes, e.g. '/add-game'. */
  returnUrl: string;
  /** Opaque snapshot captured by the originating form, restored on return. */
  returnState: any;
  /** Logical target slot the created value(s) should be applied to. */
  field: string;
  /** Whether the target accepts multiple ids. */
  multi: boolean;
  /** Extra hints for the creation view, e.g. { categoryType: 'genre' }. */
  context?: any;
  /** Ids created and/or selected during the child flow. */
  resultIds: string[];
  /** Set true once the child flow signals completion (vs. just navigating in). */
  done: boolean;
}

export interface StartFlowOptions {
  returnUrl: string;
  returnState: any;
  field: string;
  multi: boolean;
  context?: any;
  /** Route of the creation view to open. */
  createUrl: string;
}

/**
 * Shared orchestration for the inline "create a missing value" feature.
 *
 * Originating forms call {@link start} when the user clicks a "+ New ..."
 * button, and {@link consume} in ngOnInit to pick up the result. Creation
 * views call {@link select}/{@link finish}/{@link abort} to feed values back.
 */
@Injectable({
  providedIn: 'root'
})
export class CreationFlowService {
  private stack: CreationFlowFrame[] = [];

  constructor(private router: Router) {}

  /** True when a creation flow is currently in progress. */
  get active(): boolean {
    return this.stack.length > 0;
  }

  /** The frame on top of the stack, or undefined when no flow is active. */
  get current(): CreationFlowFrame | undefined {
    return this.stack[this.stack.length - 1];
  }

  /** Push a new flow frame and navigate to the creation view. */
  start(opts: StartFlowOptions): void {
    this.stack.push({
      returnUrl: opts.returnUrl,
      returnState: opts.returnState,
      field: opts.field,
      multi: opts.multi,
      context: opts.context,
      resultIds: [],
      done: false,
    });
    this.go(opts.createUrl);
  }

  // --- Selection helpers used by the creation views ---

  isSelected(id: string): boolean {
    return !!this.current && this.current.resultIds.includes(id);
  }

  select(id: string): void {
    const frame = this.current;
    if (!frame) return;
    if (!frame.multi) {
      // Single-target slots only keep the latest selection.
      frame.resultIds = [id];
      return;
    }
    if (!frame.resultIds.includes(id)) {
      frame.resultIds.push(id);
    }
  }

  deselect(id: string): void {
    const frame = this.current;
    if (!frame) return;
    const index = frame.resultIds.indexOf(id);
    if (index > -1) {
      frame.resultIds.splice(index, 1);
    }
  }

  toggle(id: string): void {
    this.isSelected(id) ? this.deselect(id) : this.select(id);
  }

  /**
   * Finish the current flow and return to the originating form.
   * Optionally overrides the collected result ids.
   */
  finish(ids?: string[]): void {
    const frame = this.current;
    if (!frame) return;
    if (ids) {
      frame.resultIds = ids;
    }
    frame.done = true;
    this.go(frame.returnUrl);
  }

  /** Cancel the current flow, returning to the originating form with no result. */
  abort(): void {
    const frame = this.stack.pop();
    if (frame) {
      this.go(frame.returnUrl);
    }
  }

  /**
   * Called by an originating form in ngOnInit. If the top frame is a finished
   * flow that returned to this url, it is popped and handed back so the form can
   * restore its state and apply the result. Otherwise returns undefined.
   *
   * The `done` guard is what prevents a same-route child (Add Game opened from
   * Add Game) from consuming its parent's frame as it navigates in.
   */
  consume(returnUrl: string): CreationFlowFrame | undefined {
    const frame = this.current;
    if (frame && frame.done && frame.returnUrl === returnUrl) {
      return this.stack.pop();
    }
    return undefined;
  }

  /**
   * Navigate in a way that always recreates the destination component.
   *
   * Bouncing through '/' (without touching the address bar) forces Angular to
   * tear down and rebuild the target, so the same-route recursive case
   * (Add Game -> Add Game) re-runs ngOnInit, and originating forms reliably
   * re-initialize and restore their state on return.
   */
  private go(url: string): void {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigateByUrl(url));
  }
}
