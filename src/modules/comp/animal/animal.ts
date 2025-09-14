import {Component, HostBinding} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-animal',
  imports: [CommonModule],
  templateUrl: './animal.html',
  styleUrl: './animal.scss',
})
export class Animal {
  @HostBinding('class.container-night') isNight = false;
  sunRotationAngle = 0;

  toggleNightMode(event: MouseEvent) {
    event.stopPropagation();
    this.isNight = !this.isNight;

    // 更新太阳旋转角度
    this.sunRotationAngle += 360;
  }
}
