import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SellerInventoryManagement } from './seller-inventory-management';


describe('SellerInventoryManagementTs', () => {
  let component: SellerInventoryManagement;
  let fixture: ComponentFixture<SellerInventoryManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerInventoryManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerInventoryManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
