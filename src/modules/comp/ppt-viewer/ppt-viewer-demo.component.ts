import { Component } from '@angular/core';
import { PptViewerComponent } from './ppt-viewer.component';
import { CommonModule } from '@angular/common';

/**
 * PPT查看器演示组件
 * 
 * 这是一个演示页面，展示PPT在线查看器的完整功能
 * 包含功能说明、使用指南和实际查看器组件
 * 
 * @Component 装饰器配置：
 * - selector: 组件选择器，用于在HTML模板中引用
 * - standalone: 设置为true表示这是一个独立组件
 * - imports: 导入依赖模块，CommonModule提供基础指令，PptViewerComponent是主要功能组件
 * - template: 内联HTML模板，包含演示页面的结构和内容
 * - styleUrls: 外部样式文件路径
 */
@Component({
  selector: 'app-ppt-viewer-demo',
  standalone: true,
  imports: [CommonModule, PptViewerComponent],
  template: `
    <!-- 演示容器 -->
    <div class="demo-container">
      <!-- 页面标题 -->
      <h1>PPT在线查看器演示</h1>
      <!-- 简要描述 -->
      <p>这是一个功能完整的PPTX文件在线查看器，支持分页导航、缩放、全屏等功能。</p>
      
      <!-- 功能特性介绍区域 -->
      <div class="features">
        <h2>主要功能</h2>
        <ul>
          <li>支持 .pptx 文件格式</li>
          <li>分页导航（上一页/下一页/缩略图导航）</li>
          <li>缩放功能（放大/缩小/重置）</li>
          <li>全屏显示</li>
          <li>加载进度显示</li>
          <li>错误处理</li>
        </ul>
      </div>
      
      <!-- 查看器展示区域 -->
      <div class="viewer-wrapper">
        <h2>PPT查看器</h2>
        <!-- 嵌入实际的PPT查看器组件 -->
        <app-ppt-viewer></app-ppt-viewer>
      </div>
      
      <!-- 使用说明区域 -->
      <div class="instructions">
        <h2>使用说明</h2>
        <ol>
          <li>点击"选择文件"按钮或拖拽PPTX文件到上传区域</li>
          <li>等待文件加载完成</li>
          <li>使用工具栏按钮进行导航和缩放操作</li>
          <li>点击"全屏"按钮进入全屏模式</li>
        </ol>
      </div>
    </div>
  `,
  styleUrls: ['./ppt-viewer-demo.component.scss']
})
/**
 * PPT查看器演示组件类
 * 
 * 这是一个简单的演示容器组件，主要负责：
 * - 展示PPT查看器的功能特性
 * - 提供使用说明文档
 * - 嵌入实际的PPT查看器组件进行功能演示
 * 
 * 组件本身不包含复杂的业务逻辑，主要作为展示和测试用途
 */
export class PptViewerDemoComponent {
  /**
   * 构造函数
   * 当前组件不需要特殊初始化逻辑
   */
  constructor() { }
}