import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {trigger, state, style, transition, animate} from '@angular/animations';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

/**
 * 高级多选卡片选择器组件
 *
 * 提供左右导航按钮用于浏览项目，显示当前选中位置，
 * 下拉菜单以三列卡片布局展示所有选项，
 * 支持多选模式并提供全选功能。
 *
 * @example
 * <app-slider-selector
 *   [dataArray]="items"
 *   (selectionChange)="onSelectionChange($event)">
 * </app-slider-selector>
 *
 * @selector comp-drop-down-toggle
 */
@Component({
  selector: 'comp-drop-down-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drop-down-toggle.html',
  styleUrls: ['./drop-down-toggle.scss'],
  animations: [
    trigger('dropdownAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-10px)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('void <=> *', animate('200ms ease-in-out'))
    ])
  ]
})
export class DropDownToggle implements AfterViewInit, OnChanges {
  /**
   * 数据源数组，每个对象必须包含id和label属性
   *
   * @example
   * dataArray = [
   *   { id: 1, name: '选项1' },
   *   { id: 2, name: '选项2' }
   * ];
   */
  @Input() dataArray: any[] = [];

  /**
   * 选中项变化时触发的事件
   *
   * @eventProperty
   * @emit 当前选中的对象数组
   */
  @Output() selectionChange = new EventEmitter<any[]>();

  /** 当前高亮项的索引 */
  currentIndex = 0;

  /** 下拉菜单是否打开 */
  isDropdownOpen = false;

  /** 卡片列表的DOM引用 */
  @ViewChild('cardList', { static: false }) cardListRef!: ElementRef;

  /** 存储选中项的ID集合 */
  selectedIds = new Set<number>();

  /** 是否为多选模式 */
  isMultiSelectMode = false;

  /** 存储单选模式下最后选中的项ID */
  private lastSingleSelectedId: number | null = null;

  /**
   * 获取当前是否在第一个项目
   *
   * @returns {boolean} 如果是第一个项目或数据为空则返回true
   */
  get isFirstItem(): boolean {
    return this.currentIndex === 0 || this.dataArray.length === 0;
  }

  /**
   * 获取当前是否在最后一个项目
   *
   * @returns {boolean} 如果是最后一个项目或数据为空则返回true
   */
  get isLastItem(): boolean {
    return this.currentIndex === this.dataArray.length - 1 || this.dataArray.length === 0;
  }

  /**
   * 获取当前高亮的项目
   *
   * @returns {any} 当前高亮的对象，如果数据为空则返回null
   */
  get currentItem(): any {
    if (this.dataArray.length === 0) return null;
    return this.dataArray[this.currentIndex];
  }

  /**
   * 组件初始化后的生命周期钩子
   */
  ngAfterViewInit() {
    // 初始化逻辑
  }

  /**
   * 输入属性变化的生命周期钩子
   *
   * @param {SimpleChanges} changes 变化对象
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataArray']) {
      // 重置选中状态
      this.selectedIds.clear();
      this.lastSingleSelectedId = null;
      this.ensureValidSelection();
      this.emitSelection();
    }
  }

  /**
   * 监听文档点击事件以关闭下拉菜单
   *
   * @param {Event} event 点击事件
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  constructor(private elementRef: ElementRef) { }

  /**
   * 确保当前高亮项有效
   * 当数据变化时重置索引
   */
  private ensureValidSelection(): void {
    if (this.dataArray.length === 0) {
      this.currentIndex = 0;
      return;
    }

    // 如果当前索引超出范围，重置为0
    if (this.currentIndex >= this.dataArray.length) {
      this.currentIndex = 0;
    }

    // 如果当前没有高亮项，设置第一个为高亮项
    if (!this.currentItem) {
      this.currentIndex = 0;
    }
  }

  /**
   * 向左滑动
   */
  slideLeft(): void {
    if (this.isFirstItem) return;

    // 强制切换到单选模式
    this.switchToSingleMode();
    this.currentIndex--;

    // 选中当前项
    this.selectCurrentItemAsSingle();
    this.closeDropdown();
  }

  /**
   * 向右滑动
   */
  slideRight(): void {
    if (this.isLastItem) return;

    // 强制切换到单选模式
    this.switchToSingleMode();
    this.currentIndex++;

    // 选中当前项
    this.selectCurrentItemAsSingle();
    this.closeDropdown();
  }

  /**
   * 切换到单选模式
   */
  private switchToSingleMode(): void {
    if (this.isMultiSelectMode) {
      this.isMultiSelectMode = false;
      // 恢复单选模式下最后选中的项
      this.restoreLastSingleSelection();
    }
  }

  /**
   * 恢复单选模式下最后选中的项
   */
  private restoreLastSingleSelection(): void {
    if (this.lastSingleSelectedId !== null) {
      const index = this.dataArray.findIndex(item => item.id === this.lastSingleSelectedId);
      if (index !== -1) {
        this.currentIndex = index;
      }
      this.selectedIds = new Set([this.lastSingleSelectedId]);
    } else {
      // 如果没有记录，则选中当前项
      this.selectCurrentItemAsSingle();
    }
  }

  /**
   * 将当前项设为唯一选中项
   */
  private selectCurrentItemAsSingle(): void {
    if (this.currentItem) {
      this.selectedIds = new Set([this.currentItem.id]);
      this.lastSingleSelectedId = this.currentItem.id;
      this.emitSelection();
    }
  }

  /**
   * 切换下拉菜单
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * 关闭下拉菜单
   */
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  /**
   * 选择卡片
   *
   * @param {number} id 项的ID
   * @param {Event} [event] 点击事件（可选）
   */
  selectCard(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // 在单选模式下，只选中当前项
    if (!this.isMultiSelectMode) {
      this.selectedIds = new Set([id]);
      this.lastSingleSelectedId = id;
    } else {
      // 在多选模式下，切换选中状态
      if (this.selectedIds.has(id)) {
        this.selectedIds.delete(id);
      } else {
        this.selectedIds.add(id);
      }
    }

    // 更新当前索引
    const index = this.dataArray.findIndex(item => item.id === id);
    if (index !== -1) {
      this.currentIndex = index;
    }

    this.emitSelection();
  }

  /**
   * 发出选中事件
   */
  private emitSelection(): void {
    if (this.dataArray.length > 0) {
      const selectedItems = this.dataArray.filter(item =>
        this.selectedIds.has(item.id)
      );
      this.selectionChange.emit(selectedItems);
    } else {
      this.selectionChange.emit([]);
    }
  }

  /**
   * 检查项目是否被选中
   *
   * @param {number} id 项目ID
   * @returns {boolean} 如果项目被选中则返回true
   */
  isItemSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  /**
   * 切换全选状态
   *
   * @param {Event} event 点击事件
   */
  toggleSelectAll(event: Event): void {
    event.stopPropagation();

    if (this.isAllSelected()) {
      // 如果已全选，则清除所有选中
      this.selectedIds.clear();
    } else {
      // 如果未全选，则选中所有项目
      this.dataArray.forEach(item => {
        this.selectedIds.add(item.id);
      });
    }

    this.emitSelection();
  }

  /**
   * 检查是否所有项目都被选中
   *
   * @returns {boolean} 如果所有项目都被选中则返回true
   */
  isAllSelected(): boolean {
    return this.dataArray.length > 0 &&
      this.selectedIds.size === this.dataArray.length;
  }

  /**
   * 切换单选/多选模式
   *
   * @param {Event} event 点击事件
   */
  toggleMode(event: Event): void {
    event.stopPropagation();

    // 记录切换前的状态
    const wasMultiSelect = this.isMultiSelectMode;
    this.isMultiSelectMode = !this.isMultiSelectMode;

    if (wasMultiSelect && !this.isMultiSelectMode) {
      // 从多选切换到单选：恢复单选模式下最后选中的项
      this.restoreLastSingleSelection();
    } else if (!wasMultiSelect && this.isMultiSelectMode) {
      // 从单选切换到多选：保存当前单选状态
      if (this.currentItem) {
        this.lastSingleSelectedId = this.currentItem.id;
      }
    }
  }
}
