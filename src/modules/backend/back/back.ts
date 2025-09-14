import { Component, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

/**
 * 后台管理系统首页组件
 *
 * 该组件实现了企业级管理系统的首页界面，包括左侧导航、顶部栏、主内容区和右侧边栏。
 * 主内容区包含数据概览、常用功能和最近操作记录等模块。
 */
@Component({
  selector: 'app-back',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  templateUrl: './back.html',
  styleUrls: ['./back.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Back implements OnInit {
  /**
   * 指标数据
   */
  metrics = [
    {
      title: '总销售额',
      value: '¥128,569',
      trend: { value: '12%', direction: 'up', period: '较上月' },
      chartId: 'chart-1',
      color: '#1E5DFF'
    },
    {
      title: '访问量',
      value: '8,458',
      trend: { value: '3.5%', direction: 'down', period: '较上周' },
      chartId: 'chart-2',
      color: '#54C0F8'
    },
    {
      title: '订单量',
      value: '2,134',
      trend: { value: '8.1%', direction: 'up', period: '较上月' },
      chartId: 'chart-3',
      color: '#36CBCB'
    },
    {
      title: '新增用户',
      value: '683',
      trend: { value: '15.3%', direction: 'up', period: '较上周' },
      chartId: 'chart-4',
      color: '#9DC6F8'
    }
  ];

  /**
   * 常用功能列表
   */
  quickEntries = [
    { icon: 'mdi:account-plus', name: '新增用户' },
    { icon: 'mdi:package-variant', name: '产品上架' },
    { icon: 'mdi:shopping', name: '订单处理' },
    { icon: 'mdi:chart-bar', name: '数据统计' },
    { icon: 'mdi:message-processing', name: '消息通知' },
    { icon: 'mdi:cog-outline', name: '系统设置' }
  ];

  /**
   * 最近操作记录
   */
  recentActivities = [
    {
      title: '修改商品库存信息',
      time: '2025/09/12 14:25',
      description: '更新产品 [企业版软件授权] 库存从 152 件到 140 件',
      status: 'success'
    },
    {
      title: '订单发货处理',
      time: '2025/09/12 10:18',
      description: '订单 #ORD-20250912-085 已发货',
      status: 'success'
    },
    {
      title: '新增营销活动',
      time: '2025/09/11 16:42',
      description: '创建了 [新用户优惠活动]',
      status: 'warning'
    },
    {
      title: '更新用户权限',
      time: '2025/09/11 09:15',
      description: '为 [王经理] 分配了财务权限',
      status: 'success'
    }
  ];

  /**
   * 系统公告
   */
  announcements = [
    {
      tag: '重要',
      title: '系统维护通知',
      content: '本周末（9/15 02:00-06:00）进行系统维护，请提前安排工作',
      tagStyle: {}
    },
    {
      tag: '公告',
      title: '新功能上线通知',
      content: '订单导出功能优化版本已发布，支持更多导出格式',
      tagStyle: { background: 'rgba(250, 173, 20, 0.1)', color: '#faad14' }
    },
    {
      tag: '推荐',
      title: '中秋假期安排',
      content: '中秋节期间客服值班安排已更新，请查看详情',
      tagStyle: { background: 'rgba(82, 196, 26, 0.1)', color: '#52c41a' }
    }
  ];

  /**
   * 待办事项
   */
  todos = [
    { text: '处理客户退款申请', dueDate: '紧急', checked: false },
    { text: '编写季度销售报告', dueDate: '2天后', checked: false },
    { text: '新员工权限配置', dueDate: '需完成', checked: false },
    { text: '财务对账数据核对', dueDate: '本周', checked: false }
  ];

  /**
   * 当前激活的菜单项
   */
  activeMenuItem = '控制台';

  /**
   * 图表容器引用
   */
  @ViewChild('chartContainer1') chartContainer1!: ElementRef;
  @ViewChild('chartContainer2') chartContainer2!: ElementRef;
  @ViewChild('chartContainer3') chartContainer3!: ElementRef;
  @ViewChild('chartContainer4') chartContainer4!: ElementRef;

  /**
   * 组件初始化时调用的方法
   * 初始化所有图表
   */
  ngOnInit(): void {
    this.initCharts();
  }

  /**
   * 初始化图表
   * 使用ECharts创建指标卡片中的小图表
   */
  private initCharts(): void {
    const chartContainers = [
      this.chartContainer1,
      this.chartContainer2,
      this.chartContainer3,
      this.chartContainer4
    ];

    this.metrics.forEach((metric, index) => {
      if (chartContainers[index] && chartContainers[index].nativeElement) {
        const chart = echarts.init(chartContainers[index].nativeElement);
        
        chart.setOption({
          grid: { top: 0, left: 0, right: 0, bottom: 0 },
          xAxis: { show: false, type: 'category' },
          yAxis: { show: false, max: 100 },
          series: [{
            type: 'line',
            data: [22, 32, 48, 65, 41, 34, 52, 69, 87, 75, 63, 81],
            smooth: true,
            showSymbol: false,
            lineStyle: { color: metric.color, width: 3 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `${metric.color}33` },
                { offset: 1, color: `${metric.color}00` }
              ])
            }
          }]
        });

        // 响应窗口大小变化
        window.addEventListener('resize', () => {
          chart.resize();
        });
      }
    });
  }

  /**
   * 切换激活的菜单项
   * @param menuItem 菜单项名称
   */
  setActiveMenu(menuItem: string): void {
    this.activeMenuItem = menuItem;
  }

  /**
   * 切换待办事项的选中状态
   * @param index 待办事项索引
   */
  toggleTodo(index: number): void {
    this.todos[index].checked = !this.todos[index].checked;
  }
}
