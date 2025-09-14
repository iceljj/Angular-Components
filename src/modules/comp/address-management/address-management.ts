import {Component, signal, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPicker, IonPickerColumn, IonPickerColumnOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

interface Address
{
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

interface PCAData
{
  [province: string]: {
    [city: string]: string[];
  };
}

@Component({
  selector: 'app-address-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBadge,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonPicker,
    IonTextarea,
    IonTitle,
    IonToolbar,
    IonPickerColumn,
    IonPickerColumnOption,
  ],
  templateUrl: './address-management.html',
  styleUrl: './address-management.scss'
})
export class AddressManagement implements OnInit
{
  @ViewChild('provinceModal') provinceModal!: IonModal;
  @ViewChild('cityModal') cityModal!: IonModal;
  @ViewChild('districtModal') districtModal!: IonModal;

  showModal = signal(false);
  isEditing = signal(false);
  currentAddress = signal<Partial<Address>>({});

  provinces: string[] = [];
  cities: Record<string, string[]> = {};
  districts: Record<string, string[]> = {};

  provincePickerValue = '';
  cityPickerValue = '';
  districtPickerValue = '';

  selectedProvince = '';
  selectedCity = '';
  selectedDistrict = '';

  addresses = signal<Address[]>([
    {
      id: 1,
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '广州市',
      district: '天河区',
      detail: '珠江新城花城大道68号',
      isDefault: true
    },
    {
      id: 2,
      name: '李四',
      phone: '13900139000',
      province: '浙江省',
      city: '杭州市',
      district: '上城区',
      detail: '钱江新城民心路88号',
      isDefault: false
    }
  ]);

  constructor()
  {
  }

  ngOnInit()
  {
    this.loadPCAData();
  }

  async loadPCAData()
  {
    try
    {
      const response = await fetch('assets/address/pca.json');
      const pcaData: PCAData = await response.json();

      // 提取省份
      this.provinces = Object.keys(pcaData);

      // 提取城市和区县数据
      for (const province in pcaData)
      {
        const cityData = pcaData[province];
        const cityNames = Object.keys(cityData);

        // 处理直辖市的情况（如北京市、上海市等）
        if (cityNames.length === 1 && cityNames[0] === '市辖区')
        {
          this.cities[province] = cityNames;
          this.districts[province] = cityData[cityNames[0]];
        } else
        {
          this.cities[province] = cityNames;

          // 提取区县数据
          for (const city in cityData)
          {
            if (Array.isArray(cityData[city]))
            {
              this.districts[city] = cityData[city];
            }
          }
        }
      }
    } catch (error)
    {
      console.error('Failed to load PCA data:', error);
    }
  }

  goBack()
  {
  }

  openAddModal()
  {
    this.currentAddress.set({});
    this.isEditing.set(false);
    this.showModal.set(true);

    // 重置picker值
    this.provincePickerValue = '';
    this.cityPickerValue = '';
    this.districtPickerValue = '';
    this.selectedProvince = '';
    this.selectedCity = '';
    this.selectedDistrict = '';
  }

  editAddress(address: Address)
  {
    this.currentAddress.set({...address});
    this.isEditing.set(true);
    this.showModal.set(true);

    // 设置picker值为当前地址的值
    this.provincePickerValue = address.province || '';
    this.cityPickerValue = address.city || '';
    this.districtPickerValue = address.district || '';
    this.selectedProvince = address.province || '';
    this.selectedCity = address.city || '';
    this.selectedDistrict = address.district || '';
  }

  deleteAddress(id: number)
  {
    this.addresses.update(addresses => addresses.filter(addr => addr.id !== id));
  }

  setDefaultAddress(id: number)
  {
    this.addresses.update(addresses =>
      addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
    );
  }

  saveAddress()
  {
    // 更新currentAddress中的省市区值
    this.currentAddress.update(addr => ({
      ...addr,
      province: this.selectedProvince,
      city: this.selectedCity,
      district: this.selectedDistrict
    }));

    if (this.isEditing())
    {
      this.addresses.update(addresses =>
        addresses.map(addr =>
          addr.id === this.currentAddress().id ? {...this.currentAddress()} as Address : addr
        )
      );
    } else
    {
      const newAddress = {
        ...this.currentAddress(),
        id: Date.now(),
        isDefault: this.addresses().length === 0
      } as Address;

      this.addresses.update(addresses => [...addresses, newAddress]);
    }

    this.closeModal();
  }

  closeModal()
  {
    this.showModal.set(false);
    this.currentAddress.set({});
  }

  // Picker相关方法
  openProvincePicker()
  {
    this.provinceModal.present();
  }

  openCityPicker()
  {
    if (!this.selectedProvince) return;
    this.cityModal.present();
  }

  openDistrictPicker()
  {
    if (!this.selectedCity) return;
    this.districtModal.present();
  }

  onProvinceChange(ev: any)
  {
    this.provincePickerValue = ev.detail.value;
  }

  onCityChange(ev: any)
  {
    this.cityPickerValue = ev.detail.value;
  }

  onDistrictChange(ev: any)
  {
    this.districtPickerValue = ev.detail.value;
  }

  confirmProvince()
  {
    this.selectedProvince = this.provincePickerValue;
    this.provinceModal.dismiss();

    // 重置城市和区县
    this.selectedCity = '';
    this.selectedDistrict = '';
    this.cityPickerValue = '';
    this.districtPickerValue = '';
  }

  confirmCity()
  {
    this.selectedCity = this.cityPickerValue;
    this.cityModal.dismiss();

    // 重置区县
    this.selectedDistrict = '';
    this.districtPickerValue = '';
  }

  confirmDistrict()
  {
    this.selectedDistrict = this.districtPickerValue;
    this.districtModal.dismiss();
  }

  cancelProvince()
  {
    this.provinceModal.dismiss();
  }

  cancelCity()
  {
    this.cityModal.dismiss();
  }

  cancelDistrict()
  {
    this.districtModal.dismiss();
  }

  getFilteredCities()
  {
    const province = this.selectedProvince;
    return province ? this.cities[province] || [] : [];
  }

  getFilteredDistricts()
  {
    const city = this.selectedCity;
    if (!city) return [];

    // 处理直辖市的情况
    if (this.districts[city])
    {
      return this.districts[city];
    }

    // 查找是否有以城市名作为键的区县数据
    const province = this.selectedProvince;
    if (province && this.cities[province] && this.cities[province].includes('市辖区'))
    {
      return this.districts[province] || [];
    }

    return [];
  }
}
