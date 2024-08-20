import { BaseRallyUseCases, locationUsecases } from "@/useCases";
import { Location, PathRepository, Waypoint } from "@/domain";
import { WaypointRally, WaypointRepository } from "./domain";


export class WaypointRallyUseCases extends BaseRallyUseCases {
  waypointRepository: WaypointRepository;

  constructor(pathRepository: PathRepository, waypointRepository: WaypointRepository) {
    super(pathRepository)
    this.waypointRepository = waypointRepository
  }

  createNew(checkpointDate: Date): WaypointRally {
    // TODO store in repo
    const reference = crypto.randomUUID();
    return new WaypointRally(reference, checkpointDate, []);
  }

  addWaypoint(rally: WaypointRally, location?: Location, passed?: boolean): WaypointRally {
    rally.waypoints.push({
      reference: crypto.randomUUID(),
      location: location === undefined ? locationUsecases.getLastKnownLocation() : location,
      passed: passed === undefined ? false : passed,
    });
    return rally;
  }

  addIntermediateWaypoint(rally: WaypointRally, location: Location, passed?: boolean): WaypointRally {

    const addWaypointAtIndex = (index: number) => {
      rally.waypoints.splice(index, 0, {
        reference: crypto.randomUUID(),
        location: location,
        passed: passed === undefined ? false : passed,
      })
    }
    
    const locationIsBetween = (location: Location, location1: Location, location2: Location): boolean => {
      const norm = ((location2.latitude-location1.latitude)**2 + (location2.longitude-location1.longitude)**2);
      if(norm === 0) {
        return false;
      }

      const P = [location.latitude-location1.latitude, location.longitude-location1.longitude];
      const U = [(location2.latitude-location1.latitude), (location2.longitude-location1.longitude)];
      const V = [-U[1], U[0]];

      const u = (P[0]*U[0] + P[1]*U[1])/norm;
      const v = (P[0]*V[0] + P[1]*V[1])/norm;

      return u > 0 && u < 1 && v > -0.1 && v < 0.1;
    }

    if(rally.waypoints.length === 0){
      addWaypointAtIndex(-1);
      return rally
    }

    rally.waypoints.every((waypoint, index) => {
      if(index + 1 >= rally.waypoints.length){
        addWaypointAtIndex(index+1);
        return false
      }

      const nextWaypoint = rally.waypoints[index + 1];

      if(locationIsBetween(location, waypoint.location, nextWaypoint.location)) {
        addWaypointAtIndex(index+1);
        return false; 
      }
      
      return true;
    });
    return rally;
  }

  updateWaypoints(rally: WaypointRally, waypoints: Array<Waypoint>): WaypointRally {
    rally.waypoints = waypoints;
    return rally;
  }

  listStoredWaypoints(): Array<string>{
    return this.waypointRepository.listStoredWaypoints();
  }

  storeWaypoints(rally: WaypointRally, reference: string): void {
    this.waypointRepository.storeWaypoints(reference, rally.waypoints.map((waypoint) => waypoint.location));
  }

  loadWaypoints(rally: WaypointRally, reference: string): void {
    const locations = this.waypointRepository.loadWaypoints(reference);
    this.updateWaypoints(rally, locations.map((location) => ({reference: crypto.randomUUID(), location: location, passed: false})));
  }

  deleteWaypoints(reference: string): void {
    this.waypointRepository.deleteStoredWaypoints(reference);
  }
  
}