import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import moment from "moment";
import { CircularProgress } from "@mui/material";
import {
  CountdownCard,
  CountdownRow,
  CountdownFont,
  CountdownFontNumber,
  CountdownCol,
} from "./Countdown-styles";

interface CountdownProps {
  endDate: moment.Moment;
  blocksRemaining: number | null;
  loadingAtInfo: boolean;
}

export const Countdown: React.FC<CountdownProps> = ({
  endDate,
  blocksRemaining,
  loadingAtInfo,
}) => {
  const [timeRemainingDays, setTimeRemainingDays] = useState<number | null>(
    null
  );
  const [timeRemainingHours, setTimeRemainingHours] = useState<number | null>(
    null
  );
  const [timeRemainingMinutes, setTimeRemainingMinutes] = useState<
    number | null
  >(null);

  // useEffect that runs the countdown timer
  useEffect(() => {
    let intervalId: number | null = null;
    const updateCountdown = () => {
      const now = moment();
      const duration = moment.duration(endDate.diff(now));

      if (duration.asMilliseconds() <= 0) {
        setTimeRemainingDays(0);
        setTimeRemainingHours(0);
        setTimeRemainingMinutes(0);
        if (intervalId) clearInterval(intervalId);
        return;
      }

      const totalMinutes = duration.asMinutes();
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = Math.floor(totalMinutes % 60);

      setTimeRemainingDays(days);
      setTimeRemainingHours(hours);
      setTimeRemainingMinutes(minutes);
    };

    // Ensure the crowdfund has not ended before running the countdown
    if (!endDate || !blocksRemaining) return;

    updateCountdown();
    intervalId = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [blocksRemaining, endDate]);

  return (
    <>
      {!loadingAtInfo ? (
        <CountdownCard>
          {endDate && blocksRemaining ? (
            <>
              <CountdownRow style={{ alignItems: "flex-start" }}>
                <CountdownCol>
                  <CountdownFontNumber>{timeRemainingDays}</CountdownFontNumber>
                  <CountdownFont>{`Day${
                    timeRemainingDays === 1 ? "" : "s"
                  }`}</CountdownFont>
                </CountdownCol>
                <CountdownCol>
                  <CountdownFontNumber>:</CountdownFontNumber>
                </CountdownCol>
                <CountdownCol>
                  <CountdownFontNumber>
                    {timeRemainingHours}
                  </CountdownFontNumber>
                  <CountdownFont>{`Hour${
                    timeRemainingHours === 1 ? "" : "s"
                  }`}</CountdownFont>
                </CountdownCol>
                <CountdownCol>
                  <CountdownFontNumber>:</CountdownFontNumber>
                </CountdownCol>
                <CountdownCol>
                  <CountdownFontNumber>
                    {timeRemainingMinutes}
                  </CountdownFontNumber>
                  <CountdownFont>{`Minute${
                    timeRemainingMinutes === 1 ? "" : "s"
                  }`}</CountdownFont>
                </CountdownCol>
              </CountdownRow>
              <CountdownRow>
                <CountdownCol>
                  <CountdownFont style={{ fontSize: "21px" }}>
                    Blocks Remaining: {blocksRemaining}
                  </CountdownFont>
                  <CountdownFont style={{ fontSize: "21px" }}>
                    updated every 30 seconds
                  </CountdownFont>
                </CountdownCol>
              </CountdownRow>
            </>
          ) : (
            <CountdownFont style={{ fontSize: "21px" }}>
              Crowdfunding has ended.
            </CountdownFont>
          )}
        </CountdownCard>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};
