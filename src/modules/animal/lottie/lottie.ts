import {Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, QueryList} from '@angular/core';
import lottie, {AnimationItem} from 'lottie-web';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-lottie',
  templateUrl: './lottie.html',
  styleUrls: ['./lottie.scss'],
  imports: [FormsModule, CommonModule]
})
export class Lottie implements AfterViewInit, OnDestroy
{
  @ViewChild('animationContainer', {static: false})
  animationContainer!: ElementRef;

  animations: {
    name: string;
    path: string;
    animation?: AnimationItem;
    totalFrames: number;
    currentSpeed: number;
  }[] = [
    {
      name: 'Click',
      path: 'assets/animations/click.json',
      totalFrames: 0,
      currentSpeed: 1
    },
    {
      name: 'Add To Cart',
      path: 'assets/animations/Add To Cart Success.json',
      totalFrames: 0,
      currentSpeed: 1
    },
    {
      name: 'Check Mark',
      path: 'assets/animations/Check Mark.json',
      totalFrames: 0,
      currentSpeed: 1
    },
    {
      name: 'loading',
      path: 'assets/animations/Loading animation blue.json',
      totalFrames: 0,
      currentSpeed: 1
    },
    {
      name: '404',
      path: 'assets/animations/Lonely 404.json',
      totalFrames: 0,
      currentSpeed: 1
    },
    {
      name: 'skating',
      path: 'assets/animations/Orange skating.json',
      totalFrames: 0,
      currentSpeed: 1
    },
  ];

  ngAfterViewInit(): void
  {
    this.initializeAnimations();
  }

  private initializeAnimations(): void
  {
    const containers = document.querySelectorAll('.animation-container');

    containers.forEach((container, index) =>
    {
      const animation = lottie.loadAnimation({
        container: container as HTMLElement,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: this.animations[index].path
      });

      this.animations[index].animation = animation;

      animation.addEventListener('DOMLoaded', () =>
      {
        this.animations[index].totalFrames = animation.totalFrames;
      });

      animation.setSubframe(false);
    });
  }

  // 播放指定索引的动画
  play(index: number): void
  {
    this.animations[index].animation?.play();
  }

  // 暂停指定索引的动画
  pause(index: number): void
  {
    this.animations[index].animation?.pause();
  }

  // 上一帧
  prevFrame(index: number): void
  {
    const animation = this.animations[index].animation;
    if (animation)
    {
      const currentFrame = animation.currentFrame;
      if (currentFrame > 0)
      {
        animation.goToAndStop(currentFrame - 1, true);
      } else
      {
        animation.goToAndStop(this.animations[index].totalFrames - 1, true);
      }
    }
  }

  // 下一帧
  nextFrame(index: number): void
  {
    const animation = this.animations[index].animation;
    if (animation)
    {
      const currentFrame = animation.currentFrame;
      if (currentFrame < this.animations[index].totalFrames - 1)
      {
        animation.goToAndStop(currentFrame + 1, true);
      } else
      {
        animation.goToAndStop(0, true);
      }
    }
  }

  // 设置播放速度
  setSpeed(event: Event, index: number): void
  {
    const target = event.target as HTMLInputElement;
    const speed = parseFloat(target.value);
    this.animations[index].currentSpeed = speed;
    this.animations[index].animation?.setSpeed(speed);
  }

  // 组件销毁时释放资源
  ngOnDestroy(): void
  {
    this.animations.forEach(anim =>
    {
      if (anim.animation)
      {
        anim.animation.destroy();
      }
    });
  }
}
