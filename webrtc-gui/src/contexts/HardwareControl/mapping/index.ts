import { mapGamepadToArmInputs } from "./arm";
import { mapGamepadToDriveInputs } from "./drive";
import { mapGamepadToExcavatorInputs } from "./excavator";
//import { mapGamepadToScienceInputs } from "./science";
//import { mapGamepadToPTZCamInputs } from "./ptzcam";

export const gamepadMappings: Record<string, (axes: number[], buttons: number[]) => any> = {
  arm: mapGamepadToArmInputs,
  drive: mapGamepadToDriveInputs,
  excavator: mapGamepadToExcavatorInputs,
  //science: mapGamepadToScienceInputs,
  //ptzcam: mapGamepadToPTZCamInputs,
};