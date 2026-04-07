// components/SplashScreen.tsx
export default function SplashScreen({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col gap-0 items-center justify-center bg-black text-white transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
        <img src="Equinox Logo.png" style={{width: "30%", marginTop: "15%"}}/>
        <img src="Loading_Dots.gif" style={{width: "30%", marginTop: "-10%"}}/>

    </div>
  );
}