import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeripheralListComponent } from './peripheral-list.component';

describe('PeripheralListComponent', () => {
  let component: PeripheralListComponent;
  let fixture: ComponentFixture<PeripheralListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeripheralListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeripheralListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
