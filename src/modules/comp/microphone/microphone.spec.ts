import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Microphone } from './microphone';

describe('Microphone', () => {
  let component: Microphone;
  let fixture: ComponentFixture<Microphone>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Microphone]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Microphone);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
