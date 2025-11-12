import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleDetailComponent } from './console-detail.component';

describe('ConsoleDetailComponent', () => {
  let component: ConsoleDetailComponent;
  let fixture: ComponentFixture<ConsoleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsoleDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
