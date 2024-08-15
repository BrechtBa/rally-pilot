import { Location, Path, PathRepository, StoredPathItem } from "@/domain";

export class PathLocalStorageRepository implements PathRepository {
  private static pathMetaDataKey = "pathMetaData"


  storePath(reference: string, path: Path): void {
    if( path.gpsPoints.length == 0 ){
      return;
    }
    
    localStorage.setItem(reference, JSON.stringify({
      gpsPoints: path.gpsPoints
    }));

    const localStorageKeys = localStorage.getItem(PathLocalStorageRepository.pathMetaDataKey);
    let metaData = localStorageKeys === null ? {} : JSON.parse(localStorageKeys);
    metaData[reference] = path.gpsPoints[0].date;
    localStorage.setItem(PathLocalStorageRepository.pathMetaDataKey, JSON.stringify(metaData));
  }

  loadPath(reference: string): Path {
    const localStoragePath = localStorage.getItem(reference);
    if(localStoragePath === null) {
      return new Path([])
    }
    const pathObject: {gpsPoints: Array<{date: string, location: Location}>} = JSON.parse(localStoragePath);
    return new Path(
      pathObject.gpsPoints.map((point) => ({
        date: new Date(point.date),
        location: point.location
      }))
    );
  }

  listPaths(): Array<StoredPathItem> {
    const localStorageKeys = localStorage.getItem(PathLocalStorageRepository.pathMetaDataKey);
    const metaData = localStorageKeys === null ? {} : JSON.parse(localStorageKeys);

    return Object.keys(metaData).map((key) => ({
      reference: key,
      date: new Date(metaData[key]),
    }))
  }

    
  deletePath(reference: string): void {
    localStorage.removeItem(reference);

    const localStorageKeys = localStorage.getItem(PathLocalStorageRepository.pathMetaDataKey);
    let metaData = localStorageKeys === null ? {} : JSON.parse(localStorageKeys);
    delete metaData[reference];
    localStorage.setItem(PathLocalStorageRepository.pathMetaDataKey, JSON.stringify(metaData));
  }
}

export const pathLocalStorageRepository = new PathLocalStorageRepository()