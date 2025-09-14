import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompList } from './comp-list';

describe('CompList', () => {
  let component: CompList;
  let fixture: ComponentFixture<CompList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
