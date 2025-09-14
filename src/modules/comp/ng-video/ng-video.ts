import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';


@Component({
  selector: 'app-ng-video',
  imports: [],
  templateUrl: './ng-video.html',
  styleUrl: './ng-video.scss'
})
export class NgVideo {
  // 播放器元素引用
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  // 播放状态
  isPlaying = false;

  // 当前进度 (百分比)
  currentProgress = 0;

  // 音量 (0-100)
  volume = 80;

  // 当前清晰度
  currentQuality = '1080p';

  // 清晰度选项 [5](@ref)
  qualities = [
    {label: '高清 720p', value: '720p'},
    {label: '超清 1080p', value: '1080p'},
    {label: '4K', value: '4k'}
  ];

  // 视频源（多清晰度支持）
  videoSources = [
    {
      src: '/assets/video/1.mp4',
      type: 'video/mp4',
      label: '720p'
    },
    {
      src: '/assets/video/1.mp4',
      type: 'video/mp4',
      label: '1080p'
    },
    {
      src: '/assets/video/1.mp4',
      type: 'video/mp4',
      label: '4k'
    }
  ];

  /**
   * 播放/暂停切换
   */
  togglePlay(): void {
    if (this.isPlaying) {
      this.videoPlayer.nativeElement.pause();
    } else {
      this.videoPlayer.nativeElement.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  /**
   * 更新进度条
   * @param event 时间更新事件
   */
  updateProgress(): void {
    const video = this.videoPlayer.nativeElement;
    this.currentProgress = (video.currentTime / video.duration) * 100;
  }

  /**
   * 跳转到指定位置
   * @param percent 进度百分比 (0-100)
   */
  seekTo(percent: number): void {
    const video = this.videoPlayer.nativeElement;
    video.currentTime = (percent / 100) * video.duration;
  }

  /**
   * 切换全屏模式 [6](@ref)
   */
  toggleFullscreen(): void {
    const player = this.videoPlayer.nativeElement.parentElement;
    if (player) {
      if (!document.fullscreenElement) {
        player.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  }

  /**
   * 切换清晰度
   * @param quality 选中的清晰度
   */
  changeQuality(quality: string): void {
    this.currentQuality = quality;
    // 实际项目中此处应切换视频源
  }

  // 快捷键支持 [3](@ref)
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case ' ':
        this.togglePlay();
        break;
      case 'ArrowRight':
        this.seekTo(this.currentProgress + 5);
        break;
      case 'ArrowLeft':
        this.seekTo(this.currentProgress - 5);
        break;
      case 'f':
        this.toggleFullscreen();
        break;
    }
  }
}
