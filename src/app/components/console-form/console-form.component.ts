import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleService } from '../../services/console.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { CreationFlowService } from '../../services/creation-flow.service';

@Component({
  selector: 'app-console-form',
  templateUrl: `./console-form.component.html`,
  styleUrls: [`./console-form.component.css`]
})
export class ConsoleFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  consoleId: string | null = null;
  families: ConsoleFamily[] = [];

  constructor(
    private fb: FormBuilder,
    private consoleService: ConsoleService,
    private familyService: ConsoleFamilyService,
    private route: ActivatedRoute,
    private router: Router,
    public flow: CreationFlowService
  ) {
    this.form = this.fb.group({
      consoleFamilyId: ['', Validators.required],
      model: ['', Validators.required],
      releaseDate: ['', Validators.required],
      region: ['', Validators.required],
      color: ['', Validators.required],
      picture: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadFamilies();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.consoleId = id;
    }

    const returned = this.flow.consume(this.router.url);
    if (returned) {
      this.form.patchValue(returned.returnState || {});
      if (returned.field === 'consoleFamilyId' && returned.resultIds.length) {
        this.form.patchValue({ consoleFamilyId: returned.resultIds[0] });
      }
    } else if (id) {
      this.loadConsole(id);
    }
  }

  /** True when this Add Console view was opened to create another form's value. */
  get isFlowTarget(): boolean {
    return this.flow.active && this.flow.current?.field === 'consoleId';
  }

  startCreate(field: string, multi: boolean, createUrl: string): void {
    this.flow.start({
      returnUrl: this.router.url,
      returnState: this.form.getRawValue(),
      field,
      multi,
      createUrl,
    });
  }

  loadFamilies(): void {
    this.familyService.getAllFamilies().subscribe(families => {
      this.families = families;
    });
  }

  loadConsole(id: string): void {
    this.consoleService.getConsole(id).subscribe(console => {
      this.form.patchValue({
        consoleFamilyId: console.consoleFamilyId,
        model: console.model,
        releaseDate: console.releaseDate.split('T')[0],
        region: console.region,
        color: console.color,
        picture: console.picture,
      });
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const data = { ...this.form.value, customAttributes: {} };

      if (this.isEditMode && this.consoleId) {
        this.consoleService.updateConsole(this.consoleId, data).subscribe(() => {
          this.router.navigate(['/console', this.consoleId]);
        });
      } else {
        this.consoleService.createConsole(data).subscribe(console => {
          if (this.isFlowTarget) {
            this.flow.finish([console.id]);
          } else {
            this.router.navigate(['/console', console.id]);
          }
        });
      }
    }
  }

  cancel(): void {
    if (this.isFlowTarget) {
      this.flow.abort();
    } else if (this.isEditMode && this.consoleId) {
      this.router.navigate(['/console', this.consoleId]);
    } else {
      this.router.navigate(['/consoles']);
    }
  }
}