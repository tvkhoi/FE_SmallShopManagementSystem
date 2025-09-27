import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarLeft } from './sidebar-left';

describe('SiderbarLeft', () => {
  let component: SidebarLeft;
  let fixture: ComponentFixture<SidebarLeft>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarLeft]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarLeft);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
