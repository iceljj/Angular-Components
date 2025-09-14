import {Component, Input, TemplateRef} from '@angular/core';
import {CommonModule, NgStyle, NgTemplateOutlet} from '@angular/common';
import {FormsModule} from '@angular/forms';

/**
 * 气泡卡片UI组件
 *
 * @Input content: string | TemplateRef<any> - 显示的内容（支持字符串或模板）
 * @Input width: number | string - 卡片宽度（支持数字像素值或CSS字符串，默认'200px'）
 * @Input overlayClass: string - 自定义CSS类名（替代直接样式对象）
 * @Input context: { [key: string]: any } - 模板上下文数据（当content为TemplateRef时使用）
 *
 * @example
 * <!-- 字符串内容 -->
 * <app-popover content="提示文本"></app-popover>
 *
 * <!-- 模板内容 -->
 * <ng-template #tpl let-data>
 *   {{ data.message }}
 * </ng-template>
 * <app-popover [content]="tpl" [context]="{ message: '动态数据' }"></app-popover>
 */
@Component({
  selector: 'app-popover',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './popover.html',
  styleUrl: './popover.scss'
})
export class Popover {
  @Input() content: any = '';
  @Input() width: number | string = '200px';
  @Input() overlayClass: string = '';
  @Input() context: any = {};

  get widthStyle(): string {
    return typeof this.width === 'number' ? `${this.width}px` : this.width;
  }

  isTemplateRef(): boolean {
    return this.content instanceof TemplateRef;
  }
}
