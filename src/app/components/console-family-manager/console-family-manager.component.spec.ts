import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleFamilyManagerComponent } from './console-family-manager.component';

describe('ConsoleFamilyManagerComponent', () => {
  let component: ConsoleFamilyManagerComponent;
  let fixture: ComponentFixture<ConsoleFamilyManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsoleFamilyManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleFamilyManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
