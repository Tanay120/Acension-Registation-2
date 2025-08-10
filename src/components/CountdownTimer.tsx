import { useEffect, useMemo, useState } from "react";

type CountdownTimerProps = {
  target: string | Date;
  className?: string;
  label?: string;
};

function format(num: number) {
  return num.toString().padStart(2, "0");
}

export const CountdownTimer = ({ target, className = "", label }: CountdownTimerProps) => {
  const targetDate = useMemo(() => (typeof target === "string" ? new Date(target) : target), [target]);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, targetDate.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return (
    <div className={`grid grid-flow-col gap-4 text-center auto-cols-max ${className}`} aria-live="polite">
      {label && <span className="sr-only">{label}</span>}
      <TimeBlock value={days} unit="Days" />
      <TimeBlock value={hours} unit="Hours" />
      <TimeBlock value={minutes} unit="Minutes" />
      <TimeBlock value={seconds} unit="Seconds" />
    </div>
  );
};

const TimeBlock = ({ value, unit }: { value: number; unit: string }) => (
  <div className="px-4 py-3 rounded-md bg-secondary text-secondary-foreground shadow-sm border border-border animate-fade-in">
    <div className="text-2xl md:text-3xl font-semibold font-display tracking-wider tabular-nums">{format(value)}</div>
    <div className="text-xs md:text-sm text-muted-foreground">{unit}</div>
  </div>
);
