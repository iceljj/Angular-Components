import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PptViewerComponent } from './ppt-viewer/ppt-viewer.component';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'upload',
    loadComponent: () => import('./comp-upload/comp-upload').then((m) => m.CompUpload),
  },
  {
    path: 'list',
    loadComponent: () => import('./comp-list/comp-list').then((m) => m.CompList),
  },
  {
    path: 'btn',
    loadComponent: () => import('./comp-btn/comp-btn').then((m) => m.CompBtn),
  },
  {
    path: 'upload',
    loadComponent: () => import('./comp-upload/comp-upload').then((m) => m.CompUpload),
  },
  {
    path: 'list',
    loadComponent: () => import('./comp-list/comp-list').then((m) => m.CompList),
  },
  {
    path: 'btn',
    loadComponent: () => import('./comp-btn/comp-btn').then((m) => m.CompBtn),
  },
  {
    path: 'menu',
    loadComponent: () => import('./comp-menu/comp-menu').then((m) => m.CompMenu),
  },
  {
    path: 'folder',
    loadComponent: () => import('./comp-folder/comp-folder').then((m) => m.CompFolder),
  },
  {
    path: 'hourglass',
    loadComponent: () => import('./countdown-timer/countdown-timer').then((m) => m.CountdownTimer),
  },
  {
    path: 'animal',
    loadComponent: () => import('./animal/animal').then((m) => m.Animal),
  },
  {
    path: 'image-animal',
    loadComponent: () => import('./image-animal/image-animal').then((m) => m.ImageAnimal),
  },
  {
    path: 'comp-modol',
    loadComponent: () => import('./comp-modol/comp-modol').then((m) => m.CompModol),
  },
  {
    path: 'videogular',
    loadComponent: () => import('./videogular/videogular').then((m) => m.Videogular),
  },
  {
    path: 'ngvideo',
    loadComponent: () => import('./ng-video/ng-video').then((m) => m.NgVideo),
  },
  {
    path: 'drop-down-toggle',
    loadComponent: () =>
      import('./drop-down-toggle/drop-down-toggle').then((m) => m.DropDownToggle),
  },
  {
    path: 'popover',
    loadComponent: () => import('./popover/popover').then((m) => m.Popover),
  },
  {
    path: 'waterfall',
    loadComponent: () => import('./waterfall/waterfall').then((m) => m.Waterfall),
  },
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat').then((m) => m.Chat),
  },
  {
    path: 'Microphone',
    loadComponent: () => import('./microphone/microphone').then((m) => m.Microphone),
  },
  {
    path: 'provinces',
    loadComponent: () => import('./provinces/provinces').then((m) => m.Provinces),
  },
  {
    path: 'lowCode',
    loadComponent: () => import('./low-code/low-code').then((m) => m.LowCode),
  },
  {
    path: 'card-selected',
    loadComponent: () => import('./card-selected/card-selected').then((m) => m.CardSelected),
  },
  {
    path: 'CheckList',
    loadComponent: () => import('./check-list/check-list').then((m) => m.CheckList),
  },
  {
    path: 'checkListS',
    loadComponent: () =>
      import('./check-list-small/check-list-small').then((m) => m.CheckListSmall),
  },
  {
    path: 'coupons',
    loadComponent: () => import('./coupons/coupons').then((m) => m.Coupons),
  },
  {
    path: 'message',
    loadComponent: () =>
      import('./message/message-demo.component').then((m) => m.MessageDemoComponent),
  },
  {
    path: 'excel-grid',
    loadComponent: () => import('./excel-grid').then((m) => m.ExcelGridComponent),
  },
  {
    path: 'docx',
    loadComponent: () => import('./docx-comp/docx-comp.component').then((m) => m.DocxCompComponent),
  },
  {
    path: 'ppt-viewer',
    loadComponent: () =>
      import('./ppt-viewer/ppt-viewer-demo.component').then((m) => m.PptViewerDemoComponent),
  },
  {
    path: 'md',
    loadComponent: () => import('./md-comp/md-comp.component').then((m) => m.MdCompComponent),
  },
  {
    path: 'mobile-music',
    loadComponent: () => import('./mobile-music/mobile-music').then((m) => m.MobileMusic),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompRoutingModule {}
