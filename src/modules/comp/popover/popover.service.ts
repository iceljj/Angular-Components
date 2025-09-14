import {Injectable} from '@angular/core';
import {Overlay, PositionStrategy, ConnectionPositionPair} from '@angular/cdk/overlay';

/**
 * 气泡定位服务
 * 支持12个方向的位置计算
 */
@Injectable({providedIn: 'root'})
export class PopoverService {
  private positionMap: { [key: string]: ConnectionPositionPair } = {
    top: {overlayX: 'center', overlayY: 'bottom', originX: 'center', originY: 'top'},
    topLeft: {overlayX: 'start', overlayY: 'bottom', originX: 'center', originY: 'top'},
    topRight: {overlayX: 'end', overlayY: 'bottom', originX: 'center', originY: 'top'},
    bottom: {overlayX: 'center', overlayY: 'top', originX: 'center', originY: 'bottom'},
    bottomLeft: {overlayX: 'start', overlayY: 'top', originX: 'center', originY: 'bottom'},
    bottomRight: {overlayX: 'end', overlayY: 'top', originX: 'center', originY: 'bottom'},
    left: {overlayX: 'end', overlayY: 'center', originX: 'start', originY: 'center'},
    leftTop: {overlayX: 'end', overlayY: 'top', originX: 'start', originY: 'center'},
    leftBottom: {overlayX: 'end', overlayY: 'bottom', originX: 'start', originY: 'center'},
    right: {overlayX: 'start', overlayY: 'center', originX: 'end', originY: 'center'},
    rightTop: {overlayX: 'start', overlayY: 'top', originX: 'end', originY: 'center'},
    rightBottom: {overlayX: 'start', overlayY: 'bottom', originX: 'end', originY: 'center'}
  };

  constructor(private overlay: Overlay) {
  }

  getPositionStrategy(origin: HTMLElement, placement: string): PositionStrategy {
    const position = this.positionMap[placement] || this.positionMap['bottom'];
    return this.overlay.position()
      .flexibleConnectedTo(origin)
      .withPositions([position])
      .withPush(true)
      .withViewportMargin(8);
  }
}
