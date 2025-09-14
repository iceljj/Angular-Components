import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownToggle } from './drop-down-toggle';

describe('DropDownToggle', () => {
  let component: DropDownToggle;
  let fixture: ComponentFixture<DropDownToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropDownToggle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropDownToggle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
