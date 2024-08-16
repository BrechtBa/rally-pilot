import { Path, PathRepository, StoredPathItem, Location, GPSPoint } from "@/domain";


export interface AugmentedGPSPoint extends GPSPoint {
  date: Date,
  time: number,
  location: Location,
  distance: number,
  speed: number, // km/h
}


function calculateAugmentedGPSPointsFromPath(path: Path): Array<AugmentedGPSPoint> {
  if(path.gpsPoints.length === 0){
    return []
  }
  const times = path.gpsPoints.map((point) => (point.date.getTime() - path.gpsPoints[0].date.getTime()) / 1000);
  const distances = path.calculateCumulativePathDistance()
  const speeds = path.calculateSpeed();

  return path.gpsPoints.map((point, ind) => ({
    date: point.date,
    time: times[ind],
    location: point.location,
    distance: distances[ind],
    speed: speeds[ind]
  }));
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