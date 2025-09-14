import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompInput } from './comp-input';

describe('CompInput', () => {
  let component: CompInput;
  let fixture: ComponentFixture<CompInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
