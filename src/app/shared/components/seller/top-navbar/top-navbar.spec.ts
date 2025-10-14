import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopNavbar } from './top-navbar';

describe('TopNavbar', () => {
  let component: TopNavbar;
  let fixture: ComponentFixture<TopNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
