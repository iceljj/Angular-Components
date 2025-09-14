import { Component } from '@angular/core';
import { CustomMessageComponent } from './custom-message.component';
import { NzButtonModule } from 'ng-zorro-antd/button';

/**
 * 消息组件演示页面
 * 展示如何使用自定义的全局提示组件
 */
@Component({
  selector: 'app-message-demo',
  standalone: true,
  imports: [
    CustomMessageComponent,
    NzButtonModule
  ],
  template: `
    <div class="message-demo-container">
      <h2>自定义全局提示组件演示</h2>
      <app-custom-message></app-custom-message>
    </div>
  `,
  styles: [`
    .message-demo-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    h2 {
      text-align: center;
      color: #333;
    }
  `]
})
export class MessageDemoComponent {}