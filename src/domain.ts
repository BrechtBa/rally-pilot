
export interface Location {
  longitude: number;
  latitude: number;
  altitude: number;
}

export interface GPSPoint {
  date: Date;
  location: Location
}


export class Path {

  gpsPoints: Array<GPSPoint>;

  constructor(gpsPoints: Array<GPSPoint>){
    this.gpsPoints = gpsPoints;
  }

  calculatePathDistance() {
    const distanceLocation = this.gpsPoints.reduce((accumulator: {distance: number, location: Location | null}, val: GPSPoint): {distance: number, location: Location} => {
      if(accumulator.location === null) {
        return {distance: 0, location: val.location};
      }
      else {
        return {distance: accumulator.distance + this.calculateDistance(
          accumulator.location.latitude,
          accumulator.location.longitude,
          accumulator.location.altitude,
          val.location.latitude,
          val.location.longitude,
          val.location.altitude,
        ), location: val.location};
      }
    }, {distance: 0, location: null});

    return distanceLocation.distance;
  }

  calculateDistance(lat1: number, lon1: number, alt1: number, lat2: number, lon2: number, alt2: number) {

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

  addPoint(point: GPSPoint) {
    this.gpsPoints.push(point);
  }
}
