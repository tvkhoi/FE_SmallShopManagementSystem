import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignPermissionModal } from './assign-permission-modal';

describe('AssignPermissionModal', () => {
  let component: AssignPermissionModal;
  let fixture: ComponentFixture<AssignPermissionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignPermissionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignPermissionModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
