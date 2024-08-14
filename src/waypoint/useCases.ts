import { locationUsecases } from "@/useCases";
import { Location, Waypoint } from "@/domain";
import { WaypointRally } from "./domain";


export class WaypointRallyUseCases {
  intervals: Map<string, any>;

  constructor() {
    this.intervals = new Map([])
  }

  createNew(checkpointDate: Date): WaypointRally {
    // TODO store in repo
    const reference = crypto.randomUUID();
    return new WaypointRally(reference, [], checkpointDate);
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

  updateCheckpointDate(rally: WaypointRally, checkpointDate: Date): WaypointRally {
    rally.checkpointDate = checkpointDate;
    return rally;
  }

  startUpdatingRally(rally: WaypointRally, updateCallback: (rally: WaypointRally) => void): void {
    rally.updating = true;

    const id = locationUsecases.watchLocation((location: Location): void => {
      const now = new Date();
      rally.path.addPoint({date: now, location: location});
      rally.checkPassedWaypoints();
      updateCallback(rally);
    });
    this.intervals.set(rally.reference, id)
  }

  stopUpdatingRally(rally: WaypointRally): void {
    rally.updating = false;
    locationUsecases.clearWatchLocation(this.intervals.get(rally.reference));
  }

}