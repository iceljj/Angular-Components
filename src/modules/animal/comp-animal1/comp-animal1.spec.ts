import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompAnimal1 } from './comp-animal1';

describe('CompAnimal1', () => {
  let component: CompAnimal1;
  let fixture: ComponentFixture<CompAnimal1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompAnimal1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompAnimal1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
