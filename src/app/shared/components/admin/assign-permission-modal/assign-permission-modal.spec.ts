import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignPermissionModalComponent } from './assign-permission-modal';

describe('AssignPermissionModal', () => {
  let component: AssignPermissionModalComponent;
  let fixture: ComponentFixture<AssignPermissionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignPermissionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignPermissionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
