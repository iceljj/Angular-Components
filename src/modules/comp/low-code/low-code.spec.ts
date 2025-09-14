import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowCode } from './low-code';

describe('LowCode', () => {
  let component: LowCode;
  let fixture: ComponentFixture<LowCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LowCode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
