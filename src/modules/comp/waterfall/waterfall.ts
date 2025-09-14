import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

/**
 * 卡片数据接口
 * @interface CardItem
 * @property {string} id - 卡片唯一标识
 * @property {string} title - 卡片标题
 * @property {string} content - 卡片内容
 * @property {string} image - 卡片图片URL
 * @property {number} columns - 卡片占据的列数 (1, 2, 或 3)
 * @property {number} height - 卡片高度 (像素)
 */
export interface CardItem {
  id: string;
  title: string;
  content: string;
  image: string;
  columns: number;
  height: number;
}

/**
 * 瀑布流组件
 *
 * 该组件实现了一个响应式的瀑布流布局，具有以下特性：
 * 1. 固定列数（默认为2列）
 * 2. 每行可包含1-3个卡片
 * 3. 自适应不同屏幕尺寸
 * 4. 卡片高度可变
 *
 * @example
 * <app-waterfall [cards]="cardData" [columns]="2"></app-waterfall>
 */
@Component({
  selector: 'app-waterfall',
  imports: [CommonModule, FormsModule],
  templateUrl: './waterfall.html',
  styleUrl: './waterfall.scss'
})
export class Waterfall implements OnInit {
  /**
   * 卡片数据输入
   * @type {CardItem[]}
   */
  @Input() cards: CardItem[] = [];

  /**
   * 列数配置
   * @type {number}
   * @default 2
   */
  @Input() columns = 2;

  /** 组织后的列数据 */
  organizedColumns: CardItem[][] = [];

  ngOnInit(): void {
    this.organizeCards();
  }

  /**
   * 组织卡片数据到各列
   *
   * 此方法将卡片数据分配到各列中，并保持各列高度平衡
   * 算法逻辑：
   * 1. 初始化列数组
   * 2. 计算每列当前高度
   * 3. 遍历所有卡片，将卡片添加到当前最短的列
   * 4. 更新列高度
   */
  private organizeCards(): void {
    // 初始化列数组
    this.organizedColumns = Array.from({length: this.columns}, () => []);
    const columnHeights = new Array(this.columns).fill(0);

    // 将卡片分配到列中
    this.cards.forEach(card => {
      // 找到当前最短的列
      const minHeight = Math.min(...columnHeights);
      const columnIndex = columnHeights.indexOf(minHeight);

      // 将卡片添加到该列
      this.organizedColumns[columnIndex].push(card);

      // 更新列高度（考虑间距）
      columnHeights[columnIndex] += card.height + 16; // 16为卡片间距
    });
  }

  /**
   * 获取卡片CSS类
   * @param {CardItem} card - 卡片对象
   * @returns {string} - 对应的CSS类名
   */
  getCardClass(card: CardItem): string {
    return `card-${card.columns}`;
  }
}
