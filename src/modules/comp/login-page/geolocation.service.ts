/**
 * 地理位置服务
 * 提供浏览器定位功能、位置信息缓存和省份匹配功能
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as turf from '@turf/turf';

/**
 * 省份信息接口
 */
export interface ProvinceInfo {
  /** 省份名称 */
  name: string;
  /** 省份代码 */
  code: string;
  /** 行政级别 */
  level: number;
  /** 中心点坐标 [经度, 纬度] */
  center: [number, number];
}

/**
 * 地理位置结果接口
 */
export interface LocationResult {
  /** 省份名称 */
  province?: string;
  /** 纬度 */
  lat?: number;
  /** 经度 */
  lng?: number;
  /** 定位是否成功 */
  success: boolean;
  /** 定位结果消息 */
  message: string;
}

/**
 * 地理位置服务类
 * 提供获取用户地理位置、匹配省份、缓存位置等功能
 */
@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  /** 缓存键名 */
  private readonly CACHE_KEY = 'user_location';
  /** 最大尝试次数 - 设为public以便组件访问 */
  public readonly MAX_RETRIES = 2;
  /** 缓存有效期（毫秒），5分钟 */
  private readonly CACHE_EXPIRY = 5 * 60 * 1000;

  constructor(private http: HttpClient) {}

  /**
   * 获取用户地理位置信息
   * 注意：此方法应在用户交互事件（如点击按钮）的直接回调中调用，以避免浏览器安全策略警告
   * @param success 成功回调函数，接收定位结果
   * @param error 错误回调函数，接收错误信息
   */
  getUserLocation(success: (result: LocationResult) => void, error: (errorMsg: string) => void): void {
    // 首先检查是否有缓存的位置信息
    const cachedLocation = this.getCachedLocation();
    if (cachedLocation) {
      success(cachedLocation);
      return;
    }

    if (!navigator.geolocation) {
      error('浏览器不支持定位');
      return;
    }

    // 直接在用户手势响应中调用getCurrentPosition
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // 获取地理数据并匹配省份
          const result = await this.matchProvince(lng, lat);
          
          // 缓存成功的定位结果
          if (result.success && result.province) {
            this.cacheLocation(result);
          }

          success(result);
        } catch (err: any) {
          error(err.message || '定位处理失败');
        }
      },
      (err) => {
        let errorMsg = '定位失败';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = '用户拒绝定位权限，请在浏览器设置中允许定位';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = '位置信息不可用，请检查设备定位服务是否开启';
            break;
          case err.TIMEOUT:
            errorMsg = '定位超时，请稍后重试或检查网络连接和定位权限';
            break;
        }
        error(errorMsg);
      },
      {
        enableHighAccuracy: true,  // 开启高精度（会尝试使用 GPS）
        timeout: 30000,            // 延长到 30 秒（国内网络慢）
        maximumAge: 10000          // 允许使用 10 秒内的缓存位置
      }
    );
  }

  /**
   * 带重试机制的获取当前位置
   * @param maxRetries 最大重试次数
   * @param retries 当前重试次数（内部使用）
   * @returns Promise<GeolocationPosition> 地理位置位置信息
   */
  // 标记为public以便组件可以直接在用户交互事件中调用
  public async getCurrentPositionWithRetry(maxRetries: number, retries: number = 0): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          let msg = '未知错误';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg = '用户拒绝定位权限，请在浏览器设置中允许定位';
              reject(new Error(msg));
              break;
            case error.POSITION_UNAVAILABLE:
              msg = '位置信息不可用，请检查设备定位服务是否开启';
              reject(new Error(msg));
              break;
            case error.TIMEOUT:
              retries++;
              if (retries <= maxRetries) {
                // 超时后重试
                setTimeout(() => {
                  this.getCurrentPositionWithRetry(maxRetries, retries)
                    .then(resolve)
                    .catch(reject);
                }, 1000);
                return;
              }
              msg = '定位超时，请检查网络连接和定位权限';
              reject(new Error(msg));
              break;
            default:
              msg = '定位失败';
              reject(new Error(msg));
          }
        },
        {
          enableHighAccuracy: true,  // 开启高精度（会尝试使用 GPS）
          timeout: 30000,            // 延长到 30 秒（国内网络慢）
          maximumAge: 10000          // 允许使用 10 秒内的缓存位置
        }
      );
    });
  }

  /**
   * 匹配用户所在省份
   * 使用本地GeoJSON文件和Turf.js进行坐标点与多边形的空间关系判断
   * @param lng 经度
   * @param lat 纬度
   * @returns Promise<LocationResult> 地理位置匹配结果
   */
  public async matchProvince(lng: number, lat: number): Promise<LocationResult> {
    try {
      // 使用本地GeoJSON文件获取全国行政区划数据
      const geoData = await this.http.get<any>('/assets/FeHelper-20250911104610.json').toPromise();

      if (!geoData.features || !Array.isArray(geoData.features)) {
        throw new Error('地理数据格式错误');
      }

      const point = turf.point([lng, lat]); // 注意：Turf.js使用[经度, 纬度]格式
      let matchedProvince: string | undefined;

      for (const feature of geoData.features) {
        const geometry = feature.geometry;
        const props = feature.properties as ProvinceInfo;

        if (geometry.type === 'Polygon') {
          // 处理单个多边形
          if (turf.booleanPointInPolygon(point, turf.polygon(geometry.coordinates))) {
            matchedProvince = feature.properties.name;
            break;
          }
        } else if (geometry.type === 'MultiPolygon') {
          // 处理多个多边形
          for (const polygon of geometry.coordinates) {
            if (turf.booleanPointInPolygon(point, turf.polygon(polygon))) {
              matchedProvince = feature.properties.name;
              break;
            }
          }
          if (matchedProvince) break;
        }
      }
      
      if (matchedProvince) {
        return {
          success: true,
          message: '定位成功',
          province: matchedProvince,
          lat,
          lng
        };
      } else {
        // 如果没有匹配到，返回原始坐标信息
        return {
          success: true,
          message: '已获取位置信息',
          province: '未知',
          lat,
          lng
        };
      }
    } catch (error: any) {
      console.error('匹配省份失败:', error);
      // 即使匹配失败，也可以返回原始坐标信息
      return {
        success: true,
        message: '已获取位置但无法匹配省份',
        province: '未知',
        lat,
        lng
      };
    }
  }

  /**
   * 从本地存储获取缓存的位置信息
   * @returns LocationResult | null 缓存的位置信息或null（如果没有有效缓存）
   */
  private getCachedLocation(): LocationResult | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const parsed: any = JSON.parse(cached);
      const now = Date.now();

      // 检查缓存是否过期
      if (parsed.timestamp && (now - parsed.timestamp) <= this.CACHE_EXPIRY) {
        // 移除时间戳，返回有效数据
        const { timestamp, ...locationData } = parsed;
        return locationData;
      }

      // 缓存过期，删除并返回null
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    } catch (error) {
      console.error('读取缓存位置信息失败:', error);
      return null;
    }
  }

  /**
   * 将位置信息缓存到本地存储
   * @param locationData 位置信息数据
   */
  private cacheLocation(locationData: LocationResult): void {
    try {
      // 添加时间戳以便后续检查过期
      const dataToCache = {
        ...locationData,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(dataToCache));
    } catch (error) {
      console.error('缓存位置信息失败:', error);
      // 缓存失败不影响主要功能，静默处理
    }
  }

  /**
   * 清除缓存的位置信息
   */
  clearCachedLocation(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.error('清除缓存位置信息失败:', error);
    }
  }

  /**
   * 获取用户地理位置（Promise 版本，便于 await 使用）
   * 注意：此方法应在用户交互事件（如点击按钮）的直接回调中调用，以避免浏览器安全策略警告
   * @returns Promise<LocationResult> 地理位置结果
   */
  public async getUserLocationAsync(): Promise<LocationResult> {
    return new Promise((resolve) => {
      this.getUserLocation(resolve, (errorMsg) => {
        resolve({
          success: false,
          message: errorMsg,
          province: undefined,
          lat: undefined,
          lng: undefined
        });
      });
    });
  }
}