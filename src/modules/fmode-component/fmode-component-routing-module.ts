import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'picker',
    loadComponent: () => import('./picker/picker').then((m) => m.Picker),
  },
  {
    path: 'mobile-video',
    loadComponent: () => import('./mobile-video/mobile-video').then((m) => m.MobileVideo),
  },
  {
    path: 'scan',
    loadComponent: () => import('./scan/scan').then((m) => m.Scan),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FmodeComponentRoutingModule {}
