import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lottie } from './lottie';

describe('Lottie', () => {
  let component: Lottie;
  let fixture: ComponentFixture<Lottie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lottie]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lottie);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
