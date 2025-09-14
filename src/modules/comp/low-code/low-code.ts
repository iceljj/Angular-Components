import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FormsModule} from '@angular/forms';

// 组件类型接口
interface ComponentItem
{
  type: string;
  name: string;
  properties: any;
  animationState: 'initial' | 'enter' | 'pulse';
}

@Component({
  selector: 'app-low-code',
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './low-code.html',
  styleUrl: './low-code.scss',
  animations: [
    trigger('componentAnimation', [
      state('initial', style({opacity: 1, transform: 'translateY(0)'})),
      state('enter', style({opacity: 0, transform: 'translateY(10px)'})),
      state('pulse', style({transform: 'scale(1.05)'})),
      transition('initial => enter', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')),
      transition('enter => initial', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')),
      transition('initial => pulse', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')),
      transition('pulse => initial', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ])
  ]
})
export class LowCode
{
  @ViewChild('canvas') canvas!: ElementRef;

  // 组件库
  components = [
    {id: 1, name: '按钮', icon: 'widgets', type: 'button', width: 100, height: 40, color: '#3f51b5'},
    {id: 2, name: '文本框', icon: 'text_fields', type: 'input', width: 200, height: 40, color: '#4caf50'},
    {id: 3, name: '图片', icon: 'image', type: 'image', width: 150, height: 150, color: '#f44336'},
    {id: 4, name: '卡片', icon: 'dashboard', type: 'card', width: 250, height: 180, color: '#ff9800'},
    {id: 5, name: '开关', icon: 'toggle_on', type: 'toggle', width: 60, height: 30, color: '#9c27b0'},
    {id: 6, name: '滑块', icon: 'tune', type: 'slider', width: 200, height: 40, color: '#00bcd4'}
  ];

  // 画布上的组件
  canvasComponents: any[] = [];

  // 当前选中的组件
  selectedComponent: any = null;

  // 设备预览设置
  devicePreview = 'iphone-x';
  deviceOptions = [
    {id: 'iphone-x', name: 'iPhone X'},
    {id: 'samsung-s10', name: 'Samsung S10'},
    {id: 'pixel-5', name: 'Pixel 5'},
    {id: 'responsive', name: '响应式'}
  ];

  // 缩放级别
  zoomLevel = 100;

  constructor(private renderer: Renderer2)
  {
  }

  ngAfterViewInit()
  {
    // 添加初始网格线
    this.addGridLines();
  }

  // 添加网格线
  addGridLines()
  {
    const canvas = this.canvas.nativeElement;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const gridSize = 20;

    // 创建网格线
    for (let x = 0; x <= width; x += gridSize)
    {
      const line = this.renderer.createElement('div');
      this.renderer.setStyle(line, 'position', 'absolute');
      this.renderer.setStyle(line, 'left', `${x}px`);
      this.renderer.setStyle(line, 'top', '0');
      this.renderer.setStyle(line, 'width', '1px');
      this.renderer.setStyle(line, 'height', '100%');
      this.renderer.setStyle(line, 'background', 'rgba(0, 0, 0, 0.05)');
      this.renderer.setStyle(line, 'z-index', '0');
      this.renderer.appendChild(canvas, line);
    }

    for (let y = 0; y <= height; y += gridSize)
    {
      const line = this.renderer.createElement('div');
      this.renderer.setStyle(line, 'position', 'absolute');
      this.renderer.setStyle(line, 'left', '0');
      this.renderer.setStyle(line, 'top', `${y}px`);
      this.renderer.setStyle(line, 'width', '100%');
      this.renderer.setStyle(line, 'height', '1px');
      this.renderer.setStyle(line, 'background', 'rgba(0, 0, 0, 0.05)');
      this.renderer.setStyle(line, 'z-index', '0');
      this.renderer.appendChild(canvas, line);
    }
  }

  // 拖拽开始
  dragStart(event: any, component: any)
  {
    event.dataTransfer.setData('component', JSON.stringify(component));
  }

  // 拖拽结束
  dragEnd(event: any)
  {
    event.preventDefault();
  }

  // 拖拽放置
  drop(event: any)
  {
    event.preventDefault();
    const componentData = JSON.parse(event.dataTransfer.getData('component'));

    // 计算在画布中的位置
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 创建新组件实例
    const newComponent = {
      ...componentData,
      id: Date.now(),
      x: x - componentData.width / 2,
      y: y - componentData.height / 2,
      props: this.getDefaultProps(componentData.type)
    };

    this.canvasComponents.push(newComponent);
    this.selectedComponent = newComponent;
  }

  // 获取组件的默认属性
  getDefaultProps(type: string): any
  {
    switch (type)
    {
      case 'button':
        return {text: '按钮', color: '#3f51b5', fontSize: 14};
      case 'input':
        return {placeholder: '请输入...', value: ''};
      case 'image':
        return {src: 'https://via.placeholder.com/150', alt: '图片'};
      case 'card':
        return {title: '卡片标题', content: '卡片内容', backgroundColor: '#ffffff'};
      case 'toggle':
        return {checked: false};
      case 'slider':
        return {value: 50, min: 0, max: 100};
      default:
        return {};
    }
  }

  // 选择组件
  selectComponent(component: any)
  {
    this.selectedComponent = component;
  }

  // 更新组件属性
  updateComponentProperty(property: string, value: any)
  {
    if (this.selectedComponent)
    {
      this.selectedComponent.props[property] = value;
    }
  }

  // 删除组件
  deleteComponent()
  {
    if (this.selectedComponent)
    {
      const index = this.canvasComponents.indexOf(this.selectedComponent);
      if (index !== -1)
      {
        this.canvasComponents.splice(index, 1);
        this.selectedComponent = null;
      }
    }
  }

  // 复制组件
  duplicateComponent()
  {
    if (this.selectedComponent)
    {
      const newComponent = {
        ...this.selectedComponent,
        id: Date.now(),
        x: this.selectedComponent.x + 20,
        y: this.selectedComponent.y + 20
      };
      this.canvasComponents.push(newComponent);
      this.selectedComponent = newComponent;
    }
  }

  // 保存设计
  saveDesign()
  {
    const design = {
      components: this.canvasComponents,
      createdAt: new Date()
    };
    console.log('保存设计:', design);
    alert('设计已保存！');
  }

  // 预览设计
  previewDesign()
  {
    alert('预览功能将在新窗口中打开');
  }

  // 导出代码
  exportCode()
  {
    alert('导出HTML/CSS代码功能');
  }

  // 改变设备预览
  changeDevice(deviceId: string)
  {
    this.devicePreview = deviceId;
  }

  // 调整缩放
  changeZoom(direction: 'in' | 'out')
  {
    if (direction === 'in' && this.zoomLevel < 150)
    {
      this.zoomLevel += 10;
    } else if (direction === 'out' && this.zoomLevel > 50)
    {
      this.zoomLevel -= 10;
    }
  }
}
