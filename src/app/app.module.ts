import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule } from '@angular/common/http';
import { Storage }  from '@ionic/storage';
import { IonicStorageModule }  from '@ionic/storage-angular'; 
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
// import * as Sqlite from '@capacitor-community/sqlite';


export function jwtOptionsFactory(storage: { get: (arg0: string) => any; }) {
	return {
		tokenGetter: () => {
			return storage.get('access_token');
		},
		whitelistedDomains: ['localhost:4000']
	};
}

@NgModule({
	declarations: [AppComponent],
	entryComponents: [],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		AppRoutingModule,
		HttpClientModule,
		IonicStorageModule.forRoot(),
		JwtModule.forRoot({
			jwtOptionsProvider: {
				provide: JWT_OPTIONS,
				useFactory: jwtOptionsFactory,
				deps: [Storage]
			}
		})
	],
	providers: [
		StatusBar,
		SplashScreen,
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
	],
	bootstrap: [AppComponent]
})
export class AppModule {}