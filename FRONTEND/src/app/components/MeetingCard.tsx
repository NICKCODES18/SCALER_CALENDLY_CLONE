import { Calendar, Clock, Mail, User, X } from 'lucide-react';
import { dateFromCivilString } from '@/lib/date';
import type { Meeting } from '../context/AppContext';

interface MeetingCardProps {
  meeting: Meeting;
  onCancel?: (id: string) => void;
}

export function MeetingCard({ meeting, onCancel }: MeetingCardProps) {
  const formatDate = (dateStr: string) => {
    const date = dateFromCivilString(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md mobile:p-3">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900 mb-1">{meeting.eventTypeName}</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{meeting.attendeeName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{meeting.attendeeEmail}</span>
            </div>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={() => onCancel(meeting.id)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
            title="Cancel meeting"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(meeting.date)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{formatTime(meeting.time)} ({meeting.duration} min)</span>
        </div>
      </div>
    </div>
  );
}
