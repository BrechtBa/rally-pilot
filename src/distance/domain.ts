import { Path } from "../domain";


export class DistanceRally {
  reference: string;
  totalDistance: number;  // km
  checkpointDate: Date;
  path: Path;
  updating: boolean;

  constructor(reference: string, totalDistance: number, checkpointDate: Date){
    this.reference = reference;
    this.totalDistance = totalDistance;
    this.checkpointDate = checkpointDate;
    this.updating = false;

    this.path = new Path([]);
  }

  calculateRemainingDistance(): number {
    const remainingDistance = this.totalDistance - this.calulatePathDistance();
    if(remainingDistance <= 0 ){
      return 0;
    }
    return remainingDistance;
  }

  calculateRequiredAverageVelocity() : number {
    const now = new Date();
    const remainingTime: number = (this.checkpointDate.getTime() - now.getTime()) / 1000 / 3600;  // h
    if(remainingTime <= 0) {
      return 0; 
    }
    
    const remainingDistance: number = this.calculateRemainingDistance();  // km
    return remainingDistance / remainingTime; // km/h
  }

  calulatePathDistance(): number {
    return this.path.calculatePathDistance();
  }

  calculatePathAverageVelocity() : number {
    if(this.path.gpsPoints.length === 0) {
      return 0;
    }

    const now = new Date();
    const pathTime: number = (now.getTime() - this.path.gpsPoints[0].date.getTime()) / 1000 / 3600;  // h

    const pathDistance: number = this.calulatePathDistance();  // km

    const velocity = pathDistance / pathTime; // km/h
    if (velocity < 0) {
      return 0;
    }
    return velocity
  }
}