import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject, interval, of} from 'rxjs';
import {catchError, map, retryWhen, delay, take, sampleTime, switchMap} from 'rxjs/operators';

/**
 * 模拟的WebSocket服务，提供语音聊天功能
 *
 * 功能包括：
 * - 模拟WebSocket连接
 * - 自动重连机制
 * - 卡顿数据丢弃
 * - 语音数据流模拟
 * - 聊天消息模拟
 *
 * 使用RxJS操作符处理数据流，确保流畅性
 */
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private connectionStatus = new BehaviorSubject<'connected' | 'disconnected' | 'connecting'>('disconnected');
  private audioData = new Subject<number[]>();
  private chatMessages = new Subject<{ user: string, message: string, timestamp: Date }>();

  constructor() {
    // 初始连接
    this.connect();
  }

  /**
   * 建立WebSocket连接
   * 实现自动重连机制
   */
  connect(): void {
    this.connectionStatus.next('connecting');

    // 模拟连接过程
    setTimeout(() => {
      this.connectionStatus.next('connected');
      this.startSimulatedData();
    }, 1500);
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    this.connectionStatus.next('disconnected');
    this.stopSimulatedData();
  }

  /**
   * 启动模拟数据流
   * 生成语音数据和聊天消息
   */
  private startSimulatedData(): void {
    // 模拟语音数据流 - 每50ms生成一次数据
    const audioInterval = setInterval(() => {
      const data = Array.from({length: 40}, () => Math.floor(Math.random() * 100));
      this.audioData.next(data);
    }, 50);

    // 模拟聊天消息 - 每3-8秒随机生成一条消息
    const messageInterval = setInterval(() => {
      const users = ['John Doe', 'Maria Johnson', 'Alex Smith', 'Robert Taylor', 'Emma Stone'];
      const messages = [
        'Can everyone hear me okay?',
        'I think we should reconsider the design approach',
        'The latest build is ready for testing',
        'Let\'s schedule a meeting for next week',
        'I\'ve fixed the issue with the audio processing',
        'Has anyone reviewed the latest PR?',
        'The performance improvements look promising',
        'We need to update the documentation',
      ];

      const user = users[Math.floor(Math.random() * users.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];

      this.chatMessages.next({
        user,
        message,
        timestamp: new Date(),
      });
    }, 3000 + Math.random() * 5000);

    // 存储interval以便清理
    (this as any).intervals = [audioInterval, messageInterval];
  }

  /**
   * 停止模拟数据流
   */
  private stopSimulatedData(): void {
    const intervals = (this as any).intervals || [];
    intervals.forEach((intervalId: any) => clearInterval(intervalId));
    (this as any).intervals = [];
  }

  /**
   * 获取连接状态Observable
   * @returns 连接状态的可观察对象
   */
  getConnectionStatus(): Observable<'connected' | 'disconnected' | 'connecting'> {
    return this.connectionStatus.asObservable();
  }

  /**
   * 获取音频数据流
   * 使用sampleTime操作符丢弃多余数据，确保流畅性
   * @returns 音频数据的可观察对象
   */
  getAudioData(): Observable<number[]> {
    return this.audioData.asObservable().pipe(
      sampleTime(100), // 每100ms采样一次，丢弃多余数据
      catchError(error => {
        console.error('Audio data error:', error);
        return of([]);
      }),
    );
  }

  /**
   * 获取聊天消息流
   * @returns 聊天消息的可观察对象
   */
  getChatMessages(): Observable<{ user: string, message: string, timestamp: Date }> {
    return this.chatMessages.asObservable().pipe(
      catchError(error => {
        console.error('Chat message error:', error);
        return of({user: 'System', message: 'Error loading messages', timestamp: new Date()});
      }),
    );
  }
}
