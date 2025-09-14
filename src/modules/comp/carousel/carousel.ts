import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrls: ['./carousel.scss'],
})
export class Carousel implements AfterViewInit, OnDestroy {
  @Input() images: string[] = [
    'https://picsum.photos/id/1/800/400',
    'https://picsum.photos/id/2/800/400',
    'https://picsum.photos/id/3/800/400',
    'https://picsum.photos/id/4/800/400'
  ];

  @Input() titles: string[] = [
    '山间日出',
    '宁静湖泊',
    '雪山之巅',
    '森林小径'
  ];

  @Input() descriptions: string[] = [
    '清晨的第一缕阳光洒在山间，万物苏醒',
    '宁静的湖面倒映着蓝天白云，如诗如画',
    '巍峨的雪山在阳光下闪耀着圣洁的光芒',
    '蜿蜒的小径通向神秘的森林深处'
  ];

  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLElement>;

  currentIndex = 0;
  isAutoPlaying = true;
  private autoPlayInterval: any;
  private startX = 0;
  private isDragging = false;
  private dragOffset = 0;

  ngAfterViewInit() {
    this.startAutoPlay();
    this.setTrackPosition();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.setTrackPosition();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.setTrackPosition();
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.setTrackPosition();
  }

  private setTrackPosition() {
    if (this.carouselTrack) {
      const track = this.carouselTrack.nativeElement;
      track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }
  }

  // 触摸事件处理
  onTouchStart(event: TouchEvent) {
    this.stopAutoPlay();
    this.startX = event.touches[0].clientX;
    this.isDragging = true;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;

    const currentX = event.touches[0].clientX;
    this.dragOffset = this.startX - currentX;

    if (this.carouselTrack) {
      const track = this.carouselTrack.nativeElement;
      const offset = this.currentIndex * 100 + (this.dragOffset / window.innerWidth) * 100;
      track.style.transform = `translateX(-${offset}%)`;
      track.style.transition = 'none';
    }
  }

  onTouchEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;

    if (this.carouselTrack) {
      const track = this.carouselTrack.nativeElement;
      track.style.transition = '';

      const threshold = 0.3;
      const dragPercentage = this.dragOffset / window.innerWidth;

      if (Math.abs(dragPercentage) > threshold) {
        if (dragPercentage > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      } else {
        this.setTrackPosition();
      }
    }

    this.dragOffset = 0;
    this.startAutoPlay();
  }
}
