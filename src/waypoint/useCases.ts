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
      location: location == undefined ? locationUsecases.getLastKnownLocation() : location,
      passed: passed === undefined ? false : passed,
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