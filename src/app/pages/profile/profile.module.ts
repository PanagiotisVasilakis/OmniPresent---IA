import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { profilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { SMS } from '@awesome-cordova-plugins/sms/ngx';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    profilePageRoutingModule
  ],
  declarations: [ProfilePage],
  providers: [
    Geolocation,
    SMS
  ]
})
export class profilePageModule {}
