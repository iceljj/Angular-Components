import { Component, computed, effect, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonCheckbox,
  IonFooter,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonPicker,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import pcaData from '../../../assets/pca.json';
import { CommonModule } from '@angular/common';

interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-address-management',
  templateUrl: './provinces.html',
  styleUrls: ['./provinces.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonInput, IonTextarea, IonCheckbox,
    IonFooter, IonModal, IonSelect, IonSelectOption, IonBadge,
    IonPicker,
    CommonModule, FormsModule
  ]
})
export class Provinces {
  // 地址列表
  addresses = signal<Address[]>([
    {
      id: 1,
      name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '市辖区',
      district: '朝阳区',
      detail: '建国路88号',
      isDefault: true
    }
  ]);

  // 控制模态框显示
  showModal = signal(false);
  isEditing = signal(false);

  // 当前编辑的地址
  currentAddress = signal<Address>({
    id: 0,
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false
  });

  // 省份数据
  provinces: string[] = Object.keys(pcaData);

  // Picker相关状态
  showProvincePicker = false;
  showCityPicker = false;
  showDistrictPicker = false;

  selectedProvince = '';
  selectedCity = '';
  selectedDistrict = '';

  constructor() {
    // 初始化时设置默认选中值
    effect(() => {
      const address = this.currentAddress();
      this.selectedProvince = address.province || '';
      this.selectedCity = address.city || '';
      this.selectedDistrict = address.district || '';
    });
  }

  // 获取城市列表
  getFilteredCities() {
    if (!this.currentAddress().province) return [];
    const provinceData = (pcaData as any)[this.currentAddress().province];
    return provinceData ? Object.keys(provinceData) : [];
  }

  // 获取区县列表
  getFilteredDistricts() {
    if (!this.currentAddress().province || !this.currentAddress().city) return [];
    const provinceData = (pcaData as any)[this.currentAddress().province];
    if (!provinceData) return [];
    return provinceData[this.currentAddress().city] || [];
  }

  // 打开省份选择器
  openProvincePicker() {
    this.showProvincePicker = true;
  }

  // 打开城市选择器
  openCityPicker() {
    if (!this.currentAddress().province) return;
    this.showCityPicker = true;
  }

  // 打开区县选择器
  openDistrictPicker() {
    if (!this.currentAddress().province || !this.currentAddress().city) return;
    this.showDistrictPicker = true;
  }

  // 省份选择变化
  onProvinceChange(event: any) {
    this.selectedProvince = event.detail.value;
  }

  // 城市选择变化
  onCityChange(event: any) {
    this.selectedCity = event.detail.value;
  }

  // 区县选择变化
  onDistrictChange(event: any) {
    this.selectedDistrict = event.detail.value;
  }

  // 确认省份选择
  confirmProvince() {
    this.currentAddress.update(addr => ({
      ...addr,
      province: this.selectedProvince,
      city: '',
      district: ''
    }));
    this.showProvincePicker = false;
  }

  // 确认城市选择
  confirmCity() {
    this.currentAddress.update(addr => ({
      ...addr,
      city: this.selectedCity,
      district: ''
    }));
    this.showCityPicker = false;
  }

  // 确认区县选择
  confirmDistrict() {
    this.currentAddress.update(addr => ({
      ...addr,
      district: this.selectedDistrict
    }));
    this.showDistrictPicker = false;
  }

  // Picker关闭处理
  onProvincePickerDismiss(event: any) {
    this.showProvincePicker = false;
  }

  onCityPickerDismiss(event: any) {
    this.showCityPicker = false;
  }

  onDistrictPickerDismiss(event: any) {
    this.showDistrictPicker = false;
  }

  // 返回上一页
  goBack() {
    console.log('返回上一页');
  }

  // 编辑地址
  editAddress(address: Address) {
    this.isEditing.set(true);
    this.currentAddress.set({ ...address });
    this.showModal.set(true);
  }

  // 删除地址
  deleteAddress(id: number) {
    this.addresses.update(addrs => addrs.filter(addr => addr.id !== id));
  }

  // 打开添加地址模态框
  openAddModal() {
    this.isEditing.set(false);
    this.currentAddress.set({
      id: 0,
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false
    });
    this.showModal.set(true);
  }

  // 关闭模态框
  closeModal() {
    this.showModal.set(false);
  }

  // 保存地址
  saveAddress() {
    if (this.isEditing()) {
      // 编辑地址
      this.addresses.update(addrs =>
        addrs.map(addr =>
          addr.id === this.currentAddress().id ? this.currentAddress() : addr
        )
      );
    } else {
      // 添加新地址
      const newAddress = {
        ...this.currentAddress(),
        id: Date.now() // 简单生成唯一ID
      };

      // 如果设置为默认地址，需要取消其他地址的默认状态
      if (newAddress.isDefault) {
        this.addresses.update(addrs =>
          addrs.map(addr => ({ ...addr, isDefault: false }))
        );
      }

      this.addresses.update(addrs => [...addrs, newAddress]);
    }

    this.closeModal();
  }
}
