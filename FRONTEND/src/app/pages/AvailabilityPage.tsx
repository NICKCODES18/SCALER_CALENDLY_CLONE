import { useEffect, useState } from 'react';
import { Clock, Globe, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import type { Availability } from '../context/AppContext';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function AvailabilityPage() {
  const { refreshUser } = useAuth();
  const {
    availability,
    updateAvailability,
    timezone,
    setTimezone,
    eventTypes,
    activeEventTypeId,
    setActiveEventTypeId,
    loadAvailability,
  } = useApp();
  const [localAvailability, setLocalAvailability] = useState<Availability>(availability);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalAvailability(availability);
  }, [availability]);

  const handleDayToggle = (day: keyof Availability) => {
    const newAvailability = { ...localAvailability };
    if (newAvailability[day].length === 0) {
      newAvailability[day] = [{ start: '09:00', end: '17:00' }];
    } else {
      newAvailability[day] = [];
    }
    setLocalAvailability(newAvailability);
    setHasChanges(true);
  };

  const handleAddTimeSlot = (day: keyof Availability) => {
    const newAvailability = { ...localAvailability };
    newAvailability[day] = [...newAvailability[day], { start: '09:00', end: '17:00' }];
    setLocalAvailability(newAvailability);
    setHasChanges(true);
  };

  const handleRemoveTimeSlot = (day: keyof Availability, index: number) => {
    const newAvailability = { ...localAvailability };
    newAvailability[day] = newAvailability[day].filter((_, i) => i !== index);
    setLocalAvailability(newAvailability);
    setHasChanges(true);
  };

  const handleTimeChange = (day: keyof Availability, index: number, field: 'start' | 'end', value: string) => {
    const newAvailability = { ...localAvailability };
    newAvailability[day][index][field] = value;
    setLocalAvailability(newAvailability);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await api.patch('/api/me', { timeZone: timezone });
      await updateAvailability(localAvailability);
      await refreshUser();
      setHasChanges(false);
      toast.success('Availability saved successfully!');
    } catch (error) {
      let msg: string | undefined;
      if (isAxiosError(error) && error.response?.data && typeof error.response.data === 'object') {
        const d = error.response.data as { message?: unknown; error?: unknown };
        if (typeof d.message === 'string') msg = d.message;
        else if (typeof d.error === 'string') msg = d.error;
      }
      toast.error(
        msg ?? (error instanceof Error ? error.message : 'Failed to save availability'),
      );
    }
  };

  return (
    <div
      className={`min-h-screen min-w-0 bg-[#f8fafc] px-4 py-6 tablet:px-6 tablet:py-8 desktop:px-8 ${hasChanges ? 'pb-24 desktop:pb-6' : ''}`}
    >
      <div className="mb-6 tablet:mb-8">
        <h1 className="mb-2 text-2xl text-gray-900 tablet:text-3xl">Availability</h1>
        <p className="text-sm text-gray-600 tablet:text-base">Set your weekly hours for scheduling</p>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/30 tablet:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <h2 className="text-lg text-gray-900">Event Type</h2>
        </div>
        <select
          value={activeEventTypeId || ''}
          onChange={async (e) => {
            setActiveEventTypeId(e.target.value);
            await loadAvailability(e.target.value);
            setHasChanges(false);
          }}
          className="mb-6 h-11 min-h-11 w-full max-w-full rounded-lg border border-gray-300 px-4 py-2 text-base outline-none focus:border-transparent focus:ring-2 focus:ring-[#006bff]"
        >
          {eventTypes.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>

        <div className="flex items-center space-x-2 mb-4">
          <Globe className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg text-gray-900">Timezone</h2>
        </div>
        <select
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
          className="h-11 min-h-11 w-full max-w-full rounded-lg border border-gray-300 px-4 py-2 text-base outline-none focus:border-transparent focus:ring-2 focus:ring-[#006bff]"
        >
          {TIMEZONES.map(tz => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/30 tablet:p-6">
        <div className="mb-6 flex items-center gap-2">
          <Clock className="size-5 shrink-0 text-gray-600" />
          <h2 className="text-lg text-gray-900">Weekly Hours</h2>
        </div>

        <div className="space-y-4">
          {DAYS.map(day => {
            const isEnabled = localAvailability[day].length > 0;
            return (
              <div key={day} className="rounded-lg border border-gray-200 p-3 tablet:p-4">
                <div className="mb-3 flex flex-col gap-3 tablet-up:flex-row tablet-up:items-center tablet-up:justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`relative h-6 w-12 shrink-0 rounded-full transition-colors ${isEnabled ? 'bg-[#006bff]' : 'bg-gray-300'
                        }`}
                    >
                      <div
                        className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                      />
                    </button>
                    <span className="font-medium text-gray-900">{DAY_LABELS[day]}</span>
                  </div>
                  {isEnabled && (
                    <button
                      type="button"
                      onClick={() => handleAddTimeSlot(day)}
                      className="inline-flex min-h-11 items-center gap-1 text-sm text-[#006bff] hover:text-[#0056CC]"
                    >
                      <Plus className="size-4" />
                      <span>Add hours</span>
                    </button>
                  )}
                </div>

                {isEnabled && (
                  <div className="space-y-3 pl-0 tablet-up:pl-[3.75rem]">
                    {localAvailability[day].map((slot, index) => (
                      <div
                        key={index}
                        className="flex w-full flex-col gap-2 tablet-up:flex-row tablet-up:flex-wrap tablet-up:items-center"
                      >
                        <input
                          type="time"
                          value={slot.start}
                          onChange={e => handleTimeChange(day, index, 'start', e.target.value)}
                          className="h-11 min-h-11 w-full min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-transparent focus:ring-2 focus:ring-[#006bff] tablet-up:min-w-[8.5rem] tablet-up:flex-none"
                        />
                        <span className="hidden text-gray-500 tablet-up:inline">–</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={e => handleTimeChange(day, index, 'end', e.target.value)}
                          className="h-11 min-h-11 w-full min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base outline-none focus:border-transparent focus:ring-2 focus:ring-[#006bff] tablet-up:min-w-[8.5rem] tablet-up:flex-none"
                        />
                        {localAvailability[day].length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTimeSlot(day, index)}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center self-start text-red-500 hover:text-red-700 tablet-up:self-center"
                            aria-label="Remove hours"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!isEnabled && (
                  <p className="pl-0 text-sm text-gray-500 tablet-up:pl-[3.75rem]">Unavailable</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {hasChanges && (
        <div className="flex justify-stretch mobile:fixed mobile:bottom-0 mobile:left-0 mobile:right-0 mobile:z-30 mobile:border-t mobile:border-gray-200 mobile:bg-white mobile:p-4 desktop:static desktop:border-0 desktop:p-0 desktop:justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="h-11 min-h-11 w-full rounded-lg bg-[#006bff] px-6 text-white transition-colors hover:bg-[#0056CC] desktop:w-auto"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
