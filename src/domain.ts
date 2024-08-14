
export interface Location {
  longitude: number;
  latitude: number;
  altitude: number;
}

export interface GPSPoint {
  date: Date;
  location: Location
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

