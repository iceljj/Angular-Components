import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Waterfall } from './waterfall';

describe('Waterfall', () => {
  let component: Waterfall;
  let fixture: ComponentFixture<Waterfall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Waterfall]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Waterfall);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
