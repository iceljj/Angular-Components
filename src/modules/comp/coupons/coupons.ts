import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-coupons',
  imports: [CommonModule],
  templateUrl: './coupons.html',
  styleUrl: './coupons.scss'
})
export class Coupons
{
  @Input() coupon = {
    title: '夏日特惠',
    discount: '¥20',
    description: '满¥199可用',
    validDate: '2025-08-31前有效'
  };

  @ViewChild('banner') banner!: ElementRef;

  // 三种清除方式
  hideWithNgIf = false;
  hideWithDisplay = false;
  removeFromDOM = false;

  close(method: 'ngIf' | 'display' | 'dom')
  {
    switch (method)
    {
      case 'ngIf':
        this.hideWithNgIf = true;
        break;
      case 'display':
        this.hideWithDisplay = true;
        break;
      case 'dom':
        this.removeFromDOM = true;
        break;
    }
  }

}
