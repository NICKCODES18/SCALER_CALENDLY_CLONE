import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import type { EventType } from '../context/AppContext';

interface EventFormModalProps {
  event: EventType | null;
  onSubmit: (event: Omit<EventType, 'id'>) => void;
  onClose: () => void;
}

export function EventFormModal({ event, onSubmit, onClose }: EventFormModalProps) {
  const [name, setName] = useState(event?.name || '');
  const [duration, setDuration] = useState(event?.duration || 30);
  const [slug, setSlug] = useState(event?.slug || '');
  const [description, setDescription] = useState(event?.description || '');

  useEffect(() => {
    if (!event && name && !slug) {
      const autoSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(autoSlug);
    }
  }, [name, event, slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSubmit({
      name: name.trim(),
      duration,
      slug: slug.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 tablet:items-center tablet:p-4">
      <div className="max-h-[min(90vh,40rem)] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4 tablet:rounded-2xl tablet:p-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <h2 className="text-xl text-gray-900 tablet:text-2xl">
            {event ? 'Edit Event Type' : 'Create Event Type'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="30 Minute Meeting"
              className="h-11 min-h-11 w-full min-w-0 rounded-lg border border-gray-300 px-4 py-2 text-base outline-none focus:border-transparent focus:ring-2 focus:ring-[#006bff]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Duration <span className="text-red-500">*</span>
            </label>
            <select
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="h-11 min-h-11 w-full rounded-lg border border-gray-300 px-4 py-2 text-base outline-none focus:border-transparent focus:ring-2 focus:ring-[#006bff]"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-[#006bff] tablet:flex-row tablet:items-stretch">
              <span className="shrink-0 border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 tablet:border-b-0 tablet:border-r tablet:py-3 tablet:text-sm">
                {window.location.origin}/book/
              </span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="30min"
                className="min-h-11 min-w-0 flex-1 px-3 py-2 text-base outline-none"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Quick 30-minute discussion"
              rows={3}
              className="min-h-[5.5rem] w-full min-w-0 resize-none rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-transparent focus:ring-2 focus:ring-[#006bff]"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4 tablet:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="h-11 min-h-11 w-full flex-1 rounded-lg border border-gray-300 px-4 text-sm font-medium transition-colors hover:bg-gray-50 tablet:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 min-h-11 w-full flex-1 rounded-lg bg-[#006bff] px-4 text-sm font-medium text-white transition-colors hover:bg-[#0056CC] tablet:w-auto"
            >
              {event ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
