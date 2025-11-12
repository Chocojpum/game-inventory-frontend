import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleListComponent } from './console-list.component';

describe('ConsoleListComponent', () => {
  let component: ConsoleListComponent;
  let fixture: ComponentFixture<ConsoleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsoleListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
