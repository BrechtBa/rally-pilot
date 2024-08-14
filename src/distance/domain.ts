import { BaseRally } from "@/domain";


export class DistanceRally extends BaseRally {
  totalDistance: number;

  constructor(reference: string, checkpointDate: Date, totalDistance: number){
    super(reference, checkpointDate, []);
    this.totalDistance = totalDistance;
  }

  calculateRemainingDistance(): number {
    const remainingDistance = this.totalDistance - this.calulatePathDistance();
    if(remainingDistance <= 0 ){
      return 0;
    }
    return remainingDistance;
  }
}