// product-detail.component.ts
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {NzCarouselModule} from 'ng-zorro-antd/carousel';
import { NzTabComponent, NzTabsComponent } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [CommonModule, NzCarouselModule, NzTabsComponent, NzTabComponent],
  standalone: true,
})
export class Home implements OnInit {
  array = [1, 2, 3, 4];
  effect = 'scrollx';
  currentId: number | null = null;
  logs: string[] = [];
  private paramChanges = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.logs.push('--- 组件初始化 ---');

    // Snapshot 只会在初始化时获取一次
    const snapshotId = this.route.snapshot.paramMap.get('id');
    this.logs.push(`[Snapshot] 初始ID: ${snapshotId}`);
    this.currentId = snapshotId ? +snapshotId : 0;

    // Subscribe 会在每次参数变化时更新
    this.route.paramMap.subscribe((params) => {
      const subscribedId = params.get('id');
      this.logs.push(`[Subscribe] 接收到新ID: ${subscribedId}`);
      this.currentId = subscribedId ? +subscribedId : 0;
    });
  }

  changeTab(index: number): void {
    this.logs.push(`用户切换到标签页 ${index}`);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: index },
      queryParamsHandling: 'merge',
    });
  }

  simulateRouteChange(): void {
    this.paramChanges++;
    const newId = Math.floor(Math.random() * 3);

    this.logs.push(`--- 模拟路由参数变化 #${this.paramChanges} ---`);
    this.logs.push(`>> 触发路由参数变为 ${newId}`);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: newId },
      queryParamsHandling: 'merge',
    });
  }
}
