import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageAnimal } from './image-animal';

describe('ImageAnimal', () => {
  let component: ImageAnimal;
  let fixture: ComponentFixture<ImageAnimal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageAnimal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageAnimal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
