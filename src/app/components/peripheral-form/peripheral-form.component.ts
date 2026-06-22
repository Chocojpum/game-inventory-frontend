import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PeripheralService } from '../../services/peripheral.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';
import { CreationFlowService } from '../../services/creation-flow.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-peripheral-form',
  templateUrl: `./peripheral-form.component.html`,
  styleUrls: [`./peripheral-form.component.css`]
})
export class PeripheralFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  peripheralId: string | null = null;
  families: ConsoleFamily[] = [];

  constructor(
    private fb: FormBuilder,
    private peripheralService: PeripheralService,
    private familyService: ConsoleFamilyService,
    private route: ActivatedRoute,
    private router: Router,
    public flow: CreationFlowService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      consoleFamilyId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      color: ['', Validators.required],
      picture: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadFamilies();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.peripheralId = id;
    }

    const returned = this.flow.consume(this.router.url);
    if (returned) {
      this.form.patchValue(returned.returnState || {});
      if (returned.field === 'consoleFamilyId' && returned.resultIds.length) {
        this.form.patchValue({ consoleFamilyId: returned.resultIds[0] });
      }
    } else if (id) {
      this.loadPeripheral(id);
    }
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

  loadPeripheral(id: string): void {
    this.peripheralService.getPeripheral(id).subscribe(peripheral => {
      this.form.patchValue(peripheral);
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Missing information', 'Please fill in all required fields (marked with *).');
      return;
    }

    const data = { ...this.form.value, customAttributes: {} };

    if (this.isEditMode && this.peripheralId) {
      this.peripheralService.updatePeripheral(this.peripheralId, data).subscribe({
        next: () => {
          this.toast.success('Peripheral updated');
          this.router.navigate(['/peripherals']);
        },
        error: (err) => this.toast.error('Could not save', err?.message),
      });
    } else {
      this.peripheralService.createPeripheral(data).subscribe({
        next: () => {
          this.toast.success('Peripheral added');
          this.router.navigate(['/peripherals']);
        },
        error: (err) => this.toast.error('Could not save', err?.message),
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/peripherals']);
  }
}