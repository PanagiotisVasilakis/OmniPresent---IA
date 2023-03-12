/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import {Device, DeviceInfo} from "@capacitor/device";
import { SqLiteDatabaseService } from 'src/app/services/sq-lite-database.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  isEmergencyContactAdd: boolean = false;
  iosOrAndroid: boolean;
  emergencyContactName: string;
  emergencyContactNumber: string;
  showEmail = false;
  showPassword = false;
  

  constructor(
    private authService: AuthService,
    private sqLiteDatabaseService: SqLiteDatabaseService
  ) {  }

  async saveEmergencyContact(){
        //SAVE CONTACTS BY CLICK                      
          await this.sqLiteDatabaseService.run(
            `INSERT INTO contacts (name, phonenumber)
            VALUES (?, ?);`, 
            [this.emergencyContactName, this.emergencyContactNumber]
          );
          console.log('we did it');
  }

  async ngOnInit() {
    const info: DeviceInfo = await Device.getInfo();
    this.iosOrAndroid = (info.platform === "android" || info.platform === "ios");
  }

  logout() {
		this.authService.logout();
	}

}
