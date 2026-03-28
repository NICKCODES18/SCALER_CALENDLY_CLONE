import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { localDateString } from '@/lib/date';
import { useAuth } from '@/app/context/AuthContext';

export interface EventType {
  id: string;
  name: string;
  duration: number;
  slug: string;
  description?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface Availability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface Meeting {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  attendeeName: string;
  attendeeEmail: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'cancelled';
}

export function mapAvailability(
  rows: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
): Availability {
  const next: Availability = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };
  const map: Record<number, keyof Availability> = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
    0: 'sunday',
  };
  rows.forEach((row) => {
    const key = map[row.dayOfWeek];
    if (key) next[key].push({ start: row.startTime, end: row.endTime });
  });
  return next;
}

interface AppContextType {
  eventTypes: EventType[];
  addEventType: (event: Omit<EventType, 'id'>) => Promise<void>;
  updateEventType: (id: string, event: Omit<EventType, 'id'>) => Promise<void>;
  deleteEventType: (id: string) => Promise<void>;
  availability: Availability;
  updateAvailability: (availability: Availability) => Promise<void>;
  activeEventTypeId: string | null;
  setActiveEventTypeId: (id: string) => void;
  loadAvailability: (eventTypeId: string) => Promise<void>;
  getSlots: (eventTypeId: string, date: string) => Promise<string[]>;
  timezone: string;
  setTimezone: (timezone: string) => void;
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id'>) => Promise<void>;
  cancelMeeting: (id: string) => Promise<void>;
  refreshMeetings: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultAvailability: Availability = {
  monday: [{ start: '09:00', end: '17:00' }],
  tuesday: [{ start: '09:00', end: '17:00' }],
  wednesday: [{ start: '09:00', end: '17:00' }],
  thursday: [{ start: '09:00', end: '17:00' }],
  friday: [{ start: '09:00', end: '17:00' }],
  saturday: [],
  sunday: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const defaultUserMode = import.meta.env.VITE_USE_DEFAULT_USER === 'true';
  /** Load dashboard data when logged in, or in assignment mode without relying on /api/me. */
  const hostDataEnabled = !authLoading && (!!user || defaultUserMode);
  const queryClient = useQueryClient();
  const [availability, setAvailability] = useState<Availability>(defaultAvailability);
  const [activeEventTypeId, setActiveEventTypeId] = useState<string | null>(null);
  const [timezone, setTimezoneState] = useState<string>(
    () =>
      localStorage.getItem('calendly_timezone') ||
      localStorage.getItem('schedulr_timezone') ||
      'America/New_York'
  );

  const setTimezone = (tz: string) => {
    localStorage.setItem('calendly_timezone', tz);
    setTimezoneState(tz);
  };
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: eventTypes = [], isFetching: eventTypesLoading } = useQuery({
    queryKey: ['event-types', user?.id],
    queryFn: async () => {
      const { data } = await api.get<
        Array<{ id: number; title: string; duration: number; slug: string; description?: string | null }>
      >('/api/event-types');
      return data.map((item) => ({
        id: String(item.id),
        name: item.title,
        duration: item.duration,
        slug: item.slug,
        description: item.description ?? '',
      })) as EventType[];
    },
    enabled: hostDataEnabled,
  });

  useEffect(() => {
    if (!user && !defaultUserMode) {
      setActiveEventTypeId(null);
    }
  }, [user?.id, defaultUserMode]);

  useEffect(() => {
    if (user?.timeZone) {
      localStorage.setItem('calendly_timezone', user.timeZone);
      setTimezoneState(user.timeZone);
    }
  }, [user?.timeZone]);

  useEffect(() => {
    if (!user && !defaultUserMode) return;
    if (!eventTypes.length) {
      setActiveEventTypeId(null);
      return;
    }
    setActiveEventTypeId((prev) => {
      if (prev && eventTypes.some((e) => e.id === prev)) return prev;
      return eventTypes[0].id;
    });
  }, [user, eventTypes, defaultUserMode]);

  const refreshEventTypes = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['event-types'] });
  }, [queryClient]);

  const refreshMeetings = useCallback(async () => {
    if (!user && !defaultUserMode) return;
    const asOf = encodeURIComponent(localDateString(new Date()));
    const [{ data: upcoming }, { data: past }] = await Promise.all([
      api.get<Array<Record<string, unknown>>>(`/api/booking/upcoming?asOf=${asOf}`),
      api.get<Array<Record<string, unknown>>>(`/api/booking/past?asOf=${asOf}`),
    ]);
    const byEvent = new Map(eventTypes.map((e) => [e.id, e]));
    const mapped: Meeting[] = [...upcoming, ...past].map((item: Record<string, unknown>) => {
      const eventTypeId = String(item.eventTypeId);
      const event = byEvent.get(eventTypeId);
      return {
        id: String(item.id),
        eventTypeId,
        eventTypeName: event?.name || `Event ${String(item.eventTypeId)}`,
        attendeeName: String(item.name),
        attendeeEmail: String(item.email),
        date: String(item.date),
        time: String(item.startTime),
        duration: event?.duration || 0,
        status: (item.status as 'scheduled' | 'cancelled') || 'scheduled',
      };
    });
    setMeetings(mapped);
  }, [user, eventTypes, defaultUserMode]);

  const loadAvailability = useCallback(async (eventTypeId: string) => {
    const { data } = await api.get<Array<{ dayOfWeek: number; startTime: string; endTime: string }>>(
      `/api/availability/${eventTypeId}`,
    );
    setAvailability(mapAvailability(data));
  }, []);

  const addEventType = async (event: Omit<EventType, 'id'>) => {
    await api.post('/api/event-types', {
      title: event.name,
      duration: event.duration,
      description: event.description,
      slug: event.slug,
    });
    await refreshEventTypes();
  };

  const updateEventType = async (id: string, event: Omit<EventType, 'id'>) => {
    await api.patch(`/api/event-types/${id}`, {
      title: event.name,
      duration: event.duration,
      description: event.description,
      slug: event.slug,
    });
    await refreshEventTypes();
  };

  const deleteEventType = async (id: string) => {
    await api.delete(`/api/event-types/${id}`);
    await refreshEventTypes();
  };

  const updateAvailability = async (newAvailability: Availability) => {
    if (!activeEventTypeId) throw new Error('No event selected');
    const dayMap: Record<keyof Availability, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    const slots = (Object.keys(newAvailability) as Array<keyof Availability>).flatMap((day) =>
      newAvailability[day].map((slot) => ({
        dayOfWeek: dayMap[day],
        startTime: slot.start,
        endTime: slot.end,
      })),
    );
    await api.post('/api/availability', {
      eventTypeId: Number(activeEventTypeId),
      slots,
    });
    setAvailability(newAvailability);
  };

  const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
    const [hour, minute] = meeting.time.split(':').map(Number);
    const end = new Date(0, 0, 0, hour, minute + meeting.duration);
    const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
    await api.post('/api/booking', {
      name: meeting.attendeeName,
      email: meeting.attendeeEmail,
      date: meeting.date,
      startTime: meeting.time,
      endTime,
      eventTypeId: Number(meeting.eventTypeId),
    });
    await refreshMeetings();
  };

  const cancelMeeting = async (id: string) => {
    await api.delete(`/api/booking/${id}`);
    await refreshMeetings();
  };

  const getSlots = async (eventTypeId: string, date: string): Promise<string[]> => {
    const { data } = await api.get<Array<{ startTime: string }>>(
      `/api/booking/slots?eventTypeId=${eventTypeId}&date=${date}`,
    );
    return data.map((slot) => slot.startTime);
  };

  useEffect(() => {
    if ((!user && !defaultUserMode) || !activeEventTypeId) return;
    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadAvailability(activeEventTypeId), refreshMeetings()]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, activeEventTypeId, eventTypes.length, loadAvailability, refreshMeetings, defaultUserMode]);

  const combinedLoading = loading || eventTypesLoading;

  return (
    <AppContext.Provider
      value={{
        eventTypes,
        addEventType,
        updateEventType,
        deleteEventType,
        availability,
        updateAvailability,
        activeEventTypeId,
        setActiveEventTypeId,
        loadAvailability,
        getSlots,
        timezone,
        setTimezone,
        meetings,
        addMeeting,
        cancelMeeting,
        refreshMeetings,
        loading: combinedLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
