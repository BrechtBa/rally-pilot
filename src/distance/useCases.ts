import getLocation from "../useCases";
import { Location } from "../domain";
import { DistanceRally } from "./domain";

export class DistanceRallyUseCases {
  intervals: Map<string, any>;
  static updateInterval: number = 5000;

  constructor() {
    this.intervals = new Map([])
  }

  createNew(totalDistance: number, checkpointDate: Date): DistanceRally {
    // TODO store in repo
    const reference = crypto.randomUUID();
    return new DistanceRally(reference, totalDistance, checkpointDate);
  }

  updateTotalDistance(rally: DistanceRally, totalDistance: number): DistanceRally {
    rally.totalDistance = totalDistance;
    return rally;
  }

  updateCheckpointDate(rally: DistanceRally, checkpointDate: Date): DistanceRally {
    rally.checkpointDate = checkpointDate;
    return rally;
  }

  _updatePoint(rally: DistanceRally): void {
    getLocation((location: Location): void => {
      const now = new Date();
      rally.path.addPoint({date: now, location: location})
    });
    // TODO update in repo
  }

  startUpdatingRally(rally: DistanceRally, updateCallback: (rally: DistanceRally) => void): void {
    rally.updating = true;

    this._updatePoint(rally);
    updateCallback(rally);

    this.intervals.set(
      rally.reference, setInterval(() => {
        this._updatePoint(rally);
        updateCallback(rally);
      }, DistanceRallyUseCases.updateInterval)
    );
  }

  stopUpdatingRally(rally: DistanceRally): void {
    rally.updating = false;
    clearTimeout(this.intervals.get(rally.reference));
  }

}