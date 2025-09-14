import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Videogular } from './videogular';

describe('Videogular', () => {
  let component: Videogular;
  let fixture: ComponentFixture<Videogular>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Videogular]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Videogular);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
