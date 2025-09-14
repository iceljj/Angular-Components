import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompFolder } from './comp-folder';

describe('CompFolder', () => {
  let component: CompFolder;
  let fixture: ComponentFixture<CompFolder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompFolder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompFolder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
