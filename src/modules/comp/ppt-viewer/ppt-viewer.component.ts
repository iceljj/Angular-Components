/**
 * PPT查看器主组件 - 核心功能模块
 *
 * 这是一个基于Angular Standalone模式的PPTX文件在线查看器组件
 * 主要功能包括：
 * - PPTX文件上传和解析
 * - 幻灯片分页导航和预览
 * - 缩放控制（放大/缩小/重置）
 * - 全屏显示模式
 * - 键盘和鼠标导航支持
 * - 加载进度和错误处理
 *
 * 依赖第三方库：pptx-preview 用于PPTX文件渲染
 *
 * @Component 装饰器配置：
 * - selector: 组件选择器，用于在HTML模板中引用
 * - standalone: 设置为true表示这是一个独立组件
 * - imports: 导入CommonModule提供基础Angular指令支持
 * - templateUrl: 外部HTML模板文件路径
 * - styleUrls: 外部样式文件路径数组
 */
import {Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {init} from 'pptx-preview';
import {on} from "pptx-preview/dist/utils/event-bus";

@Component({
    selector: 'app-ppt-viewer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ppt-viewer.component.html',
    styleUrls: ['./ppt-viewer.component.scss']
})
/**
 * PPT查看器组件类
 *
 * 实现 OnDestroy 和 AfterViewInit 生命周期接口
 * - OnDestroy: 组件销毁时清理资源
 * - AfterViewInit: 视图初始化完成后执行初始化逻辑
 *
 * 主要职责：
 * - 管理PPTX文件的加载和渲染
 * - 处理用户交互（导航、缩放、全屏）
 * - 维护组件状态和错误处理
 * - 管理事件监听器和资源清理
 */
export class PptViewerComponent implements OnDestroy, AfterViewInit
{
    @ViewChild('fileInput', {static: false}) fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('pptContainer', {static: false}) pptContainer!: ElementRef<HTMLDivElement>;
    slides: any[] = [];
    currentSlideIndex = 0;
    scale = 1;
    isFullscreen = false;
    isLoading = false;
    loadProgress = 0;
    error: string | null = null;
    private pptxPreviewer: any = null;
    private loadTimeout: any = null;
    private isViewInit = false;
    private fullscreenKeyHandler: ((event: KeyboardEvent) => void) | null = null;
    private _retryTrigger = false; // 添加重试标志

    constructor(private elementRef: ElementRef)
    {
        // 添加键盘事件监听
        this.addKeyboardListeners();
    }

    ngAfterViewInit()
    {
        // 标记视图已初始化
        this.isViewInit = true;
        console.log('PPT Viewer: View initialized');
        console.log('File input element:', this.fileInput?.nativeElement);
    }

    onFileSelected(event: any)
    {
        const file = event.target.files[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
        {
            this.parsePptxFile(file);
        } else
        {
            alert('请选择有效的PPTX文件');
        }
    }

    parsePptxFile(file: File)
    {
        // 文件验证
        if (!file)
        {
            this.handleError('未选择文件');
            return;
        }

        // 检查文件大小（限制为50MB）
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize)
        {
            this.handleError('文件过大，请选择小于50MB的PPTX文件');
            return;
        }

        this.isLoading = true;
        this.loadProgress = 0;
        this.error = null;

        // 设置加载超时
        this.loadTimeout = setTimeout(() =>
        {
            if (this.isLoading)
            {
                this.handleError('加载超时，请检查网络连接或尝试较小的文件');
            }
        }, 300000); // 5分钟超时

        // 模拟进度更新
        this.simulateProgress();

        const reader = new FileReader();
        reader.onload = (e: any) =>
        {
            try
            {
                const arrayBuffer = e.target.result;
                // 验证ArrayBuffer
                if (!arrayBuffer || arrayBuffer.byteLength === 0)
                {
                    this.handleError('文件内容为空或损坏');
                    return;
                }
                this.processPPTX(arrayBuffer);
            } catch (error: any)
            {
                this.handleError('解析PPTX文件时出错: ' + (error.message || error));
            }
        };
        reader.onerror = () =>
        {
            this.handleError('读取文件时出错: ' + reader.error?.message || '未知错误');
        };
        reader.onabort = () =>
        {
            this.handleError('文件读取被中断');
        };
        reader.readAsArrayBuffer(file);
    }

    // 模拟加载进度
    private simulateProgress()
    {
        if (!this.isLoading) return;

        if (this.loadProgress < 90)
        {
            this.loadProgress += 5;
            setTimeout(() => this.simulateProgress(), 200);
        } else if (this.loadProgress === 90)
        {
            // 保持在90%直到实际加载完成
            setTimeout(() => this.simulateProgress(), 500);
        }
    }

    private processPPTX(arrayBuffer: ArrayBuffer)
    {
        try
        {
            // 检查视图是否已初始化
            if (!this.isViewInit)
            {
                console.log('PPT Viewer: View not initialized yet, waiting...');
                // 如果视图未初始化，等待一段时间再尝试
                setTimeout(() => this.processPPTX(arrayBuffer), 100);
                return;
            }

            // 容器现在始终存在于DOM中，直接初始化预览器
            this.initializePreviewer(arrayBuffer);
        } catch (error: any)
        {
            console.error('PPT Viewer: Process error', error);
            this.handleError('处理PPTX内容时出错: ' + (error.message || error));
        }
    }

    private initializePreviewer(arrayBuffer: ArrayBuffer)
    {
        console.log('PPT Viewer: Initializing previewer...');

        // 确保容器元素存在
        if (!this.pptContainer || !this.pptContainer.nativeElement)
        {
            console.error('PPT Viewer: Container element not found');
            this.handleError('PPT容器未正确初始化，请刷新页面后重试');
            return;
        }

        // 清空容器
        this.pptContainer.nativeElement.innerHTML = '';

        // 初始化 pptx-preview 库，移除mode限制以显示所有幻灯片
        this.pptxPreviewer = init(this.pptContainer.nativeElement, {
            width: 960,  // 使用更合适的宽度
            height: 540, // 使用更合适的高度
            mode: 'slide',
            renderer: 'canvas', // 使用canvas渲染器以提高性能
        });

        // 添加事件监听器
        this.addEventListeners();

        // 预览 PPTX 文件
        this.pptxPreviewer.preview(arrayBuffer)
            .then(() =>
            {
                console.log('PPT Viewer: Preview completed successfully');

                // 应用额外的文本样式修正
                this.applyTextRenderingFix();

                // 检测幻灯片数量
                this.detectSlides();

                this.onLoadComplete();
            })
            .catch((error: any) =>
            {
                console.error('PPT Viewer: Preview error', error);
                this.handleError('渲染PPTX内容时出错: ' + (error.message || error));
            })
            .finally(() =>
            {
                // 确保加载状态被清除
                if (this.loadTimeout)
                {
                    clearTimeout(this.loadTimeout);
                    this.loadTimeout = null;
                }
            });
    }

    // 应用文本渲染修正
    private applyTextRenderingFix()
    {
        if (!this.pptContainer?.nativeElement) return;

        // 延迟执行，确保DOM完全渲染
        setTimeout(() =>
        {
            try
            {
                const container = this.pptContainer.nativeElement;

                // 查找所有文本元素
                const textElements = container.querySelectorAll('[class*="text"], p, span, div');

                textElements.forEach((element: Element) =>
                {
                    const htmlElement = element as HTMLElement;
                    // 确保文本不自动换行
                    htmlElement.style.whiteSpace = 'nowrap';
                    htmlElement.style.overflow = 'visible';
                    htmlElement.style.textOverflow = 'clip';

                    // 保持原始布局
                    htmlElement.style.wordWrap = 'normal';
                    htmlElement.style.wordBreak = 'keep-all';

                    // 修复字体平滑属性 - 使用类型断言
                    (htmlElement.style as any).fontSmooth = 'antialiased';
                    (htmlElement.style as any).webkitFontSmoothing = 'antialiased';
                });

                console.log('PPT Viewer: Applied text rendering fix to', textElements.length, 'elements');

                // 检查是否有被截断的文本
                this.checkForTruncatedText();

            } catch (error)
            {
                console.warn('PPT Viewer: Error applying text fix:', error);
            }
        }, 500);
    }

    // 检查并修复被截断的文本
    private checkForTruncatedText()
    {
        const container = this.pptContainer.nativeElement;
        const allElements = container.querySelectorAll('*');

        let fixedCount = 0;

        allElements.forEach((element: Element) =>
        {
            const htmlElement = element as HTMLElement;
            const style = window.getComputedStyle(htmlElement);

            // 检查是否有文本被截断
            if (style.overflow === 'hidden' || style.textOverflow === 'ellipsis')
            {
                htmlElement.style.overflow = 'visible';
                htmlElement.style.textOverflow = 'clip';
                fixedCount++;
            }

            // 检查容器是否限制了宽度导致文本换行
            if (htmlElement.scrollWidth > htmlElement.clientWidth &&
                htmlElement.clientWidth > 0 &&
                style.whiteSpace !== 'nowrap')
            {
                htmlElement.style.whiteSpace = 'nowrap';
                fixedCount++;
            }
        });

        if (fixedCount > 0)
        {
            console.log('PPT Viewer: Fixed', fixedCount, 'truncated text elements');
        }
    }

    private onLoadComplete()
    {
        // 确保加载状态被清除
        if (this.loadTimeout)
        {
            clearTimeout(this.loadTimeout);
            this.loadTimeout = null;
        }

        this.loadProgress = 100;
        // 短暂延迟后完成加载，确保UI更新
        setTimeout(() =>
        {
            this.isLoading = false;
            this.error = null;
            try
            {
                console.log('PPT Viewer: Load completed successfully');
            } catch (error)
            {
                console.warn('加载完成时出错:', error);
            }
        }, 300); // 增加延迟时间，确保DOM完全渲染
    }


    private handleError(errorMessage: string)
    {
        console.error('PPT Viewer Error:', errorMessage);
        // 清除超时定时器
        if (this.loadTimeout)
        {
            clearTimeout(this.loadTimeout);
            this.loadTimeout = null;
        }

        // 重置幻灯片状态
        this.slides = [];
        this.currentSlideIndex = 0;

        this.error = errorMessage;
        this.isLoading = false;
        this.loadProgress = 0;
    }

    // 检测幻灯片数量
    private detectSlides()
    {
        try
        {
            // 通过pptx-preview库的slideCount属性获取幻灯片数量
            if (this.pptxPreviewer && this.pptxPreviewer.slideCount !== undefined)
            {
                const slideCount = this.pptxPreviewer.slideCount;
                console.log('通过pptx-preview库获取的幻灯片数量:', slideCount);

                // 确保幻灯片数量有效（大于0），否则使用默认值1
                const validSlideCount = slideCount && slideCount > 0 ? slideCount : 0;
                this.finalizeSlideDetection(validSlideCount);
            } else
            {
                // 如果无法通过API获取，使用默认值1张幻灯片
                console.warn('无法通过pptx-preview API获取幻灯片数量，使用默认值1');
                this.finalizeSlideDetection(1);
            }
        } catch (error)
        {
            console.warn('检测幻灯片时出错:', error);
            // 出错时默认设置为1张幻灯片
            this.finalizeSlideDetection(1);
        }
    }

    private finalizeSlideDetection(slideCount: number)
    {
        console.log('检测到幻灯片数量:', slideCount);

        // 初始化幻灯片数组
        this.slides = Array.from({length: slideCount}, (_, i) => ({
            index: i,
            title: `幻灯片 ${i + 1}`
        }));

        this.currentSlideIndex = 0;

        // 修改pptx-preview库的页码显示（从1开始而不是0）
        this.fixPaginationDisplay();

        // 确保第一张幻灯片可见
        this.goToSlide(0);
    }


    // 修改pptx-preview库的页码显示，使其从1开始
    private fixPaginationDisplay()
    {
        setTimeout(() =>
        {
            // 移除对原生分页元素的引用，因为我们使用自定义导航
            console.log('原生分页显示已禁用，使用自定义导航控件');
        }, 100);
    }

    // 计算属性 - 只保留缩放百分比
    get zoomPercentage(): string
    {
        return `${Math.round(this.scale * 100)}%`;
    };

    zoomIn()
    {
        this.scale = Math.min(this.scale + 0.1, 3);
        this.updateScale();
    }

    zoomOut()
    {
        this.scale = Math.max(this.scale - 0.1, 0.5);
        this.updateScale();
    }

    resetZoom()
    {
        this.scale = 1;
        this.updateScale();
    }

    private updateScale()
    {
        // 更新PPT容器的缩放比例
        if (this.pptContainer && this.pptContainer.nativeElement)
        {
            this.pptContainer.nativeElement.style.transform = `scale(${this.scale})`;
        }
    }

    // 分页导航方法
    nextSlide(event?: Event)
    {
        // 阻止事件冒泡，避免触发容器的点击事件
        if (event) {
            event.stopPropagation();
        }
        
        if (this.slides.length > 0 && this.currentSlideIndex < this.slides.length - 1)
        {
            // 使用pptx-preview库的API切换到下一页
            if (this.pptxPreviewer && typeof this.pptxPreviewer.renderNextSlide === 'function')
            {
                this.pptxPreviewer.renderNextSlide();
                // 等待pptx-preview库更新currentIndex后再同步
                setTimeout(() =>
                {
                    this.currentSlideIndex = this.pptxPreviewer.currentIndex;
                    console.log('切换到下一页幻灯片:', this.currentSlideIndex + 1);
                    // 更新页码显示
                }, 0);
            }
        }
    }

    prevSlide(event?: Event)
    {
        // 阻止事件冒泡，避免触发容器的点击事件
        if (event) {
            event.stopPropagation();
        }
        
        if (this.slides.length > 0 && this.currentSlideIndex > 0)
        {
            // 使用pptx-preview库的API切换到上一页
            if (this.pptxPreviewer && typeof this.pptxPreviewer.renderPreSlide === 'function')
            {
                this.pptxPreviewer.renderPreSlide();
                // 等待pptx-preview库更新currentIndex后再同步
                setTimeout(() =>
                {
                    this.currentSlideIndex = this.pptxPreviewer.currentIndex;
                    console.log('切换到上一页幻灯片:', this.currentSlideIndex + 1);
                    // 更新页码显示
                }, 0);
            }
        }
    }

    goToSlide(index: number)
    {
        if (this.slides.length > 0 && index >= 0 && index < this.slides.length)
        {
            this.currentSlideIndex = index;

            // 使用pptx-preview库的API切换到指定幻灯片
            if (this.pptxPreviewer && typeof this.pptxPreviewer.renderSingleSlide === 'function')
            {
                this.pptxPreviewer.renderSingleSlide(index);
                // 等待pptx-preview库更新currentIndex后再同步
                setTimeout(() =>
                {
                    this.currentSlideIndex = this.pptxPreviewer.currentIndex;
                    console.log('切换到幻灯片:', index + 1);
                    // 更新页码显示
                }, 0);
            } else
            {
                console.log('切换到幻灯片:', index + 1);
            }
        }
    }

    // 移除updatePaginationDisplay方法，因为我们不再使用原生分页元素

    // 计算属性 - 幻灯片编号
    get slideNumbers(): number[]
    {
        return this.slides.map((_, index) => index + 1);
    }

    // 添加键盘事件监听器
    private addKeyboardListeners()
    {
        // 添加全局键盘事件监听
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        console.log('PPT Viewer: Keyboard listeners added');
    }

    // 处理键盘事件
    private handleKeyDown(event: KeyboardEvent)
    {
        // 只在PPT加载完成且不是全屏模式下处理键盘事件
        if (!this.isLoading && !this.error && this.slides.length > 0)
        {
            switch (event.key)
            {
                case 'ArrowRight':
                case 'ArrowDown':
                case 'PageDown':
                case ' ':
                    event.preventDefault();
                    this.nextSlide();
                    break;

                case 'ArrowLeft':
                case 'ArrowUp':
                case 'PageUp':
                    event.preventDefault();
                    this.prevSlide();
                    break;

                case 'Home':
                    event.preventDefault();
                    this.goToSlide(0);
                    break;

                case 'End':
                    event.preventDefault();
                    this.goToSlide(this.slides.length - 1);
                    break;
            }
        }
    }

    // 处理容器点击事件（鼠标左键）
    handleContainerClick(event: MouseEvent)
    {
        // 只在PPT加载完成且不是全屏模式下处理点击事件
        if (!this.isLoading && !this.error && this.slides.length > 0)
        {
            event.preventDefault();
            event.stopPropagation();
            this.nextSlide();
        }
    }

    // 处理容器右键点击事件（鼠标右键）
    handleContainerContextMenu(event: MouseEvent)
    {
        // 只在PPT加载完成且不是全屏模式下处理右键事件
        if (!this.isLoading && !this.error && this.slides.length > 0)
        {
            event.preventDefault();
            event.stopPropagation();
            this.prevSlide();
        }
    }

    // 处理容器滚轮事件
    handleContainerWheel(event: WheelEvent)
    {
        // 只在PPT加载完成且不是全屏模式下处理滚轮事件
        if (!this.isLoading && !this.error && this.slides.length > 0)
        {
            event.preventDefault();
            event.stopPropagation();

            // 向下滚动 - 下一页
            if (event.deltaY > 0)
            {
                this.nextSlide();
            }
            // 向上滚动 - 上一页
            else if (event.deltaY < 0)
            {
                this.prevSlide();
            }
        }
    }

    async toggleFullscreen()
    {
        const pptContainer = this.elementRef.nativeElement.querySelector('.ppt-container-wrapper');
        if (!pptContainer) return;

        try
        {
            if (!this.isFullscreen)
            {
                // 进入全屏模式 - 只全屏PPT容器部分
                if (pptContainer.requestFullscreen)
                {
                    await pptContainer.requestFullscreen();
                } else if ((pptContainer as any).webkitRequestFullscreen)
                {
                    await (pptContainer as any).webkitRequestFullscreen();
                } else if ((pptContainer as any).msRequestFullscreen)
                {
                    await (pptContainer as any).msRequestFullscreen();
                }

                this.isFullscreen = true;
                this.enterFullscreenMode();
            } else
            {
                // 退出全屏模式
                if (document.exitFullscreen)
                {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen)
                {
                    await (document as any).webkitExitFullscreen();
                } else if ((document as any).msExitFullscreen)
                {
                    await (document as any).msExitFullscreen();
                }

                this.isFullscreen = false;
                this.exitFullscreenMode();
            }
        } catch (error)
        {
            console.error('全屏操作失败:', error);
        }
    }

    private enterFullscreenMode()
    {
        const container = this.elementRef.nativeElement;

        // 添加全屏模式类
        container.classList.add('fullscreen-mode');

        // 隐藏其他UI元素
        this.hideUIElements();

        // 添加ESC键退出监听
        this.addFullscreenListeners();

        // 优化全屏下的文本显示
        this.optimizeFullscreenText();
    }

    private exitFullscreenMode()
    {
        const container = this.elementRef.nativeElement;

        // 移除全屏模式类
        container.classList.remove('fullscreen-mode');

        // 显示UI元素
        this.showUIElements();

        // 移除监听器
        this.removeFullscreenListeners();
    }

    private hideUIElements()
    {
        // 隐藏工具栏
        const uiElements = this.elementRef.nativeElement.querySelectorAll('.toolbar');
        uiElements.forEach((el: HTMLElement) => el.style.display = 'none');
    }

    private showUIElements()
    {
        // 显示工具栏
        const uiElements = this.elementRef.nativeElement.querySelectorAll('.toolbar');
        uiElements.forEach((el: HTMLElement) => el.style.display = '');
    }

    private optimizeFullscreenText()
    {
        // 延迟执行，确保DOM完全渲染
        setTimeout(() =>
        {
            const container = this.pptContainer.nativeElement;
            // 增强全屏下的文本可读性 - 修复文字虚化问题
            const textElements = container.querySelectorAll('text, tspan, [class*="text"], p, span, div');
            textElements.forEach((element: Element) =>
            {
                const htmlElement = element as HTMLElement;
                // 移除可能导致文字虚化的filter效果
                htmlElement.style.filter = 'none';
                // 使用更清晰的字体渲染设置
                (htmlElement.style as any).fontSmooth = 'auto';
                (htmlElement.style as any).webkitFontSmoothing = 'auto';
                htmlElement.style.textRendering = 'geometricPrecision';
            });

            // 强制重绘以解决文字虚化问题
            this.forceRedraw();
        }, 100);
    }

    // 强制重绘容器以解决文字虚化问题
    private forceRedraw()
    {
        const container = this.pptContainer.nativeElement;
        if (container)
        {
            // 临时隐藏再显示以触发重绘
            const originalDisplay = container.style.display;
            container.style.display = 'none';
            setTimeout(() =>
            {
                container.style.display = originalDisplay;
            }, 50);
        }
    }

    private addFullscreenListeners()
    {
        // ESC键退出全屏
        this.fullscreenKeyHandler = (event: KeyboardEvent) =>
        {
            if (event.key === 'Escape')
            {
                this.isFullscreen = false;
                this.exitFullscreenMode();
            }
        };

        // 添加全屏状态变化监听
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('msfullscreenchange', this.handleFullscreenChange.bind(this));

        document.addEventListener('keydown', this.fullscreenKeyHandler);
    }

    private handleFullscreenChange()
    {
        // 检查是否真的退出了全屏
        const isFullscreen = !!(document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).msFullscreenElement);

        if (!isFullscreen && this.isFullscreen)
        {
            // 用户通过其他方式（如按ESC）退出全屏
            this.isFullscreen = false;
            this.exitFullscreenMode();
        }
    }

    private removeFullscreenListeners()
    {
        if (this.fullscreenKeyHandler)
        {
            document.removeEventListener('keydown', this.fullscreenKeyHandler);
        }

        // 移除全屏状态变化监听
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
        document.removeEventListener('msfullscreenchange', this.handleFullscreenChange.bind(this));
    }

    triggerFileInput()
    {
        // 安全检查，确保fileInput已初始化
        if (this.fileInput && this.fileInput.nativeElement)
        {
            this.fileInput.nativeElement.click();
        } else
        {
            console.warn('File input not initialized yet');
            // 如果未初始化，延迟重试，但只重试一次
            if (!this._retryTrigger)
            {
                this._retryTrigger = true;
                setTimeout(() =>
                {
                    if (this.fileInput && this.fileInput.nativeElement)
                    {
                        this.fileInput.nativeElement.click();
                    } else
                    {
                        console.warn('File input still not initialized after retry');
                    }
                    this._retryTrigger = false;
                }, 100);
            } else
            {
                console.warn('File input retry already attempted');
            }
        }
    }


    // 组件销毁时清理资源
    ngOnDestroy()
    {
        if (this.loadTimeout)
        {
            clearTimeout(this.loadTimeout);
        }
        if (this.pptxPreviewer)
        {
            this.pptxPreviewer = null;
        }
        // 移除所有事件监听器
        this.removeAllEventListeners();
        // 移除全屏监听器
        this.removeFullscreenListeners();
    }

    // 添加事件监听器
    private addEventListeners()
    {
        // 添加鼠标点击、滚轮和键盘事件监听
        const container = this.pptContainer.nativeElement;

        // 鼠标左键点击 - 下一页
        container.addEventListener('click', this.handleContainerClick.bind(this));

        // 鼠标右键点击 - 上一页
        container.addEventListener('contextmenu', this.handleContainerContextMenu.bind(this));

        // 鼠标滚轮 - 翻页
        container.addEventListener('wheel', this.handleContainerWheel.bind(this));

        console.log('PPT Viewer: Event listeners added');
    }

    private removeAllEventListeners()
    {
        // 移除鼠标点击、滚轮和键盘事件监听
        const container = this.pptContainer?.nativeElement;
        if (container)
        {
            container.removeEventListener('click', this.handleContainerClick.bind(this));
            container.removeEventListener('contextmenu', this.handleContainerContextMenu.bind(this));
            container.removeEventListener('wheel', this.handleContainerWheel.bind(this));
        }

        // 移除全屏监听器
        this.removeFullscreenListeners();


        console.log('PPT Viewer: All event listeners removed');
    }

}
