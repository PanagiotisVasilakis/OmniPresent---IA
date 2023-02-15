import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { InsidePageRoutingModule } from './inside-routing.module';

// import { Geolocation } from '@awesome-cordova-plugins/geolocation';
import { RouteReuseStrategy } from '@angular/router';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { InsideAppComponent } from './inside.component';
import { ReactiveFormsModule } from '@angular/forms';
// import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@NgModule({
  entryComponents: [],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsidePageRoutingModule,
    ReactiveFormsModule
  ],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    Platform,
    StatusBar,
    SplashScreen,
    { 
      provide: RouteReuseStrategy, 
      useClass: IonicRouteStrategy 
    }
  ],
  declarations: [InsideAppComponent],
  bootstrap: [InsideAppComponent],
})
export class InsidePageModule {}
