import { calculatePathDistance, Waypoint, BaseRally, Location } from "@/domain";


export interface WaypointRepository {
  storeWaypoints(reference: string, waypoints: Array<Location>): void;
  loadWaypoints(reference: string): Array<Location>;
  listStoredWaypoints(): Array<string>;
  deleteStoredWaypoints(reference: string): void ;
}


export class WaypointRally extends BaseRally {

  private getRemainingWaypoints(): Array<Waypoint> {
    return this.waypoints.filter((wp) => !wp.passed);  
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
}