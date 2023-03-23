import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsPageRoutingModule
  ],
  providers: [Geolocation ,BLE],
  declarations: [SettingsPage]
})
export class SettingsPageModule {}
