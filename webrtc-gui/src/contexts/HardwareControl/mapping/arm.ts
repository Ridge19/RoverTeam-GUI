// src/mappers/arm.ts

import { GamepadInputMapping } from "../types";

// -------------------------
// Configuration
// -------------------------

const DEADZONE = 0.05;

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
 * axes[4] = left trigger
 * axes[5] = right trigger
 */
export function mapGamepadToArmInputs(
  axes: number[],
  buttons: number[]
): GamepadInputMapping {
  const targets: Record<string, number> = {};

  // Yaw (right stick X)
  targets["axis_yaw"] = applyDeadzone(axes[2] ?? 0);

  // Pitch (right stick Y)
  targets["axis_pitch"] = -applyDeadzone(axes[3] ?? 0);

  // Roll (triggers: right - left)
  targets["axis_roll"] = (axes[5] ?? 0) - (axes[4] ?? 0);
  targets["axis_roll"] = applyDeadzone(targets["axis_roll"]);

  // Optional: keep rest at 0 for now
  targets["axis_x"] = 0;
  targets["axis_y"] = 0;
  targets["axis_z"] = 0;

  return targets;
}