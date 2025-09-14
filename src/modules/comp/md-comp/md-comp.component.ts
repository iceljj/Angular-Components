import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// 第三方库导入
import { marked } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';
import mermaid from 'mermaid';

// 自定义组件导入
import { MermaidDiagramComponent } from './mermaid-diagram.component';

interface ToolbarAction {
  name: string;
  icon: string;
  action: () => void;
  shortcut?: string;
}

@Component({
  selector: 'app-md-comp',
  standalone: true,
  imports: [CommonModule, FormsModule, MermaidDiagramComponent],
  templateUrl: './md-comp.component.html',
  styleUrl: './md-comp.component.scss',
})
export class MdCompComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editor', { static: false }) editorRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('preview', { static: false }) previewRef!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput', { static: false }) fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('notionEditor', { static: false }) notionEditorRef!: ElementRef<HTMLDivElement>;

  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef); // 注入ChangeDetectorRef
  private languageChangeListener!: (event: Event) => void; // 添加languageChangeListener属性定义
  currentCodeTheme = 'github'; // 当前代码高亮主题（公开以便模板使用）

  // 支持的编程语言列表
  readonly availableLanguages = [
    { value: 'javascript', name: 'JavaScript', icon: '🟨' },
    { value: 'typescript', name: 'TypeScript', icon: '🔷' },
    { value: 'java', name: 'Java', icon: '☕' },
    { value: 'python', name: 'Python', icon: '🐍' },
    { value: 'csharp', name: 'C#', icon: '🔵' },
    { value: 'cpp', name: 'C++', icon: '⚙️' },
    { value: 'c', name: 'C', icon: '📘' },
    { value: 'go', name: 'Go', icon: '🐹' },
    { value: 'rust', name: 'Rust', icon: '🦀' },
    { value: 'php', name: 'PHP', icon: '🐘' },
    { value: 'ruby', name: 'Ruby', icon: '💎' },
    { value: 'swift', name: 'Swift', icon: '🦉' },
    { value: 'kotlin', name: 'Kotlin', icon: '🎯' },
    { value: 'dart', name: 'Dart', icon: '🎪' },
    { value: 'html', name: 'HTML', icon: '🌐' },
    { value: 'css', name: 'CSS', icon: '🎨' },
    { value: 'scss', name: 'SCSS', icon: '💅' },
    { value: 'json', name: 'JSON', icon: '📋' },
    { value: 'xml', name: 'XML', icon: '📄' },
    { value: 'yaml', name: 'YAML', icon: '📝' },
    { value: 'sql', name: 'SQL', icon: '🗄️' },
    { value: 'bash', name: 'Bash', icon: '💻' },
    { value: 'powershell', name: 'PowerShell', icon: '🔵' },
    { value: 'dockerfile', name: 'Dockerfile', icon: '🐳' },
    { value: 'markdown', name: 'Markdown', icon: '📖' }
  ];

  // 编辑器状态
  markdownContent = `# 🌟 Markdown 可视化编辑器

欢迎使用功能强大的 Markdown 编辑器！

## ✨ 功能特性

- ✅ **实时预览** - 左侧编辑，右侧即时渲染
- ✅ **代码高亮** - 支持多种编程语言和主题切换
- ✅ **数学公式** - 支持 LaTeX 语法
- ✅ **图片上传** - 拖拽上传，自动插入
- ✅ **主题切换** - 深色/浅色模式
- ✅ **快捷键** - 提升编辑效率
- ✅ **流程图** - 支持 Mermaid 图表渲染

## 🎨 代码高亮主题切换

现在每个代码块都有独立的主题选择器，支持多种配色方案：

### JavaScript 示例
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome to Markdown Editor\`;
}

// 支持的主题包括：
// GitHub, VS Code Dark, Monokai, Solarized, 
// Atom One Dark, Dracula, Nord 等
const themes = ['github', 'vs2015', 'monokai', 'dracula'];
themes.forEach(theme => console.log(\`主题: \${theme}\`));
\`\`\`

### Python 示例
\`\`\`python
def calculate_fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# 测试代码高亮效果
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
\`\`\`

### CSS 样式示例
\`\`\`css
/* 响应式设计 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}
\`\`\`

## 📊 Mermaid 流程图示例

使用 Mermaid 语法可以轻松创建各种图表：

\`\`\`mermaid
graph TD
    A[开始] --> B[初始化]
    B --> C{条件判断}
    C -->|条件1| D[执行操作1]
    C -->|条件2| E[执行操作2]
    D --> F[合并]
    E --> F
    F --> G[结束]
\`\`\`

\`\`\`mermaid
pie title 产品销售分布
    "产品A" : 38.2
    "产品B" : 25.7
    "产品C" : 19.3
    "产品D" : 16.8
\`\`\`

## 📊 数学公式

行内公式：$E = mc^2$

块级公式：
$$
\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n
$$

## 📝 表格示例

| 功能 | 状态 | 描述 |
|------|------|------|
| 实时预览 | ✅ | 支持 |
| 代码高亮 | ✅ | 多主题切换 |
| 数学公式 | ✅ | LaTeX 支持 |
| 主题切换 | ✅ | 深色/浅色 |
| Mermaid图表 | ✅ | 流程图、饼图等 |

> 💡 **提示**: 
> 1. 在每个代码块的右上角选择不同的高亮主题
> 2. 工具栏中的"🎨 代码配色"可以全局切换主题
> 3. 拖拽图片到编辑器中可以快速插入图片！
> 4. 保存和导出时会保留您选择的代码主题`;

  renderedHtml: SafeHtml = '';
  isDarkTheme = false;
  isPreviewMode = false;
  isFullscreen = false;
  fontSize = 16; // 默认字体大小
  isNotionMode = false; // Notion式实时渲染模式
  notionHtml: SafeHtml = ''; // Notion编辑器的HTML内容
  private isComposing = false; // 输入法输入状态标记
  isThemeSelectorOpen = false; // 主题选择器开启状态

  // 工具栏配置
  toolbarActions: ToolbarAction[] = [
    { name: '粗体', icon: '𝐁', action: () => this.insertMarkdown('**', '**'), shortcut: 'Ctrl+B' },
    { name: '斜体', icon: '𝐼', action: () => this.insertMarkdown('*', '*'), shortcut: 'Ctrl+I' },
    { name: '删除线', icon: '𝖲', action: () => this.insertMarkdown('~~', '~~') },
    { name: '标题', icon: 'H', action: () => this.insertMarkdown('# ') },
    { name: '引用', icon: '❝', action: () => this.insertMarkdown('> ') },
    { name: '代码', icon: '⟨⟩', action: () => this.insertMarkdown('`', '`') },
    { name: '代码块', icon: '▣', action: () => this.insertCodeBlock() },
    { name: 'Mermaid图表', icon: '📊', action: () => this.insertMermaidDiagram() },
    { name: '链接', icon: '🔗', action: () => this.insertLink() },
    { name: '图片', icon: '🖼', action: () => this.insertImage() },
    { name: '表格', icon: '▦', action: () => this.insertTable() },
    { name: '列表', icon: '≡', action: () => this.insertMarkdown('- ') },
    { name: '数学公式', icon: '𝑓', action: () => this.insertMath() },
  ];

  ngOnInit() {
    this.setupMarked();
    this.renderMarkdown();
    // 检查本地存储中的主题偏好
    const savedTheme = localStorage.getItem('markdown-theme');
    if (savedTheme === 'dark') {
      this.toggleTheme(true); // 传入true以避免反转初始状态
    }

    // 检查保存的字体大小
    const savedFontSize = localStorage.getItem('markdown-font-size');
    if (savedFontSize) {
      this.fontSize = parseInt(savedFontSize, 10);
      this.applyFontSize();
    }

    // 检查保存的代码主题
    const savedCodeTheme = localStorage.getItem('markdown-code-theme');
    if (savedCodeTheme) {
      this.currentCodeTheme = savedCodeTheme;
      this.switchCodeTheme(savedCodeTheme);
    }
  }

  // 在现有属性中添加scrollSyncEnabled
  scrollSyncEnabled = true; // 控制是否启用滚动同步
  private isSyncingScroll = false; // 防止滚动事件循环调用

  ngAfterViewInit() {
    this.setupDragAndDrop();
    this.setupKeyboardShortcuts();
    this.setupInputMethodEvents(); // 设置输入法相关事件
    this.setupScrollSync(); // 设置滚动同步
    this.setupThemeSelector(); // 设置主题选择器
    this.setupClickOutside(); // 设置点击外部关闭功能
    
    // 将组件实例暴露到全局，以便代码块中的下拉选择器可以调用
    (window as any).mdEditor = this;
  }

  // 设置主题选择器事件监听
  private setupThemeSelector() {
    // 保存监听器引用以便后续移除
    this.languageChangeListener = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { theme, element } = customEvent.detail;
      // 切换代码高亮主题
      this.switchCodeTheme(theme);
    };

    // 使用事件委托监听主题变化事件
    this.previewRef?.nativeElement.addEventListener('themeChange', this.languageChangeListener);
  }

  /**
   * 处理代码主题变化事件
   * 当用户在下拉选择器中选择不同主题时的处理逻辑
   * @param event 选择器变化事件
   */
  onCodeThemeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newTheme = select.value;
    this.switchCodeTheme(newTheme);
  }

  /**
   * 获取当前代码主题名称
   * 返回当前选中的代码高亮主题的显示名称
   */
  getCurrentCodeThemeName(): string {
    // 简化为直接返回主题名称
    const themeNames: { [key: string]: string } = {
      'github': 'GitHub',
      'vs2015': 'VS Code Dark',
      'monokai': 'Monokai',
      'solarized-dark': 'Solarized Dark',
      'solarized-light': 'Solarized Light',
      'atom-one-dark': 'Atom One Dark',
      'atom-one-light': 'Atom One Light',
      'dracula': 'Dracula',
      'nord': 'Nord',
      'tomorrow-night': 'Tomorrow Night'
    };
    return themeNames[this.currentCodeTheme] || this.currentCodeTheme;
  }

  /**
   * 获取适合当前界面主题的代码主题
   * 根据当前界面是否为深色主题，返回适合的代码高亮主题
   */
  getRecommendedCodeTheme(): string {
    // 简化为直接根据主题返回推荐主题
    return this.isDarkTheme ? 'vs2015' : 'github';
  }

  /**
   * 切换主题选择器显示状态
   * 开启或关闭全局主题选择下拉菜单
   */
  toggleThemeSelector() {
    this.isThemeSelectorOpen = !this.isThemeSelectorOpen;
  }

  /**
   * 关闭主题选择器
   * 关闭全局主题选择下拉菜单
   */
  closeThemeSelector() {
    this.isThemeSelectorOpen = false;
  }

  /**
   * 设置点击外部关闭功能
   * 当用户点击主题选择器外部时关闭下拉菜单
   */
  private setupClickOutside() {
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      const wrapper = document.querySelector('.theme-selector-wrapper');
      
      if (wrapper && !wrapper.contains(target) && this.isThemeSelectorOpen) {
        this.closeThemeSelector();
        this.cdr.detectChanges(); // 手动触发变化检测
      }
    });
  }

  /**
   * 选择全局主题
   * 设置全局代码高亮主题，影响所有代码块
   * @param theme 主题名称
   */
  selectGlobalTheme(theme: string) {
    this.switchCodeTheme(theme);
    this.closeThemeSelector();
  }

  /**
   * 改变代码块语言（替代原有的主题切换功能）
   * 修改指定代码块的语言类型并重新高亮，同时同步更新编辑区域的内容
   * @param selectElement 选择器元素
   * @param originalLanguage 原始语言
   */
  changeCodeLanguage(selectElement: HTMLSelectElement, originalLanguage: string) {
    const newLanguage = selectElement.value;
    const codeBlock = selectElement.closest('.code-block-container');
    
    console.log(`开始切换代码块语言: ${originalLanguage} -> ${newLanguage}`);
    
    if (codeBlock && newLanguage !== originalLanguage) {
      const codeElement = codeBlock.querySelector('code');
      const preElement = codeBlock.querySelector('pre');
      const blockIndex = codeBlock.getAttribute('data-block-index');
      
      if (codeElement && preElement) {
        // 获取纯文本代码内容（去除HTML标签）
        const codeContent = codeElement.textContent || '';
        console.log(`代码块索引: ${blockIndex}, 代码内容长度: ${codeContent.length}`);
        
        // 1. 更新渲染区域的显示
        // 更新语言类
        codeElement.className = `hljs language-${newLanguage}`;
        
        // 更新语言标签
        const languageLabel = codeBlock.querySelector('.code-language');
        if (languageLabel) {
          const languageInfo = this.availableLanguages.find(lang => lang.value === newLanguage);
          languageLabel.textContent = languageInfo ? `${languageInfo.icon} ${languageInfo.name}` : newLanguage.toUpperCase();
        }
        
        // 重新进行语法高亮
        try {
          const highlighted = hljs.highlight(codeContent, { language: newLanguage }).value;
          codeElement.innerHTML = highlighted;
        } catch (e) {
          console.warn(`无法为语言 ${newLanguage} 进行语法高亮:`, e);
        }
        
        // 2. 同步更新编辑区域的Markdown内容
        this.updateMarkdownLanguage(originalLanguage, newLanguage, codeContent, parseInt(blockIndex || '0'));
        
        // 3. 显示同步成功的视觉反馈
        this.showSyncFeedback(codeBlock, newLanguage);
        
        console.log(`代码块语言从 ${originalLanguage} 更改为: ${newLanguage}，已同步到编辑区域`);
      }
    } else {
      console.log('语言没有变化或找不到代码块容器');
    }
  }

  /**
   * 更新Markdown编辑区域中的代码块语言标识
   * 将编辑器中对应的代码块语言标识同步更新
   * @param oldLanguage 原始语言标识
   * @param newLanguage 新的语言标识
   * @param codeContent 代码内容（用于精确匹配）
   * @param blockIndex 代码块索引（用于精确定位）
   */
  private updateMarkdownLanguage(oldLanguage: string, newLanguage: string, codeContent: string, blockIndex: number = 0) {
    console.log(`开始更新Markdown内容: ${oldLanguage} -> ${newLanguage}, 索引: ${blockIndex}`);
    console.log('原始Markdown内容长度:', this.markdownContent.length);
    
    let updatedContent = this.markdownContent;
    let matchCount = 0;
    let targetFound = false;
    
    // 使用索引进行精确匹配：查找第N个相同语言的代码块
    const codeBlockPattern = new RegExp(
      `(\`\`\`${oldLanguage}\\s*\\n)([\\s\\S]*?)(\\n\`\`\`)`,
      'gi'
    );
    
    console.log('使用的正则表达式:', codeBlockPattern.source);
    
    // 查找所有匹配的代码块
    let allMatches = [];
    let match;
    const tempPattern = new RegExp(codeBlockPattern.source, codeBlockPattern.flags);
    while ((match = tempPattern.exec(this.markdownContent)) !== null) {
      allMatches.push({
        fullMatch: match[0],
        index: match.index,
        content: match[2].trim(),
        matchIndex: allMatches.length
      });
    }
    
    console.log(`找到 ${allMatches.length} 个 ${oldLanguage} 代码块`, allMatches.map(m => ({ index: m.matchIndex, contentLength: m.content.length })));
    
    // 替换目标索引的代码块
    updatedContent = updatedContent.replace(codeBlockPattern, (match, openTag, content, closeTag) => {
      const currentIndex = matchCount++;
      console.log(`检查代码块 ${currentIndex}, 内容长度: ${content.trim().length}`);
      
      // 检查是否是目标代码块（按索引匹配）
      if (currentIndex === blockIndex) {
        targetFound = true;
        console.log(`▶️ 找到目标代码块（索引: ${blockIndex}），更新语言从 ${oldLanguage} 到 ${newLanguage}`);
        return `\`\`\`${newLanguage}\n${content}${closeTag}`;
      }
      return match; // 不是目标则保持原样
    });
    
    // 如果没有找到目标索引，尝试内容匹配作为备选方案
    if (!targetFound) {
      console.warn(`没有找到索引 ${blockIndex} 的代码块，尝试内容匹配...`);
      
      // 重置匹配计数器
      matchCount = 0;
      
      updatedContent = this.markdownContent.replace(codeBlockPattern, (match, openTag, content, closeTag) => {
        // 比较代码内容是否匹配（忽略空白字符差异）
        const normalizedContent = content.trim().replace(/\s+/g, ' ');
        const normalizedTarget = codeContent.trim().replace(/\s+/g, ' ');
        
        console.log(`内容匹配检查 ${matchCount}: 内容长度 ${normalizedContent.length} vs ${normalizedTarget.length}`);
        
        if (normalizedContent === normalizedTarget && !targetFound) {
          targetFound = true;
          console.log(`▶️ 通过内容匹配找到目标代码块，更新语言从 ${oldLanguage} 到 ${newLanguage}`);
          return `\`\`\`${newLanguage}\n${content}${closeTag}`;
        }
        matchCount++;
        return match;
      });
    }
    
    // 更新编辑器内容并重新渲染
    if (updatedContent !== this.markdownContent) {
      console.log('✅ Markdown内容已更新，准备重新渲染');
      this.markdownContent = updatedContent;
      
      // 延迟重新渲染，避免与当前操作冲突
      setTimeout(() => {
        console.log('正在重新渲染...');
        this.renderMarkdown();
      }, 100);
    } else {
      console.warn('⚠️ 未找到匹配的代码块，同步失败');
    }
  }

  /**
   * 显示同步反馈的视觉提示
   * 在代码块语言变更后显示短暂的成功提示
   * @param codeBlock 代码块容器元素
   * @param newLanguage 新语言名称
   */
  private showSyncFeedback(codeBlock: Element, newLanguage: string) {
    // 创建提示元素
    const feedback = document.createElement('div');
    feedback.className = 'sync-feedback';
    feedback.innerHTML = `✅ 已同步到编辑区域: ${newLanguage.toUpperCase()}`;
    feedback.style.cssText = `
      position: absolute;
      top: -30px;
      right: 10px;
      background: var(--color-success, #28a745);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    
    // 添加到代码块容器
    const header = codeBlock.querySelector('.code-block-header');
    if (header) {
      const headerElement = header as HTMLElement;
      headerElement.style.position = 'relative';
      headerElement.appendChild(feedback);
      
      // 显示动画
      setTimeout(() => {
        feedback.style.opacity = '1';
      }, 50);
      
      // 2秒后自动隐藏
      setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => {
          if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
          }
        }, 300);
      }, 2000);
    }
  }

  /**
   * 切换代码高亮主题（公开方法，供HTML中的选择器调用）
   * 动态加载不同的highlight.js主题样式
   * @param theme 主题名称
   */
  switchCodeTheme(theme: string) {
    this.currentCodeTheme = theme;
    
    // 移除旧的主题样式
    const existingThemeLink = document.querySelector('link[data-highlight-theme]');
    if (existingThemeLink) {
      existingThemeLink.remove();
    }
    
    // 添加新的主题样式
    const themeLink = document.createElement('link');
    themeLink.rel = 'stylesheet';
    themeLink.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${theme}.min.css`;
    themeLink.setAttribute('data-highlight-theme', theme);
    document.head.appendChild(themeLink);
    
    // 保存主题选择
    localStorage.setItem('markdown-code-theme', theme);
    
    // 重新渲染以应用新主题
    this.renderMarkdown();
  }

  ngOnDestroy() {
    // 清理事件监听器
    document.removeEventListener('keydown', this.handleKeyboardShortcuts);
    if (this.editorRef?.nativeElement) {
      this.editorRef.nativeElement.removeEventListener(
        'compositionstart',
        this.handleCompositionStart,
      );
      this.editorRef.nativeElement.removeEventListener(
        'compositionupdate',
        this.handleCompositionUpdate,
      );
      this.editorRef.nativeElement.removeEventListener('compositionend', this.handleCompositionEnd);
      this.editorRef.nativeElement.removeEventListener('scroll', this.handleEditorScroll);
    }
    if (this.previewRef?.nativeElement && this.languageChangeListener) {
      this.previewRef.nativeElement.removeEventListener('scroll', this.handlePreviewScroll);
      // 清理主题选择器事件监听器
      this.previewRef.nativeElement.removeEventListener(
        'themeChange',
        this.languageChangeListener,
      );
    }
    
    // 清理全局引用
    if ((window as any).mdEditor === this) {
      delete (window as any).mdEditor;
    }
  }

  /**
   * 设置滚动同步
   * 使编辑器和预览区域的滚动保持同步
   */
  private setupScrollSync() {
    const editor = this.editorRef?.nativeElement;
    const preview = this.previewRef?.nativeElement;

    if (editor && preview) {
      editor.addEventListener('scroll', this.handleEditorScroll);
      preview.addEventListener('scroll', this.handlePreviewScroll);
    }
  }

  /**
   * 处理编辑器滚动事件
   * 当编辑器滚动时，同步预览区域的滚动位置
   */
  private handleEditorScroll = () => {
    if (!this.scrollSyncEnabled || this.isSyncingScroll) return;

    const editor = this.editorRef?.nativeElement;
    const preview = this.previewRef?.nativeElement;

    if (editor && preview) {
      this.isSyncingScroll = true;

      // 计算滚动比例
      const editorScrollTop = editor.scrollTop;
      const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
      const scrollRatio = editorScrollHeight > 0 ? editorScrollTop / editorScrollHeight : 0;

      // 应用到预览区域
      const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
      preview.scrollTop = previewScrollHeight * scrollRatio;

      // 重置标志
      setTimeout(() => {
        this.isSyncingScroll = false;
      }, 10);
    }
  };

  /**
   * 处理预览区域滚动事件
   * 当预览区域滚动时，同步编辑器的滚动位置
   */
  private handlePreviewScroll = () => {
    if (!this.scrollSyncEnabled || this.isSyncingScroll) return;

    const editor = this.editorRef?.nativeElement;
    const preview = this.previewRef?.nativeElement;

    if (editor && preview) {
      this.isSyncingScroll = true;

      // 计算滚动比例
      const previewScrollTop = preview.scrollTop;
      const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
      const scrollRatio = previewScrollHeight > 0 ? previewScrollTop / previewScrollHeight : 0;

      // 应用到编辑器区域
      const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
      editor.scrollTop = editorScrollHeight * scrollRatio;

      // 重置标志
      setTimeout(() => {
        this.isSyncingScroll = false;
      }, 10);
    }
  };

  /**
   * 切换滚动同步功能
   * 启用或禁用编辑器和预览区域的滚动同步
   */
  toggleScrollSync() {
    this.scrollSyncEnabled = !this.scrollSyncEnabled;
  }

  /**
   * 配置 marked 解析器
   * 设置 Markdown 解析选项和自定义扩展
   */
  private setupMarked() {
    // 配置 marked，使用更简单的方式避免类型问题
    marked.setOptions({
      breaks: true,   // 转换换行符为 <br>
      gfm: true,      // 启用 GitHub Flavored Markdown
    });

    // 使用扩展来处理自定义渲染
    const customExtension = {
      name: 'customRendering',
      level: 'inline' as const,
      start(src: string) {
        return src.indexOf('$');
      },
      tokenizer(src: string) {
        const rule = /^\$([^$\n]+)\$/;
        const match = rule.exec(src);
        if (match) {
          return {
            type: 'customRendering',
            raw: match[0],
            text: match[1],
          };
        }
        return false;
      },
      renderer(token: any) {
        try {
          return katex.renderToString(token.text, { throwOnError: false, displayMode: false });
        } catch (e) {
          return `<code>$${token.text}$</code>`;
        }
      },
    };

    marked.use({ extensions: [customExtension] });
  }

  /**
   * 设置拖拽上传功能
   * 允许用户通过拖拽文件到编辑器区域来上传图片
   */
  private setupDragAndDrop() {
    const editor = this.editorRef?.nativeElement;
    if (!editor) return;

    editor.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      editor.classList.add('dragover');
    });

    editor.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      editor.classList.remove('dragover');
    });

    editor.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      editor.classList.remove('dragover');

      const files = Array.from(e.dataTransfer?.files || []);
      files.forEach((file) => this.handleFileUpload(file));
    });
  }

  /**
   * 设置键盘快捷键
   * 为常用的编辑操作设置键盘快捷键
   */
  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', this.handleKeyboardShortcuts);
  }

  /**
   * 设置输入法相关事件
   * 确保中文等输入法能够正常工作，避免在输入法组合过程中触发渲染
   */
  private setupInputMethodEvents() {
    const editor = this.editorRef?.nativeElement;
    if (!editor) return;

    editor.addEventListener('compositionstart', this.handleCompositionStart);
    editor.addEventListener('compositionupdate', this.handleCompositionUpdate);
    editor.addEventListener('compositionend', this.handleCompositionEnd);
  }

  /**
   * 处理输入法开始输入
   * 标记输入法正在组合状态
   */
  private handleCompositionStart = () => {
    this.isComposing = true;
  };

  /**
   * 处理输入法输入过程中
   * 在输入法组合过程中不执行任何操作
   */
  private handleCompositionUpdate = () => {
    // 可以根据需要在这里添加实时更新逻辑，但通常不需要
    // 因为输入内容还未确定
  };

  /**
   * 处理输入法输入完成
   * 当输入法组合完成时，触发 Markdown 渲染
   */
  private handleCompositionEnd = () => {
    this.isComposing = false;
    // 输入法输入完成后，触发渲染
    this.renderMarkdown();
  };

  /**
   * 处理键盘快捷键
   * 监听键盘事件并执行相应的操作
   * @param e 键盘事件对象
   */
  private handleKeyboardShortcuts = (e: KeyboardEvent) => {
    // 检查是否正在输入中文（输入法激活状态）
    if (this.isComposing) return;

    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          this.insertMarkdown('**', '**');
          break;
        case 'i':
          e.preventDefault();
          this.insertMarkdown('*', '*');
          break;
        case 's':
          e.preventDefault();
          this.saveMarkdown();
          break;
        case 'o':
          e.preventDefault();
          this.openFile();
          break;
        case '=': // Ctrl+= 增大字体
        case '+': // Ctrl++ 增大字体
          e.preventDefault();
          this.increaseFontSize();
          break;
        case '-': // Ctrl+- 减小字体
          e.preventDefault();
          this.decreaseFontSize();
          break;
        case '0': // Ctrl+0 重置字体
          e.preventDefault();
          this.resetFontSize();
          break;
      }
    } else if (e.key === 'F11') {
      e.preventDefault();
      this.toggleFullscreen();
    }
  };

  // 添加防抖函数用于优化渲染性能
  private debounceTimer: any = null;
  private readonly DEBOUNCE_DELAY = 150; // 缩短防抖延迟到150ms
  private isRendering = false; // 防止渲染冲突
  private renderQueue: (() => void)[] = []; // 渲染队列

  /**
   * 处理内容变化事件
   * 当编辑器内容发生变化时，防抖执行渲染操作
   */
  onContentChange() {
    // 确保只有在非输入法组合状态或者输入完成后才触发渲染
    if (!this.isComposing) {
      // 使用防抖优化渲染性能，避免频繁触发全量渲染
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.batchRender();
        this.debounceTimer = null;
      }, this.DEBOUNCE_DELAY);
    }
  }

  /**
   * 批量渲染方法，减少闪动
   */
  private batchRender() {
    if (this.isRendering) {
      // 如果正在渲染，将任务添加到队列
      this.renderQueue.push(() => this.renderMarkdown());
      return;
    }
    
    // 渲染当前内容
    this.renderMarkdown();
    
    // 处理队列中的任务
    if (this.renderQueue.length > 0) {
      const nextRender = this.renderQueue.shift();
      if (nextRender) {
        setTimeout(nextRender, 10);
      }
    }
  }

  /**
   * 渲染Markdown内容为HTML
   * 使用marked库将Markdown转换为HTML，并处理数学公式和代码高亮
   */
  renderMarkdown() {
    if (this.isRendering) return;
    
    this.isRendering = true;
    
    try {
      // 处理数学公式块
      let content = this.markdownContent;
      
      // 处理块级数学公式 $$...$$
      content = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        try {
          const katexHtml = katex.renderToString(formula.trim(), {
            throwOnError: false,
            displayMode: true
          });
          // 包装在math-block容器中，以应用SCSS样式
          return `<div class="math-block">${katexHtml}</div>`;
        } catch (e) {
          return `<div class="math-error">数学公式错误: ${formula}</div>`;
        }
      });
      
      // 使用marked渲染Markdown
      const rawHtml = marked(content) as string;
      
      // 处理Mermaid图表 - 将mermaid代码块替换为组件标签
      let mermaidIndex = 0;
      const mermaidProcessedHtml = rawHtml.replace(
        /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/gi,
        (match, diagramCode) => {
          try {
            // 解码HTML实体
            const decodedCode = diagramCode
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
            
            // 生成唯一的ID
            const diagramId = `mermaid-${Date.now()}-${mermaidIndex++}`;
            
            // 返回自定义组件标签
            return `<app-mermaid-diagram diagramId="${diagramId}" diagramCode="${encodeURIComponent(decodedCode)}"></app-mermaid-diagram>`;
          } catch (e) {
            console.error('Mermaid图表处理错误:', e);
            return match;
          }
        }
      );
      
      // 代码高亮处理 - 添加主题选择器（排除mermaid代码块）
      let codeBlockIndex = 0; // 代码块索引计数器
      const highlightedHtml = mermaidProcessedHtml.replace(
        /<pre><code class="language-(\w+)"([^>]*)>(.*?)<\/code><\/pre>/gs,
        (match, lang, attrs, code) => {
          // 跳过mermaid代码块，因为它们已经被处理过了
          if (lang.toLowerCase() === 'mermaid') {
            return match;
          }
          
          try {
            const decodedCode = code
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
            
            const highlighted = hljs.highlight(decodedCode, { language: lang }).value;
            
            // 为每个代码块添加语言选择器
            const languageInfo = this.availableLanguages.find(l => l.value === lang) || { value: lang, name: lang.toUpperCase(), icon: '📝' };
            const currentIndex = codeBlockIndex++; // 递增索引
            
            return `
              <div class="code-block-container" data-block-index="${currentIndex}" data-original-language="${lang}">
                <div class="code-block-header">
                  <span class="code-language">${languageInfo.icon} ${languageInfo.name}</span>
                  <select 
                    class="code-language-selector" 
                    onchange="window.mdEditor?.changeCodeLanguage(this, '${lang}')"
                    title="选择代码语言类型">
                    ${this.availableLanguages.map(language => 
                      `<option value="${language.value}" ${language.value === lang ? 'selected' : ''}>
                        ${language.icon} ${language.name}
                      </option>`
                    ).join('')}
                  </select>
                </div>
                <pre><code class="hljs language-${lang}">${highlighted}</code></pre>
              </div>`;
          } catch (e) {
            return match;
          }
        }
      );
      
      this.renderedHtml = this.sanitizer.bypassSecurityTrustHtml(highlightedHtml);
      
      // 如果是Notion模式，也更新Notion编辑器内容
      if (this.isNotionMode) {
        this.notionHtml = this.renderedHtml;
      }
      
    } catch (error) {
      console.error('Markdown渲染错误:', error);
      this.renderedHtml = this.sanitizer.bypassSecurityTrustHtml(
        '<div class="error">渲染错误，请检查Markdown语法</div>'
      );
    } finally {
      this.isRendering = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * 获取主题类名
   * 根据当前主题状态返回相应的CSS类名
   */
  getThemeClass(): string {
    return this.isDarkTheme ? 'dark-theme' : 'light-theme';
  }

  /**
   * 切换主题
   * 在深色和浅色主题之间切换，并自动调整代码高亮主题
   */
  toggleTheme(forceState?: boolean) {
    if (typeof forceState === 'boolean') {
      this.isDarkTheme = forceState;
    } else {
      this.isDarkTheme = !this.isDarkTheme;
    }
    
    // 保存主题偏好到本地存储
    localStorage.setItem('markdown-theme', this.isDarkTheme ? 'dark' : 'light');
    
    // 更新body类名以应用全局主题
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    // 根据新的界面主题推荐合适的代码主题
    const recommendedTheme = this.getRecommendedCodeTheme();
    if (recommendedTheme !== this.currentCodeTheme) {
      // 只有当推荐的主题与当前不同时才切换，避免不必要的变化
      this.switchCodeTheme(recommendedTheme);
    }
  }

  /**
   * 切换预览模式
   * 在编辑模式和预览模式之间切换
   */
  togglePreviewMode() {
    this.isPreviewMode = !this.isPreviewMode;
  }

  /**
   * 切换全屏模式
   * 进入或退出全屏编辑模式
   */
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    
    if (this.isFullscreen) {
      // 请求全屏
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * 切换Notion模式
   * 在传统编辑器和Notion式实时编辑之间切换
   */
  toggleNotionMode() {
    this.isNotionMode = !this.isNotionMode;
    
    if (this.isNotionMode) {
      // 将当前内容渲染到Notion编辑器
      this.notionHtml = this.renderedHtml;
      
      // 延迟设置焦点
      setTimeout(() => {
        if (this.notionEditorRef?.nativeElement) {
          this.notionEditorRef.nativeElement.focus();
        }
      }, 100);
    }
  }

  /**
   * 插入Markdown语法
   * 在当前光标位置插入指定的Markdown语法
   */
  insertMarkdown(prefix: string, suffix: string = '') {
    const editor = this.editorRef?.nativeElement;
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    
    const newText = prefix + selectedText + suffix;
    const beforeText = editor.value.substring(0, start);
    const afterText = editor.value.substring(end);
    
    this.markdownContent = beforeText + newText + afterText;
    
    // 设置新的光标位置
    setTimeout(() => {
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      editor.setSelectionRange(newCursorPos, newCursorPos);
      editor.focus();
    }, 0);
    
    this.renderMarkdown();
  }

  /**
   * 插入代码块
   * 插入带语言标识的代码块
   */
  insertCodeBlock() {
    const language = prompt('请输入编程语言 (例如: javascript, python, html):', 'javascript');
    if (language !== null) {
      this.insertMarkdown('\n```' + language + '\n', '\n```\n');
    }
  }

  /**
   * 插入链接
   * 插入Markdown格式的链接
   */
  insertLink() {
    const url = prompt('请输入链接地址:', 'https://');
    const text = prompt('请输入链接文本:', '链接文本');
    
    if (url && text) {
      this.insertMarkdown(`[${text}](${url})`);
    }
  }

  /**
   * 插入图片
   * 触发文件选择器或插入图片链接
   */
  insertImage() {
    const choice = confirm('是否上传本地图片？\n确定：上传本地图片\n取消：插入图片链接');
    
    if (choice) {
      // 触发文件选择器
      this.fileInputRef?.nativeElement.click();
    } else {
      // 插入图片链接
      const url = prompt('请输入图片地址:', 'https://');
      const alt = prompt('请输入图片描述:', '图片描述');
      
      if (url && alt) {
        this.insertMarkdown(`![${alt}](${url})`);
      }
    }
  }

  /**
   * 插入表格
   * 插入Markdown格式的表格
   */
  insertTable() {
    const rows = prompt('请输入行数:', '3');
    const cols = prompt('请输入列数:', '3');
    
    if (rows && cols) {
      const rowCount = parseInt(rows, 10);
      const colCount = parseInt(cols, 10);
      
      let table = '\n';
      
      // 表头
      table += '|';
      for (let i = 0; i < colCount; i++) {
        table += ` 列${i + 1} |`;
      }
      table += '\n';
      
      // 分隔线
      table += '|';
      for (let i = 0; i < colCount; i++) {
        table += ' --- |';
      }
      table += '\n';
      
      // 数据行
      for (let i = 0; i < rowCount - 1; i++) {
        table += '|';
        for (let j = 0; j < colCount; j++) {
          table += ' 数据 |';
        }
        table += '\n';
      }
      
      table += '\n';
      this.insertMarkdown(table);
    }
  }

  /**
   * 插入数学公式
   * 插入LaTeX格式的数学公式
   */
  insertMath() {
    const isBlock = confirm('插入块级公式？\n确定：块级公式 ($$...$$)\n取消：行内公式 ($...$)');
    
    if (isBlock) {
      this.insertMarkdown('\n$$\n', '\n$$\n');
    } else {
      this.insertMarkdown('$', '$');
    }
  }

  /**
   * 插入Mermaid图表
   * 插入Mermaid图表代码块
   */
  insertMermaidDiagram() {
    const diagramType = prompt('请输入图表类型 (例如: graph, pie, flowchart):', 'graph');
    if (diagramType !== null) {
      let template = '';
      
      switch(diagramType.toLowerCase()) {
        case 'graph':
        case 'flowchart':
          template = `graph TD
    A[开始] --> B[初始化]
    B --> C{条件判断}
    C -->|条件1| D[执行操作1]
    C -->|条件2| E[执行操作2]
    D --> F[合并]
    E --> F
    F --> G[结束]`;
          break;
        case 'pie':
          template = `pie title 产品销售分布
    "产品A" : 38.2
    "产品B" : 25.7
    "产品C" : 19.3
    "产品D" : 16.8`;
          break;
        case 'sequence':
          template = `sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 登录请求
    B->>A: 登录成功`;
          break;
        default:
          template = `${diagramType}
    // 在这里添加您的${diagramType}图表代码`;
      }
      
      this.insertMarkdown(`
\`\`\`mermaid
`, `
${template}
\`\`\`
`);
    }
  }

  /**
   * 保存Markdown文件
   * 将当前内容保存为.md文件，包含代码主题信息
   */
  saveMarkdown() {
    // 在文件开头添加主题信息注释
    const themeInfo = `<!-- 
代码高亮主题: ${this.getCurrentCodeThemeName()} (${this.currentCodeTheme})
保存时间: ${new Date().toLocaleString()}
由 Markdown 编辑器生成
-->

`;
    
    const contentWithInfo = themeInfo + this.markdownContent;
    const blob = new Blob([contentWithInfo], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `markdown-${this.currentCodeTheme}-${new Date().getTime()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * 导出HTML文件
   * 将渲染后的HTML保存为文件，包含当前选中的代码主题
   */
  exportHtml() {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Markdown Export</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${this.currentCodeTheme}.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 20px; 
      line-height: 1.6;
      color: #333;
    }
    pre { 
      background: #f6f8fa; 
      padding: 16px; 
      border-radius: 6px; 
      overflow-x: auto; 
      border: 1px solid #e1e4e8;
    }
    code { 
      background: #f6f8fa; 
      padding: 2px 4px; 
      border-radius: 3px; 
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }
    blockquote { 
      border-left: 4px solid #0366d6; 
      padding-left: 16px; 
      color: #6a737d; 
      margin-left: 0;
    }
    table { 
      border-collapse: collapse; 
      width: 100%; 
      margin: 16px 0;
    }
    th, td { 
      border: 1px solid #e1e4e8; 
      padding: 6px 13px; 
      text-align: left;
    }
    th { 
      background: #f6f8fa; 
      font-weight: 600;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }
    h1, h2 {
      border-bottom: 1px solid #e1e4e8;
      padding-bottom: 8px;
    }
    /* 代码主题信息样式 */
    .code-theme-info {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <!-- 代码主题信息 -->
  <div class="code-theme-info">
    代码高亮: ${this.getCurrentCodeThemeName()}
  </div>
  
  <!-- Markdown 内容 -->
  ${this.renderedHtml}
  
  <!-- 导出信息 -->
  <hr>
  <p style="text-align: center; color: #6a737d; font-size: 12px;">
    由 Markdown 编辑器导出 | 代码主题: ${this.getCurrentCodeThemeName()} | 导出时间: ${new Date().toLocaleString()}
  </p>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `markdown-export-${this.currentCodeTheme}-${new Date().getTime()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * 打开文件
   * 触发文件选择器来打开本地Markdown文件
   */
  openFile() {
    this.fileInputRef?.nativeElement.click();
  }

  /**
   * 处理文件选择
   * 当用户选择文件时的处理逻辑
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      if (file.type.startsWith('image/')) {
        this.handleFileUpload(file);
      } else if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
        this.loadMarkdownFile(file);
      } else {
        alert('请选择Markdown文件(.md)或图片文件');
      }
    }
    
    // 重置input值，允许重复选择同一文件
    input.value = '';
  }

  /**
   * 加载Markdown文件
   * 读取并加载Markdown文件内容
   */
  private loadMarkdownFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.markdownContent = e.target?.result as string;
      this.renderMarkdown();
    };
    reader.readAsText(file, 'UTF-8');
  }

  /**
   * 处理文件上传
   * 处理图片文件的上传和插入
   */
  handleFileUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const imageName = file.name;
      
      // 插入图片Markdown语法
      this.insertMarkdown(`![${imageName}](${imageUrl})`);
    };
    reader.readAsDataURL(file);
  }

  /**
   * 增大字体
   * 增加编辑器字体大小
   */
  increaseFontSize() {
    if (this.fontSize < 24) {
      this.fontSize += 2;
      this.applyFontSize();
    }
  }

  /**
   * 减小字体
   * 减少编辑器字体大小
   */
  decreaseFontSize() {
    if (this.fontSize > 12) {
      this.fontSize -= 2;
      this.applyFontSize();
    }
  }

  /**
   * 重置字体大小
   * 将字体大小重置为默认值
   */
  resetFontSize() {
    this.fontSize = 16;
    this.applyFontSize();
  }

  /**
   * 应用字体大小
   * 将字体大小应用到编辑器元素
   */
  private applyFontSize() {
    const editor = this.editorRef?.nativeElement;
    if (editor) {
      editor.style.fontSize = `${this.fontSize}px`;
    }
    
    // 保存字体大小偏好
    localStorage.setItem('markdown-font-size', this.fontSize.toString());
  }

  /**
   * 获取字数统计
   * 计算并返回当前内容的字数
   */
  getWordCount(): number {
    // 移除Markdown语法符号，只计算实际内容
    const content = this.markdownContent
      .replace(/[#*`~\[\]()]/g, '') // 移除Markdown符号
      .replace(/\s+/g, ' ') // 合并空白字符
      .trim();
    
    return content.length;
  }

  /**
   * Notion编辑器内容变化处理
   * 处理Notion式编辑器的内容变化
   */
  onNotionContentChange(event: Event) {
    const target = event.target as HTMLElement;
    const content = target.innerText || '';
    this.markdownContent = content;
    this.renderMarkdown();
  }

  /**
   * Notion编辑器键盘事件处理
   * 处理Notion式编辑器的特殊键盘事件
   */
  onNotionKeydown(event: KeyboardEvent) {
    // 在这里可以添加Notion式的快捷键处理
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      // 插入换行
      document.execCommand('insertHTML', false, '<br>');
    }
  }

  /**
   * Notion编辑器粘贴事件处理
   * 处理Notion式编辑器的粘贴操作
   */
  onNotionPaste(event: ClipboardEvent) {
    event.preventDefault();
    
    const paste = event.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertText', false, paste);
    
    // 更新内容
    setTimeout(() => {
      const target = event.target as HTMLElement;
      const content = target.innerText || '';
      this.markdownContent = content;
      this.renderMarkdown();
    }, 10);
  }
}