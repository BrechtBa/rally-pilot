
export interface Location {
  longitude: number;
  latitude: number;
  altitude: number;
}

export interface GPSPoint {
  date: Date;
  location: Location
}


export interface Waypoint{
  reference: string;
  location: Location;
  passed: boolean;
}


export function calculateDistance(lat1: number, lon1: number, alt1: number, lat2: number, lon2: number, alt2: number) {

  var R = 6371; // km 

  var x1 = lat2 - lat1;
  var dLat = x1 * Math.PI / 180;  
  var x2 = lon2 - lon1;
  var dLon = x2 * Math.PI / 180;

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);  
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; 
  
  return d + alt1 - alt1 + alt2 - alt2; // km
}


export function calculatePathDistance(locations: Array<Location>) {
  const distanceLocation = locations.reduce((accumulator: {distance: number, location: Location | null}, val: Location): {distance: number, location: Location} => {
    if(accumulator.location === null) {
      return {distance: 0, location: val};
    }
    else {
      return {distance: accumulator.distance + calculateDistance(
        accumulator.location.latitude,
        accumulator.location.longitude,
        accumulator.location.altitude,
        val.latitude,
        val.longitude,
        val.altitude,
      ), location: val};
    }
  }, {distance: 0, location: null});

  return distanceLocation.distance;
}


export class Path {

  gpsPoints: Array<GPSPoint>;

  constructor(gpsPoints: Array<GPSPoint>){
    this.gpsPoints = gpsPoints;
  }

  calculatePathDistance() {
    return calculatePathDistance(this.gpsPoints.map(val => val.location))
  }

  addPoint(point: GPSPoint) {
    this.gpsPoints.push(point);
  }
}


export class BaseRally {
  reference: string;
  waypoints: Array<Waypoint>;  // km
  checkpointDate: Date;
  path: Path;
  updating: boolean;

  private static checkpointPassedDistance: number = 0.05; // km

  constructor(reference: string, checkpointDate: Date, waypoints: Array<Waypoint>){
    this.reference = reference;
    this.checkpointDate = checkpointDate;
    this.waypoints = waypoints;
    this.updating = false;

    this.path = new Path([]);
  }

  calculateRemainingDistance(): number {
    // subclass
    return 0;
  }

  calculateRequiredAverageVelocity() : number {
    const now = new Date();
    const remainingTime: number = (this.checkpointDate.getTime() - now.getTime()) / 1000 / 3600;  // h
    if(remainingTime <= 0) {
      return 0; 
    }
    
    const remainingDistance: number = this.calculateRemainingDistance();  // km
    return remainingDistance / remainingTime; // km/h
  }

  calulatePathDistance(): number {
    return this.path.calculatePathDistance();
  }

  calculatePathAverageVelocity() : number {
    if(this.path.gpsPoints.length <= 1) {
      return 0;
    }

    const now = new Date();
    const pathTime: number = (now.getTime() - this.path.gpsPoints[0].date.getTime()) / 1000 / 3600;  // h

    const pathDistance: number = this.calulatePathDistance();  // km

    const velocity = pathDistance / pathTime; // km/h
    if (velocity < 0) {
      return 0;
    }
    return velocity
  }

  checkPassedWaypoints() {
    if(this.path.gpsPoints.length === 0){
      return;
    }

    this.waypoints.every((waypoint) => {
      if(waypoint.passed){
        return true;
      }

      const loc = this.path.gpsPoints[this.path.gpsPoints.length-1].location;
      const distance = calculateDistance(loc.latitude, loc.longitude, loc.altitude, 
        waypoint.location.latitude, waypoint.location.longitude, waypoint.location.altitude);

      if(distance < BaseRally.checkpointPassedDistance){
        waypoint.passed = true;
        return true;
      }
      return false;
    });
  }
}


export interface StoredPathItem {
  reference: string;
  date: Date;
}


export interface PathRepository {
  storePath(reference: string, path: Path): void;
  loadPath(reference: string): Path;
  listPaths(): Array<StoredPathItem>;
  deletePath(reference: string): void;
}