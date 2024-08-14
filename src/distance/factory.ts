import { DistanceRallyUseCases } from "./useCases";
import { pathLocalStorageRepository } from "@/repositories/pathLocalStorageRepositoy";

export const distanceRallyUseCases = new DistanceRallyUseCases(pathLocalStorageRepository);
