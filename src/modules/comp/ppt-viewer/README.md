# PPT 在线查看器 (PPT Viewer)

## 简介

这是一个基于Angular Standalone组件的PPT在线查看器，支持解析和显示PPTX文件。该组件提供了完整的PPT查看功能，包括分页导航、缩放、全屏显示等。

## 功能特性

- 支持 .pptx 文件格式解析
- 分页导航（上一页/下一页/缩略图导航）
- 缩放功能（放大/缩小/重置）
- 全屏显示模式
- 加载进度显示
- 错误处理机制
- 响应式设计，适配移动端

## 安装依赖

在使用此组件之前，需要安装以下依赖：

```bash
cnpm install pptx-preview
```

## 使用方法

### 1. 导入组件

```typescript
import { PptViewerComponent } from './path/to/ppt-viewer/ppt-viewer.component';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [PptViewerComponent],
  template: `
    <app-ppt-viewer></app-ppt-viewer>
  `
})
export class YourComponent {
  // Your component logic
}
```

### 2. 在模板中使用

```html
<app-ppt-viewer></app-ppt-viewer>
```

### 3. 设置容器高度

为了正确显示PPT查看器，需要为其容器设置适当的高度：

```scss
.your-container {
  height: 70vh; // 或其他合适的高度
}
```

## API

### 输入属性

该组件目前没有输入属性。

### 输出事件

该组件目前没有输出事件。

### 方法

该组件的所有方法都是内部使用的，不需要外部调用。

## 样式定制

可以通过覆盖以下CSS类来自定义组件样式：

- `.ppt-viewer-container` - 主容器
- `.upload-section` - 文件上传区域
- `.viewer-section` - 查看器区域
- `.toolbar` - 工具栏
- `.slides-container` - 幻灯片容器
- `.ppt-container` - PPT内容容器

## 注意事项

1. 该组件仅支持 .pptx 格式的文件，不支持旧版 .ppt 文件
2. 建议文件大小不超过50MB以获得最佳性能
3. 组件会自动处理文件加载超时（5分钟）
4. 组件具有基本的错误处理机制，会在加载失败时显示错误信息

## 技术实现

该组件基于以下技术实现：

- Angular Standalone Components
- pptx-preview 库用于解析PPTX文件
- CSS3 Transform 实现缩放功能
- Fullscreen API 实现全屏显示
- 响应式设计适配不同屏幕尺寸

## 浏览器兼容性

- Chrome 60+
- Firefox 64+
- Safari 12+
- Edge 79+

## 更新日志

### v1.0.0
- 初始版本
- 实现基本的PPTX文件查看功能
- 支持分页导航、缩放、全屏显示