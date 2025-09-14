import {AfterViewInit, Component, HostListener} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  query,
  stagger
} from '@angular/animations';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-comp-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './comp-list.html',
  styleUrl: './comp-list.scss',
  animations: [
    // 控制卡片列表整体动画
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({opacity: 0, transform: 'scale(0.8)'}),
          stagger('100ms', animate('300ms ease-out', style({opacity: 1, transform: 'scale(1)'})))
        ], {optional: true}),
        query(':leave', [
          style({opacity: 1, transform: 'scale(1)'}),
          animate('200ms ease-in', style({opacity: 0, transform: 'scale(0.8)'}))
        ], {optional: true})
      ])
    ]),

    // 单个卡片状态切换动画（可选）
    trigger('cardState', [
      state('in', style({opacity: 1, transform: 'scale(1)'})),
      transition('void => *', [
        style({opacity: 0, transform: 'scale(0.8)'}),
        animate(300)
      ]),
      transition('* => void', [
        animate(200, style({opacity: 0, transform: 'scale(0.8)'}))
      ])
    ])
  ]
})
export class CompList implements AfterViewInit {
  cards: number[] = [1, 2, 3, 4, 5, 6]; // 初始卡片
  gapSize: number = 16;                // 卡片间距
  minCardWidth: number = 200;          // 卡片最小宽度

  cols: number = 3;                    // 默认列数
  isManualMode: boolean = false;      // 是否手动选择了列数

  constructor()
  {
  }

  ngAfterViewInit(): void
  {
    this.calculateColumns(); // 初始化一次
  }

  // 窗口大小变化时自动调整
  @HostListener('window:resize')
  onWindowResize(): void
  {
    if (!this.isManualMode) {
      this.calculateColumns();
    }
  }

  // 计算列数
  calculateColumns(): void
  {
    const container = document.querySelector('.card-grid') as HTMLElement;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const totalGap = (this.cols - 1) * this.gapSize;
    const availableWidth = containerWidth - totalGap;
    const calculatedCols = Math.max(1, Math.floor(availableWidth / this.minCardWidth));
    this.cols = calculatedCols;
  }

  // 手动选择列数
  setManualCols(col: number): void
  {
    this.isManualMode = true;
    this.cols = col;
  }

  // 退出手动模式，回到自动计算
  resetToAuto(): void
  {
    this.isManualMode = false;
    this.calculateColumns();
  }

  // 增加卡片
  addCard(): void
  {
    if (this.cards.length < 20) {
      this.cards.push(this.cards.length + 1);
    }
  }

  // 减少卡片
  removeCard(): void
  {
    if (this.cards.length > 1) {
      this.cards.pop();
    }
  }

  // 增大间距
  increaseGap(): void
  {
    if (this.gapSize < 50) {
      this.gapSize += 4;
      if (!this.isManualMode) this.calculateColumns();
    }
  }

  // 缩小间距
  decreaseGap(): void
  {
    if (this.gapSize > 8) {
      this.gapSize -= 4;
      if (!this.isManualMode) this.calculateColumns();
    }
  }

  getGridTemplate(): string
  {
    return `repeat(${this.cols}, 1fr)`;
  }
}