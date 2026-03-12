// src/mappers/arm.ts

import { GamepadInputMapping } from "../types";

// -------------------------
// Configuration
// -------------------------

const DEADZONE = 0.1;
const MAX_VELOCITY = 10; // Max velocity in deg/s for the arm joints. Actuators support up to 500 deg/s.
const MAX_ANGULAR = 10; // Overall sensitivity multiplier for the controls
const SCALE_VELOCITY = 1.0; // Additional scaling factor for velocity (can be adjusted for sensitivity)
const SCALE_ANGULAR = 120.0; // Additional scaling factor for angular velocity (can be adjusted for sensitivity)

// -------------------------
// Helpers
// -------------------------

function applyDeadzone(value: number, dz = DEADZONE): number {
  return Math.abs(value) < dz ? 0 : value;
}

function scaleAxisToRange(value: number, max: number): number {
  return Math.max(-1, Math.min(1, value)) * max;
}

// -------------------------
// Mapper
// -------------------------

/**
 * Map gamepad inputs to IK-based end-effector axes
 * axes[2] = right stick X → yaw
 * axes[3] = right stick Y → pitch
 * buttons[6] = left trigger
 * buttons[7] = right trigger
 * 
 * X → Forward
 * Y → Left
 * Z → Up
 */
export function mapGamepadToArmInputs(
  axes: number[],
  buttons: number[]
): GamepadInputMapping {
  const targets: Record<string, number> = {};

  /*
  targets["J1"] = applyDeadzone((buttons[14] ?? 0) - (buttons[15] ?? 0)) * 360;
  targets["J2"] = applyDeadzone(axes[0] ?? 0) * 10 * 2;
  targets["J3"] = applyDeadzone(axes[1] ?? 0) * 10 * 2;
  targets["J4"] = applyDeadzone(axes[3] ?? 0) * 10 * 120;
  targets["J5"] = applyDeadzone(axes[2] ?? 0) * 10 * 2;
  targets["J6"] = applyDeadzone((buttons[6] ?? 0) - (buttons[7] ?? 0)) * 10 * 10;
  */

  targets["J1"] = applyDeadzone(axes[0] ?? 0, 0.5) * 360 * 12 * 0.1; // 0.1 rev/s
  targets["J2"] = applyDeadzone(axes[1] ?? 0) * -1 * 360 * 0.03; // 0.1 rev/s
  targets["J3"] = applyDeadzone(axes[3] ?? 0) * -1 * 360 * 0.03; // 0.1 rev/s
  targets["J4"] = applyDeadzone((buttons[12] ?? 0) - (buttons[13] ?? 0)) * -1 * 100 * 360 * 0.05; // 0.1 rev/s
  targets["J5"] = applyDeadzone(axes[2] ?? 0) * -1 * 360 * 0.1; // 0.1 rev/s
  targets["J6"] = applyDeadzone((buttons[14] ?? 0) - (buttons[15] ?? 0)) * -1 * 360 * 0.1; // 0.1 rev/s

  targets["Grip"] = applyDeadzone((buttons[6] ?? 0)>0.2?1:0 - (buttons[7] ?? 0)>0.2?1:0) * -1 * 255; // 0.1 rev/s
  targets["Poke"] = applyDeadzone((buttons[5] ?? 0)) * 255; // 0.1 rev/s

  //targets["ik_z_vel"] = applyDeadzone((buttons[12] ?? 0) - (buttons[13] ?? 0)) * 20;
  //targets["ik_x_vel"] = applyDeadzone((buttons[14] ?? 0) - (buttons[15] ?? 0)) * 20;

  targets["moveto_ready"] = buttons[2] ? 1 : buttons[0] ? 2 : 0; // X button = 1, A button = 2

  return targets;
}