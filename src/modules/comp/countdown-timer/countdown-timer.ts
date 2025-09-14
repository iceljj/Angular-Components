import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  ElementRef,
  SimpleChanges, Renderer2,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SandParticle {
  id: number;
  x: number;
  y: number;
  isMoving: boolean;
  targetX?: number;
  targetY?: number;
}

@Component({
             selector: 'app-countdown-timer',
             imports: [CommonModule,
               FormsModule],
             templateUrl: './countdown-timer.html',
             styleUrl: './countdown-timer.scss',
           })
export class CountdownTimer
{
  @Input() duration: number = 30; // 倒计时总秒数
  @Input() sandCount: number = 100; // 沙粒总数
  @Input() color: string = '#F5D142';
  @Input() size: number = 100;

  upperSandArray: number[] = [];
  lowerSandArray: number[] = [];

  private intervalId: any;
  private animationQueue: number[] = [];
  private isAnimating = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['duration'] || changes['sandCount']) {
      this.reset();
    }
  }

  ngAfterViewInit(): void {
    this.startCountdown();
  }

  reset() {
    this.upperSandArray = Array.from({ length: this.sandCount }, (_, i) => i);
    this.lowerSandArray = [];
    this.animationQueue = [...this.upperSandArray];
    clearInterval(this.intervalId);
  }

  startCountdown() {
    this.reset();

    const interval = Math.floor((this.duration * 1000) / this.sandCount);

    let index = 0;
    this.intervalId = setInterval(() => {
      if (index < this.upperSandArray.length) {
        this.dropRandomGrain();
        index++;
      } else {
        clearInterval(this.intervalId);
      }
    }, interval);
  }

  dropRandomGrain() {
    if (this.isAnimating) return;

    const randomIndex = Math.floor(Math.random() * this.upperSandArray.length);
    const grainId = this.upperSandArray[randomIndex];

    this.isAnimating = true;
    this.animationQueue.push(grainId);

    setTimeout(() => {
      this.lowerSandArray.unshift(grainId);
      this.upperSandArray.splice(randomIndex, 1);
      this.animationQueue.pop();
      this.isAnimating = false;
    }, 600); // 等待动画完成
  }
}
