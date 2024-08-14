import { WaypointRallyUseCases } from "./useCases";
import { pathLocalStorageRepository } from "@/repositories/pathLocalStorageRepositoy";

export const waypointRallyUseCases = new WaypointRallyUseCases(pathLocalStorageRepository);
