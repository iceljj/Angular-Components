import {Component} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'app-envelop',
  imports: [],
  templateUrl: './envelop.html',
  styleUrl: './envelop.scss',
  animations: [
    // 盖章动画（点击后消失）
    trigger('stampAnimation', [
      state('initial', style({
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1
      })),
      state('pressed', style({
        transform: 'translate(-50%, -50%) scale(1.2)',
        opacity: 1
      })),
      state('hidden', style({
        transform: 'translate(-50%, -50%) scale(0)',
        opacity: 0
      })),
      transition('initial => pressed', [
        animate('300ms ease-in', keyframes([
          style({ transform: 'translate(-50%, -50%) scale(0.8)', offset: 0.3 }),
          style({ transform: 'translate(-50%, -50%) scale(1.2)', offset: 1.0 })
        ]))
      ]),
      transition('pressed => hidden', animate('300ms ease-out'))
    ]),

    // 信封盖翻转动画（纯上下旋转）
    trigger('flapAnimation', [
      state('closed', style({
        transform: 'rotateX(0)',
        'transform-origin': 'bottom center' // 确保绕底部中心旋转[5](@ref)
      })),
      state('open', style({
        transform: 'rotateX(180deg) translateY(-20px)',
        'transform-origin': 'bottom center'
      })),
      transition('closed => open', [
        animate('1000ms cubic-bezier(0.68, -0.55, 0.27, 1.55)', keyframes([
          // 关键帧1：30度抬起
          style({
            transform: 'rotateX(30deg)',
            'transform-origin': 'bottom center',
            offset: 0.3
          }),
          // 关键帧2：90度垂直状态
          style({
            transform: 'rotateX(90deg)',
            'transform-origin': 'bottom center',
            offset: 0.6
          }),
          // 关键帧3：180度完全翻转
          style({
            transform: 'rotateX(180deg) translateY(-20px)',
            'transform-origin': 'bottom center',
            offset: 1
          })
        ]))
      ])
    ]),

    // 信封翼动画（向外展开）
    trigger('wingAnimation', [
      state('closed', style({ transform: 'rotateY(0)' })),
      state('open', style({ transform: 'rotateY(90deg)' })),
      transition('closed => open', [
        animate('800ms 500ms ease-out')
      ])
    ]),

    // 信封整体下移动画
    trigger('bottomAnimation', [
      state('initial', style({ transform: 'translateY(0)' })),
      state('moved', style({ transform: 'translateY(80px)' })),
      transition('initial => moved', [
        animate('1000ms ease-out')
      ])
    ]),

    // 卡片显示动画
    trigger('cardAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(20px)' // 初始位置下移[5](@ref)
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)' // 最终位置上移
      })),
      transition('hidden => visible', [
        animate('1000ms 500ms ease-in')
      ])
    ]),

    // 整体信封容器动画
    trigger('envelopeAnimation', [
      transition('* => *', [])
    ])
  ]
})
export class Envelop {
  // 动画状态控制
  animationState = 'closed';
  stampState = 'initial';
  flapState = 'closed';
  wingState = 'closed';
  bottomState = 'initial';
  cardState = 'hidden';

  openEnvelope() {
    // 1. 触发盖章动画
    this.stampState = 'pressed';

    // 2. 延迟启动信封盖翻转
    setTimeout(() => {
      this.stampState = 'hidden';
      this.flapState = 'open'; // 启动三维翻转

      // 3. 翻转完成后触发其他动画
      setTimeout(() => {
        this.wingState = 'open';
        this.bottomState = 'moved';
        this.cardState = 'visible';
      }, 1000); // 匹配信封盖动画时长
    }, 300);
  }
}
