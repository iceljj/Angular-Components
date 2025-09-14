import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Envelop } from './envelop';

describe('Envelop', () => {
  let component: Envelop;
  let fixture: ComponentFixture<Envelop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Envelop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Envelop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
