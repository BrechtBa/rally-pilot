import { Location } from "@/domain";
import { WaypointRepository } from "@/waypoint/domain";


class WaypointLocalStorageRepository implements WaypointRepository {
  private makeKey(reference: string): string {
    return `waypoints-${reference}`;
  }

  storeWaypoints(reference: string, waypoints: Array<Location>): void {
    localStorage.setItem(this.makeKey(reference), JSON.stringify(waypoints))
  }

  loadWaypoints(reference: string): Array<Location> {
    const localStorageWaypoints = localStorage.getItem(this.makeKey(reference));
    if(localStorageWaypoints === null){
      return [];
    }
    return JSON.parse(localStorageWaypoints);
  }

  listStoredWaypoints(): Array<string> {
    return Object.keys(localStorage).filter((key) => key.startsWith("waypoints-")).map((val) => val.slice(10));
  }

}


export const waypointLocalStorageRepository = new WaypointLocalStorageRepository()