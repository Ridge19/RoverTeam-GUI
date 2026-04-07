type SpeedDisplayProps = {
  value?: number
}

export function SpeedDisplay({ value = 0 }: SpeedDisplayProps) {
  const text = format7Seg(value)

  function format7Seg(value: number): string {
      const scaled = Math.round(value * 100);
  
      // positive overflow
      if (scaled > 99999) return "9999+";
  
      // negative overflow
      if (scaled < -9999) return " 999-";
  
      const abs = Math.abs(scaled);
  
      // ensure at least 3 digits if |x| < 1 (so we show 0.xx)
      const minDigits = abs < 100 ? 3 : 0;
  
      const digits = abs.toString().padStart(minDigits, "0");
  
      if (scaled < 0) {
        return ("-" + digits).padStart(5, " ");
      }
  
      return digits.padStart(5, " ");
  }

  return (
    <div
      style={{
        background: "#000",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        borderRadius: 10,
        padding: "0px 20px",
        border: "5px solid #222",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          fontFamily: "segment-eglas, monospace",
          position: "relative",
          fontSize: 80,
          letterSpacing: 20,
        }}
      >
        <div style={{ color: "#222" }}>
          88888

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              color: "#ff9100",
              textShadow: "0 0 10px #fab861",
              whiteSpace: "pre",
            }}
          >
            {text}
          </div>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 20,
              color: "#ff9100",
              textShadow: "0 0 10px #fab861",
              whiteSpace: "pre",
            }}
          >
            {"  ."}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 15,
          gap: 5,
          fontFamily: "monospace",
          fontWeight: "bold",
        }}
      >
        <div
          style={{
            fontSize: 24,
            lineHeight: "24px",
            color: "#ff9100",
            textShadow: "0 0 10px #fab861",
          }}
        >
          m⋅s⁻¹
        </div>

        <div
          style={{
            fontSize: 24,
            lineHeight: "24px",
            color: "#222",
          }}
        >
          kph
        </div>

        <div
          style={{
            fontSize: 24,
            lineHeight: "24px",
            color: "#222",
          }}
        >
          rpm
        </div>
      </div>
    </div>
  )
}