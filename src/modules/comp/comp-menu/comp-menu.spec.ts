import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompMenu } from './comp-menu';

describe('CompMenu', () => {
  let component: CompMenu;
  let fixture: ComponentFixture<CompMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
