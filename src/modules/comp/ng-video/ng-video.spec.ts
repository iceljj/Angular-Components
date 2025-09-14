import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgVideo } from './ng-video';

describe('NgVideo', () => {
  let component: NgVideo;
  let fixture: ComponentFixture<NgVideo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgVideo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgVideo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
