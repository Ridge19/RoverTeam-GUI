import { useGamepad } from "@/contexts/GamepadContext"
import { ButtonHoldTooltip } from "./ButtonHoldTooltip"

interface StatusBannerProps {
    controlDevice: string, controlDeviceLabel: string
}

const StatusBanner: React.FC<StatusBannerProps> = ({controlDevice, controlDeviceLabel}:StatusBannerProps) => {

    const gamepad = useGamepad()

    const c1 = "#ff3636AA"
    const c2 = "#e3e3e3AA"
    const c3 = "#000000"
    const c4 = "#FFFFFF"
    const c5 = "#89e582aa"
    const c6 = "#e3e3e3AA"

    return (<>
        {gamepad.hasControl===controlDevice && <div style={{
            width: "calc(100% + 40px)",
            margin: -20,
            marginBottom: 20,
            height: 70,
            background: `repeating-linear-gradient(
                -45deg,
                ${c1} 0px,
                ${c1} 20px,
                ${c2} 20px,
                ${c2} 40px
            )`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                backgroundColor: c3,
                color: c4,
                fontWeight: "bold",
                padding: 5,
                paddingRight: 10,
                paddingLeft: 10,
                fontFamily: "monospace",
                fontSize: 24
            }}>
                {controlDeviceLabel.toUpperCase()} IS UNDER YOUR CONTROL - HOLD
                <ButtonHoldTooltip
                size={36}
                style={{
                    display: "inline-block",
                    marginBottom: -10,
                    marginLeft: 5,
                    marginRight: 5}}
                buttonIndex={1}
                holdDuration={2}
                onComplete={()=>{
                    gamepad.setHasControl("none")
                }}
                />
                TO EXIT
            </div>
            </div>}

            {gamepad.hasControl==="none" && <div style={{
            width: "calc(100% + 40px)",
            margin: -20,
            marginBottom: 20,
            height: 70,
            background: `repeating-linear-gradient(
                -45deg,
                ${c5} 0px,
                ${c5} 20px,
                ${c6} 20px,
                ${c6} 40px
            )`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
            }}>
            <div style={{
                backgroundColor: c3,
                color: c4,
                fontWeight: "bold",
                padding: 5,
                paddingRight: 10,
                paddingLeft: 10,
                fontFamily: "monospace",
                fontSize: 24
            }}>
                HOLD
                <ButtonHoldTooltip
                size={36}
                style={{
                    display: "inline-block",
                    marginBottom: -10,
                    marginLeft: 5,
                    marginRight: 5
                }}
                buttonIndex={3}
                holdDuration={2}
                onComplete={()=>{
                    gamepad.setHasControl(controlDevice)
                }}
                />
                TO TAKE CONTROL OF {controlDeviceLabel.toUpperCase()}
            </div>
        </div>}
    </>)
}

export { StatusBanner }