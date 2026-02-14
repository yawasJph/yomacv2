import { formatTimeAgo, formatTimeTiny } from "@/utils/timers/timeAgo";
import { useEffect, useState } from "react";

export default function useLiveTimeAgo(timestamp, tiny = false) {
  const formatter = tiny ? formatTimeTiny : formatTimeAgo;

  const [time, setTime] = useState(() => formatter(timestamp));

  useEffect(() => {
    function update() {
      setTime(formatter(timestamp));
    }

    update();

    // interval inteligente según antigüedad
    const age = (Date.now() - new Date(timestamp)) / 1000;

    let interval = 60000; // default 1 min

    if (age < 60) interval = 1000;
    else if (age < 3600) interval = 10000;
    else if (age < 86400) interval = 60000;
    else interval = 300000;

    const id = setInterval(update, interval);
    return () => clearInterval(id);
  }, [timestamp, tiny]);

  return time;
}
