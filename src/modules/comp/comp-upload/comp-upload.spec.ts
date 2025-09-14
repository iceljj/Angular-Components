import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompUpload } from './comp-upload';

describe('CompUpload', () => {
  let component: CompUpload;
  let fixture: ComponentFixture<CompUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
