/**
 * 登录页面组件
 * 提供用户登录功能，集成地理位置自动获取功能
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeolocationService, LocationResult } from './geolocation.service';

/**
 * 登录页面组件
 * 提供登录表单、一键登录功能，集成地理位置服务进行自动定位
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  /** 登录表单 */
  loginForm!: FormGroup;
  /** 加载状态标志 */
  isLoading = false;
  /** 登录错误信息 */
  loginError = '';
  /** 地理位置结果 */
  locationResult: LocationResult = { success: false, message: '未开始定位' };

  /** 演示用默认账号密码 */
  private readonly DEFAULT_CREDENTIALS = {
    username: 'admin',
    password: '123456'
  };

  /**
   * 构造函数
   * @param fb 表单构建器
   * @param geolocationService 地理位置服务，用于获取用户地理位置信息
   */
  constructor(private fb: FormBuilder, private geolocationService: GeolocationService) { }

  /**
   * 组件初始化
   * 创建登录表单
   */
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * 表单提交处理
   * 验证账号密码并直接触发定位请求（在用户交互事件中直接调用）
   * 按照Chrome安全策略要求，确保地理位置请求在用户手势的直接响应中调用
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;

    if (username === this.DEFAULT_CREDENTIALS.username && password === this.DEFAULT_CREDENTIALS.password) {
      this.isLoading = true;
      this.loginError = '';
      this.locationResult = { success: false, message: '定位中...' };

      try {
        // ✅ 在用户点击事件中直接调用服务方法
        const result = await this.geolocationService.getUserLocationAsync();
        this.locationResult = result;
      } catch (err: any) {
        console.error('定位错误:', err);
        this.locationResult = {
          success: false,
          message: err.message || '未知定位错误'
        };
      } finally {
        this.isLoading = false;
      }
    } else {
      this.loginError = '用户名或密码错误';
    }
  }

  /**
   * 一键登录功能
   * 自动填入默认账号密码并点击登录
   */
  quickLogin(): void {
    // 填入默认账号密码
    this.loginForm.patchValue({
      username: this.DEFAULT_CREDENTIALS.username,
      password: this.DEFAULT_CREDENTIALS.password
    });

    // 自动触发登录
    this.onSubmit();
  }
}
