import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cubeloading } from './cubeloading';

describe('Cubeloading', () => {
  let component: Cubeloading;
  let fixture: ComponentFixture<Cubeloading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cubeloading]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cubeloading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
