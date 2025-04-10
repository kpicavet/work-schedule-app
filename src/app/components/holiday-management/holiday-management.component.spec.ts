import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayManagementComponent } from './holiday-management.component';

describe('HolidayManagementComponent', () => {
  let component: HolidayManagementComponent;
  let fixture: ComponentFixture<HolidayManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidayManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidayManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
