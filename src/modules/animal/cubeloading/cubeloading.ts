import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-cubeloading',
  imports: [CommonModule, FormsModule],
  templateUrl: './cubeloading.html',
  styleUrl: './cubeloading.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class Cubeloading {
  // 输入属性
  @Input() size: number = 200; // 立方体尺寸（像素）
  @Input() speed: number = 8; // 旋转速度（秒/圈）
  @Input() showText: boolean = true; // 是否显示加载文本
  @Input() showControls: boolean = true; // 是否显示控制按钮
  @Input() isPlaying: boolean = true; // 是否正在播放
  @Input() colors: string[] = [ // 立方体各面颜色
    'rgba(255, 107, 107, 0.7)',
    'rgba(77, 171, 247, 0.7)',
    'rgba(129, 236, 236, 0.7)',
    'rgba(253, 203, 110, 0.7)',
    'rgba(85, 239, 196, 0.7)',
    'rgba(162, 155, 254, 0.7)'
  ];

  // 加载文本动画状态
  dots = '';
  private intervalId: any;

  constructor(private elementRef: ElementRef) {
  }

  ngAfterViewInit(): void {
    this.setCssVariables();
    this.updateAnimationState();
    this.startDotsAnimation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['size'] || changes['speed']) {
      this.setCssVariables();
    }

    if (changes['speed'] || changes['isPlaying']) {
      this.updateAnimationState();
    }

    if (changes['showText']) {
      if (this.showText) {
        this.startDotsAnimation();
      } else {
        this.clearDotsAnimation();
      }
    }
  }

  // 设置CSS变量
  private setCssVariables() {
    const container = this.elementRef.nativeElement.querySelector('.cube-container');
    if (container) {
      // 设置面平移距离（立方体边长的一半）
      container.style.setProperty('--face-translate', `${this.size / 2}px`);
      // 设置动画持续时间
      container.style.setProperty('--animation-duration', `${this.speed}s`);
    }
  }

  // 更新立方体动画状态
  private updateAnimationState() {
    const cubeElement = this.elementRef.nativeElement.querySelector('.cube');
    if (cubeElement) {
      cubeElement.style.animationPlayState = this.isPlaying ? 'running' : 'paused';
    }
  }

  // 开始加载文本动画
  private startDotsAnimation() {
    if (!this.showText) return;

    this.clearDotsAnimation();

    this.intervalId = setInterval(() => {
      this.dots = this.dots.length >= 3 ? '' : this.dots + '.';
    }, 500);
  }

  // 清除加载文本动画
  private clearDotsAnimation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.dots = '';
  }

  // 切换动画播放状态
  togglePlay() {
    this.isPlaying = !this.isPlaying;
    this.updateAnimationState();
  }

  // 加速旋转
  speedUp() {
    if (this.speed > 1) {
      this.speed--;
      this.setCssVariables();
      this.updateAnimationState();
    }
  }

  // 减速旋转
  speedDown() {
    this.speed++;
    this.setCssVariables();
    this.updateAnimationState();
  }

  // 组件销毁时清除动画
  ngOnDestroy(): void {
    this.clearDotsAnimation();
  }
}
