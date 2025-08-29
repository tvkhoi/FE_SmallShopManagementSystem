import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Auditlog } from './auditlog';

describe('Auditlog', () => {
  let component: Auditlog;
  let fixture: ComponentFixture<Auditlog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auditlog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Auditlog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
