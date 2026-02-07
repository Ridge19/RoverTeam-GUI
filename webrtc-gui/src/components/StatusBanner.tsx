import { useGamepad } from "@/contexts/GamepadContext"
import { ButtonHoldTooltip } from "./ButtonHoldTooltip"

type ControlState =
  | "active"
  | "idle"
  | "disabled"

interface StatusBannerProps {
  controlDevice: string
  controlDeviceLabel: string
}

/* ---------- COLOR VARIANTS ---------- */

const bannerVariants: Record<ControlState, {
  stripeA: string
  stripeB: string
}> = {
  active: {
    stripeA: "#ff3636AA",
    stripeB: "#e3e3e3AA",
  },
  idle: {
    stripeA: "#89e582aa",
    stripeB: "#e3e3e3AA",
  },
  disabled: {
    stripeA: "#363636aa",
    stripeB: "#e3e3e3AA",
  }
}

/* ---------- SHARED STYLES ---------- */

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

/* ---------- HELPERS ---------- */

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

  const state: ControlState =
    gamepad.hasControl === controlDevice ? "active" :
    gamepad.gamepadType === "none" ? "disabled" : "idle"

  const colors = bannerVariants[state]

  const bannerStyle: React.CSSProperties = {
    ...containerBase,
    background: stripeBackground(colors.stripeA, colors.stripeB),
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
              onComplete={() => gamepad.setHasControl("none")}
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
              onComplete={() => gamepad.setHasControl(controlDevice)}
            />
            TO TAKE CONTROL OF {controlDeviceLabel.toUpperCase()}
          </>
        ) : (
          <>
            CONTROLLER MUST BE CONNECTED
          </>
        )}
      </div>
    </div>
  )
}

export { StatusBanner }