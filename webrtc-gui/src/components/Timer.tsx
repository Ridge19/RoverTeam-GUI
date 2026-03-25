import React, { useEffect, useState, useMemo } from 'react';
import { Temporal } from '@js-temporal/polyfill';

const Timer = () => {
  // 1. Define your sequence of dates (ISO format strings)
  const targetDates = useMemo(() => [
    '2026-03-26T08:50:00',
    '2026-03-26T09:00:00',
    '2026-03-26T09:15:00',
    '2026-03-26T10:05:00',
  ], []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<Temporal.Duration | null>(null);

  useEffect(() => {
    // If we've run out of dates, stop
    if (currentIndex >= targetDates.length) return;

    const userTimeZone = Temporal.Now.timeZoneId();

    // Convert the current target string into a ZonedDateTime
    const target = Temporal.PlainDateTime.from(targetDates[currentIndex])
      .toZonedDateTime(userTimeZone);

    const calculateTime = () => {
      const now = Temporal.Now.zonedDateTimeISO();

      // Calculate difference between Target and Now
      const diff = target.since(now, {
        largestUnit: 'day',
        smallestUnit: 'second',
      });

      // CHECK: Has the timer reached zero (or passed it)?
      if (diff.sign <= 0) {
        // Move to the next date in the array
        setCurrentIndex((prev) => prev + 1);
        return;
      }

      setTimeLeft(diff);
    };

    // Run immediately
    calculateTime();

    const timerInterval = setInterval(calculateTime, 1000);
    return () => clearInterval(timerInterval);

    // Re-run this effect whenever the currentIndex changes
  }, [currentIndex, targetDates]);

  // UI States
  if (currentIndex >= targetDates.length) {
    return <div><h1>All countdowns finished!</h1></div>;
  }

  if (!timeLeft) return <div>Loading...</div>;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif', padding: '10px' }}>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
        {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
        <span>{String(timeLeft.hours).padStart(2, '0')}h:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}m:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>

      <div style={{ marginTop: '20px', color: '#666' }}>
      </div>
    </div>
  );
};

export default Timer;