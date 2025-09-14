import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompBtn } from './comp-btn';

describe('CompBtn', () => {
  let component: CompBtn;
  let fixture: ComponentFixture<CompBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompBtn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompBtn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
