import { Location, BaseRally } from "@/domain";


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


export class BaseRallyUseCases {
  private watchers: Map<string, any>;

  constructor() {
    this.watchers = new Map([])
  }

  updateCheckpointDate(rally: BaseRally, checkpointDate: Date): BaseRally {
    rally.checkpointDate = checkpointDate;
    return rally;
  }


  startUpdatingRally(rally: BaseRally, updateCallback: (rally: BaseRally) => void): void {
    rally.updating = true;

    const id = locationUsecases.watchLocation((location: Location): void => {
      const now = new Date();
      rally.path.addPoint({date: now, location: location});
      rally.checkPassedWaypoints();
      updateCallback(rally);
    });
    this.watchers.set(rally.reference, id)
  }

  stopUpdatingRally(rally: BaseRally): void {
    rally.updating = false;
    locationUsecases.clearWatchLocation(this.watchers.get(rally.reference));
  }
}
