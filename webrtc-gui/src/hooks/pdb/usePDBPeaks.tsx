import { useRef } from "react";

export function usePDBPeaks(current: number, power: number, temp: number) {
  const peaks = useRef({ maxI: 0, maxP: 0, maxT: 0 });

  if (current > peaks.current.maxI) peaks.current.maxI = current;
  if (power > peaks.current.maxP) peaks.current.maxP = power;
  if (temp > peaks.current.maxT) peaks.current.maxT = temp;

  return peaks.current;
}

export default usePDBPeaks;
