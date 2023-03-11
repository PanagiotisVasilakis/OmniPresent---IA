/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
// import {SmsManager} from "@byteowls/capacitor-sms";
import {Device, DeviceInfo} from "@capacitor/device";
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  latitude: number;
  longitude: number;
  isEmergencyContactAdd: boolean = false;
  iosOrAndroid: boolean;
  emergencyContacts: Array<{ name: string, number: string }> = [];
  emergencyContactName: string;
  emergencyContactNumber: string;
  

  constructor(
    private authService: AuthService,
    private geolocation: Geolocation,
    private storage: Storage
  ) { 
    this.storage.create();
  }

  saveEmergencyContact(){
    // Add new emergency contact to the array
    this.emergencyContacts.push({ name: this.emergencyContactName, number: this.emergencyContactNumber });
    // Save the updated emergency contacts array in local storage
    this.storage.set('emergencyContacts', JSON.stringify(this.emergencyContacts));
    console.log('we did it');
  }
  
  // sendEmergencySMS() {
  //   // Retrieve emergency contacts array from local storage
  //   this.storage.get('emergencyContacts').then(contacts => {
  //     this.emergencyContacts = JSON.parse(contacts);
  //     // Get the current location
  //     this.geolocation.getCurrentPosition().then((resp) => {
  //       this.latitude = resp.coords.latitude;
  //       this.longitude = resp.coords.longitude;
    
  //       // Construct the message body
  //       const message = `EMERGENCY: Please help! I am in danger. My location is https://www.google.com/maps/place/${this.latitude},${this.longitude}.`;
        
  //       for (const element of this.emergencyContacts) {
  //         const contact: any = element;
  //         SmsManager.send({
  //             numbers: contact.number,
  //             text: message,
  //         }).then(() => {
  //             // success
  //             console.log("success")
  //         }).catch(error => {
  //             console.error(error);
  //         });
  //       }
  //     }) 
  //   })
  // }
  

  async ngOnInit() {
    const info: DeviceInfo = await Device.getInfo();
    this.iosOrAndroid = (info.platform === "android" || info.platform === "ios");
  }

  logout() {
		this.authService.logout();
	}

}
