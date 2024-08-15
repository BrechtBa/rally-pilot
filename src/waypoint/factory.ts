import { WaypointRallyUseCases } from "./useCases";
import { pathLocalStorageRepository } from "@/repositories/pathLocalStorageRepositoy";
import { waypointLocalStorageRepository } from "@/repositories/waypointLocalstorageRepository";

export const waypointRallyUseCases = new WaypointRallyUseCases(pathLocalStorageRepository, waypointLocalStorageRepository);
