import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CustomMessageComponent } from './custom-message.component';

// 创建NzMessageService的模拟实现
class MockNzMessageService {
  info = jasmine.createSpy('info');
  success = jasmine.createSpy('success');
  warning = jasmine.createSpy('warning');
  error = jasmine.createSpy('error');
}

describe('CustomMessageComponent', () => {
  let component: CustomMessageComponent;
  let fixture: ComponentFixture<CustomMessageComponent>;
  let messageService: NzMessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomMessageComponent],
      providers: [
        { provide: NzMessageService, useClass: MockNzMessageService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomMessageComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(NzMessageService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show info message', () => {
    component.showMessage('info', 'Test message');
    expect(messageService.info).toHaveBeenCalledWith('Test message');
  });

  it('should show success message', () => {
    component.showMessage('success', 'Success message');
    expect(messageService.success).toHaveBeenCalledWith('Success message');
  });

  it('should show warning message', () => {
    component.showMessage('warning', 'Warning message');
    expect(messageService.warning).toHaveBeenCalledWith('Warning message');
  });

  it('should show error message', () => {
    component.showMessage('error', 'Error message');
    expect(messageService.error).toHaveBeenCalledWith('Error message');
  });
});