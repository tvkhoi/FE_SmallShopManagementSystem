import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerOrderManagement } from './seller-order-management';

describe('SellerOrderManagement', () => {
  let component: SellerOrderManagement;
  let fixture: ComponentFixture<SellerOrderManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerOrderManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerOrderManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
