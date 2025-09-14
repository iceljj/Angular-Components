import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [{
  path: 'lottery',
  loadComponent: () => import('./lottery/lottery').then((m) => m.Lottery)
},
  {
    path: 'home',
    loadComponent: () => import('./home/home').then(m => m.Home)
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlgorithmRoutingModule {
}
