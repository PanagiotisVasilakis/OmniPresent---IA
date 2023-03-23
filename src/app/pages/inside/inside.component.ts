import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
// import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { GeocoderAutocomplete, GeocoderAutocompleteOptions } from '@geoapify/geocoder-autocomplete';
import { SqLiteDatabaseService } from 'src/app/services/sq-lite-database.service';
import { Geolocation } from '@capacitor/geolocation';
import {SmsManager} from "@byteowls/capacitor-sms";
import {Device, DeviceInfo} from "@capacitor/device";
import 'leaflet-geometryutil';
import { IonModal } from '@ionic/angular';



@Component({
  selector: 'app-inside',
  templateUrl: 'inside.component.html',
  styleUrls: ['inside.component.scss'],
})
export class InsideAppComponent implements OnInit{
  @ViewChild('modal', { static: true }) modal!: IonModal;
  public mymap : L.Map;
  suggestions: any;
  myAPIKey = "7ab20422eadd4008be20a8274432337d";
  searchForm = true;
  navForm=true;
  displayRoutes=true;
  showDiv = false;
  latholder1:number = 0.000000;
  lonholder1:number = 0.000000;
  latholder2:number = 0.000000;
  lonholder2:number = 0.000000;
  url:string;
  input2:HTMLElement | null;
  route: L.Layer | any;
  routeLayer: L.Layer | any;
  startL: string;
  endL: string;
  routes: any[] = [];
  savedRoutes: any[] = [];
  latitudeNow: number;
  longitudeNow: number;
  isEmergencyContactAdd: boolean = false;
  iosOrAndroid: boolean;
  emergencyContacts: Array<{ name: string, number: string }> = [];
  emergencyContactName: string;
  emergencyContactNumber: string;


  markerClusterGroup:any;
  categories: any[] = [
    { text: 'Κέντρα εστίασης', value: 'catering' },
    { text: 'Διαμονή', value: 'accommodation' },
    { text: 'Clubs, community centers', value: 'activity' },
    { text: 'Αγορές', value: 'commercial' },
    { text: 'Σχολεία && Βιβλιοθήκες', value: 'education' },
    { text: 'Παιδικοί Σταθμοί', value: 'childcare' },
    { text: 'Διασκέδαση', value: 'entertainment' },
    { text: 'Ιατρεία', value: 'healthcare' },
    { text: 'Χαλάρωση', value: 'leisure' },
    { text: 'Παρκινγκ', value: 'parking' },
    { text: 'Φύση', value: 'natural' },
    { text: 'Κατοικίδια', value: 'pet' },
    { text: 'Ενοικίαση Οχημάτων', value: 'rental' },
    { text: 'Υπηρεσίες', value: 'service' },
    { text: 'Τουρισμός', value: 'tourism' },
    { text: 'Σκι', value: 'ski' },
    { text: 'Αθλητικές Δραστηριότητες', value: 'sport' },
    { text: 'Μέσα Μαζικής Μεταφοράς', value: 'public_transport' },
];
selectedCategories: string[] = [];
selectedCategoryText = '0 Items';

  // Define a variable to store the current position
  currentPosition: any;
  watchId:any;

  // Define a variable to store the current instruction index
  currentInstructionIndex: number = 0;

  place1: string = '';
  place2: string = '';
  selectedInput: string;
  places: any[] = [];

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    public http: HttpClient,
    private splashScreen: SplashScreen,
    // private authService: AuthService,
    private sqLiteDatabaseService: SqLiteDatabaseService,
    private geolocation: Geolocation,
    // private storage: Storage
    // private routeService: RouteService
    ) {
    this.initializeApp();
  }

  private initializeMap() {
    //osm layer
    let osm = L.tileLayer('https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?&apiKey=7ab20422eadd4008be20a8274432337d', {
      id: 'osm-bright'
    });

    //Dark Map
    let darkMap = L.tileLayer('https://maps.geoapify.com/v1/tile/dark-matter-yellow-roads/{z}/{x}/{y}.png?apiKey=7ab20422eadd4008be20a8274432337d', {
       id: 'osm-bright'
    });

    //Layer Controller
    let baseMaps = {
      "Omni Map": osm,
      "Dark Mode": darkMap
    };

    //deafault map
    osm.addTo(this.mymap);
    let controlLayers = new L.Control.Layers(baseMaps).addTo(this.mymap);
    controlLayers.setPosition('bottomright');
    // this.mymap.zoomControl.setPosition('topright');
    // add map scale info
    new L.Control.Scale().addTo(this.mymap);  
    

    setTimeout(() => {
      this.mymap.invalidateSize();
    }, 500);

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
          skipDetails: false,
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
      autocomplete.on('select', async (location) => {
          console.log(location);
          this.mymap.setView([location.properties.lat,location.properties.lon], 13);
          L.marker([location.properties.lat, location.properties.lon]).addTo(this.mymap);

          // Get a reference to the filter form element and the category select element
          const filterForm = document.querySelector('form') as HTMLElement;
          const categorySelect = document.getElementById('category-select') as HTMLElement | any;

          // Listen for the form submission event
          filterForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the form from submitting and reloading the page
            
            this.selectedCategories = categorySelect.text; // Get the selected category from the select element
            
            // Remove any existing markers from the map
            if (this.markerClusterGroup) {
                  this.markerClusterGroup.clearLayers();
            }            
            this.onCategoryChange(this.selectedCategories);
          });

      });


   


    // let inputnav2 = document.getElementById("autocompletenav2") as HTMLElement;
    // let inputnav1 = document.getElementById("autocompletenav1") as HTMLElement;

    // if (inputnav2 || inputnav1) {
    //   // for (let i = 0; i < 2; i++) {
    //     let urlnav1 = `http://192.168.56.1:4000/maps-api/maps/api/place/autocomplete/json?input=${inputnav1}&types=geocode&language=us&key=AIzaSyDO04-2N5LAmJkQc6bhR3oA1ksUOoWCroA`;
    //     let urlnav2 = `http://192.168.56.1:4000/maps-api/maps/api/place/autocomplete/json?input=${inputnav2}&types=geocode&language=us&key=AIzaSyDO04-2N5LAmJkQc6bhR3oA1ksUOoWCroA`;
        
    //     fetch(urlnav1)
    //     .then(response => response.json())
    //     .then(data => {
    //         let place = data.predictions[0];
    //         let placeId1 = place.place_id;
    //         let urlnav3 = `http://192.168.56.1:4000/maps-api/maps/api/place/details/json?placeid=${placeId1}&key=AIzaSyDO04-2N5LAmJkQc6bhR3oA1ksUOoWCroA`;
    //         fetch(urlnav3)
    //           .then(response => response.json())
    //           .then(data => {
    //               this.latholder1 = data.result.geometry.location.lat;
    //               this.lonholder1  = data.result.geometry.location.lng;
    //               this.endL = place.description;
    //               console.log(this.latholder1, this.lonholder1 );
    //           });                  
    //       },
    //       (error: any) => {
    //         console.log(error);
    //       }
    //     );
                
    //     fetch(urlnav2)
    //     .then(response => response.json())
    //     .then(data => {
    //         let place = data.predictions[0];
    //         let placeId2 = place.place_id;
    //         let urlnav4 = `http://192.168.56.1:4000/maps-api/maps/api/place/details/json?placeid=${placeId2}&key=AIzaSyDO04-2N5LAmJkQc6bhR3oA1ksUOoWCroA`;
    //         fetch(urlnav4)
    //           .then(response => response.json())
    //           .then(data => {
    //               this.latholder2 = data.result.geometry.location.lat;
    //               this.lonholder2  = data.result.geometry.location.lng;
    //               this.endL = place.description;
    //               console.log(this.latholder2, this.lonholder2 );
    //           });                  
    //       },
    //       (error: any) => {
    //         console.log(error);
    //       }
    //     );

    // //Navigation
    //   const input2 = document.getElementById("autocomplete2") as HTMLInputElement;
    //   if (input2) {
    //     for(let i = 0; i < 2; i++){
    //       const autocomplete = new GeocoderAutocomplete(
    //         input2, 
    //         '7ab20422eadd4008be20a8274432337d', 
    //         <GeocoderAutocompleteOptions>{ 
    //           language: 'en',  
    //           types: ['locality'], 
    //           allowNonVerifiedHouseNumber: true,
    //           allowNonVerifiedStreet: true,
    //           skipDetails: true,
    //           autoSelect: false
    //         }
    //       );

    //       // It has by default an X icon for erasing the user's input and i closed it for appeariance reasons
    //       const closeButton = Array.from(document.getElementsByClassName("geoapify-close-button")) as HTMLElement[];
    //       for (const button of closeButton) {
    //         button.style.display = "none";
    //       }
          
    //       autocomplete.on('suggestions', (suggestions) => {
    //         console.log('Suggestions: ', suggestions);
    //       });

    //       // Takes the result that the user selected and displays it in the map
    //       autocomplete.on('select', (location) => {
    //         console.log(location);

    //                 // Update the input2 value when the button is clicked
    //       const setLocationButton = document.getElementById("set-location-button") as HTMLElement;

    //         if(i===0){
    //           this.latholder1 = location.properties.lat;
    //           this.lonholder1 = location.properties.lon;
    //           this.startL = location.properties.name;

    //           setLocationButton.addEventListener("click", () => {
    //             // const input2 = document.getElementById("input2")  as HTMLElement;
    //             // (input2 as HTMLElement | any).value = `${this.currentPosition.latitude}, ${this.currentPosition.longitude}`;
    //             this.latholder1 = this.currentPosition.latitude;
    //             this.lonholder1 = this.currentPosition.longitude;
    //           });

    //         } else if(i === 1){
    //           this.latholder2 = location.properties.lat;
    //           this.lonholder2 = location.properties.lon;
    //           this.endL = location.properties.name;

    //           setLocationButton.addEventListener("click", () => {
    //             // const input2 = document.getElementById("input2")  as HTMLElement;
    //             // (input2 as HTMLElement | any).value = `${this.currentPosition.latitude}, ${this.currentPosition.longitude}`;
    //             this.latholder2 = this.currentPosition.latitude;
    //             this.lonholder2 = this.currentPosition.longitude;
    //           });

              //SAVE ROUTES BY CLICK              
              // Add this line of code to get a reference to the save button element
              const saveButton = document.getElementById("saveButton") as HTMLElement | any;
              
              // Add an event listener to the save button that calls the saveRoute function
              saveButton.addEventListener("click", async () => {
                const SavedRouteName = this.startL + ' - ' + this.endL;
                await this.sqLiteDatabaseService.run(
                  `INSERT INTO places (name, latitudeFirst, longitudeFirst, latitudeSecond, longitudeSecond)
                  VALUES (?, ?, ?, ?, ?);`, 
                  [SavedRouteName, this.latholder1, this.lonholder1, this.latholder2, this.lonholder2]
                );
              });
            }                    
            // // Get a reference to the input element for this loop iteration
            // const input = document.getElementById(`autocomplete${i + 1}`) as HTMLInputElement;

            // // Get a reference to the button element for this loop iteration
            // const setLocationButton = document.getElementById(`set-location-button-${i + 1}`) as HTMLElement;

            // // Add an event listener to the button that sets the input value to the current position
            // setLocationButton.addEventListener("click", () => {
            //   input.value = `${this.currentPosition.latitude}, ${this.currentPosition.longitude}`;
            // });
          // };
        }
      
  //     }
  // }

  //catering,accommodation,activity,commercial,education,childcare,entertainment,healthcare,national_park,parking,pet,rental,service,tourism,camping,adult,beach,ski,sport,public_transport
  //conditions=internet_access,wheelchair,dogs,no-dogs,access,access.yes,access.not_specified,access_limited,no_access,fee,no_fee,named,vegetarian,vegan,halal,kosher,organic,gluten_free,sugar_free,egg_free,soy_free
  onCategoryChange(selectcategories: string | string[] | undefined) {
    const geometry = this.mymap.getBounds();
    const placesUrl = `https://api.geoapify.com/v2/places?&filter=rect:${geometry.getWest()},${geometry.getSouth()},${geometry.getEast()},${geometry.getNorth()}&limit=20&apiKey=${this.myAPIKey}`;
    this.addMarkersToMap(placesUrl, selectcategories);
  }
  
  addMarkersToMap(placesUrl: string, selectcategories?: string | string[] | undefined) {
    // Remove previous markers from the map
    this.mymap.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.mymap.removeLayer(layer);
      }
    });

    // Add new markers to the map
    const url = selectcategories ? `${placesUrl}&categories=${selectcategories}` : placesUrl;
    this.http.get(url).subscribe((data: any) => {
      for (const feature of data.features) {
        const properties = feature.properties;
        const name = properties.name;
        const geometry = feature.geometry;
        const latLng = L.latLng(geometry.coordinates[1], geometry.coordinates[0]);
        const marker = L.marker(latLng);
        marker.bindPopup(name).addTo(this.mymap);
        marker.addTo(this.mymap);
      }
    });
  }

  // async placesdetails(location: { feature: { properties: { id: any; }; }; }){
      // // Get the place ID from the location object
      //   const placeId = location.feature.properties.id;

      //   // Make an HTTP request to the Place Details API with the place ID and features parameters
      //   const placeDetailsUrl = `https://api.geoapify.com/v2/place-details?apiKey=${this.myAPIKey}&id=${placeId}&features=contact,website,name,description,geometry,details,radius_500.supermarket,radius_500.shopping_mall,radius_500.restaurant,radius_500.cafe,radius_500.school,radius_500.toilet,radius_500.atm,radius_500.playground,radius_500.hotel`;
      //   const placeDetailsResponse = await fetch(placeDetailsUrl);
      //   const placeDetailsData = await placeDetailsResponse.json();


      //   // Get the geometry of the place from the data object
      //     const geometry = placeDetailsData.features[0].geometry;

  //         // Make an HTTP request to the Places API with the categories, conditions, filters, and other parameters
  //         const placesUrl = `https://api.geoapify.com/v2/places?categories=catering,accommodation,activity,commercial,education,childcare,entertainment,healthcare,leisure,man_made,natural,national_park,office,parking,pet,rental,service,tourism,camping,amenity,adult,beach,building,ski,sport,public_transport,administrative,postal_code,political,low_emission_zone,populated_place,production,production.factory&conditions=internet_access,wheelchair,dogs,no-dogs,access,access.yes,access.not_specified,access_limited,no_access,fee,no_fee,named,vegetarian,vegan,halal,kosher,organic,gluten_free,sugar_free,egg_free,soy_free&filter=rect:${geometry.coordinates[0][0][0]},${geometry.coordinates[0][0][1]},${geometry.coordinates[0][2][0]},${geometry.coordinates[0][2][1]}&limit=20&apiKey=${this.myAPIKey}`;
  //         const placesResponse = await fetch(placesUrl);
  //         const placesData = await placesResponse.json();

  //         // Get the list of places from the data object
  //         const places = placesData.features;

  //         // create a layer for the place geometry
  //         const placeLayer = L.geoJSON(placeDetailsData.features[0].geometry);

  //         // create a feature group for the markers
  //         const markerGroup = L.featureGroup();

  //         // filter the places by category
  //         const filteredPlaces = places.filter((place: { properties: { category: string; }; }) => {
  //           return place.properties.category === this.selectedCategory;
  //         });

  //         // create an array of markers for each place
  //         for (let i = 0; i < filteredPlaces.length; i++) {
  //             // get the category and properties of the place
  //             const category = places[i].properties.category;
  //             const properties = places[i].properties;

  //             // generate an icon URL using Geoapify's Icon API
  //             const iconUrl = `https://api.geoapify.com/v1/icon/?type=awesome&color=%23ff0000&icon=${category}&text=${properties.name}&apiKey=${this.myAPIKey}`;

  //             // create a custom icon using Leaflet's Icon class
  //             const icon = L.icon({
  //               iconUrl: iconUrl,
  //               iconSize: [40, 40],
  //               iconAnchor: [20, 20],
  //               popupAnchor: [0,-20]
  //             });

  //             // create a marker with the custom icon and add it to the feature group
  //             const marker = L.marker(places[i].geometry.coordinates,{icon:icon});
  //             markerGroup.addLayer(marker).addTo(this.mymap);
  //         }

  //         // add the layer and feature group to the map
  //         this.mymap.addLayer(placeLayer);
  //         this.mymap.addLayer(markerGroup);
  // }


  async ngOnInit() {
    const info: DeviceInfo = await Device.getInfo();
    this.iosOrAndroid = (info.platform === "android" || info.platform === "ios");

    //map initialization 
    this.mymap = L.map('map', { zoomControl: false }).setView([ 38.246639, 21.734573], 11);
    this.initializeMap();
  }

    // Define a function to display the map
  displayMap() {
    // Create a Leaflet map object centered at the starting point of the route
    this.mymap.setView([this.latholder1, this.lonholder1], 13);
    // Create a GeoJSON layer with the route data and add it to the map
    this.routeLayer = L.geoJSON(this.route);
    this.routeLayer.addTo(this.mymap);
  }
  
  async navigatebutton() {
    this.showDiv = !this.showDiv;
    //https://api.geoapify.com/v1/routing?waypoints=${this.latholder1},${this.lonholder1}|${this.latholder2},${this.lonholder2}&mode=drive&details=instruction_details,route_details&apiKey=${this.myAPIKey}
    //https://api.geoapify.com/v1/routing?waypoints=${this.latholder1},${this.lonholder1}|${this.latholder2},${this.lonholder2}&mode=drive&details=instruction_details&apiKey=${this.myAPIKey}
    this.url = `https://api.geoapify.com/v1/routing?waypoints=${this.latholder1},${this.lonholder1}|${this.latholder2},${this.lonholder2}&lang=el&mode=walk&details=instruction_details,route_details&apiKey=${this.myAPIKey}`;
    // Fetch the response from the API
    const response = await fetch(this.url);

    // Parse the response as JSON
    const data = await response.json();

    // Check if the response contains a valid route
    if (data.type === 'FeatureCollection' && data.features.length > 0) {
      // Store the route and instructions in the variable
      this.route = data.features[0];

      // Show the first instruction on the screen
      this.showInstruction(this.route.properties.legs[0].steps[this.currentInstructionIndex].instruction);

      // Display the map and add the route layer
      this.displayMap();

      // Start watching the position updates
      this.watchPosition();
    } else {
      // Handle the error if no route is found
      console.error('No route found');
    }

  
  }

  // Define a function to watch the position updates from Capacitor Geolocation Plugin
  watchPosition() {
    // Call the watchPosition method and get a watch ID
    this.watchId = Geolocation.watchPosition({}, (position, err: any) => {
      // Check if there is an error
      if (err) {
        // Handle the error
        console.error(err);
        return;
      }

      // Check if there is a valid position
      if (position && position.coords) {
        // Store the current position in the variable
        this.currentPosition = position.coords;

        // Compare the current position with the next instruction point
        this.comparePosition();
      }
    });
  }

// Define a function to compare the current position with the next instruction point
 comparePosition() {
  // Check if the route and current instruction index are defined
  if (!this.route || !this.route.properties || !this.route.properties.legs || !this.route.properties.legs[0].steps || !this.route.properties.legs[0].steps[this.currentInstructionIndex + 1]) {
    return;
  }

  // Get the next instruction point coordinates from the route
  const nextInstructionPoint = this.route.properties.legs[0].steps[this.currentInstructionIndex + 1].location;

  // Check if the next instruction point coordinates are defined
  if (!nextInstructionPoint || !nextInstructionPoint.coordinates) {
    return;
  }        
  // Create Leaflet LatLng objects for the current position and the next instruction point
  const currentPositionLatLng = L.latLng(this.currentPosition.latitude, this.currentPosition.longitude);
  const nextInstructionPointLatLng = L.latLng(nextInstructionPoint[1], nextInstructionPoint[0]);

  // Calculate the distance and bearing between the current position and the next instruction point using Leaflet methods
  const distance = currentPositionLatLng.distanceTo(nextInstructionPointLatLng);
  const bearing = L.GeometryUtil.bearing(currentPositionLatLng, nextInstructionPointLatLng);

  // Define a threshold for showing the next instruction (in meters)
  const threshold = 0.5;

  // Check if the distance is less than or equal to the threshold
  if (distance <= threshold) {
    // Increment the current instruction index by one
    this.currentInstructionIndex++;

    // Show the next instruction on the screen
    this.showInstruction(this.route.properties.legs[0].steps[this.currentInstructionIndex].instruction);

    // Check if this is the last instruction of the route
    if (this.currentInstructionIndex === this.route.properties.legs[0].steps.length - 1) {
      // Stop watching the position updates and show a message that you have reached your destination
      Geolocation.clearWatch({ id: this.watchId });
      this.showInstruction('You have reached your destination!');
    }
  } else {
    // Show the distance and bearing to the next instruction point on the screen
    this.showDistanceAndBearing(distance, bearing);
  }
}

// Define a function to show an instruction on the screen (you can modify this according to your UI design)
 showInstruction(instruction: any) {
  // Find an element on the screen where you want to show
  const instructionElement = document.getElementById('instruction') as HTMLElement;

  // Set the text content of the element to the instruction
  instructionElement.textContent = instruction.text;
}

showDistanceAndBearing(distance: number, bearing: number) {
  const distanceElement = document.getElementById('distance') as HTMLElement;
  const bearingElement = document.getElementById('bearing') as HTMLElement;
  const remainingDistanceElement = document.getElementById('remaining-distance') as HTMLElement;

  const distanceMessage: any = `Distance to next instruction: ${distance.toFixed(2)} meters`;
  const bearingMessage:any = `Bearing: ${bearing.toFixed(2)} degrees`;

  distanceElement.textContent = distanceMessage.text;
  bearingElement.textContent = bearingMessage.text;

  if (this.route && this.route.properties && this.route.properties.distance) {
    const totalDistance = this.route.properties.distance;
    const remainingDistance = totalDistance - distance;
    const remainingDistanceMessage: any = `Remaining distance: ${remainingDistance.toFixed(2)} meters`;
    remainingDistanceElement.textContent = remainingDistanceMessage.text;
  }
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
    await this.sqLiteDatabaseService.execute(
      `DELETE FROM places WHERE id = ?;`,
      [id]
    );
    this.savedRoutes = this.savedRoutes.filter(route => route.id !== id);
  }
 
  

  deleteRoute(){
    // Check if the map and routeLayer are defined
    if (this.mymap && this.routeLayer) {
      // Remove the routeLayer from the map
      this.mymap.removeLayer(this.routeLayer);

      // Set the routeLayer variable to null
      this.routeLayer = null;
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

     // Remove the instruction element
      const instructionElement = document.getElementById('instruction');
      if (instructionElement) {
        instructionElement.remove();
      }

      // Remove the distance element
      const distanceElement = document.getElementById('distance');
      if (distanceElement) {
        distanceElement.remove();
      }

      // Hide the ng-container element
      this.showDiv = false;
  }

  async sendEmergencySMS() {
    let result = await this.sqLiteDatabaseService.execute("SELECT * FROM contacts");
      
    this.geolocation.getCurrentPosition(
      response => {
        this.latitudeNow = response.coords.latitude;
        this.longitudeNow = response.coords.longitude;
      },
      error => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout:15000 }
    );
    
      
    // Construct the message body
    const message = `EMERGENCY: Please help! I am in danger. My location is https://www.google.com/maps/place/${this.latitudeNow},${this.longitudeNow}.`;
  
    // Check if result.values is not empty
    if (result.values.length > 0) {
      console.log("there are contacts"+ result.values.length);
      // Loop through the result.values array
      for (let contact of result.values) {
        // Access the name and number properties of each contact object
        console.log(contact.name);
        console.log(contact.number);
        // Wrap SmsManager.send in a promise
        let smsPromise = new Promise(() => {
          SmsManager.send({
            numbers: contact.number,
            text: message,
          });
        });
        // Await the promise and handle errors
        try {
          await smsPromise;
          console.log("success");
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
  

  minimize() {
    // set the height of the card content to 0
    const cardContent = document.querySelector('.ionicardforSavedRoutes .card-content') as HTMLElement;
    cardContent.style.height = '0';
  }
  
  expand() {
    // reset the height of the card content to its original value
    const cardContent = document.querySelector('.ionicardforSavedRoutes .card-content') as HTMLElement;
    cardContent.style.height = '';
  }
  
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }





  onPlaceChange(event: { target: { value: any; }; }) {
    const input = event.target;
    const url = `http://192.168.56.1:4000/maps-api/maps/api/place/autocomplete/json?input=${input.value}&types=geocode&language=us&key=AIzaSyDO04-2N5LAmJkQc6bhR3oA1ksUOoWCroA`;

    this.http.get(url).subscribe((data: any) => {
      this.places = data.predictions;
    });
  }

  onItemSelected(event: { place_id: any; description: string; }) {
    let placeId = event.place_id;
    let url = `http://192.168.56.1:4000/maps-api/maps/api/place/details/json?placeid=${placeId}&key=AIzaSyDO04-2N5LAmJkQc6bhR3oA1ksUOoWCroA`;

    this.http.get(url).subscribe((data: any) => {
      let lat = data.result.geometry.location.lat;
      let lng = data.result.geometry.location.lng;
      let description = event.description;
  
      if (this.selectedInput === 'place1') {
          this.latholder1 = lat;
          this.lonholder1 = lng;
          this.startL = description;
      } else if (this.selectedInput === 'place2') {
          this.latholder2 = lat;
          this.lonholder2 = lng;
          this.endL = description;       
      }
      // this.selectedInput.valueOf = description.valueOf;
      console.log(lat, lng, description);
    });
  }

  onInputFocus(input: string) {
    this.selectedInput = input;
  }
}








 