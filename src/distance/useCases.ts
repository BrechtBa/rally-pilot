import { BaseRallyUseCases } from "@/useCases";
import { DistanceRally } from "./domain";


export class DistanceRallyUseCases extends BaseRallyUseCases {

  createNew(checkpointDate: Date, totalDistance: number): DistanceRally {
    // TODO store in repo
    const reference = crypto.randomUUID();
    return new DistanceRally(reference, checkpointDate, totalDistance);
  }

  updateTotalDistance(rally: DistanceRally, totalDistance: number): DistanceRally {
    rally.totalDistance = totalDistance;
    return rally;
  }
}