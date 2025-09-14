import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter,
  ViewContainerRef,
  ComponentRef, TemplateRef
} from '@angular/core';
import {Overlay, OverlayRef, PositionStrategy} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {Popover} from './popover';
import {PopoverService} from './popover.service';

/**
 * 气泡卡片指令
 *
 * @example
 * <!-- 基础用法 -->
 * <button [appPopover]="content">触发按钮</button>
 *
 * <!-- 自定义方向 -->
 * <button [appPopover]="content" placement="topLeft">Top Left</button>
 *
 * @Input content: string | TemplateRef<any> - 气泡内容（支持字符串或模板）
 * @Input placement: string - 气泡位置（默认'bottom'）
 * @Input trigger: 'hover' | 'click' - 触发方式（默认'click'）
 * @Output visibleChange = new EventEmitter<boolean>() - 显隐状态变化事件
 */
@Directive({selector: '[appPopover]'})
export class PopoverDirective {
  @Input() appPopover!: string | TemplateRef<any>;
  @Input() placement: string = 'bottom';
  @Input() trigger: 'hover' | 'click' = 'click';
  @Output() visibleChange = new EventEmitter<boolean>();

  private overlayRef!: OverlayRef;
  private popoverRef!: ComponentRef<Popover>;

  constructor(
    private el: ElementRef,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private popoverService: PopoverService
  ) {
  }

  ngOnInit() {
    this.createOverlay();
  }

  private createOverlay() {
    const positionStrategy = this.popoverService.getPositionStrategy(
      this.el.nativeElement,
      this.placement
    );

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
  }

  @HostListener('click') onClick() {
    if (this.trigger === 'click') this.togglePopover();
  }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.trigger === 'hover') this.showPopover();
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.trigger === 'hover') this.hidePopover();
  }

  private togglePopover() {
    this.overlayRef.hasAttached() ? this.hidePopover() : this.showPopover();
  }

  private showPopover() {
    const portal = new ComponentPortal(Popover);
    this.popoverRef = this.overlayRef.attach(portal);
    this.popoverRef.instance.content = this.appPopover;
    this.visibleChange.emit(true);
  }

  private hidePopover() {
    this.overlayRef.detach();
    this.visibleChange.emit(false);
  }

  ngOnDestroy() {
    if (this.overlayRef) this.overlayRef.dispose();
  }
}
