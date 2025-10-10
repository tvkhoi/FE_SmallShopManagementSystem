import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionDropdown } from './action-dropdown';

describe('ActionDropdown', () => {
  let component: ActionDropdown;
  let fixture: ComponentFixture<ActionDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
