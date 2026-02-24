// src/mappers/arm.ts

import { GamepadInputMapping } from "../types";

// -------------------------
// Configuration
// -------------------------

const DEADZONE = 0.1;
const MAX_VELOCITY = 200; // Max velocity in deg/s for the arm joints. Actuators support up to 500 deg/s.
const MAX_ANGULAR = 10; // Overall sensitivity multiplier for the controls
const SCALE_VELOCITY = 1000.0; // Additional scaling factor for velocity (can be adjusted for sensitivity)
const SCALE_ANGULAR = 1000.0; // Additional scaling factor for angular controls

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

  targets["yaw"] = applyDeadzone(axes[2] ?? 0) * MAX_ANGULAR * SCALE_ANGULAR;
  targets["pitch"] = applyDeadzone(axes[3] ?? 0) * MAX_ANGULAR * SCALE_ANGULAR;
  targets["roll"] = -applyDeadzone((buttons[4] ?? 0) - (buttons[5] ?? 0)) * MAX_ANGULAR * SCALE_ANGULAR;

  targets["x"] = -applyDeadzone((buttons[6] ?? 0) - (buttons[7] ?? 0)) * MAX_VELOCITY * SCALE_VELOCITY;
  targets["y"] = applyDeadzone(axes[0] ?? 0) * MAX_VELOCITY * SCALE_VELOCITY;
  targets["z"] = applyDeadzone(axes[1] ?? 0) * MAX_VELOCITY * SCALE_VELOCITY;

  return targets;
}