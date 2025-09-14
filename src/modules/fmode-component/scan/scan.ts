import { Component, ViewChild, OnDestroy, Renderer2, Output, EventEmitter } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import {
  BarcodeFormat,
  Result,
  NotFoundException,
  ChecksumException,
  FormatException,
} from '@zxing/library';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronBackOutline, scanCircleOutline } from 'ionicons/icons';

/**
 * 二维码扫描组件
 *
 * 该组件封装了二维码扫描功能，提供以下特性：
 * 1. 使用Ionic图标作为扫描入口
 * 2. 全屏扫描界面，顶部带有返回按钮
 * 3. 中央扫描框动画效果
 * 4. 错误处理机制，打印错误原因
 * 5. 通过事件发射器返回扫描结果
 *
 * @example
 * <app-scan (scanResult)="handleScanResult($event)"></app-scan>
 *
 * @example
 * // 在父组件中处理扫描结果
 * handleScanResult(result: string) {
 *   console.log('扫描结果:', result);
 *   // 处理扫描结果...
 * }
 */
@Component({
  selector: 'app-scan',
  imports: [ZXingScannerModule, CommonModule, FormsModule, IonicModule],
  standalone: true,
  templateUrl: './scan.html',
  styleUrls: ['./scan.scss'],
})
export class Scan implements OnDestroy {
  /** 引用扫描器组件实例 */
  @ViewChild('scanner') scanner!: ZXingScannerComponent;

  /** 输出事件：扫描成功时发射扫描结果 */
  @Output() scanResult = new EventEmitter<string>();

  /** 允许的条形码格式 */
  allowedFormats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
  ];

  /** 扫描状态标志 */
  isScanning = false;
  isCameraReady = false; // 新增摄像头就绪标志
  cameraError = false; // 新增摄像头错误标志

  constructor(private renderer: Renderer2) {
    addIcons({ scanCircleOutline, chevronBackOutline });
  }

  /**
   * 开始扫描
   *
   * 此方法初始化扫描环境：
   * 1. 设置扫描状态为true
   * 2. 向body添加scan-active类，用于全局样式控制
   * 3. 重置扫描结果
   */
  startScan(): void {
    this.isScanning = true;
    this.isCameraReady = false; // 重置摄像头状态
    this.cameraError = false; // 重置错误状态
    this.renderer.addClass(document.body, 'scan-active');
  }

  /**
   * 停止扫描
   *
   * 此方法清理扫描环境：
   * 1. 设置扫描状态为false
   * 2. 重置扫描器实例
   * 3. 从body移除scan-active类
   */
  stopScan(): void {
    this.isScanning = false;
    this.isCameraReady = false;
    if (this.scanner) {
      this.scanner.reset();
    }
    this.renderer.removeClass(document.body, 'scan-active');
  }

  /**
   * 处理摄像头就绪事件
   * @param cameras 可用的摄像头设备列表
   */
  handleCameraFound(cameras: MediaDeviceInfo[]): void {
    if (cameras.length > 0) {
      // 添加短暂延迟确保摄像头完全初始化
      setTimeout(() => {
        this.isCameraReady = true;
        this.cameraError = false;
      }, 300);
    } else {
      this.handleCameraNotFound();
    }
  }

  /**
   * 处理未找到摄像头事件
   */
  handleCameraNotFound(): void {
    console.error('未检测到可用摄像头');
    this.isCameraReady = false;
    this.cameraError = true;
  }

  /**
   * 处理扫描成功事件
   *
   * @param result 扫描结果对象
   *
   * 此方法：
   * 1. 提取扫描结果文本
   * 2. 通过事件发射器发射结果
   * 3. 停止扫描
   */
  handleScanSuccess(result: any): void {
    const resultText = this.extractAfterColon(result);
    this.scanResult.emit(resultText);
    this.stopScan();
  }

  /**
   * 处理扫描错误事件
   *
   * @param error 扫描错误对象
   *
   * 此方法根据错误类型打印相应的错误信息：
   * 1. NotFoundException - 未找到二维码
   * 2. ChecksumException - 二维码校验失败
   * 3. FormatException - 二维码格式错误
   * 4. 其他未知错误
   */
  handleScanError(error: Error): void {
    console.error('扫描错误:', error);

    if (error instanceof NotFoundException) {
      console.error('错误原因: 未找到二维码');
    } else if (error instanceof ChecksumException) {
      console.error('错误原因: 二维码校验失败');
    } else if (error instanceof FormatException) {
      console.error('错误原因: 二维码格式错误');
    } else {
      console.error('错误原因: 未知错误');
    }
  }

  /**
   * 从扫描结果中提取冒号后的内容
   *
   * @param input 原始扫描文本
   * @returns 提取后的文本
   *
   * 此方法处理常见的二维码格式（如URL:example.com），
   * 提取冒号后的内容。如果没有冒号，则返回原始文本。
   */
  extractAfterColon(input: string): string {
    return input.split(':')[1]?.trim() || input;
  }

  /**
   * 组件销毁时的清理工作
   *
   * 此方法确保组件销毁时：
   * 1. 停止扫描
   * 2. 移除全局样式类
   */
  ngOnDestroy(): void {
    this.stopScan();
    this.renderer.removeClass(document.body, 'scan-active');
  }
}
