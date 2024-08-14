import { BaseRallyUseCases, locationUsecases } from "@/useCases";
import { Location, Waypoint } from "@/domain";
import { WaypointRally } from "./domain";


export class WaypointRallyUseCases extends BaseRallyUseCases {

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
}