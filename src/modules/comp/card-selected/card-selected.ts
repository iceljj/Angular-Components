import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

/**
 * 选项卡片组件
 *
 * @selector app-tab-chips
 * @standalone true
 *
 * @input tabs: string[] - 选项卡标签数组（必填）
 * @input selectedColor: string - 选中状态颜色（默认红色）
 * @input gap: string - 卡片间距（默认8px）
 *
 * @output tabSelected: EventEmitter<string> - 选项卡选中事件
 */
@Component({
  selector: 'app-card-selected',
  templateUrl: './card-selected.html',
  styleUrls: ['./card-selected.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CardSelected
{
  /** 选项卡标签数组 */
  @Input({required: true}) tabs: string[] = ['红烧肉', '2mm*400km*200', '选项3'];

  /** 选中状态颜色 (默认 #f00) */
  @Input() selectedColor: string = '#f00';

  /** 卡片间距 (默认 8px) */
  @Input() gap: string = '8px';

  /** 选项卡选中事件 */
  @Output() tabSelected = new EventEmitter<string>();

  /** 当前选中的选项卡 */
  selectedTab: string | null = null;

  /**
   * 处理选项卡点击事件
   * @param tab 被点击的选项卡
   */
  selectTab(tab: string): void
  {
    this.selectedTab = tab;
    this.tabSelected.emit(tab);
  }
}
