'use client';

import React, { useState, useEffect } from 'react';
import { getCityLocalTime } from '@/lib/timeUtils';
import { Clock } from 'lucide-react';

interface CityClockProps {
  timezone: string;
  className?: string;
  showIcon?: boolean;
  showDate?: boolean;
}

interface LocalTimeState {
  formattedTime: string;
  formattedDate: string;
  timeOfDay: string;
  isNight: boolean;
}

/**
 * Live local time for a curated destination.
 *
 * The clock is resolved only after mount: rendering a real timestamp during SSR
 * compares the server's clock (and instant) against the browser's, which React
 * reports as a hydration mismatch. Until then a width-stable placeholder is
 * rendered so the surrounding layout does not shift.
 */
export function CityClock({ timezone, className = '', showIcon = true, showDate = false }: CityClockProps) {
  const [timeData, setTimeData] = useState<LocalTimeState | null>(null);

  useEffect(() => {
    const syncTime = () => setTimeData(getCityLocalTime(timezone));
    syncTime();

    const interval = setInterval(syncTime, 10000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono tabular-nums text-xs ${className}`}
      suppressHydrationWarning
    >
      {showIcon && <Clock className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />}
      {timeData ? (
        <>
          <span>{timeData.formattedTime}</span>
          <span className="opacity-50" aria-hidden="true">
            ·
          </span>
          <span>{timeData.timeOfDay}</span>
          {showDate && (
            <>
              <span className="opacity-50" aria-hidden="true">
                ·
              </span>
              <span className="font-sans text-xs tracking-normal">{timeData.formattedDate}</span>
            </>
          )}
        </>
      ) : (
        <>
          <span aria-hidden="true">--:--</span>
          <span className="opacity-50" aria-hidden="true">
            ·
          </span>
          <span className="opacity-60">Local time</span>
          {showDate && (
            <>
              <span className="opacity-50" aria-hidden="true">
                ·
              </span>
              <span className="font-sans text-xs tracking-normal opacity-60">Today</span>
            </>
          )}
        </>
      )}
    </span>
  );
}
