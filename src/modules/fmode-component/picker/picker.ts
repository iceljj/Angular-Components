import { Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonModal,
  IonPicker,
  IonPickerColumn,
  IonPickerColumnOption,
  IonTitle,
  IonToolbar,
  IonIcon
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';

@Component({
  selector: 'app-address-picker',
  templateUrl: './picker.html',
  styleUrls: ['./picker.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonModal,
    IonPicker,
    IonPickerColumn,
    IonPickerColumnOption,
    IonTitle,
    IonToolbar,
    IonIcon,
    CommonModule
  ]
})
export class Picker implements OnInit {
  provinces: string[] = [];
  cities: string[] = [];
  districts: string[] = [];

  selectedProvince: string | null = null;
  selectedCity: string | null = null;
  selectedDistrict: string | null = null;

  currentColumn: 'province' | 'city' | 'district' = 'province';

  pcaData: any = {};

  constructor() {
    addIcons({ chevronDownOutline });
  }

  async ngOnInit() {
    try {
      const response = await fetch('assets/pca.json');
      this.pcaData = await response.json();
      this.provinces = Object.keys(this.pcaData);

      // 初始化第一个省的城市和区域
      if (this.provinces.length > 0) {
        this.selectedProvince = this.provinces[0];
        this.onProvinceChange({ detail: { value: this.selectedProvince } });
      }
    } catch (error) {
      console.error('Failed to load pca data:', error);
    }
  }

  onProvinceChange(event: any) {
    this.selectedProvince = event.detail.value;
    this.selectedCity = null;
    this.selectedDistrict = null;

    if (this.selectedProvince) {
      const cityData = this.pcaData[this.selectedProvince];
      this.cities = Object.keys(cityData);

      // 初始化第一个城市
      if (this.cities.length > 0) {
        this.selectedCity = this.cities[0];
        this.onCityChange({ detail: { value: this.selectedCity } });
      } else {
        this.districts = [];
      }
    } else {
      this.cities = [];
      this.districts = [];
    }
  }

  onCityChange(event: any) {
    this.selectedCity = event.detail.value;
    this.selectedDistrict = null;

    if (this.selectedProvince && this.selectedCity) {
      const cityData = this.pcaData[this.selectedProvince];
      this.districts = cityData[this.selectedCity] || [];

      // 初始化第一个区域
      if (this.districts.length > 0) {
        this.selectedDistrict = this.districts[0];
      }
    } else {
      this.districts = [];
    }
  }

  onDistrictChange(event: any) {
    this.selectedDistrict = event.detail.value;
  }

  onColumnFocus(column: 'province' | 'city' | 'district') {
    this.currentColumn = column;
  }

  confirmSelection() {
    const result = {
      province: this.selectedProvince,
      city: this.selectedCity,
      district: this.selectedDistrict
    };

    const modal = document.querySelector('ion-modal');
    if (modal) {
      modal.dismiss(result, 'confirm');
    }
  }

  onDidDismiss(event: CustomEvent) {
    if (event.detail.role === 'confirm') {
      const data = event.detail.data;
      this.selectedProvince = data.province;
      this.selectedCity = data.city;
      this.selectedDistrict = data.district;
      console.log('Selected address:', data);
      // 这里可以将数据传递给父组件
    }
  }
}
