import { useMemo, useState, useEffect, useRef } from 'react';
import { CalendarClock, ChevronDown, HelpCircle, Link2, MoreVertical, Search, Share2, Trash2, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { EventFormModal } from '../components/EventFormModal';
import { Checkbox } from '../components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import type { EventType } from '../context/AppContext';

type SchedulingTab = 'event-types' | 'single-use' | 'polls';

interface SingleUseLink {
  id: string;
  eventName: string;
  slug: string;
  token: string;
  createdAt: string;
  used: boolean;
}

const STORAGE_KEY = 'calendly_single_use_links';

function loadLinks(): SingleUseLink[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SingleUseLink[];
  } catch {
    return [];
  }
}

function saveLinks(links: SingleUseLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

function generateToken(): string {
  return Math.random().toString(36).slice(2, 9) + Math.random().toString(36).slice(2, 9);
}

export function Dashboard() {
  const { eventTypes, addEventType, updateEventType, deleteEventType } = useApp();
  const [tab, setTab] = useState<SchedulingTab>('event-types');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [singleUseLinks, setSingleUseLinks] = useState<SingleUseLink[]>(loadLinks);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = helpDialogRef.current;
    if (!dialog) return;
    if (helpOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [helpOpen]);

  // Persist single-use links to localStorage whenever they change
  useEffect(() => {
    saveLinks(singleUseLinks);
  }, [singleUseLinks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return eventTypes;
    return eventTypes.filter((e) => e.name.toLowerCase().includes(q));
  }, [eventTypes, search]);

  const publicUrl = (slug: string) => `${window.location.origin}/book/${slug}`;

  const copyLink = (slug: string) => {
    void navigator.clipboard.writeText(publicUrl(slug));
    toast.success('Link copied to clipboard');
  };

  const handleCreateEventType = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: EventType) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this event type?')) {
      try {
        await deleteEventType(id);
        toast.success('Event type deleted');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete');
      }
    }
  };

  const handleSubmit = async (event: Omit<EventType, 'id'>) => {
    try {
      if (editingEvent) {
        await updateEventType(editingEvent.id, event);
        toast.success('Event type updated');
      } else {
        await addEventType(event);
        // Auto-create a single-use link with a unique token for the new event
        const newLink: SingleUseLink = {
          id: generateToken(),
          eventName: event.name,
          slug: event.slug,
          token: generateToken(),
          createdAt: new Date().toISOString(),
          used: false,
        };
        setSingleUseLinks((prev) => [newLink, ...prev]);
        toast.success('Event type created — single-use link generated!');
      }
      setIsModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save event');
    }
  };

  const singleUseUrl = (link: SingleUseLink) =>
    `${window.location.origin}/book/${link.slug}?t=${link.token}`;

  const copySingleUseLink = (link: SingleUseLink) => {
    void navigator.clipboard.writeText(singleUseUrl(link));
    toast.success('Single-use link copied!');
  };

  const deleteSingleUseLink = (id: string) => {
    setSingleUseLinks((prev) => prev.filter((l) => l.id !== id));
    toast.success('Single-use link removed');
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((s) => ({ ...s, [id]: checked }));
  };

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelected({});
      return;
    }
    const next: Record<string, boolean> = {};
    filtered.forEach((e) => {
      next[e.id] = true;
    });
    setSelected(next);
  };

  const allSelected = filtered.length > 0 && filtered.every((e) => selected[e.id]);

  return (
    <div className="min-h-screen min-w-0 bg-[#f8fafc]">
      <header className="border-b border-slate-200/80 bg-white px-4 pt-4 shadow-sm shadow-slate-200/20 tablet:px-6 tablet:pt-5 desktop:px-8 desktop:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="text-xl font-semibold leading-7 tracking-tight text-[#0A0A0A] tablet:text-2xl desktop:text-[28px] desktop:leading-8">
              Scheduling
            </h1>
            <button
              type="button"
              id="help-btn"
              onClick={() => setHelpOpen(true)}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-[#6B6B6B] transition-colors hover:bg-gray-100 hover:text-[#0A0A0A]"
              aria-label="Help"
            >
              <HelpCircle className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-b border-transparent pb-1 tablet:mt-5 desktop:mt-6 desktop:gap-8">
          <button
            type="button"
            onClick={() => setTab('event-types')}
            className={`relative min-h-11 px-0.5 pb-3 text-sm font-medium transition-colors ${
              tab === 'event-types'
                ? 'text-[#006bff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#006bff]'
                : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
            }`}
          >
            Event types
          </button>
          <button
            type="button"
            onClick={() => setTab('single-use')}
            className={`relative min-h-11 px-0.5 pb-3 text-sm font-medium transition-colors ${
              tab === 'single-use'
                ? 'text-[#006bff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#006bff]'
                : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
            }`}
          >
            Single-use links
          </button>
          <button
            type="button"
            onClick={() => setTab('polls')}
            className={`relative min-h-11 px-0.5 pb-3 text-sm font-medium transition-colors ${
              tab === 'polls'
                ? 'text-[#006bff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#006bff]'
                : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              Meeting polls
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Soon</span>
            </span>
          </button>
        </div>
      </header>

      {tab === 'event-types' && (
        <>
          <div className="flex flex-col gap-3 border-b border-slate-200/80 bg-white px-4 py-4 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-4 tablet:px-6 desktop:px-8">
            <div className="relative min-w-0 max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9B9B9B]" />
              <input
                type="search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 min-h-11 w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-400 outline-none ring-0 transition-shadow focus:border-[#006bff] focus:ring-2 focus:ring-[#006bff]/25 mobile:text-sm"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-11 min-h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#006bff] px-4 text-sm font-medium text-white shadow-md shadow-[#006bff]/25 transition-all duration-200 hover:bg-[#0058e6] hover:shadow-lg hover:shadow-[#006bff]/30 tablet:w-auto"
                >
                  <span className="text-lg leading-none">+</span>
                  Create
                  <ChevronDown className="size-4 opacity-90" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleCreateEventType}>Event type</DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <span className="flex items-center gap-2">Single-use link <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Soon</span></span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <span className="flex items-center gap-2">Meeting poll <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Soon</span></span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="px-4 py-5 tablet:px-6 desktop:px-8 desktop:py-6">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/90 bg-white px-4 py-16 shadow-sm shadow-slate-200/30 tablet:py-20">
                <CalendarClock className="mb-4 size-12 text-[#CFCFCF]" strokeWidth={1.25} />
                <p className="text-base font-medium text-[#3D3D3D]">No event types yet</p>
                <p className="mt-1 max-w-sm text-center text-sm text-[#6B6B6B]">
                  Create an event type to share your scheduling link. Data loads from your database.
                </p>
                <button
                  type="button"
                  onClick={handleCreateEventType}
                  className="mt-6 h-11 min-h-11 w-full max-w-xs rounded-xl bg-[#006bff] px-5 text-sm font-medium text-white shadow-md shadow-[#006bff]/25 transition-all duration-200 hover:bg-[#0058e6] hover:shadow-lg tablet:w-auto"
                >
                  + Create event type
                </button>
              </div>
            ) : (
              <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40 desktop:rounded-xl">
                <div className="flex items-center gap-4 border-b border-slate-200/80 bg-[#f8fafc] px-3 py-3 tablet:px-4">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) => toggleSelectAll(v === true)}
                    aria-label="Select all"
                  />
                  <span className="text-xs font-medium uppercase tracking-wide text-[#6B6B6B]">
                    Event types ({filtered.length})
                  </span>
                </div>
                <ul className="flex flex-col divide-y divide-[#ECECEC] bg-white tablet:grid tablet:grid-cols-2 tablet:gap-4 tablet:divide-y-0 tablet:bg-[#F5F5F5] tablet:p-4 desktop:flex desktop:flex-col desktop:gap-0 desktop:divide-y desktop:divide-[#ECECEC] desktop:bg-white desktop:p-0">
                  {filtered.map((event) => (
                    <li
                      key={event.id}
                      className="flex flex-col items-stretch border-l-4 border-l-[#8247E5] transition-colors hover:bg-[#FAFAFA] tablet:rounded-xl tablet:border tablet:border-[#E6E6E6] tablet:border-l-[6px] tablet:bg-white tablet:shadow-sm desktop:flex-row desktop:rounded-none desktop:border-0 desktop:border-l-[6px] desktop:border-l-[#8247E5] desktop:bg-transparent desktop:shadow-none"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3 px-3 py-4 tablet:items-center tablet:px-4 desktop:items-center desktop:gap-4 desktop:px-4">
                        <Checkbox
                          checked={!!selected[event.id]}
                          onCheckedChange={(v) => toggleSelect(event.id, v === true)}
                          aria-label={`Select ${event.name}`}
                          className="mt-1 desktop:mt-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold text-[#0A0A0A]">{event.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#5C5C5C]">
                            <span>{event.duration} min</span>
                            <span className="text-[#D0D0D0]">·</span>
                            <span>Video link not configured</span>
                            <span className="text-[#D0D0D0]">·</span>
                            <span>One host</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 border-t border-[#ECECEC] px-3 py-3 tablet:border-t-0 tablet:px-4 tablet:pb-4 desktop:w-auto desktop:shrink-0 desktop:border-t-0 desktop:px-4 desktop:py-4 desktop:pr-4">
                        <button
                          type="button"
                          onClick={() => copyLink(event.slug)}
                          className="h-11 min-h-11 flex-1 rounded-full border border-[#D8D8D8] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-gray-50 mobile:min-w-0 desktop:h-auto desktop:min-h-11 desktop:flex-none"
                        >
                          Copy link
                        </button>
                        <button
                          type="button"
                          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#5C5C5C] hover:bg-gray-100"
                          aria-label="Share"
                          onClick={() => copyLink(event.slug)}
                        >
                          <Share2 className="size-[18px]" strokeWidth={1.75} />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#5C5C5C] hover:bg-gray-100"
                              aria-label="More options"
                            >
                              <MoreVertical className="size-[18px]" strokeWidth={1.75} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => handleEdit(event)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyLink(event.slug)}>Copy link</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDelete(event.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'single-use' && (
        <div className="px-4 py-5 tablet:px-6 desktop:px-8 desktop:py-6">
          {singleUseLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/90 bg-white px-4 py-16 shadow-sm shadow-slate-200/30 tablet:py-20">
              <Link2 className="mb-4 size-12 text-[#CFCFCF]" strokeWidth={1.25} />
              <p className="text-base font-medium text-[#3D3D3D]">No single-use links yet</p>
              <p className="mt-1 max-w-sm text-center text-sm text-[#6B6B6B]">
                When you create a new event type, a unique single-use link is automatically generated here.
              </p>
              <button
                type="button"
                onClick={() => { setTab('event-types'); handleCreateEventType(); }}
                className="mt-6 h-11 min-h-11 w-full max-w-xs rounded-xl bg-[#006bff] px-5 text-sm font-medium text-white shadow-md shadow-[#006bff]/25 transition-all duration-200 hover:bg-[#0058e6] hover:shadow-lg tablet:w-auto"
              >
                + Create event type
              </button>
            </div>
          ) : (
            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
              <div className="flex items-center gap-4 border-b border-slate-200/80 bg-[#f8fafc] px-3 py-3 tablet:px-4">
                <span className="text-xs font-medium uppercase tracking-wide text-[#6B6B6B]">
                  Single-use links ({singleUseLinks.length})
                </span>
              </div>
              <ul className="divide-y divide-[#ECECEC]">
                {singleUseLinks.map((link) => (
                  <li
                    key={link.id}
                    className="flex flex-col gap-3 border-l-4 border-l-[#006bff] px-4 py-4 transition-colors hover:bg-[#FAFAFA] tablet:flex-row tablet:items-center tablet:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-semibold text-[#0A0A0A]">{link.eventName}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            link.used
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {link.used ? 'Used' : 'Active'}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-[#6B6B6B]">
                        {singleUseUrl(link)}
                      </p>
                      <p className="mt-0.5 text-xs text-[#9B9B9B]">
                        Created {new Date(link.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copySingleUseLink(link)}
                        className="h-9 min-h-9 rounded-full border border-[#D8D8D8] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-gray-50"
                      >
                        Copy link
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSingleUseLink(link.id)}
                        className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-[#9B9B9B] hover:bg-red-50 hover:text-red-500"
                        aria-label="Delete single-use link"
                      >
                        <Trash2 className="size-[16px]" strokeWidth={1.75} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}


      {tab === 'polls' && (
        <div className="px-4 py-12 text-center tablet:px-6 tablet:py-16 desktop:px-8">
          <p className="text-lg font-medium text-[#3D3D3D]">Meeting polls</p>
          <p className="mt-2 text-sm text-[#6B6B6B]">Let invitees vote on times. Coming soon.</p>
        </div>
      )}

      {isModalOpen && (
        <EventFormModal
          event={editingEvent}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Help / About popup */}
      <dialog
        ref={helpDialogRef}
        id="help-dialog"
        onClick={(e) => { if (e.target === helpDialogRef.current) setHelpOpen(false); }}
        className="m-auto w-full max-w-md rounded-2xl border-0 bg-white p-0 shadow-2xl shadow-slate-900/20 backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm open:flex open:flex-col"
      >
        {/* Gradient header */}
        <div className="relative flex items-center gap-3 rounded-t-2xl bg-gradient-to-br from-[#006bff] to-[#5b21b6] px-6 py-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Info className="size-5 text-white" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/75">About this site</p>
            <p className="text-base font-semibold text-white">Scheduling Tool</p>
          </div>
          <button
            type="button"
            id="help-dialog-close"
            onClick={() => setHelpOpen(false)}
            className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-6 py-6">
          <p className="text-[15px] leading-relaxed text-[#3D3D3D]">
            This is a <span className="font-semibold text-[#006bff]">demo website</span> built as a
            Calendly-style scheduling tool assignment project for{' '}
            <span className="font-semibold text-[#5b21b6]">Scaler</span>.
          </p>
          <p className="text-sm leading-relaxed text-[#6B6B6B]">
            It showcases event-type management, availability settings, real-time booking pages, and
            single-use shareable links — all backed by a live API.
          </p>
          <div className="rounded-xl border border-slate-200/80 bg-[#f8fafc] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[#9B9B9B]">Built with</p>
            <p className="mt-1 text-sm font-medium text-[#3D3D3D]">React · Node.js · Prisma · PostgreSQL</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200/80 px-6 py-4">
          <button
            type="button"
            onClick={() => setHelpOpen(false)}
            className="h-10 rounded-xl bg-[#006bff] px-5 text-sm font-medium text-white transition-all hover:bg-[#0058e6]"
          >
            Got it
          </button>
        </div>
      </dialog>
    </div>
  );
}
