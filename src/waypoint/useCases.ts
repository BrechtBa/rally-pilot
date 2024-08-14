import getLocation from "@/useCases";
import { Location } from "@/domain";
import { Waypoint, WaypointRally } from "./domain";

export class WaypointRallyUseCases {
  intervals: Map<string, any>;
  static updateInterval: number = 5000;

  constructor() {
    this.intervals = new Map([])
  }

  createNew(checkpointDate: Date): WaypointRally {
    // TODO store in repo
    const reference = crypto.randomUUID();
    return new WaypointRally(reference, [], checkpointDate);
  }

  updateWaypoints(rally: WaypointRally, waypoints: Array<Waypoint>): WaypointRally {
    rally.waypoints = waypoints;
    return rally;
  }

  addWaypoint(rally: WaypointRally, waypoint: Waypoint): WaypointRally {
    rally.waypoints.push(waypoint);
    return rally;
  }

  moveWaypoint(waypoint: Waypoint, location: Location): Waypoint {
    waypoint.location = location;
    return waypoint;
  }

  editWaypointPassed(waypoint: Waypoint, passed: boolean): Waypoint{
    waypoint.passed = passed;
    return waypoint
  }

  updateCheckpointDate(rally: WaypointRally, checkpointDate: Date): WaypointRally {
    rally.checkpointDate = checkpointDate;
    return rally;
  }

  _updatePoint(rally: WaypointRally): void {
    getLocation((location: Location): void => {
      const now = new Date();
      rally.path.addPoint({date: now, location: location});
      rally.checkPassedWaypoints();
    });
    // TODO update in repo
  }

  startUpdatingRally(rally: WaypointRally, updateCallback: (rally: WaypointRally) => void): void {
    rally.updating = true;

    this._updatePoint(rally);
    updateCallback(rally);

    this.intervals.set(
      rally.reference, setInterval(() => {
        this._updatePoint(rally);
        updateCallback(rally);
      }, WaypointRallyUseCases.updateInterval)
    );
  }

  stopUpdatingRally(rally: WaypointRally): void {
    rally.updating = false;
    clearTimeout(this.intervals.get(rally.reference));
  }

}