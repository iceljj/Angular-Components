import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [{
  path: 'companimal1',
  loadComponent: () => import('./comp-animal1/comp-animal1').then(m => m.CompAnimal1)
},
  {
    path: 'envelop',
    loadComponent: () => import('./envelop/envelop').then(m => m.Envelop)
  },
  {
  path: 'cubeloading',
  loadComponent: () => import('./cubeloading/cubeloading').then(m => m.Cubeloading)
},
  {
  path: 'lottie',
  loadComponent: () => import('./lottie/lottie').then(m => m.Lottie)
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnimalRoutingModule {
}
