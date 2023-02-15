import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InsideAppComponent } from './inside.component';

const routes: Routes = [
  {
    path: '',
    component: InsideAppComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsidePageRoutingModule {}
