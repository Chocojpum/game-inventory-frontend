import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeripheralFormComponent } from './peripheral-form.component';

describe('PeripheralFormComponent', () => {
  let component: PeripheralFormComponent;
  let fixture: ComponentFixture<PeripheralFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeripheralFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeripheralFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
