import { Path, calculateDistance, calculatePathDistance, Waypoint } from "@/domain";




export class WaypointRally {
  reference: string;
  waypoints: Array<Waypoint>;  // km
  checkpointDate: Date;
  path: Path;
  updating: boolean;

  static checkpointPassedDistance: number = 0.1; // km

  constructor(reference: string, waypoints: Array<Waypoint>, checkpointDate: Date){
    this.reference = reference;
    this.waypoints = waypoints;
    this.checkpointDate = checkpointDate;
    this.updating = false;

    this.path = new Path([]);
  }

  private getRemainingWaypoints(): Array<Waypoint> {
    return this.waypoints.filter((wp) => !wp.passed);  
  }

  checkPassedWaypoints() {
    if(this.path.gpsPoints.length === 0){
      return
    }

    this.waypoints.forEach((waypoint) => {
      if(waypoint.passed){
        return
      }

      const loc = this.path.gpsPoints[this.path.gpsPoints.length-1].location;
      const distance = calculateDistance(loc.latitude, loc.longitude, loc.altitude, 
        waypoint.location.latitude, waypoint.location.longitude, waypoint.location.altitude);

      if(distance < WaypointRally.checkpointPassedDistance){
        waypoint.passed = true;
      }
    })
  }

  calculateRemainingDistance(): number {
    const remainingWaypointLocations = this.getRemainingWaypoints().map(val => val.location)

    if(remainingWaypointLocations.length === 0){
      return 0;
    }

    if(this.path.gpsPoints.length === 0){
      return calculatePathDistance(remainingWaypointLocations);
    }

    return calculatePathDistance([this.path.gpsPoints[this.path.gpsPoints.length-1].location, ...remainingWaypointLocations]);
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
    if(this.path.gpsPoints.length === 0) {
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
}