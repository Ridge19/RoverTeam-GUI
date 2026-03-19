import { useGamepad } from "@/contexts/HardwareControl/useGamepad"
import { ControlTarget } from "@/contexts/HardwareControl/types"
import { ButtonHoldTooltip } from "./ButtonHoldTooltip"
import React from "react"

/* ---------- TYPES ---------- */

type ControlState =
  | "active"
  | "idle"
  | "disabled"
  | "unavailable"

interface StatusBannerProps {
  controlDevice: ControlTarget
  controlDeviceLabel: string
}

/* ---------- COLOR VARIANTS ---------- */

const bannerVariants: Record<ControlState, { stripeA: string; stripeB: string }> = {
  active: { stripeA: "#ff3636AA", stripeB: "#e3e3e3AA" },
  idle: { stripeA: "#89e582aa", stripeB: "#e3e3e3AA" },
  disabled: { stripeA: "#363636aa", stripeB: "#e3e3e3AA" },
  unavailable: { stripeA: "#555555aa", stripeB: "#e3e3e3AA" },
}

/* ---------- STYLES ---------- */

const containerBase: React.CSSProperties = {
  width: "calc(100% + 40px)",
  margin: -20,
  marginBottom: 20,
  height: 70,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

const labelBase: React.CSSProperties = {
  backgroundColor: "#000000",
  color: "#FFFFFF",
  fontWeight: "bold",
  padding: 5,
  paddingLeft: 10,
  paddingRight: 10,
  fontFamily: "monospace",
  fontSize: 24,
}

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: -10,
  marginLeft: 5,
  marginRight: 5,
}

function stripeBackground(a: string, b: string) {
  return `repeating-linear-gradient(
    -45deg,
    ${a} 0px,
    ${a} 20px,
    ${b} 20px,
    ${b} 40px
  )`
}

/* ---------- COMPONENT ---------- */

const StatusBanner: React.FC<StatusBannerProps> = ({
  controlDevice,
  controlDeviceLabel,
}) => {
  const gamepad = useGamepad()

  // Check if hardware is available
  const { ok, error } =
    gamepad.hardwareControlAvailable?.(controlDevice) ?? {
      ok: false,
      error: "Controller must be connected",
    }

  // Determine state
  let state: ControlState = "disabled"
  if (gamepad.hasControl === controlDevice) state = "active"
  else if (!ok) state = "unavailable"
  else if (gamepad.hasControl !== controlDevice) state = "idle"

  const colors = bannerVariants[state]

  const bannerStyle: React.CSSProperties = {
    ...containerBase,
    background: stripeBackground(colors.stripeA, colors.stripeB),
  }

  const takeControl = async () => {
    // 1️⃣ Set hasControl immediately
    gamepad.setHasControl(controlDevice)

    // 2️⃣ Wait for hardware to be ready
    const hw = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Hardware not ready")), 1000)
      const interval = setInterval(() => {
        const hwReady = gamepad.hardwareStates[controlDevice]
        if (hwReady?.sendEvent) {
          clearInterval(interval)
          clearTimeout(timeout)
          resolve(hwReady)
        }
      }, 50)
    }).catch((e) => {
      console.warn(e.message)
      return null
    })

    // 3️⃣ Send event if ready
    hw?.sendEvent("control_take")
  }

  const releaseControl = async () => {
    const hw = gamepad.hardwareStates[controlDevice]
    hw?.sendEvent?.("control_release")
    gamepad.setHasControl("none")
  }

  return (
    <div style={bannerStyle}>
      <div style={labelBase}>
        {state === "active" ? (
          <>
            {controlDeviceLabel.toUpperCase()} IS UNDER YOUR CONTROL — HOLD
            <ButtonHoldTooltip
              size={36}
              style={buttonStyle}
              buttonIndex={1}
              holdDuration={1}
              onComplete={releaseControl} // sends "control_release" then releases
            />
            TO EXIT
          </>
        ) : state === "idle" ? (
          <>
            HOLD
            <ButtonHoldTooltip
              size={36}
              style={buttonStyle}
              buttonIndex={3}
              holdDuration={1}
              onComplete={takeControl} // sends "control_take" then takes control
            />
            TO TAKE CONTROL OF {controlDeviceLabel.toUpperCase()}
          </>
        ) : (
          <>{(error ?? "Controller must be connected").toUpperCase()}</>
        )}
      </div>
    </div>
  )
}

export { StatusBanner }