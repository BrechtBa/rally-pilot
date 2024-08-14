import { Path, PathRepository, StoredPathItem } from "@/domain";

export class HistoryUseCases {

  pathRepository: PathRepository

  constructor(pathRepository: PathRepository) {
    this.pathRepository = pathRepository
  }

  listPaths(): Array<StoredPathItem> {
    return this.pathRepository.listPaths()
  }

  getPath(reference: string): Path {
    return this.pathRepository.loadPath(reference)
  }
}