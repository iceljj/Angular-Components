import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  Renderer2,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { VgApiService, VgPlayerComponent } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Hls from 'hls.js';

/**
 * 视频播放器组件 (使用HLS实现)
 * @remarks
 * 基于HLS.js实现大厂级别的视频播放功能，包括：
 * 1. 支持HLS流媒体播放
 * 2. 智能预加载和缓存管理
 * 3. 自适应码率切换
 * 4. 多种视图模式（宽屏/关灯/无黑边）
 *
 * 注意：本组件已完全重构以支持HLS协议
 *
 * @example
 * <app-videogular [videoSources]="hlsSources"></app-videogular>
 */
@Component({
  selector: 'app-videogular',
  standalone: true,
  imports: [
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './videogular.html',
  styleUrls: ['./videogular.scss']
})
export class Videogular implements OnInit, OnDestroy, AfterViewInit {
  /** 播放器API实例 */
  public api!: VgApiService;

  /** HLS实例 */
  private hls!: Hls;

  /** 播放器DOM元素引用 */
  @ViewChild('mediaPlayer') player!: VgPlayerComponent;
  @ViewChild('media') media!: ElementRef<HTMLVideoElement>;
  @ViewChild('scrubBar') scrubBar!: ElementRef;


  // 状态控制变量
  /**
   * 是否正在播放
   */
  public isPlaying = false;

  /**
   * 是否显示覆盖播放按钮
   */
  public showOverlayPlay = true;

  /**
   * 是否隐藏控制栏
   */
  public hideControls = false;

  /**
   * 是否正在缓冲
   */
  public isBuffering = false;

  /**
   * 是否加载错误
   */
  public loadError = false;

  /**
   * 是否为直播流
   */
  public isLiveStream = false;

  // 音频控制
  /**
   * 音量大小 (0-1)
   */
  public volume = 1.0;

  /**
   * 是否静音
   */
  public isMuted = false;

  // 播放控制
  /**
   * 播放速率
   */
  public playbackRate = 1.0;

  /**
   * 播放进度百分比
   */
  public progress = 0;

  /**
   * 缓冲百分比
   */
  public bufferPercentage = 0;

  /**
   * 缓冲区间列表
   */
  public bufferedRanges: any[] = [];

  /**
   * 缓冲开始时间
   */
  public bufferStart = 0;

  /**
   * 缓冲结束时间
   */
  public bufferEnd = 0;

  /**
   * 视频总时长
   */
  public totalDuration = 0;

  // 视图模式
  /**
   * 是否为宽屏模式
   */
  public isWidescreen = false;

  /**
   * 是否为关灯模式
   */
  public isTheaterMode = false;

  /**
   * 是否为网页全屏
   */
  public isWebFullscreen = false;

  // 控制面板状态
  /**
   * 是否显示音量滑块
   */
  public showVolumeSlider = false;

  /**
   * 是否显示画质选项
   */
  public showQualityOptions = false;

  /**
   * 是否显示播放速度选项
   */
  public showSpeedOptions = false;

  /**
   * 是否显示设置菜单
   */
  public showSettingsMenu = false;

  // 播放选项
  /**
   * 播放速度选项列表
   */
  public speedOptions = [
    { label: '2.0x', value: 2.0 },
    { label: '1.5x', value: 1.5 },
    { label: '1.25x', value: 1.25 },
    { label: '正常', value: 1.0 },
    { label: '0.75x', value: 0.75 },
    { label: '0.5x', value: 0.5 }
  ];

  // HLS源配置
  /**
   * 视频封面图
   */
  public posterImage = 'assets/images/video-thumbnail.jpg';

  /**
   * 当前选择的画质
   */
  public selectedQuality: any;

  /**
   * 可用画质列表
   */
  public availableQualities: any[] = [];

  /**
   * 当前HLS流URL
   */
  public currentHlsUrl = '';

  /**
   * HLS质量级别列表
   */
  public hlsLevels: any[] = [];

  // HLS配置参数
  /**
   * HLS配置选项
   */
  private hlsConfig: any = {
    maxBufferLength: 30,       // 最大缓冲长度(秒)
    maxMaxBufferLength: 60,   // 最大缓冲长度上限
    maxBufferSize: 60 * 1000 * 1000, // 最大缓冲大小(60MB)
    highBufferWatchdogPeriod: 1, // 监控缓冲状态的时间间隔
    enableWorker: true,        // 启用Web Worker
    lowLatencyMode: true,      // 低延迟模式
    backBufferLength: 5,       // 保留的缓冲长度
    testBandwidth: true,       // 启用带宽检测
    debug: false,              // 禁用调试日志
    fragLoadingRetryDelay: 500, // 片段加载失败重试延时(ms)
    manifestLoadingTimeOut: 10000 // 播放列表加载超时时间(ms)
  };

  // 预加载相关变量
  /**
   * 是否正在预加载
   */
  private isPreloading = false;

  // 内部状态管理
  /**
   * 控制栏隐藏定时器
   */
  private controlHideTimeout: any;

  /**
   * 空格键防抖标记
   */
  private spaceKeyDebounced = false;

  /**
   * 是否正在拖动进度条
   */
  private isScrubbing = false;

  /**
   * 拖动开始时的鼠标X坐标
   */
  private scrubStartX = 0;

  /**
   * 拖动开始时的播放百分比
   */
  private scrubStartPercentage = 0;

  /**
   * 拖动前是否正在播放
   */
  private wasPlaying = false;

  /**
   * 控制面板防抖定时器集合
   */
  private controlDebounceTimers: { [key: string]: any } = {};

  /**
   * 当前重试次数
   */
  private retryCount = 0;

  /**
   * 最大重试次数
   */
  private maxRetries = 1;

  /**
   * 缓冲超时定时器
   */
  private bufferingTimeout: any;

  /**
   * 缓冲超时持续时间(毫秒)
   */
  private bufferingTimeoutDuration = 3000;

  /**
   * 缓冲更新计时器
   */
  private bufferUpdateInterval: any;

  /**
   * 组件构造函数
   * @param renderer Angular渲染器，用于操作DOM元素
   * @param cdr 变更检测器，用于强制刷新UI
   * @param zone Angular区域，用于管理异步操作
   */
  constructor(
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
  }

  /**
   * 组件初始化钩子
   * 初始化HLS源列表和默认选中的画质
   */
  ngOnInit(): void {
    // 初始化HLS源列表
    this.availableQualities = [
      { label: '超清 1080p', url: 'public/video/1.m3u8', bitrate: 5000 },
      { label: '高清 720p', url: 'public/video/1.m3u8', bitrate: 2500 },
      { label: '标清 480p', url: 'public/video/1.m3u8', bitrate: 1000 },
      { label: '流畅 360p', url: 'public/video/2.m3u8', bitrate: 500 },
    ];

    this.selectedQuality = this.availableQualities[3];
    this.currentHlsUrl = this.selectedQuality.url;
  }

  /**
   * 视图初始化完成钩子
   * 设置全局事件监听器并初始化HLS播放器
   */
  ngAfterViewInit(): void {
    this.setupGlobalListeners();
    this.initializeHlsPlayer();
  }

  /**
   * 组件销毁钩子
   * 清理所有资源，包括定时器和HLS实例
   */
  ngOnDestroy(): void {
    this.cleanupResources();
  }

  /**
   * 初始化HLS播放器
   * 创建并配置HLS实例，加载视频源，设置事件监听
   */
  private initializeHlsPlayer(): void {
    const videoElement = this.media.nativeElement;

    // 清理已有HLS实例
    if (this.hls) {
      this.hls.destroy();
    }

    // 创建新的HLS实例
    this.hls = new Hls(this.hlsConfig);

    // 绑定到video元素
    this.hls.attachMedia(videoElement);

    // 设置初始视频源
    this.hls.loadSource(this.currentHlsUrl);

    // 设置HLS事件监听器
    this.setupHlsEvents();

    // 延迟检测状态
    setTimeout(() => this.detectStreamType(), 1000);

    // 开始缓冲更新计时器
    this.startBufferUpdateTimer();
  }

  /**
   * 设置HLS事件监听器
   * 为HLS实例添加各种事件的监听器，处理播放列表加载、缓冲、错误等情况
   */
  private setupHlsEvents(): void {
    if (!this.hls) return;

    // 监听播放列表加载事件
    this.hls.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
      this.zone.run(() => {
        // 获取所有质量级别
        this.hlsLevels = data.levels || [];

        // 重置播放器状态
        this.loadError = false;
        this.isBuffering = false;

        // 检测是否为直播流
        this.detectStreamType();
      });
    });

    // 监听片段加载事件
    this.hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
      // 可在此处添加数据收集点，用于分析加载性能
    });

    // 监听缓冲事件
    this.hls.on(Hls.Events.BUFFER_CREATED, () => {
      // 触发缓冲状态更新
      this.updateBufferDisplay();
    });

    // 监听缓冲进度
    this.hls.on(Hls.Events.BUFFER_APPENDING, () => {
      // 触发缓冲状态更新
      this.updateBufferDisplay();
    });

    // 监听错误事件
    this.hls.on(Hls.Events.ERROR, (event, data) => {
      this.zone.run(() => {
        // 处理缓冲停滞错误
        if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
          this.showBuffering();
        }
        this.handleHlsError(data);
      });
    });

    // 监听缓冲结束事件
    this.hls.on(Hls.Events.BUFFER_APPENDED, () => {
      this.zone.run(() => {
        this.hideBuffering();
        this.clearBufferingTimeout();
      });
    });
  }

  /**
   * 设置全局事件监听器
   * 为文档添加全局鼠标和键盘事件监听器，用于处理进度条拖动和全局快捷键
   */
  private setupGlobalListeners(): void {
    this.renderer.listen('document', 'mousemove', (event) =>
      this.handleGlobalMouseMove(event));
    this.renderer.listen('document', 'mouseup', () =>
      this.handleGlobalMouseUp());
    this.renderer.listen('document', 'keydown', (event) =>
      this.handleGlobalKeyDown(event));
  }

  /**
   * 检测视频流类型（直播/点播）
   * 根据视频的duration属性判断是直播流还是点播视频
   */
  private detectStreamType(): void {
    if (!this.media?.nativeElement) return;

    const duration = this.media.nativeElement.duration;
    if (duration === Infinity || duration === 0) {
      this.isLiveStream = true;
    } else {
      this.isLiveStream = false;
      this.totalDuration = duration;
    }
  }

  /**
   * 清理资源
   * 在组件销毁时清理所有定时器、HLS实例和其他资源，防止内存泄漏
   */
  private cleanupResources(): void {
    // 清理定时器
    if (this.controlHideTimeout) clearTimeout(this.controlHideTimeout);
    if (this.bufferingTimeout) clearTimeout(this.bufferingTimeout);
    if (this.bufferUpdateInterval) clearInterval(this.bufferUpdateInterval);

    // 清理HLS实例
    if (this.hls) {
      this.hls.stopLoad();
      this.hls.detachMedia();
      this.hls.destroy();
    }

    // 清理控制面板防抖定时器
    Object.keys(this.controlDebounceTimers).forEach(key => {
      if (this.controlDebounceTimers[key]) {
        clearTimeout(this.controlDebounceTimers[key]);
      }
    });
  }

  /**
   * 播放器准备就绪回调
   * 当Videogular播放器初始化完成后调用，设置初始状态和事件监听
   * @param api 视频播放器API实例
   */
  onPlayerReady(api: VgApiService): void {
    this.api = api;
    this.api.volume = this.volume;
    this.api.volume = 0; // 初始设置为静音
    this.api.playbackRate = this.playbackRate;
    this.api.play();
    // 监听播放事件
    this.api.getDefaultMedia().subscriptions.play.subscribe(() => {
      this.isPlaying = true;
      this.showOverlayPlay = true;
    });

    // 监听暂停事件
    this.api.getDefaultMedia().subscriptions.pause.subscribe(() => {
      this.isPlaying = false;
      if (!this.isBuffering && !this.loadError) {
        this.showOverlayPlay = true;
      }
    });

    // 开始控制栏隐藏计时器
    this.startControlBarTimer();
  }

  /**
   * 处理HLS错误
   * 根据不同类型的HLS错误采取相应的处理措施，如重试加载或显示错误信息
   * @param data 错误数据，包含错误详情和类型
   */
  private handleHlsError(data: any): void {
    console.error('HLS Error:', data.details);

    // 统一使用handleVideoError处理所有类型的错误，确保一致的重试逻辑
    switch (data.details) {
      case Hls.ErrorDetails.MANIFEST_LOAD_ERROR:
      case Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT:
        // 播放列表加载错误
        this.handleVideoError('播放列表加载失败');
        break;

      case Hls.ErrorDetails.FRAG_LOAD_ERROR:
      case Hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
        // 片段加载错误
        this.handleVideoError('视频片段加载失败');
        break;

      case Hls.ErrorDetails.BUFFER_STALLED_ERROR:
        // 缓冲停滞错误
        // 注意：这个错误是在监听器中特别处理的，这里不再重复处理
        break;

      default:
        console.log("其他错误")
        this.handleVideoError('视频播放错误');
        break;
    }
  }

  /**
   * 显示缓冲指示器
   * 设置缓冲状态，隐藏覆盖播放按钮，并启动缓冲超时检测
   */
  showBuffering(): void {
    if (this.isBuffering) return;

    this.isBuffering = true;
    this.showOverlayPlay = false;
    this.clearBufferingTimeout();

    // 设置超时检测
    this.bufferingTimeout = setTimeout(() => {
      if (this.isBuffering) {
        this.handleVideoError('缓冲超时');
      }
    }, this.bufferingTimeoutDuration);
  }

  /**
   * 隐藏缓冲指示器
   * 重置缓冲状态并清理缓冲超时定时器
   */
  hideBuffering(): void {
    this.isBuffering = false;
    this.clearBufferingTimeout();
  }

  /**
   * 清除缓冲超时定时器
   * 取消缓冲超时检测，防止在缓冲恢复后触发错误处理
   */
  clearBufferingTimeout(): void {
    if (this.bufferingTimeout) {
      clearTimeout(this.bufferingTimeout);
      this.bufferingTimeout = null;
    }
  }

  /**
   * 更新缓存显示
   * 计算并更新缓冲范围、缓冲百分比等参数，用于UI显示
   */
  private updateBufferDisplay(): void {
    if (!this.media?.nativeElement) return;

    const video = this.media.nativeElement;
    const currentTime = video.currentTime;
    const duration = this.isLiveStream ? video.duration : this.totalDuration;

    if (!isFinite(duration) || duration <= 0) return;

    // 初始化缓冲范围
    this.bufferedRanges = [];
    let maxBufferEnd = 0;

    // 获取缓冲范围
    for (let i = 0; i < video.buffered.length; i++) {
      const start = video.buffered.start(i);
      const end = video.buffered.end(i);

      // 计算最大缓冲范围
      if (end > maxBufferEnd) {
        maxBufferEnd = end;
      }

      // 添加到缓冲范围列表
      this.bufferedRanges.push({ start, end });
    }

    // 计算缓冲百分比
    this.bufferStart = currentTime;
    this.bufferEnd = maxBufferEnd;

    if (this.bufferEnd > 0 && duration > 0) {
      this.bufferPercentage = (this.bufferEnd / duration) * 100;
    }

    // 强制更新UI
    this.cdr.detectChanges();
  }

  /**
   * 开始缓冲更新计时器
   * 设置定时更新缓冲状态的计时器，每500毫秒更新一次
   */
  private startBufferUpdateTimer(): void {
    this.bufferUpdateInterval = setInterval(() => {
      this.updateBufferDisplay();
    }, 500);
  }


  /**
   * 处理视频错误
   * 设置错误状态，并根据重试次数决定是否进行重试
   * @param message 错误信息（可选）
   */
  private handleVideoError(message?: string): void {
    // 先清除缓冲超时定时器
    this.clearBufferingTimeout();

    // 检查是否需要重试
    if (this.retryCount < this.maxRetries) {
      // 设置为缓冲状态，不显示错误
      this.isBuffering = true;
      this.loadError = false;
      this.showOverlayPlay = false;

      // 增加重试计数
      this.retryCount++;
      console.log(`尝试重试加载 (${this.retryCount}/${this.maxRetries})`);

      // 延迟重试
      setTimeout(() => this.retryLoading(), 1000 * this.retryCount);
    } else {
      // 超出重试次数，显示错误界面
      this.hideBuffering();
      this.loadError = true;
      this.showOverlayPlay = false;
      this.retryCount = 0;
      console.log('加载失败，显示错误界面');

      // 强制更新UI，确保错误界面正确显示
      this.cdr.detectChanges();
    }
  }

  /**
   * 重试加载当前HLS流
   * 重置错误状态，尝试重新加载HLS流，如果失败则重新初始化播放器
   */
  retryLoading(): void {
    // 重置错误状态，设置为缓冲状态
    this.loadError = false;
    this.isBuffering = true;

    console.log('开始重试加载视频流...');

    if (this.hls) {
      try {
        // 停止当前加载
        this.hls.stopLoad();

        // 清除之前的错误事件监听，避免重复触发
        this.hls.off(Hls.Events.ERROR);

        // 重新添加错误事件监听
        this.hls.on(Hls.Events.ERROR, (event, data) => {
          this.zone.run(() => {
            this.handleHlsError(data);
          });
        });

        // 设置超时检测，避免加载无响应
        const retryTimeout = setTimeout(() => {
          console.error('重试加载超时');
          this.hideBuffering();
          this.loadError = true;
          this.retryCount = 0;
        }, 3000);

        // 监听清单加载成功，清除超时检测
        const onManifestLoaded = () => {
          clearTimeout(retryTimeout);
          this.hls.off(Hls.Events.MANIFEST_LOADED, onManifestLoaded);
        };

        this.hls.on(Hls.Events.MANIFEST_LOADED, onManifestLoaded);

        // 重新开始加载
        this.hls.startLoad();

        // 尝试恢复播放
        setTimeout(() => {
          if (this.api && this.api.state !== 'playing') {
            try {
              this.api.play();
            } catch (e) {
              console.error('恢复播放失败:', e);
            }
          }
        }, 500);
      } catch (e) {
        console.error('重试加载失败:', e);
        this.hideBuffering();
        this.loadError = true;
        this.retryCount = 0;
      }
    } else {
      try {
        // 如果HLS实例不存在，重新初始化
        this.initializeHlsPlayer();
      } catch (e) {
        console.error('重新初始化播放器失败:', e);
        this.hideBuffering();
        this.loadError = true;
        this.retryCount = 0;
      }
    }
  }

  /**
   * 开始拖动进度条
   * 设置拖动状态并暂停播放，开始处理进度拖动
   * @param event 鼠标事件对象，包含鼠标位置信息
   */
  startScrubbing(event: MouseEvent): void {
    if (!this.api) return;

    event.preventDefault();
    this.isScrubbing = true;
    this.wasPlaying = this.isPlaying;

    if (this.wasPlaying) {
      this.api.pause();
    }

    this.scrubStartX = event.clientX;
    this.scrubStartPercentage = this.api.currentTime / this.api.duration;
    this.handleGlobalMouseMove(event);
  }

  /**
   * 处理全局鼠标移动事件
   * 在拖动进度条时计算并更新当前的播放时间点
   * @param event 鼠标事件对象，包含当前鼠标位置
   */
  private handleGlobalMouseMove(event: MouseEvent): void {
    if (!this.isScrubbing || !this.api || !this.scrubBar) return;

    const scrubBarEl = this.scrubBar.nativeElement;
    const rect = scrubBarEl.getBoundingClientRect();
    const position = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const percentage = position / rect.width;

    // 设置当前时间
    this.api.currentTime = percentage * (this.isLiveStream ? this.api.duration : this.totalDuration);
  }

  /**
   * 处理全局鼠标释放事件
   * 结束进度条拖动，恢复之前的播放状态
   */
  private handleGlobalMouseUp(): void {
    if (this.isScrubbing) {
      this.isScrubbing = false;
      if (this.wasPlaying && this.api) {
        this.api.play();
      }
    }
  }

  /**
   * 处理全局键盘事件
   * 根据按下的按键执行相应的播放器操作，如播放/暂停、快进/快退、全屏等
   * @param event 键盘事件对象，包含按键信息
   */
  private handleGlobalKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const tagName = target.tagName;

    // 如果事件目标是输入元素（INPUT, TEXTAREA, SELECT）或者可编辑元素，则忽略 [6](@ref)
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' ||
      tagName === 'SELECT' || target.isContentEditable) {
      return;
    }

    // 处理ESC键 - 恢复所有模式到初始状态 [1,2,3,4](@ref)
    if (event.key === 'Escape') {
      this.resetAllModes();
      this.resetControlBarTimer(); // 显示控制栏并重置计时器
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // 原来的逻辑：如果事件目标是视频元素，则交给handleKeyEvents处理
    if (event.target === this.media.nativeElement) {
      this.handleKeyEvents(event);
    }
  }

  /**
   * 开始控制栏隐藏计时器
   * 显示控制栏并设置定时器，在指定时间后自动隐藏控制栏
   */
  startControlBarTimer(): void {
    if (this.controlHideTimeout) {
      clearTimeout(this.controlHideTimeout);
    }

    this.controlHideTimeout = setTimeout(() => {
      this.hideControls = true;
    }, 3000);
  }

  /**
   * 重置控制栏隐藏计时器
   * 清除已存在的控制栏隐藏定时器，防止重复计时
   */
  resetControlBarTimer(): void {
    this.hideControls = false;
    this.startControlBarTimer();
  }

  /**
   * 处理鼠标移动
   * 当鼠标在播放器上移动时，显示控制栏并重置隐藏计时器
   * @param event 鼠标事件对象
   */
  handleMouseMove(event: MouseEvent): void {
    this.hideControls = false;
    this.resetControlBarTimer();
  }

  /**
   * 处理键盘事件
   * @param event 键盘事件
   */
  handleKeyEvents(event: KeyboardEvent): void {
    if (!this.api) return;

    if (event.key === ' ') {
      if (!this.spaceKeyDebounced) {
        this.togglePlayback();
        this.spaceKeyDebounced = true;
        setTimeout(() => this.spaceKeyDebounced = false, 300);
      }
      event.preventDefault();
      return;
    }
    // 处理ESC键 - 恢复所有模式到初始状态 [1,2](@ref)
    if (event.key === 'Escape') {
      this.resetAllModes();
      this.resetControlBarTimer(); // 显示控制栏并重置计时器
      event.preventDefault();
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        this.api.currentTime = Math.max(0, this.api.currentTime - 5);
        break;
      case 'ArrowRight':
        this.api.currentTime = Math.min(this.totalDuration, this.api.currentTime + 5);
        break;
      case 'ArrowUp':
        this.volume = Math.min(1, this.volume + 0.05);
        this.setVolume();
        break;
      case 'ArrowDown':
        this.volume = Math.max(0, this.volume - 0.05);
        this.setVolume();
        break;
      case 'm':
      case 'M':
        this.toggleMute();
        break;
      case 'f':
      case 'F':
        this.enterFullscreen();
        break;
      case 'w':
      case 'W':
        this.toggleWidescreen();
        break;
      case 't':
      case 'T':
        this.toggleTheaterMode();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        const percent = parseInt(event.key) / 10;
        this.api.currentTime = this.totalDuration * percent;
        break;
      case '>':
        this.increaseSpeed();
        break;
      case '<':
        this.decreaseSpeed();
        break;
      case '0':
        this.api.currentTime = 0;
        break;
    }

    this.resetControlBarTimer();
  }

  /**
   * 切换播放状态
   * 根据当前播放状态执行暂停或播放操作，如有加载错误则尝试重试
   */
  togglePlayback(): void {
    if (this.api.state === 'playing') {
      this.api.pause();
    } else {
      if (this.loadError) {
        this.retryLoading();
      } else {
        this.api.play();
      }
    }
  }

  /**
   * 开始播放
   * 尝试播放视频内容，如有加载错误则进行重试
   */
  startPlayback(): void {
    if (this.loadError) {
      this.retryLoading();
    } else {
      this.api.play();
    }
  }

  /**
   * 进入全屏模式
   * 使用浏览器兼容的API请求全屏显示视频元素
   */
  enterFullscreen(): void {
    const videoElement = this.media.nativeElement as any;

    // 使用兼容的全屏API
    if (typeof videoElement.requestFullscreen === 'function') {
      videoElement.requestFullscreen();
    }
    // 为浏览器前缀添加兼容支持
    else if (typeof videoElement.webkitRequestFullscreen === 'function') {
      videoElement.webkitRequestFullscreen();
    } else if (typeof videoElement.mozRequestFullScreen === 'function') {
      videoElement.mozRequestFullScreen();
    } else if (typeof videoElement.msRequestFullscreen === 'function') {
      videoElement.msRequestFullscreen();
    } else {
      console.error('Fullscreen API not supported in this browser');
    }
  }

  /**
   * 切换宽屏模式
   * 切换视频播放器的宽屏显示状态
   */
  toggleWidescreen(): void {
    this.isWidescreen = !this.isWidescreen;
  }

  /**
   * 切换关灯模式
   * 切换播放器的关灯模式（影院模式），在该模式下会自动退出网页全屏
   */
  toggleTheaterMode(): void {
    this.isTheaterMode = !this.isTheaterMode;
    if (this.isTheaterMode && this.isWebFullscreen) {
      this.toggleWebFullscreen();
    }
  }

  /**
   * 切换网页全屏
   * 切换网页全屏模式，添加或移除全屏CSS类，在进入网页全屏时会自动退出影院模式
   */
  toggleWebFullscreen(): void {
    this.isWebFullscreen = !this.isWebFullscreen;

    if (this.isWebFullscreen) {
      document.documentElement.classList.add('web-fullscreen');
      if (this.isTheaterMode) {
        this.isTheaterMode = false;
      }
    } else {
      document.documentElement.classList.remove('web-fullscreen');
    }
  }

  /**
   * 设置音量
   * 根据输入事件或当前音量值设置视频播放器的音量
   * @param event 输入事件（可选），通常来自音量控制滑块
   */
  setVolume(event?: Event): void {
    if (event) {
      const target = event.target as HTMLInputElement;
      this.volume = parseFloat(target.value);
    }

    if (this.api) {
      this.api.volume = this.volume;
      if (this.volume > 0 && this.isMuted) {
        this.isMuted = false;
      }
    }
  }

  /**
   * 切换静音
   * 切换播放器的静音状态，同时保持原始音量值
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.api) {
      this.api.volume = this.isMuted ? 0 : this.volume;
    }
  }

  /**
   * 设置播放速率
   * 根据当前设置的播放速率值更新视频播放器的实际播放速度
   */
  setPlaybackRate(): void {
    if (this.api) {
      this.api.playbackRate = this.playbackRate;
    }
  }

  /**
   * 增加播放速度
   * 将播放速度增加到预设速度选项中的下一个更高值
   */
  increaseSpeed(): void {
    const currentIndex = this.speedOptions.findIndex(s => s.value === this.playbackRate);
    if (currentIndex < this.speedOptions.length - 1) {
      this.playbackRate = this.speedOptions[currentIndex + 1].value;
      this.setPlaybackRate();
    }
  }

  /**
   * 降低播放速度
   * 将播放速度降低到预设速度选项中的下一个更低值
   */
  decreaseSpeed(): void {
    const currentIndex = this.speedOptions.findIndex(s => s.value === this.playbackRate);
    if (currentIndex > 0) {
      this.playbackRate = this.speedOptions[currentIndex - 1].value;
      this.setPlaybackRate();
    }
  }

  /**
   * 选择视频质量
   * 切换视频的播放质量，并重新初始化播放器以应用新的质量设置
   * @param quality 质量选项对象，包含URL和其他质量相关信息
   */
  selectQuality(quality: any): void {
    console.log('Selected quality:', quality);
    console.log("修改清晰度");

    if (this.selectedQuality.url === quality.url) return;

    this.selectedQuality = quality;
    this.currentHlsUrl = quality.url;
    this.showQualityOptions = false;

    // 重新初始化播放器
    this.initializeHlsPlayer();

    // 预加载相邻质量
    // this.preloadAdjacentQualities();
  }

  /**
   * 选择播放速度
   * 设置指定的播放速度并更新播放器状态，同时关闭速度选项菜单
   * @param speed 播放速度值
   */
  selectSpeed(speed: number): void {
    this.playbackRate = speed;
    this.setPlaybackRate();
    this.showSpeedOptions = false;
  }

  /**
   * 获取速度标签
   * 根据当前播放速度值获取对应的显示标签文本
   * @returns 播放速度的显示标签
   */
  getSpeedLabel(): string {
    const speedOption = this.speedOptions.find(s => s.value === this.playbackRate);
    return speedOption ? speedOption.label : '正常';
  }

  /**
   * 控制面板显示控制
   * 处理控制面板组件的悬停或焦点进入事件，显示相应的控制选项
   * @param controlType 控制类型，支持质量、速度或音量控制
   */
  onControlEnter(controlType: 'quality' | 'speed' | 'volume'): void {
    if (this.controlDebounceTimers[controlType]) {
      clearTimeout(this.controlDebounceTimers[controlType]);
      this.controlDebounceTimers[controlType] = null;
    }

    switch (controlType) {
      case 'quality':
        this.showQualityOptions = true;
        break;
      case 'speed':
        this.showSpeedOptions = true;
        break;
      case 'volume':
        this.showVolumeSlider = true;
        break;
    }
  }

  /**
   * 控制面板隐藏控制
   * 处理控制面板组件的悬停或焦点离开事件，设置定时器后隐藏相应的控制选项
   * @param controlType 控制类型，支持质量、速度或音量控制
   */
  onControlLeave(controlType: 'quality' | 'speed' | 'volume'): void {
    if (this.controlDebounceTimers[controlType]) {
      clearTimeout(this.controlDebounceTimers[controlType]);
    }

    this.controlDebounceTimers[controlType] = setTimeout(() => {
      switch (controlType) {
        case 'quality':
          this.showQualityOptions = false;
          break;
        case 'speed':
          this.showSpeedOptions = false;
          break;
        case 'volume':
          this.showVolumeSlider = false;
          break;
      }
      this.controlDebounceTimers[controlType] = null;
    }, 150);
  }

  /**
   * 重置所有视图模式
   * 恢复播放器的默认视图状态，包括关闭宽屏、影院模式，关闭所有菜单，退出全屏等
   */
  resetAllModes(): void {
    this.isWidescreen = false;
    this.isTheaterMode = false;

    // 关闭所有弹出菜单
    this.showQualityOptions = false;
    this.showSpeedOptions = false;
    this.showVolumeSlider = false;
    this.showSettingsMenu = false;

    // 退出网页全屏
    if (this.isWebFullscreen) {
      this.toggleWebFullscreen();
    }

    // 退出浏览器全屏
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  /**
   * 处理上下文菜单
   * 阻止默认的右键上下文菜单显示，用于自定义播放器右键菜单
   * @param event 鼠标事件对象
   */
  menu(event: Event): void {
    event.preventDefault();
  }

  /**
   * 切换到下一个视频
   * 实现简单的播放列表轮播功能，切换到下一个可用的视频质量选项
   */
  nextVideo(): void {
    // 简单轮播播放列表
    const currentIndex = this.availableQualities.findIndex(
      q => q.url === this.selectedQuality.url
    );

    if (currentIndex >= 0) {
      const nextIndex = (currentIndex + 1) % this.availableQualities.length;
      this.selectedQuality = this.availableQualities[nextIndex];
      this.currentHlsUrl = this.selectedQuality.url;
      this.initializeHlsPlayer();
    }
  }


  /**************************************************************************/
  /*                                                                        */
  /*                  新增HLS相关事件处理函数                                */
  /*                                                                        */

  /**************************************************************************/

  /**
   * 视频准备就绪事件
   * 处理视频可以开始播放的事件，隐藏缓冲指示器，检测流类型并更新视频时长
   * @param event 事件对象
   */
  onCanPlay(event: Event): void {
    this.hideBuffering();
    this.loadError = false;

    // 检测视频流类型
    this.detectStreamType();

    // 更新总时长
    if (!this.isLiveStream && this.api) {
      this.totalDuration = this.api.duration;
    }

    // 更新缓冲显示
    this.updateBufferDisplay();
  }

  /**
   * 视频错误事件
   * 处理视频播放过程中的错误事件，记录错误信息并执行相应的错误处理
   * @param event 事件对象
   */
  onVideoError(event: Event): void {
    console.error('Video error:', (event.target as HTMLVideoElement).error);
    console.log("视频播放错误")
    this.handleVideoError('视频播放错误');
  }

  /**
   * 视频缓冲停滞事件
   * @param event 事件对象
   */
  onStalled(event: Event): void {
    this.showBuffering();
  }

  /**
   * 视频缓冲恢复事件
   * @param event 事件对象
   */
  onPlaying(event: Event): void {
    this.hideBuffering();
  }

  /**
   * 视频缓冲开始事件
   * @param event 事件对象
   */
  onWaiting(event: Event): void {
    this.showBuffering();
  }

  /**
   * 视频缓冲进度事件
   * @param event 事件对象
   */
  onProgress(event: Event): void {
    this.updateBufferDisplay();
  }
}
