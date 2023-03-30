import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
// import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
// import { GeocoderAutocomplete, GeocoderAutocompleteOptions } from '@geoapify/geocoder-autocomplete';
import { SqLiteDatabaseService } from 'src/app/services/sq-lite-database.service';
import { Geolocation } from '@capacitor/geolocation';
import {SmsManager} from "@byteowls/capacitor-sms";
import {Device, DeviceInfo} from "@capacitor/device";
import 'leaflet-geometryutil';
import { IonModal } from '@ionic/angular';

import { Observable, catchError, map, of, tap } from 'rxjs';


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
  placeSelected = false;
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
    { text: 'Λογιστικά', value: 'accounting' },
    { text: 'Αεροδρόμιο', value: 'airport' },
    { text: 'Λούνα Πάρκ', value: 'amusement_park' },
    { text: 'Ενυδρείο', value: 'aquarium' },
    { text: 'Πινακοθήκη Τέχνης', value: 'art_gallery' },
    { text: 'ΑΤΜ', value: 'atm' },
    { text: 'Αρτοποιείο', value: 'bakery' },
    { text: 'Τράπεζα', value: 'bank' },
    { text: 'Μπαρ', value: 'bar' },
    { text: 'Κέντρο Αισθητικής', value: 'beauty_salon' },
    { text: 'Κατάστημα Ποδηλάτων', value: 'bicycle_store' },
    { text: 'Βιβλιοπωλείο', value: 'book_store' },
    { text: 'Μπόουλινγκ', value: 'bowling_alley' },
    { text: 'Σταθμός Λεωφορείων', value: 'bus_station' },
    { text: 'Καφετέρια', value: 'cafe' },
    { text: 'Χώρος Κατασκήνωσης', value: 'campground' },
    { text: 'Αντιπροσωπεία Αυτοκινήτων', value: 'car_dealer' },
    { text: 'Ενοικίαση Αυτοκινήτου', value: 'car_rental' },
    { text: 'Συνεργείο Αυτοκινήτων', value: 'car_repair' },
    { text: 'Πλυντήριο Αυτοκινήτων', value: 'car_wash' },
    { text: 'Καζίνο', value: 'casino' },
    { text: 'Νεκροταφείο', value: 'cemetery' },
    { text: 'Εκκλησία', value: 'church' },
    { text: 'Δημαρχείο', value: 'city_hall' },
    { text: 'Κατάστημα Ρούχων', value: 'clothing_store' },
    { text: 'Κατάστημα Ευκολιών', value: 'convenience_store' },
    { text: 'Δικαστήριο', value: 'courthouse' },
    { text: 'Οδοντίατρος', value: 'dentist' },
    { text: 'Πολυκατάστημα', value: 'department_store' },
    { text: 'Γιατρός', value: 'doctor' },
    { text: 'Φαρμακείο', value: 'drugstore' },
    { text: 'Ηλεκτρολόγος', value: 'electrician' },
    { text: 'Κατάστημα Ηλεκτρονικών', value: 'electronics_store' },
    { text: 'Πρεσβεία', value: 'embassy' },
    { text: 'Πυροσβεστικός Σταθμός', value: 'fire_station' },
    { text: 'Ανθοπωλείο', value: 'florist' },
    { text: 'Κηδεμονικό Ιδρυμα', value: 'funeral_home' },
    { text: 'Κατάστημα Επίπλων', value: 'furniture_store' },
    { text: 'Βενζινάδικο', value: 'gas_station' },
    { text: 'Γυμναστήριο', value: 'gym' },
    { text: 'Κομμωτήριο', value: 'hair_care' },
    { text: 'Κατάστημα Υλικών Σπιτιού', value: 'hardware_store' },
    { text: 'Ινδουιστικός Ναός', value: 'hindu_temple' },
    { text: 'Κατάστημα Ειδών Σπιτιού', value: 'home_goods_store' },
    { text: 'Νοσοκομείο', value: 'hospital' },
    { text: 'Ασφαλιστικό Γραφείο', value: 'insurance_agency' },
    { text: 'Κοσμηματοπωλείο', value: 'jewelry_store' },
    { text: 'Καθαριστήριο', value: 'laundry' },
    { text: 'Δικηγόρος', value: 'lawyer' },
    { text: 'Βιβλιοθήκη', value: 'library' },
    { text: 'Σταθμός Ελαφρού Σιδηρόδρομου', value: 'light_rail_station' },
    { text: 'Κάβα', value: 'liquor_store' },
    { text: 'Δημόσιο Γραφείο', value: 'local_government_office' },
    { text: 'Κλειδαράς', value: 'locksmith' },
    { text: 'Διαμονή', value: 'lodging' },
    { text: 'Παράδοση Φαγητού', value: 'meal_delivery' },
    { text: 'Παραλαβή Φαγητού', value: 'meal_takeaway' },
    { text: 'Τζαμί', value: 'mosque' },
    { text: 'Ενοικίαση Ταινιών', value: 'movie_rental' },
    { text: 'Κινηματογράφος', value: 'movie_theater' },
    { text: 'Εταιρεία Μετακομίσεων', value: 'moving_company' },
    { text: 'Μουσείο', value: 'museum' },
    { text: 'Νυχτερινό Κέντρο', value: 'night_club' },
    { text: 'Ζωγράφος', value: 'painter' },
    { text: 'Πάρκο', value: 'park' },
    { text: 'Πάρκινγκ', value: 'parking' },
    { text: 'Κατάστημα Κατοικίδιων', value: 'pet_store' },
    { text: 'Φαρμακείο', value: 'pharmacy' },
    { text: 'Φυσιοθεραπευτής', value: 'physiotherapist' },
    { text: 'Υδραυλικός', value: 'plumber' },
    { text: 'Αστυνομία', value: 'police' },
    { text: 'Ταχυδρομείο', value: 'post_office' },
    { text: 'Δημοτικό Σχολείο', value: 'primary_school' },
    { text: 'Κτηματομεσιτικό Γραφείο', value: 'real_estate_agency' },
    { text: 'Εστιατόριο', value: 'restaurant' },
    { text: 'Κατασκευαστής Στεγανοποιήσεων', value: 'roofing_contractor' },
    { text: 'Πάρκο Τροχόσπιτων', value: 'rv_park' },
    { text: 'Σχολείο', value: 'school' },
    { text: 'Δευτεροβάθμια Εκπαίδευση', value: 'secondary_school' },
    { text: 'Κατάστημα Υποδημάτων', value: 'shoe_store' },
    { text: 'Εμπορικό Κέντρο', value: 'shopping_mall' },
    { text: 'Σπα', value: 'spa' },
    { text: 'Στάδιο', value: 'stadium' },
    { text: 'Αποθήκη', value: 'storage' },
    { text: 'Κατάστημα', value: 'store' },
    { text: 'Σταθμός Μετρό', value: 'subway_station' },
    { text: 'Σούπερ Μάρκετ', value: 'supermarket' },
    { text: 'Συναγωγή', value: 'synagogue' },
    { text: 'Πιάτσα Ταξί', value: 'taxi_stand' },
    { text: 'Τουριστικό Αξιοθέατο', value: 'tourist_attraction' },
    { text: 'Σιδηροδρομικός Σταθμός', value: 'train_station' },
    { text: 'Σταθμός Μεταφοράς', value: 'transit_station' },
    { text: 'Ταξιδιωτικό Γραφείο', value: 'travel_agency' },
    { text: 'Πανεπιστήμιο', value: 'university' },
    { text: 'Κτηνιατρική Φροντίδα', value: 'veterinary_care' },
    { text: 'Ζωολογικός Κήπος', value: 'zoo' }
  ];

  // Declare a new property for the places Observable
  places$: Observable<any[]>;

  // categories: any[] = [
  //   { text: 'Κέντρα εστίασης', value: 'catering' },
  //   { text: 'Διαμονή', value: 'accommodation' },
  //   { text: 'Clubs, community centers', value: 'activity' },
  //   { text: 'Αγορές', value: 'commercial' },
  //   { text: 'Σχολεία && Βιβλιοθήκες', value: 'education' },
  //   { text: 'Παιδικοί Σταθμοί', value: 'childcare' },
  //   { text: 'Διασκέδαση', value: 'entertainment' },
  //   { text: 'Ιατρεία', value: 'healthcare' },
  //   { text: 'Χαλάρωση', value: 'leisure' },
  //   { text: 'Παρκινγκ', value: 'parking' },
  //   { text: 'Φύση', value: 'natural' },
  //   { text: 'Κατοικίδια', value: 'pet' },
  //   { text: 'Ενοικίαση Οχημάτων', value: 'rental' },
  //   { text: 'Υπηρεσίες', value: 'service' },
  //   { text: 'Τουρισμός', value: 'tourism' },
  //   { text: 'Σκι', value: 'ski' },
  //   { text: 'Αθλητικές Δραστηριότητες', value: 'sport' },
  //   { text: 'Μέσα Μαζικής Μεταφοράς', value: 'public_transport' },
  // ];

  // conditions: any[] = [
  //   { text: 'Internet Access', value: 'internet_access' },
  //   { text: 'Wheelchair Accessible', value: 'wheelchair' },
  //   { text: 'Dogs Allowed', value: 'dogs' },
  //   { text: 'Access', value: 'access' },
  //   { text: 'Yes Access', value: 'access.yes' },
  //   { text: 'Not Specified Access', value: 'access.not_specified' },
  //   { text: 'Limited Access', value: 'access_limited' },
  //   { text: 'Vegetarian', value: 'vegetarian' },
  //   { text: 'Vegan', value: 'vegan' },
  //   { text: 'Organic', value: 'organic' }
  // ];

selectedCategories: string[] = [];
selectedCategoryText = '0 Items';
// selectedConditions: string[]= [];
// selectedConditionsText = '0 Items';
placesService: any;
markers: any[] = [];
searchInput: string;
latLngSearchPlaces: L.LatLng;








  // Define a variable to store the current position
  currentPosition: any;
  watchId:any;
  // Define a variable to hold the remaining distance
  remainingDistance: number;

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
    let  darkMapLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=mt&x={x}&y={y}&z={z}',{
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3']
      });
      
      let satelliteMapLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3']
      });

      let googleMapsLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
    });

    this.mymap = L.map('map',{ zoomControl: false, layers: [googleMapsLayer] }).setView([ 38.246639, 21.734573], 11);

    //Layer Controller
    let baseMaps = {
      "Omni Map": googleMapsLayer,
      "Satellite": satelliteMapLayer,
      "Dark Mode": darkMapLayer      
    };

    //deafault map
    // googleMapsLayer.addTo(this.mymap);
    let controlLayers = new L.Control.Layers(baseMaps).addTo(this.mymap);
    controlLayers.setPosition('bottomright');
    // this.mymap.zoomControl.setPosition('topright');
    // add map scale info
    new L.Control.Scale().addTo(this.mymap);  
    

    setTimeout(() => {
      this.mymap.invalidateSize();
    }, 500);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // SEARCH PLACES

  onSearchPlace(inputId: string,event: { target: { value: any; }; }) {
    let input = event.target;
    let searchText = input.value;
    console.log(input); // Check the input value
    const apiKey = 'AIzaSyDO04-2N5LAmJkQc6bhR3oA1ksUOoWCroA';
    const url = `http://192.168.56.1:4000/maps-api/maps/api/place/autocomplete/json?input=${searchText}&language=el&radius=5000&inputtype=textquery&key=${apiKey}`;
  
    
    this.http.get(url).subscribe((data: any) => {
      this.places = data.predictions;
      this.selectedInput = inputId; // set the selected input based on the inputId parameter
      console.log(this.places); // Add this line to check the structure of the places array
      this.placeSelected = false; // reset the flag for place selection
    });
  }

  onSelectedPlace(event: { place_id: any; description: string; }) {
    let placeId = event.place_id;
    let url = `http://192.168.56.1:4000/maps-api/maps/api/place/details/json?placeid=${placeId}&language=el&key=AIzaSyDO04-2N5LAmJkQc6bhR3oA1ksUOoWCroA`;
    this.http.get(url).subscribe((data: any) => {
      let lat = data.result.geometry.location.lat;
      let lng = data.result.geometry.location.lng;
      let description = event.description;

       // Add marker to the map
      this.latLngSearchPlaces = L.latLng(lat, lng);
      let marker = new L.Marker(this.latLngSearchPlaces);
      // Create custom popup content
      let popupContent = `<h2>${description}</h2><p></p>`; 
      marker.bindPopup(popupContent).addTo(this.mymap);
      marker.addTo(this.mymap);
      this.searchInput = description;
  
      // Center map on the selected place
      this.mymap.setView([lat, lng], 13);
  
      // Save marker for future use
      this.markers.push(marker);

      this.placeSelected = true; // set the flag for place selection
      
      // Get a reference to the filter form element and the category select element
      const filterCategoriesForm = document.querySelector('form') as HTMLElement;
      const categorySelect = document.getElementById('category-select') as HTMLElement | any;
       
      // Listen for the form submission event
      filterCategoriesForm.addEventListener('submit', (event) => {
          event.preventDefault(); // Prevent the form from submitting and reloading the page
                      
          this.selectedCategories = categorySelect.text; // Get the selected category from the select element
                      
          // Remove any existing markers from the map
          if (this.markerClusterGroup) {
                this.markerClusterGroup.clearLayers();
          }            
          this.onCategoryChange(this.selectedCategories);
      });
    });
  }

  onCategoryChange(selectcategories: string | string[] | undefined) {
    let radius = 5000; // search radius in meters
    let apiKey = 'AIzaSyDO04-2N5LAmJkQc6bhR3oA1ksUOoWCroA';
    let placesUrl = `http://192.168.56.1:4000/maps-api/maps/api/place/textsearch/json?location=${this.latLngSearchPlaces.lat},${this.latLngSearchPlaces.lng}&language=el&radius=${radius}&key=${apiKey}`;
  
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
    const url = selectcategories ? `${placesUrl}&type=${selectcategories}` : placesUrl;
    this.http.get(url).subscribe((data: any) => {
      console.log(data); // Add this line to check the structure of the data object
    
      for (const result of data.results) {
        let lat = result.geometry.location.lat;
        let lng = result.geometry.location.lng;
        let description = result.name;
    
        // Add marker to the map
        let latLng = L.latLng(lat, lng);
        let marker = new L.Marker(latLng);
        // Create custom popup content
        let popupContent = `<h2>${description}</h2><p>${selectcategories}: ${result.types.join(', ')}</p>`;
        marker.bindPopup(popupContent).addTo(this.mymap);
        marker.addTo(this.mymap);
      }
    });
  }

  
  
  clearMarkers() {
    this.markers.forEach((marker: { setMap: (arg0: null) => void; }) => {
      marker.setMap(null);
    });
    this.markers = [];
  }


  async ngOnInit() {
    const info: DeviceInfo = await Device.getInfo();
    this.iosOrAndroid = (info.platform === "android" || info.platform === "ios");

    //map initialization  
    this.initializeMap();
  }





  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // NAVIGATION


  onPlaceChange(inputId: string,event: { target: { value: any; }; }) {
    const input = event.target;
    const url = `http://192.168.56.1:4000/maps-api/maps/api/place/autocomplete/json?input=${input.value}&types=geocode&language=us&key=AIzaSyDO04-2N5LAmJkQc6bhR3oA1ksUOoWCroA`;

    this.http.get(url).subscribe((data: any) => {
      this.places = data.predictions;
      this.selectedInput = inputId; // set the selected input based on the inputId parameter
      this.placeSelected = false; // reset the flag for place selection
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
          this.place1 = description; // set the value of the input field with the selected place's description
      } else if (this.selectedInput === 'place2') {
          this.latholder2 = lat;
          this.lonholder2 = lng;
          this.endL = description;
          this.place2 = description; // set the value of the input field with the selected place's description       
      }

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
      this.placeSelected = true; // set the flag for place selection
      console.log(this.latholder1, this.lonholder1, this.startL, this.latholder2, this.lonholder2, this.endL);
    });
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
      // Update the remaining distance variable
      this.remainingDistance = distance;
      
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

  // Update the remaining distance element
  distanceElement.innerText = this.remainingDistance.toFixed(2);

  // Show the bearing element
  bearingElement.innerText = `Bearing: ${bearing.toFixed(2)}`;

  // const distanceElement = document.getElementById('distance') as HTMLElement;
  // const bearingElement = document.getElementById('bearing') as HTMLElement;
  // const remainingDistanceElement = document.getElementById('remaining-distance') as HTMLElement;

  // const distanceMessage: any = `Distance to next instruction: ${distance.toFixed(2)} meters`;
  // const bearingMessage:any = `Bearing: ${bearing.toFixed(2)} degrees`;

  // distanceElement.textContent = distanceMessage.text;
  // bearingElement.textContent = bearingMessage.text;

  // if (this.route && this.route.properties && this.route.properties.distance) {
  //   const totalDistance = this.route.properties.distance;
  //   const remainingDistance = totalDistance - distance;
  //   const remainingDistanceMessage: any = `Remaining distance: ${remainingDistance.toFixed(2)} meters`;
  //   remainingDistanceElement.textContent = remainingDistanceMessage.text;
  // }
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
    this.startL = '';
    this.endL = '';

    // clear input field
    this.place1 = '';
    this.place2 = '';

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



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // EMERGENCY

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




}








 