import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PeripheralService } from '../../services/peripheral.service';
import { ConsoleFamilyService, ConsoleFamily } from '../../services/console-family.service';

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
    private router: Router
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
      this.loadPeripheral(id);
    }
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
    if (this.form.valid) {
      const data = { ...this.form.value, customAttributes: {} };

      if (this.isEditMode && this.peripheralId) {
        this.peripheralService.updatePeripheral(this.peripheralId, data).subscribe(() => {
          this.router.navigate(['/peripherals']);
        });
      } else {
        this.peripheralService.createPeripheral(data).subscribe(() => {
          this.router.navigate(['/peripherals']);
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/peripherals']);
  }
}