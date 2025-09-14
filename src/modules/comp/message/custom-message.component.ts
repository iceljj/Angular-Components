import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NzMessageService, NzMessageComponent } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';

/**
 * 自定义全局提示组件
 * 提供两种使用方式：
 * 1. 普通模式：直接显示文本消息
 * 2. 模板模式：使用自定义模板显示消息
 */
@Component({
  selector: 'app-custom-message',
  standalone: true,
  imports: [NzButtonModule],
  templateUrl: './custom-message.component.html',
  styleUrls: ['./custom-message.component.scss']
})
export class CustomMessageComponent {
  /**
   * 自定义模板引用
   * 用于模板模式的消息显示
   */
  @ViewChild('customTemplate', { static: true }) customTemplate!: TemplateRef<{ 
    $implicit: NzMessageComponent; 
    data: string; 
  }>;

  /**
   * 构造函数
   * @param message - NzMessageService实例，用于显示消息
   */
  constructor(private message: NzMessageService) {}

  /**
   * 显示普通文本消息
   * @param type - 消息类型 (info, success, warning, error)
   * @param content - 消息内容
   */
  showMessage(type: 'info' | 'success' | 'warning' | 'error' = 'info', content: string = '这是一条普通消息'): void {
    switch (type) {
      case 'success':
        this.message.success(content);
        break;
      case 'warning':
        this.message.warning(content);
        break;
      case 'error':
        this.message.error(content);
        break;
      default:
        this.message.info(content);
    }
  }

  /**
   * 显示自定义模板消息
   * @param data - 传递给模板的数据
   */
  showTemplateMessage(data: string = 'Angular'): void {
    this.message.success(this.customTemplate, { nzData: data });
  }

  /**
   * 显示不同类型的模板消息
   * @param type - 消息类型 (info, success, warning, error)
   * @param data - 传递给模板的数据
   */
  showTemplateMessageByType(type: 'info' | 'success' | 'warning' | 'error' = 'info', data: string = 'Angular'): void {
    switch (type) {
      case 'success':
        this.message.success(this.customTemplate, { nzData: data });
        break;
      case 'warning':
        this.message.warning(this.customTemplate, { nzData: data });
        break;
      case 'error':
        this.message.error(this.customTemplate, { nzData: data });
        break;
      default:
        this.message.info(this.customTemplate, { nzData: data });
    }
  }
}