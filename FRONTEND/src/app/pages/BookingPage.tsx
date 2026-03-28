import { useEffect, useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router';
import { Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { localDateString } from '@/lib/date';
import { formatHHmm12 } from '@/lib/time';
import { isAxiosError } from 'axios';
import { mapAvailability, type Availability } from '@/app/context/AppContext';
import { CalendarView } from '../components/CalendarView';
import { slotRowsToDisplay, TimeSlotsList } from '../components/TimeSlotsList';
import { BookingForm } from '../components/BookingForm';

type SlotApiRow = {
  startTime: string;
  endTime: string;
  startTimeGuest: string;
  endTimeGuest: string;
};

type PublicEventType = {
  id: number;
  title: string;
  duration: number;
  slug: string;
  description?: string | null;
  hostTimeZone: string;
  availability: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
};

export function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [eventData, setEventData] = useState<PublicEventType | null>(null);
  const [availability, setAvailability] = useState<Availability>(mapAvailability([]));
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    eventTypeName: string;
    date: Date;
    timeDisplay: string;
    hostTimeHint?: string;
    duration: number;
  } | null>(null);
  const [slotRows, setSlotRows] = useState<SlotApiRow[]>([]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const { data } = await api.get<PublicEventType>(`/api/event-types/slug/${slug}`);
        if (!cancelled) {
          setEventData(data);
          setAvailability(mapAvailability(data.availability || []));
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setEventData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const eventType = eventData
    ? {
        id: String(eventData.id),
        name: eventData.title,
        duration: eventData.duration,
        slug: eventData.slug,
        description: eventData.description ?? '',
        hostTimeZone: eventData.hostTimeZone,
      }
    : null;

  const guestTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const hostTz = eventData?.hostTimeZone ?? 'America/New_York';
  const slotDisplays = useMemo(() => slotRowsToDisplay(slotRows, hostTz), [slotRows, hostTz]);

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  if (loadError || !eventType) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Event not found</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-600">
          This scheduling link may be wrong or no longer available. Check the URL or ask the host for an updated link.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 min-h-11 items-center justify-center rounded-lg bg-[#006bff] px-5 text-sm font-medium text-white transition-colors hover:bg-[#0056CC]"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setShowForm(false);
    const dateStr = localDateString(date);
    const gtz = encodeURIComponent(guestTimeZone);
    try {
      const { data } = await api.get<SlotApiRow[]>(
        `/api/booking/slots?eventTypeId=${eventType.id}&date=${encodeURIComponent(dateStr)}&guestTimeZone=${gtz}`,
      );
      setSlotRows(data);
    } catch {
      setSlotRows([]);
    }
  };

  const handleTimeSelect = (hostStartTime: string) => {
    setSelectedTime(hostStartTime);
    setShowForm(true);
  };

  const handleBookingSubmit = async (name: string, email: string) => {
    if (!selectedDate || !selectedTime) return;

    const dateStr = localDateString(selectedDate);
    const [hour, minute] = selectedTime.split(':').map(Number);
    const end = new Date(0, 0, 0, hour, minute + eventType.duration);
    const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

    const row = slotRows.find((s) => s.startTime === selectedTime);
    const dual = row && row.startTimeGuest !== row.startTime;
    const timeDisplay = dual ? formatHHmm12(row.startTimeGuest) : formatHHmm12(selectedTime);
    const hostTimeHint =
      dual ? `Host time ${formatHHmm12(selectedTime)} (${eventType.hostTimeZone.split('/').pop()})` : undefined;

    try {
      await api.post('/api/booking', {
        name,
        email,
        date: dateStr,
        startTime: selectedTime,
        endTime,
        eventTypeId: Number(eventType.id),
      });
      setConfirmedBooking({
        eventTypeName: eventType.name,
        date: selectedDate,
        timeDisplay,
        hostTimeHint,
        duration: eventType.duration,
      });
      setShowConfirmation(true);
    } catch (error) {
      const msg =
        isAxiosError(error) &&
        error.response?.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? String((error.response.data as { message?: unknown }).message)
          : error instanceof Error
            ? error.message
            : 'Failed to create booking';
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setShowForm(false);
    setShowConfirmation(false);
    setConfirmedBooking(null);
    setSlotRows([]);
  };

  if (showConfirmation && confirmedBooking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/60 bg-white p-6 text-center shadow-xl shadow-slate-200/50 tablet:p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl text-gray-900">You&apos;re booked!</h2>
          <p className="mb-6 text-gray-600">Your time is reserved. Details are below.</p>

          <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left">
            <h3 className="mb-3 font-medium text-gray-900">{confirmedBooking.eventTypeName}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {confirmedBooking.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <span className="block">{confirmedBooking.timeDisplay}</span>
                  {confirmedBooking.hostTimeHint ? (
                    <span className="mt-1 block text-xs text-gray-500">{confirmedBooking.hostTimeHint}</span>
                  ) : null}
                  <span className="mt-1 block text-xs text-gray-500">({confirmedBooking.duration} min)</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="h-11 min-h-11 w-full rounded-lg bg-[#006bff] px-6 text-sm font-medium text-white transition-colors hover:bg-[#0056CC]"
          >
            Schedule Another Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 bg-[#f8fafc]">
      <div className="mx-auto max-w-5xl px-3 py-6 tablet:px-4 tablet:py-8 desktop:px-6">
        <div className="grid grid-cols-1 gap-6 desktop:grid-cols-5 desktop:gap-8">
          <div className="order-2 min-w-0 desktop:order-1 desktop:col-span-2">
            <div className="desktop:sticky desktop:top-8">
              <div className="mb-4 desktop:mb-6">
                <h1 className="mb-2 text-xl text-gray-900 tablet:text-2xl">{eventType.name}</h1>
                {eventType.description ? (
                  <p className="mb-4 text-gray-600">{eventType.description}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-600">
                  <Clock className="h-5 w-5 shrink-0" />
                  <span>{eventType.duration} min</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-sm">Host timezone: {eventType.hostTimeZone}</span>
                </div>
                {guestTimeZone !== eventType.hostTimeZone ? (
                  <p className="mt-2 text-xs text-gray-500">Times shown in your timezone ({guestTimeZone}).</p>
                ) : null}
              </div>

              {selectedDate && selectedTime && showForm && (
                <BookingForm
                  onSubmit={handleBookingSubmit}
                  onBack={() => {
                    setShowForm(false);
                    setSelectedTime(null);
                  }}
                />
              )}
            </div>
          </div>

          <div className="order-1 min-w-0 desktop:order-2 desktop:col-span-3">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/35 tablet:p-6">
              <h2 className="mb-4 text-base font-medium text-gray-900 tablet:text-lg">Select a Date & Time</h2>

              <CalendarView
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                availability={availability}
              />

              {selectedDate && !showForm && (
                <div className="mt-6">
                  <TimeSlotsList
                    date={selectedDate}
                    slots={slotDisplays}
                    selectedTime={selectedTime}
                    onTimeSelect={handleTimeSelect}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
