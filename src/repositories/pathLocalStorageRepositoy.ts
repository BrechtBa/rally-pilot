import { Location, Path, PathRepository, StoredPathMetaData } from "@/domain";

export class PathLocalStorageRepository implements PathRepository {
  private static pathMetaDataKey = "pathMetaData"


  storePath(reference: string, path: Path): void {
    if( path.gpsPoints.length == 0 ){
      return;
    }
    
    localStorage.setItem(reference, JSON.stringify({
      gpsPoints: path.gpsPoints
    }));

    this.storePathMetaData(reference, path.gpsPoints[0].date, "")
  }
  
  storePathMetaData(reference: string, date: Date, title: string): void {
    const localStorageKeys = localStorage.getItem(PathLocalStorageRepository.pathMetaDataKey);
    let metaData = localStorageKeys === null ? {} : JSON.parse(localStorageKeys);
    metaData[reference] = {
      date: date,
      title: title,
    }
    localStorage.setItem(PathLocalStorageRepository.pathMetaDataKey, JSON.stringify(metaData));
  }

  loadPath(reference: string): Path {
    const localStoragePath = localStorage.getItem(reference);
    if(localStoragePath === null) {
      return new Path([]);
    }
    const pathObject: {gpsPoints: Array<{date: string, location: Location}>} = JSON.parse(localStoragePath);

    return new Path(
      pathObject.gpsPoints.map((point) => ({
        date: new Date(point.date),
        location: point.location
      }))
    )
  }

  loadPathMetaData(reference: string): StoredPathMetaData {
    const data = this.getMetadata()[reference];
    return data === undefined ? {reference: reference, date: new Date(), title: ""} : data
  }

  listPaths(): Array<StoredPathMetaData> {
    const metaData = this.getMetadata();
    return Object.values(metaData);
  }

  deletePath(reference: string): void {
    localStorage.removeItem(reference);

    const localStorageKeys = localStorage.getItem(PathLocalStorageRepository.pathMetaDataKey);
    let metaData = localStorageKeys === null ? {} : JSON.parse(localStorageKeys);
    delete metaData[reference];
    localStorage.setItem(PathLocalStorageRepository.pathMetaDataKey, JSON.stringify(metaData));
  }

  private getMetadata(): {[key: string]: StoredPathMetaData} {
    const localStorageMetaData = localStorage.getItem(PathLocalStorageRepository.pathMetaDataKey);
    const metaData = localStorageMetaData === null ? {} : JSON.parse(localStorageMetaData);

    return Object.keys(metaData).reduce((accumulator, key) => {
      let obj = {};

      if(metaData[key].date === undefined){
        obj = {
          reference: key,
          date: new Date(metaData[key]),
          title: "",
        };
      }
      else {
        obj = {
          reference: key,
          date: new Date(metaData[key].date),
          title: metaData[key].title,
        }
      }

      return {[key]: obj, ...accumulator}
  }, {})
  }

}

export const pathLocalStorageRepository = new PathLocalStorageRepository()