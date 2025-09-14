import {
  Component,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MenuItem {
  label?: string;
  icon?: string;
  children?: MenuItem[];
  separator?: boolean;
  action?: () => void;
}

@Component({
  selector: 'app-comp-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './comp-menu.html',
  styleUrls: ['./comp-menu.scss']
})
export class CompMenu implements AfterViewInit {

  @ViewChild('mainMenu') mainMenu!: ElementRef;
  @ViewChild('subMenu') subMenu!: ElementRef;
  @ViewChild('testArea') testArea!: ElementRef;

  public currentMenuItems: MenuItem[] = [];
  public currentSubMenuItems: MenuItem[] = []; // ✅ 新增的子菜单数据
  private activeSubMenuItemIndex: number | null = null;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.renderer.listen(this.testArea.nativeElement, 'contextmenu', (event: MouseEvent) => {
      event.preventDefault();
      this.showDefaultContextMenu(event.clientX, event.clientY);
    });

    this.renderer.listen('document', 'click', this.handleDocumentClick.bind(this));
  }

  // 对外公开方法
  public showMenuAtPosition(x: number, y: number, items: MenuItem[]) {
    this.resetMenu(); // 清除旧菜单状态
    this.showContextMenu(x, y, items);
  }

  // 显示默认测试菜单
  private showDefaultContextMenu(x: number, y: number) {
    this.resetMenu();
    const menuItems = [
      {
        label: '新建', icon: 'fas fa-plus', children: [
          { label: '文件', icon: 'fas fa-file', action: () => console.log('新建文件') },
          { label: '文件夹', icon: 'fas fa-folder', action: () => console.log('新建文件夹') },
          { separator: true },
          { label: '快捷方式', icon: 'fas fa-link', action: () => console.log('新建快捷方式') }
        ]
      },
      { label: '打开', icon: 'fas fa-folder-open', action: () => console.log('打开') },
      { label: '粘贴', icon: 'fas fa-paste', disabled: true },
      { separator: true },
      { label: '刷新', icon: 'fas fa-sync-alt', action: () => console.log('刷新') },
      {
        label: '查看', children: [
          { label: '大图标', icon: 'fas fa-th-large', action: () => console.log('大图标') },
          { label: '小图标', icon: 'fas fa-th', action: () => console.log('小图标') },
          { label: '列表', icon: 'fas fa-bars', action: () => console.log('列表') },
          { label: '详细信息', icon: 'fas fa-list-ul', action: () => console.log('详细信息') }
        ]
      },
      { label: '属性', icon: 'fas fa-cogs', action: () => console.log('属性') }
    ];

    this.showContextMenu(x, y, menuItems);
  }

  private showContextMenu(x: number, y: number, items: MenuItem[]) {
    this.currentMenuItems = items;
    this.setPosition(this.mainMenu.nativeElement, x, y);
    this.showMenu(this.mainMenu.nativeElement);
  }

  private resetMenu() {
    this.hideMenu(this.mainMenu.nativeElement);
    this.hideMenu(this.subMenu.nativeElement);
    this.activeSubMenuItemIndex = null;
    this.currentSubMenuItems = []; // 清空子菜单
  }

  private showMenu(menuEl: HTMLElement) {
    this.renderer.removeClass(menuEl, 'show');
    requestAnimationFrame(() => {
      this.renderer.addClass(menuEl, 'show');
    });
  }

  private hideMenu(menuEl: HTMLElement) {
    this.renderer.removeClass(menuEl, 'show');
  }

  private setPosition(menuEl: HTMLElement, x: number, y: number) {
    const rect = menuEl.getBoundingClientRect();

    let left = x;
    let top = y;

    if (x + rect.width > window.innerWidth) {
      left = window.innerWidth - rect.width - 20;
    }

    if (y + rect.height > window.innerHeight) {
      top = window.innerHeight - rect.height - 20;
    }

    this.renderer.setStyle(menuEl, 'left', `${left}px`);
    this.renderer.setStyle(menuEl, 'top', `${top}px`);
  }

  onItemEnter(index: number, event: MouseEvent, item: MenuItem) {
    if (!item.children || item.children.length === 0) {
      this.hideMenu(this.subMenu.nativeElement);
      return;
    }

    // 设置子菜单内容
    this.currentSubMenuItems = item.children;

    const targetRect = (event.target as HTMLElement).getBoundingClientRect();
    this.setPosition(this.subMenu.nativeElement, targetRect.right, targetRect.top);
    this.showMenu(this.subMenu.nativeElement);

    this.activeSubMenuItemIndex = index;
  }

  onItemLeave(index: number, item: MenuItem) {
    if (!item.children) return;

    setTimeout(() => {
      if (this.activeSubMenuItemIndex !== index) {
        this.hideMenu(this.subMenu.nativeElement);
      }
    }, 150);
  }

  onItemClick(item: MenuItem) {
    if (item.action) {
      item.action();
    }
    this.hideMenu(this.mainMenu.nativeElement);
    this.hideMenu(this.subMenu.nativeElement);
  }

  handleDocumentClick(event: MouseEvent) {
    const target = event.target as Node;
    const mainMenuEl = this.mainMenu.nativeElement;
    const subMenuEl = this.subMenu.nativeElement;

    if (!mainMenuEl.contains(target) && !subMenuEl.contains(target)) {
      this.hideMenu(mainMenuEl);
      this.hideMenu(subMenuEl);
    }
  }

  isSeparator(item: MenuItem): boolean {
    return item.separator === true;
  }

  hasChildren(item: MenuItem): boolean {
    return item.children != null && item.children.length > 0;
  }
}
