import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import mermaid from 'mermaid';

@Component({
  selector: 'app-mermaid-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mermaid-container" [class.error]="hasError">
      <div #mermaidContainer class="mermaid-wrapper"></div>
      <div *ngIf="hasError" class="mermaid-error-message">
        {{ errorMessage || '图表渲染失败，请检查语法' }}
      </div>
      <div *ngIf="isLoading" class="mermaid-loading">
        图表渲染中...
      </div>
    </div>
  `,
  styles: [`
    .mermaid-container {
      margin: 1rem 0;
      text-align: center;
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: var(--radius);
      border: 1px solid var(--border-color);
      position: relative;
      overflow: visible;
      min-height: 100px;
      contain: layout style;
      will-change: contents;
      box-sizing: border-box;
      transform: translateZ(0);
    }
    
    .mermaid-wrapper {
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .mermaid-wrapper svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
      opacity: 1;
      transition: opacity 0.2s ease;
      font-family: 'Trebuchet MS', Verdana, Arial, sans-serif !important;
    }
    
    .mermaid-wrapper svg text {
      font-family: 'Trebuchet MS', Verdana, Arial, sans-serif !important;
      font-size: 14px !important;
      fill: currentColor !important;
      dominant-baseline: central !important;
      text-anchor: middle !important;
    }
    
    .mermaid-wrapper svg .nodeLabel,
    .mermaid-wrapper svg .edgeLabel {
      font-family: 'Trebuchet MS', Verdana, Arial, sans-serif !important;
      dominant-baseline: central !important;
      text-anchor: middle !important;
    }
    
    .mermaid-wrapper svg .node text {
      dominant-baseline: central !important;
      text-anchor: middle !important;
    }
    
    .mermaid-wrapper svg .edgePath text {
      dominant-baseline: central !important;
      text-anchor: middle !important;
    }
    
    .mermaid-wrapper svg .titleText {
      dominant-baseline: central !important;
      text-anchor: middle !important;
    }
    
    .mermaid-error-message {
      color: var(--text-secondary);
      font-style: italic;
      padding: 1rem;
      text-align: center;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .mermaid-loading {
      color: var(--text-secondary);
      font-style: italic;
      padding: 1rem;
      text-align: center;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .error .mermaid-wrapper {
      display: none;
    }
    
    /* 隐藏可能的错误SVG */
    .mermaid-wrapper svg[aria-roledescription="error"],
    .mermaid-wrapper svg[data-error="true"],
    .mermaid-wrapper .error-svg {
      display: none !important;
      position: absolute !important;
      left: -9999px !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
  `]
})
export class MermaidDiagramComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() diagramCode: string = '';
  @Input() diagramId: string = '';
  
  @ViewChild('mermaidContainer', { static: true }) mermaidContainer!: ElementRef<HTMLDivElement>;
  
  isLoading = false;
  hasError = false;
  errorMessage = '';
  
  private observer: MutationObserver | null = null;
  
  ngOnInit() {
    // 初始化 mermaid 配置
    mermaid.initialize({
      startOnLoad: false, // 禁用自动加载
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      },
      fontFamily: 'Trebuchet MS, Verdana, Arial, sans-serif',
      logLevel: 4, // 降低日志级别
      suppressErrorRendering: false // 允许错误渲染以便捕获
    });
  }
  
  ngAfterViewInit() {
    if (this.diagramCode) {
      this.renderDiagram();
    }
  }
  
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  
  async renderDiagram() {
    if (!this.mermaidContainer?.nativeElement) {
      return;
    }
    
    // 清理容器
    this.clearContainer();
    
    // 设置加载状态
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    
    try {
      // 确保 diagramId 是唯一的
      const uniqueId = this.diagramId || `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // 使用 mermaid.render 手动渲染
      const { svg, bindFunctions } = await mermaid.render(uniqueId, this.diagramCode);
      
      // 渲染成功
      this.isLoading = false;
      this.hasError = false;
      
      // 将 SVG 插入到容器中
      if (this.mermaidContainer.nativeElement) {
        this.mermaidContainer.nativeElement.innerHTML = svg;
        
        // 绑定交互函数（如果有的话）
        if (bindFunctions) {
          bindFunctions(this.mermaidContainer.nativeElement);
        }
        
        // 设置 SVG 样式类
        const svgElement = this.mermaidContainer.nativeElement.querySelector('svg');
        if (svgElement) {
          svgElement.classList.add('mermaid-svg');
        }
      }
    } catch (error: any) {
      console.error('Mermaid渲染错误:', error);
      
      // 设置错误状态
      this.isLoading = false;
      this.hasError = true;
      this.errorMessage = error.message || '图表渲染失败';
    }
  }
  
  private clearContainer() {
    if (this.mermaidContainer?.nativeElement) {
      // 清空容器内容
      this.mermaidContainer.nativeElement.innerHTML = '';
      
      // 移除可能存在的错误类
      this.mermaidContainer.nativeElement.classList.remove('error');
    }
  }
  
  /**
   * 更新图表代码并重新渲染
   */
  updateDiagram(newDiagramCode: string) {
    this.diagramCode = newDiagramCode;
    this.renderDiagram();
  }
}