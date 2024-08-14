import { pathLocalStorageRepository } from "@/repositories/pathLocalStorageRepositoy";
import { HistoryUseCases } from "./useCases";


export const historyUseCases = new HistoryUseCases(pathLocalStorageRepository);
