import {Component, HostBinding} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-comp-animal1',
  imports: [CommonModule, FormsModule],
  templateUrl: './comp-animal1.html',
  styleUrl: './comp-animal1.scss'
})
export class CompAnimal1 {
  @HostBinding('class.day-mode') isDayMode = false;

  stars: any[] = [];
  clouds: any[] = [];
  mountains: any[] = [];

  ngOnInit() {
    // 初始化星星
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * 100,
        y: Math.random() * 70,
        duration: Math.random() * 3 + 1,
        delay: Math.random() * 5
      });
    }

    // 初始化云朵
    for (let i = 0; i < 8; i++) {
      this.clouds.push({
        x: Math.random() * 800,
        y: Math.random() * 150,
        size: Math.random() * 60 + 40,
        speed: Math.random() * 20 + 10
      });
    }

    // 初始化山脉
    const mountainColors = ['#2c3e50', '#34495e', '#2a3b4d'];
    for (let i = 0; i < 5; i++) {
      this.mountains.push({
        x: i * 160,
        width: Math.random() * 200 + 150,
        height: Math.random() * 100 + 100,
        color: mountainColors[i % mountainColors.length]
      });
    }
  }

  toggleDayMode() {
    this.isDayMode = !this.isDayMode;

    // 触发流星动画
    if (!this.isDayMode) {
      setTimeout(() => {
        const shootingStar = document.querySelector('.shooting-star');
        shootingStar?.classList.remove('animate');
        void shootingStar?.clientWidth; // 触发重排
        shootingStar?.classList.add('animate');
      }, 100);
    }
  }
}
