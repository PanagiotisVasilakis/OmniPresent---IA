import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as L from 'leaflet';
import { GeocoderAutocomplete, GeocoderAutocompleteOptions } from '@geoapify/geocoder-autocomplete';
import { SqLiteDatabaseService } from 'src/app/services/sq-lite-database.service';



@Component({
  selector: 'app-inside',
  templateUrl: 'inside.component.html',
  styleUrls: ['inside.component.scss'],
})
export class InsideAppComponent implements OnInit{
  public mymap : L.Map;
  suggestions: any;
  myAPIKey = "7ab20422eadd4008be20a8274432337d";
  searchForm = true;
  navForm=true;
  displayRoutes=true;
  latholder1:number = 0.000000;
  lonholder1:number = 0.000000;
  latholder2:number = 0.000000;
  lonholder2:number = 0.000000;
  url:string;
  input2:HTMLElement | null;
  route: L.Layer | any;
  startL: string;
  endL: string;
  routes: any[] = [];
  savedRoutes: any[] = [];


  // startLocation: string;
  // endLocation: string;
  // date: Date;
  // routeData = {
  //   startLocation: '',
  //   endLocation: '',
  //   date: new Date()
  // };
  // DBURL = environment.url;

 
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    public http: HttpClient,
    private splashScreen: SplashScreen,
    private authService: AuthService,
    private sqLiteDatabaseService: SqLiteDatabaseService,
    // private routeService: RouteService
    ) {
    this.initializeApp();
  }

  ngOnInit() {
    //map initialization 
    this.mymap = L.map('map', {
      zoomControl: false
    }).setView([ 38.246639, 21.734573], 11);

    //osm layer
    var osm = L.tileLayer('https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?&apiKey=7ab20422eadd4008be20a8274432337d', {
      id: 'osm-bright'
    });

    //Dark Map
    var darkMap = L.tileLayer('https://maps.geoapify.com/v1/tile/dark-matter-yellow-roads/{z}/{x}/{y}.png?apiKey=7ab20422eadd4008be20a8274432337d', {
       id: 'osm-bright'
    });

    //Layer Controller
    var baseMaps = {
      "Omni Map": osm,
      "Dark Mode": darkMap
    };

    //deafault map
    osm.addTo(this.mymap);
    var controlLayers = new L.Control.Layers(baseMaps).addTo(this.mymap);
    controlLayers.setPosition('bottomright');
    // this.mymap.zoomControl.setPosition('topright');
    // add map scale info
    new L.Control.Scale().addTo(this.mymap);  
    

    setTimeout(() => {
      this.mymap.invalidateSize();
    }, 200);


    //https://api.geoapify.com/v1/routing?waypoints=48.776438,9.150830|48.535490,9.2707263&format=json&mode=drive&details=instruction_details&apiKey=7ab20422eadd4008be20a8274432337d
    //const  url = `https://api.geoapify.com/v1/routing?waypoints=${this.fromWaypoint.join(',')}|${this.toWaypoint.join(',')}&mode=drive&details=instruction_details&apiKey=${this.myAPIKey}`;
    //Search and autocomplete in searching results
    const input1 = document.getElementById("autocomplete1") as HTMLInputElement;
    if (input1) {
      const autocomplete = new GeocoderAutocomplete(
        input1, 
        '7ab20422eadd4008be20a8274432337d', 
        <GeocoderAutocompleteOptions>{ 
          language: 'en',  
          types: ['locality'], 
          allowNonVerifiedHouseNumber: true,
          allowNonVerifiedStreet: true,
          skipDetails: true,
          autoSelect: false
        }
      );

      // It has by default an X icon for erasing the user's input and i closed it for appeariance reasons
      const closeButton = Array.from(document.getElementsByClassName("geoapify-close-button")) as HTMLElement[];
      for (const button of closeButton) {
         button.style.display = "none";
      }
      
      autocomplete.on('suggestions', (suggestions) => {
        console.log('Suggestions: ', suggestions);
      });

      // Takes the result that the user selected and displays it in the map
      autocomplete.on('select', (location) => {
        console.log(location);
        this.mymap.setView([location.properties.lat,location.properties.lon], 13);
        L.marker([location.properties.lat, location.properties.lon]).addTo(this.mymap).bindPopup(location.properties.name).openPopup(); 
      });
    }


    //Navigation
      const input2 = document.getElementById("autocomplete2") as HTMLInputElement;
      if (input2) {
        for(let i = 0; i < 2; i++){
          const autocomplete = new GeocoderAutocomplete(
            input2, 
            '7ab20422eadd4008be20a8274432337d', 
            <GeocoderAutocompleteOptions>{ 
              language: 'en',  
              types: ['locality'], 
              allowNonVerifiedHouseNumber: true,
              allowNonVerifiedStreet: true,
              skipDetails: true,
              autoSelect: false
            }
          );

          // It has by default an X icon for erasing the user's input and i closed it for appeariance reasons
          const closeButton = Array.from(document.getElementsByClassName("geoapify-close-button")) as HTMLElement[];
          for (const button of closeButton) {
            button.style.display = "none";
          }
          
          autocomplete.on('suggestions', (suggestions) => {
            console.log('Suggestions: ', suggestions);
          });

          // Takes the result that the user selected and displays it in the map
          autocomplete.on('select', (location) => {
            console.log(location);

            if(i===0){
              this.latholder1 = location.properties.lat;
              this.lonholder1 = location.properties.lon;
              this.startL = location.properties.name;

            } else if(i === 1){
              this.latholder2 = location.properties.lat;
              this.lonholder2 = location.properties.lon;
              this.endL = location.properties.name;


              //SAVE ROUTES BY CLICK              
              // Add this line of code to get a reference to the save button element
              const saveButton = document.getElementById("saveButton") as HTMLElement | any;
              
              // Add an event listener to the save button that calls the saveRoute function
              saveButton.addEventListener("click", async () => {
                const SavedRouteName = this.startL + ' - ' + this.endL;
                const result = await this.sqLiteDatabaseService.execute(
                  `INSERT INTO places (name, latitudeFirst, longitudeFirst, latitudeSecond, longitudeSecond)
                  VALUES (?, ?, ?, ?, ?);`, 
                  [SavedRouteName, this.latholder1, this.lonholder1, this.latholder2, this.lonholder2]
                );
              });
            }          
          });
        }
      }
    }

  
  navigatebutton() {
    this.url = `https://api.geoapify.com/v1/routing?waypoints=${this.latholder1},${this.lonholder1}|${this.latholder2},${this.lonholder2}&mode=drive&details=instruction_details&apiKey=${this.myAPIKey}`;
    this.http.get<any>(this.url)
    .subscribe(calculatedRouteGeoJSON => {
      console.log(calculatedRouteGeoJSON);
      this.route = L.geoJSON(calculatedRouteGeoJSON, {
        style: (_feature) => {
          return {
            color: "rgba(20, 137, 255, 0.7)",
            weight: 5
          };
        }
      });
      this.route.addTo(this.mymap);
    });
  }
  

  async LoadSavedRoutes() {
    const result = await this.sqLiteDatabaseService.execute(
      `SELECT id, name
       FROM places;`
    );
    this.savedRoutes = result.values;
  }

  async toggleSavedRoutes() {
    this.displayRoutes = !this.displayRoutes;
    if (this.displayRoutes) {
      await this.LoadSavedRoutes();
    }
  }

  async deleteDatabaseRoute(id: number) {
    const result = await this.sqLiteDatabaseService.execute(
      `DELETE FROM places WHERE id = ?;`,
      [id]
    );
    this.savedRoutes = this.savedRoutes.filter(route => route.id !== id);
  }
  
  
  

  deleteRoute(){
    if (this.route) {
      // remove previously added route
      this.mymap.removeLayer(this.route);
    }
    // clear latholder and lonholder values
    this.latholder1 = 0.000000;
    this.lonholder1 = 0.000000;
    this.latholder2 = 0.000000;
    this.lonholder2 = 0.000000;

    // clear input field
    // It has by default an X icon for erasing the user's input and i closed it for appeariance reasons
    const closeButton1 = Array.from(document.getElementsByClassName("geoapify-close-button")) as HTMLElement[];
    for (const button of closeButton1) {
      button.style.display = "none";
      button.click();
    }
  }
  

	logout() {
		this.authService.logout();
	}

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
