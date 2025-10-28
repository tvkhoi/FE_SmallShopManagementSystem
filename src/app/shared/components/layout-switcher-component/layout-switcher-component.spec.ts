import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutSwitcherComponent } from './layout-switcher-component';

describe('LayoutSwitcherComponent', () => {
  let component: LayoutSwitcherComponent;
  let fixture: ComponentFixture<LayoutSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutSwitcherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
