import { Component } from '@angular/core';
import { PptViewerDemoComponent } from './ppt-viewer-demo.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ppt-viewer-usage',
  standalone: true,
  imports: [CommonModule, PptViewerDemoComponent],
  template: `
    <div class="usage-container">
      <h1>PPT查看器使用示例</h1>
      <p>以下是如何在你的Angular应用中使用PPT查看器组件的示例：</p>
      
      <div class="code-example">
        <h3>1. 导入组件</h3>
        <pre><code>{{importCode}}</code></pre>
        
        <h3>2. 在模板中使用</h3>
        <pre><code>{{templateCode}}</code></pre>
        
        <h3>3. 设置容器高度</h3>
        <pre><code>{{styleCode}}</code></pre>
      </div>
      
      <h2>实时演示</h2>
      <p>下面是PPT查看器的实际演示：</p>
      <app-ppt-viewer-demo></app-ppt-viewer-demo>
    </div>
  `,
  styleUrls: ['./usage-example.component.scss']
})
export class PptViewerUsageComponent {
  importCode = `import { PptViewerComponent } from './path/to/ppt-viewer/ppt-viewer.component';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [PptViewerComponent],
  // ...
})
export class YourComponent {
  // Your component logic
}`;

  templateCode = `<app-ppt-viewer></app-ppt-viewer>`;

  styleCode = `.your-container {
  height: 70vh; // 或其他合适的高度
}`;
}