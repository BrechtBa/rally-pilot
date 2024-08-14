import { Location } from "@/domain";


export class LocationUsecases {
  lastKnownLocation: Location;
  private positionParameters = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

  constructor() {
    this.lastKnownLocation = {latitude: 50, longitude: 5, altitude: 0};
    this.updateLastKnownLocation();
  }

  getLastKnownLocation(): Location {
    return this.lastKnownLocation;
  }

  watchLocation(successCallback: (location: Location) => void): number | null {
    if (navigator.geolocation) {
      const watcherId = navigator.geolocation.watchPosition(
        this.handlePositionSuccess((location) => {this.lastKnownLocation = location; successCallback(location);}),
        this.handlePositionError(),
        this.positionParameters
      );
      return watcherId;
    }
    console.log("Geolocation is not supported by this browser");
    return null;
  }

  clearWatchLocation(id: number){
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(id);
    }
  }

  private updateLastKnownLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.handlePositionSuccess((location) => {this.lastKnownLocation = location}),
        this.handlePositionError(),
        this.positionParameters
      );
    }
    else {
      console.log("Geolocation is not supported by this browser");
    }
  }

  private handlePositionSuccess(callback: (location: Location) => void){
    const handler = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const altitude = 0;
      const location = {latitude: latitude, longitude: longitude, altitude: altitude};
      callback(location);
    }
    return handler
  }
  private handlePositionError(){
    const handler = (error: any) => {
      // what to do if query fails:
       const errors: {[key: number]: string} = {
         1: 'Permission denied',
         2: 'Position unavailable',
         3: 'Request timeout'
       };

       console.log("Error: " + errors[error.code]); // print the error
    }
    return handler
  }

}


export const locationUsecases = new LocationUsecases()



export function getLocation(successCallback: ({latitude, longitude, altitude}: Location) => void){
  if (navigator.geolocation) {
    const timeoutVal = 10 * 1000 * 1000; // set a timeout value for the query
    navigator.geolocation.getCurrentPosition(
      // what to do if query succeeds
      (position) => {
        const { latitude, longitude } = position.coords;
        const altitude = 0
        successCallback({latitude: latitude, longitude: longitude, altitude: altitude});
      },
      (error) => {
        // what to do if query fails:
         const errors: {[key: number]: string} = {
           1: 'Permission denied',
           2: 'Position unavailable',
           3: 'Request timeout'
         };

         console.log("Error: " + errors[error.code]); // print the error
      },
      // these 3 parameters are very important, especially the first one
      { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
    );
  }
  else {
    console.log("Geolocation is not supported by this browser");
  }
}

