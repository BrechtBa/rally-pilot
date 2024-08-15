import { Path, PathRepository, StoredPathItem, Location, GPSPoint, calculatePathDistance } from "@/domain";


export interface AugmentedGPSPoint extends GPSPoint {
  date: Date,
  time: number,
  location: Location,
  distance: number,
  speed: number, // km/h
}
function calculateSpeed(times: Array<number>, distances: Array<number>): Array<number>{
  /* distances in km, times in s, speed in km/h */
  const speeds = times.map((_, ind) => {
    if(ind == 0) {
      return 0
    }
    const dt = times[ind]-times[ind-1]
    if( dt <= 0 ) {
      return 0
    }
    return (distances[ind]-distances[ind-1]) / dt * 3600;
  });
  return speeds;
}


function calculateAugmentedGPSPointsFromPath(path: Path): Array<AugmentedGPSPoint> {
  if(path.gpsPoints.length === 0){
    return []
  }
  const locations = path.gpsPoints.map((point) => point.location);
  const distances = locations.map((_, ind) => calculatePathDistance(locations.slice(0, ind+1)))

  const times = path.gpsPoints.map((point) => (point.date.getTime() - path.gpsPoints[0].date.getTime()) / 1000);
  const speeds = calculateSpeed(times, distances);

  return path.gpsPoints.map((point, ind) => ({
    date: point.date,
    time: times[ind],
    location: point.location,
    distance: distances[ind],
    speed: speeds[ind]
  }))
}


export class HistoryUseCases {

  pathRepository: PathRepository

  constructor(pathRepository: PathRepository) {
    this.pathRepository = pathRepository
  }

  listPaths(): Array<StoredPathItem> {
    return this.pathRepository.listPaths()
  }

  getPath(reference: string): Array<AugmentedGPSPoint> {
    return calculateAugmentedGPSPointsFromPath(this.pathRepository.loadPath(reference))
  }
}