import { useState, useMemo } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useApp } from '../context/AppContext';
import { MeetingCard } from '../components/MeetingCard';

export function MeetingsPage() {
  const { meetings, cancelMeeting } = useApp();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { upcomingMeetings, pastMeetings } = useMemo(() => {
    const upcoming = meetings.filter(meeting => {
      // Fix BUG-4: append T00:00:00 to force local-timezone parsing (not UTC midnight)
      const meetingDate = new Date(meeting.date + 'T00:00:00');
      meetingDate.setHours(0, 0, 0, 0);
      // Fix BUG-1: exclude cancelled meetings from upcoming regardless of date
      return meetingDate >= today && meeting.status === 'scheduled';
    }).sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) return dateComparison;
      return a.time.localeCompare(b.time);
    });

    const past = meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date + 'T00:00:00');
      meetingDate.setHours(0, 0, 0, 0);
      // Past = date before today OR explicitly cancelled
      return meetingDate < today || meeting.status === 'cancelled';
    }).sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);
      if (dateComparison !== 0) return dateComparison;
      return b.time.localeCompare(a.time);
    });

    return { upcomingMeetings: upcoming, pastMeetings: past };
  }, [meetings, today]);

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this meeting?')) {
      try {
        await cancelMeeting(id);
      } catch (error) {
        const msg =
          isAxiosError(error) && error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
            ? String((error.response.data as { message?: unknown }).message)
            : error instanceof Error
              ? error.message
              : 'Failed to cancel meeting';
        toast.error(msg);
      }
    }
  };

  const activeMeetings = activeTab === 'upcoming' ? upcomingMeetings : pastMeetings;

  return (
    <div className="min-h-screen min-w-0 bg-[#f8fafc] px-4 py-6 tablet:px-6 tablet:py-8 desktop:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 tablet:mb-8">
          <h1 className="mb-2 text-2xl text-gray-900 tablet:text-3xl">Meetings</h1>
          <p className="text-sm text-gray-600 tablet:text-base">View and manage your scheduled meetings</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/35">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`min-h-12 flex-1 px-2 py-3 text-center text-xs font-medium transition-colors tablet:px-6 tablet:text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-b-2 border-[#006bff] text-[#006bff]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upcoming ({upcomingMeetings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`min-h-12 flex-1 px-2 py-3 text-center text-xs font-medium transition-colors tablet:px-6 tablet:text-sm ${
                  activeTab === 'past'
                    ? 'border-b-2 border-[#006bff] text-[#006bff]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Past ({pastMeetings.length})
              </button>
            </div>
          </div>

          <div className="p-4 tablet:p-6">
            {activeMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg text-gray-600 mb-2">
                  No {activeTab} meetings
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'upcoming'
                    ? 'Your scheduled meetings will appear here'
                    : 'Your past meetings will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMeetings.map(meeting => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onCancel={activeTab === 'upcoming' ? handleCancel : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
