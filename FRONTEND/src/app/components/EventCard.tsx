import { Clock, Copy, Edit2, Link2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { EventType } from '../context/AppContext';

interface EventCardProps {
  event: EventType;
  onEdit: (event: EventType) => void;
  onDelete: (id: string) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const publicUrl = `${window.location.origin}/book/${event.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg text-gray-900 mb-1">{event.name}</h3>
          {event.description && (
            <p className="text-sm text-gray-600 mb-3">{event.description}</p>
          )}
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{event.duration} min</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <Link2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="text-sm text-gray-600 truncate flex-1">
          {`${window.location.host}/book/${event.slug}`}
        </span>
        <button
          onClick={handleCopyLink}
          className="text-[#006bff] hover:text-[#0056CC] flex-shrink-0"
          title="Copy link"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(event)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
