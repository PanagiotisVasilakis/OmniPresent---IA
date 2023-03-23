/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { Position } from '@capacitor/geolocation';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  showEmail = false;
  showPassword = false;
  
  constructor( private ble: BLE ) { }

  ngOnInit() {  }
  
  async getUsers(): Promise<any[]> {
    const userUUID = 'your-user-uuid';
    const userList: any[] = [];

    try {
      const devices = this.ble.scan([], 5);
      // Subscribe to the Observable to start scanning and receive scan results
      devices.subscribe((device) => {
        if (device.advertising.localName === 'your-app-name' && device.id !== userUUID) {
          userList.push({ id: device.id, name: device.name, latitude: device.latitude, longitude: device.longitude });
        }
      });
      // Wait for the scanning to complete before returning the array
      devices.subscribe();
      console.log(`BLE scan completed. Found ${userList.length} users.`);
      return userList;
    } catch (error) {
      console.error(`BLE scan error: ${JSON.stringify(error)}`);
      throw error;
    }
  }

   findNearbyUsers(userLatitude: number, userLongitude: number, userList: any[]): any[] {
    const nearbyUsers: any[] = [];
  
    for (const user of userList) {
      if (user.latitude && user.longitude) {
        const distance = this.calculateDistance(userLatitude, userLongitude, user.latitude, user.longitude);
        if (distance <= 1000) { // Replace with your preferred distance threshold in meters
          nearbyUsers.push(user);
        }
      }
    }
  
    console.log(`Found ${nearbyUsers.length} nearby users within 1km.`);
    return nearbyUsers;
  }
  
   callUser(user: any): void {
    console.log(`Calling user ${user.name} (${user.id}) for help.`);
    // Replace with your own implementation that calls the user through your app or external service
  }

   calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const earthRadius = 6371; // in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c * 1000; // in meters
    return distance;
  }
  
   toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  async searchForHelp() {
    try {
      const position:Position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const userLatitude = position.coords.latitude;
      const userLongitude = position.coords.longitude;
      const userList = await this.getUsers();
      const nearbyUsers = this.findNearbyUsers(userLatitude, userLongitude, userList);
      
      nearbyUsers.forEach((user) => {
        this.callUser(user);
      });
    } catch (error) {
      console.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }
  
  

}
