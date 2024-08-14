import { Location, Path, PathRepository, StoredPathItem } from "@/domain";

export class PathLocalStorageRepository implements PathRepository {
  
  storePath(reference: string, path: Path): void {
    if( path.gpsPoints.length == 0 ){
      return;
    }
    
    localStorage.setItem(reference, JSON.stringify({
      gpsPoints: path.gpsPoints
    }));

    const localStorageKeys = localStorage.getItem("pathKeys");
    let keys = localStorageKeys === null ? {} : JSON.parse(localStorageKeys);
    keys[reference] = path.gpsPoints[0].date;
    localStorage.setItem("pathKeys", JSON.stringify(keys));

  }
  loadPath(reference: string): Path {
    const pathObject: {gpsPoints: Array<{date: string, location: Location}>} = JSON.parse(localStorage.getItem(reference));
    return new Path(
      pathObject.gpsPoints.map((point) => ({
        date: new Date(point.date),
        location: point.location
      }))
    );
  }
  listPaths(): Array<StoredPathItem> {
    const localStorageKeys = localStorage.getItem("pathKeys");
    const keys = localStorageKeys === null ? {} : JSON.parse(localStorageKeys);

    return Object.entries(keys).map(([key, val]) => ({
      reference: key,
      date: new Date(val),
    }))
  }
}

export const pathLocalStorageRepository = new PathLocalStorageRepository()