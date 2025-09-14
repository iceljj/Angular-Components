import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

interface MenuItem
{
  title: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-nav',
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
  ],
  standalone: true,
  templateUrl: './nav.html',
  styleUrl: './nav.scss'
})
export class Nav
{
  @Input() collapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<boolean>();

  activeRoute: string = '';
  menuItems: MenuItem[] = [
    {
      title: '仪表盘',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      title: '用户管理',
      icon: 'people',
      children: [
        {title: '用户列表', icon: 'list', route: '/users'},
        {title: '添加用户', icon: 'person_add', route: '/users/add'}
      ]
    },
    {
      title: '商品管理',
      icon: 'inventory',
      children: [
        {title: '商品列表', icon: 'list', route: '/products'},
        {title: '库存管理', icon: 'warehouse', route: '/inventory'}
      ]
    },
    {
      title: '订单管理',
      icon: 'receipt',
      route: '/orders'
    },
    {
      title: '系统设置',
      icon: 'settings',
      children: [
        {title: '基本设置', icon: 'settings_applications', route: '/settings/general'},
        {title: '权限管理', icon: 'lock', route: '/settings/permissions'}
      ]
    }
  ];

  constructor(private router: Router)
  {
  }

  navigate(route: string | undefined): void
  {
    if (route)
    {
      this.router.navigate([route]);
      this.activeRoute = route;
    }
  }

  onToggleCollapse(): void
  {
    this.collapsed = !this.collapsed;
    this.toggleCollapse.emit(this.collapsed);
  }
}
