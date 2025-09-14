import {Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

/**
 * 弹出框组件
 *
 * 功能特性：
 * 1. 支持蒙层背景和透明背景两种模式
 * 2. 支持点击蒙层关闭（可配置）
 * 3. 支持ESC键关闭
 * 4. 垂直水平居中显示
 * 5. 打开时自动禁用背景滚动
 *
 * 使用示例：
 * <app-popup-modal
 *   [isOpen]="showModal"
 *   [backgroundType]="'mask'"
 *   (closed)="handleClose()">
 *   <!-- 自定义内容 -->
 *   <h2>标题</h2>
 *   <p>内容区域...</p>
 * </app-popup-modal>
 */
@Component({
  selector: 'app-comp-modol',
  imports: [CommonModule, FormsModule],
  templateUrl: './comp-modol.html',
  styleUrl: './comp-modol.scss'
})
export class CompModol {
  /**
   * 控制弹出框显示状态
   * @default false
   */
  @Input() isOpen = false;

  /**
   * 背景类型: 'mask' | 'transparent'
   * - mask: 半透明蒙层背景
   * - transparent: 完全透明背景
   * @default 'mask'
   */
  @Input() backgroundType: 'mask' | 'transparent' = 'mask';

  /**
   * 是否允许点击背景关闭
   * @default true
   */
  @Input() closeOnBackdropClick = true;

  /**
   * 是否显示关闭按钮
   * @default true
   */
  @Input() showCloseButton = true;

  /**
   * 关闭事件回调
   */
  @Output() closed = new EventEmitter<void>();

  // 获取内容区域DOM引用
  @ViewChild('modalContent') modalContent!: ElementRef;

  // 监听ESC键关闭
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent | any) {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  /**
   * 关闭模态框
   */
  closeModal(): void {
    this.isOpen = false;
    this.enableBodyScroll();
    this.closed.emit();
  }

  /**
   * 点击背景处理
   * @param event 鼠标事件
   */
  onBackdropClick(event: MouseEvent): void {
    // 检查点击是否发生在内容区域外
    const isClickInside = this.modalContent.nativeElement.contains(event.target);

    if (this.closeOnBackdropClick && !isClickInside) {
      this.closeModal();
    }
  }

  /**
   * 打开时禁用背景滚动
   */
  private disableBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  /**
   * 关闭时恢复背景滚动
   */
  private enableBodyScroll(): void {
    document.body.style.overflow = '';
  }

  // 监听isOpen变化
  ngOnChanges() {
    if (this.isOpen) {
      this.disableBodyScroll();
    } else {
      this.enableBodyScroll();
    }
  }
}
