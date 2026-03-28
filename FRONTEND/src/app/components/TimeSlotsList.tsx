import { formatHHmm12 } from '@/lib/time';

export interface SlotDisplay {
  /** Host wall-clock start (matches API booking startTime). */
  hostStartTime: string;
  /** Primary label (guest timezone when different from host). */
  label: string;
  /** Shown when guest and host zones differ. */
  hostHint?: string;
}

interface TimeSlotsListProps {
  date: Date;
  slots: SlotDisplay[];
  selectedTime: string | null;
  onTimeSelect: (hostStartTime: string) => void;
}

export function TimeSlotsList({ date, slots, selectedTime, onTimeSelect }: TimeSlotsListProps) {
  if (slots.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">No available time slots for this date</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm text-gray-700">
        Available times for {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </h3>
      <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto tablet:grid-cols-3 desktop:grid-cols-3">
        {slots.map((slot) => (
          <button
            key={slot.hostStartTime}
            type="button"
            onClick={() => onTimeSelect(slot.hostStartTime)}
            className={`min-h-11 rounded-lg border px-3 py-3 text-left text-sm transition-colors tablet:px-4 ${
              selectedTime === slot.hostStartTime
                ? 'border-[#006bff] bg-blue-50 text-[#006bff]'
                : 'border-gray-300 text-gray-900 hover:border-[#006bff]'
            }`}
          >
            <span className="block font-medium">{slot.label}</span>
            {slot.hostHint ? (
              <span className="mt-0.5 block text-xs text-gray-500">{slot.hostHint}</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Build slot labels from API rows (host + optional guest HH:mm). */
export function slotRowsToDisplay(
  rows: Array<{ startTime: string; startTimeGuest: string; endTimeGuest: string }>,
  hostTimeZone: string,
): SlotDisplay[] {
  const guestTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const showDual = guestTz !== hostTimeZone;

  return rows.map((s) => {
    const same = s.startTimeGuest === s.startTime;
    return {
      hostStartTime: s.startTime,
      label: formatHHmm12(showDual && !same ? s.startTimeGuest : s.startTime),
      hostHint:
        showDual && !same ? `Host: ${formatHHmm12(s.startTime)} (${hostTimeZone.split('/').pop()})` : undefined,
    };
  });
}
