import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacklogManagerComponent } from './backlog-manager.component';

describe('BacklogManagerComponent', () => {
  let component: BacklogManagerComponent;
  let fixture: ComponentFixture<BacklogManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BacklogManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BacklogManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
