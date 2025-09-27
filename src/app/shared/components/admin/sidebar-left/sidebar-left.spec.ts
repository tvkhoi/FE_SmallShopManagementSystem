import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiderbarLeft } from './sidebar-left';

describe('SiderbarLeft', () => {
  let component: SiderbarLeft;
  let fixture: ComponentFixture<SiderbarLeft>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiderbarLeft]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiderbarLeft);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
