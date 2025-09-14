import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompDragDiv } from './comp-drag-div';

describe('CompDragDiv', () => {
  let component: CompDragDiv;
  let fixture: ComponentFixture<CompDragDiv>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompDragDiv]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompDragDiv);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
