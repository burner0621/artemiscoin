import React from "react";
import Countdown from "react-countdown";

const CountDownOne = ({startTime}) => {
  // Renderer callback with condition
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return (
        <div className="flex flex-row bg-[#00c4f4] gap-3 items-center justify-between p-2 text-white text-3xl border border-white rounded-xl">
          <div className="flex flex-col items-center">
            <span>{"00"}</span>
          </div>
          <div className="flex flex-col items-center">
            <span>{"00"}</span>
          </div>
          <div className="flex flex-col items-center">
            <span>{"00"}</span>
          </div>
          <div className="flex flex-col items-center">
            <span>{"00"}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-row bg-[#00c4f4] gap-3 items-center justify-between p-2 text-white text-3xl border border-white rounded-xl">
          <div className="flex flex-col items-center">
            <span className="text-sm">Days</span><span>{days < 10 ? "0" + days : days}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm">Hours</span><span>{hours < 10 ? "0" + hours : hours}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm">Minutes</span><span>{minutes < 10 ? "0" + minutes : minutes}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm">Seconds</span><span>{seconds < 10 ? "0" + seconds : seconds}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="coming-time">
      <Countdown date={Number(startTime) * 1000} renderer={renderer} />
    </div>
  );
};

export default CountDownOne;
