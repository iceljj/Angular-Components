import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompModol } from './comp-modol';

describe('CompModol', () => {
  let component: CompModol;
  let fixture: ComponentFixture<CompModol>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompModol]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompModol);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
