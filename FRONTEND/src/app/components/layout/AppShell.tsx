import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import {
  CalendarClock,
  CalendarDays,
  Clock,
  GitBranch,
  Menu,
  Plug2,
  Route,
  Users,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { UserMenu } from './UserMenu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet';

const SCHEDULING_PATH = '/scheduling';

const navItems: Array<{
  to: string;
  label: string;
  icon: typeof CalendarClock;
  disabled?: boolean;
}> = [
  { to: SCHEDULING_PATH, label: 'Scheduling', icon: CalendarClock },
  { to: '/meetings', label: 'Meetings', icon: CalendarDays },
  { to: '/availability', label: 'Availability', icon: Clock },
  { to: '#', label: 'Contacts', icon: Users, disabled: true },
  { to: '#', label: 'Workflows', icon: GitBranch, disabled: true },
  { to: '#', label: 'Integrations', icon: Plug2, disabled: true },
  { to: '#', label: 'Routing', icon: Route, disabled: true },
];

function SidebarNav({
  pathname: path,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn('flex flex-1 flex-col gap-1 px-2 py-4', className)} aria-label="Main navigation">
      {navItems.map(({ to, label, icon: Icon, disabled }) => {
        const active =
          !disabled &&
          (to === SCHEDULING_PATH
            ? path === SCHEDULING_PATH || path.startsWith('/book/')
            : path === to || path.startsWith(`${to}/`));
        const content = (
          <>
            <Icon className="size-[18px] shrink-0 text-[#64748b]" strokeWidth={1.75} />
            <span className="truncate text-[14px] leading-5">{label}</span>
          </>
        );
        if (disabled) {
          return (
            <div
              key={label}
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300"
              title="Coming soon"
            >
              {content}
              <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Soon
              </span>
            </div>
          );
        }
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200',
              active
                ? 'bg-[#e8f4ff] font-medium text-[#006bff] shadow-sm shadow-[#006bff]/10'
                : 'text-[#334155] hover:bg-slate-100/90',
            )}
          >
            <Icon
              className={cn('size-[18px] shrink-0', active ? 'text-[#006bff]' : 'text-[#64748b]')}
              strokeWidth={1.75}
            />
            <span className="truncate text-[14px] leading-5">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell() {
  const location = useLocation();
  const path = location.pathname;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen min-w-0 bg-[#f8fafc] font-sans text-slate-900 antialiased">
      <aside
        className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col border-r border-slate-200/90 bg-white shadow-sm shadow-slate-200/30 desktop:flex"
        aria-label="Main navigation"
      >
        <div className="flex h-14 shrink-0 items-center border-b border-slate-200/80 px-5">
          <Link
            to="/"
            className="flex min-h-10 items-center gap-2 transition-opacity hover:opacity-80"
          >
            <img
              src="https://res.cloudinary.com/disxidyvq/image/upload/v1774759952/qb1trfwklrj3en6mnozj.png"
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>
        <SidebarNav pathname={path} />
      </aside>

      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 min-h-14 items-center gap-2 border-b border-slate-200/90 bg-white/95 px-3 shadow-sm shadow-slate-200/20 backdrop-blur-md until-desktop:flex desktop:hidden">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-800 transition-colors hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="size-6" strokeWidth={1.75} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[min(100vw-1rem,280px)] gap-0 border-slate-200/90 bg-white p-0 shadow-xl"
          >
            <SheetHeader className="border-b border-slate-200/80 px-4 py-3.5 text-left">
              <SheetTitle>
                <img
                  src="https://res.cloudinary.com/disxidyvq/image/upload/v1774759952/qb1trfwklrj3en6mnozj.png"
                  alt="Logo"
                  className="h-10 w-auto object-contain"
                />
              </SheetTitle>
            </SheetHeader>
            <SidebarNav pathname={path} onNavigate={() => setMobileNavOpen(false)} className="flex-none" />
          </SheetContent>
        </Sheet>
        <Link
          to="/"
          className="min-h-11 flex flex-1 items-center"
          onClick={() => setMobileNavOpen(false)}
        >
          <img
            src="https://res.cloudinary.com/disxidyvq/image/upload/v1774759952/qb1trfwklrj3en6mnozj.png"
            alt="Logo"
            className="h-10 w-auto object-contain"
          />
        </Link>
        <div className="shrink-0">
          <UserMenu />
        </div>
      </header>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col pt-14 until-desktop:pt-14 desktop:pt-0 desktop:pl-[240px]">
        <header className="hidden h-14 min-h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white desktop:flex">
          {/* Full-width marquee fills gap between sidebar edge and Host menu */}
          <div className="relative flex min-w-0 flex-1 overflow-hidden px-6">
            {/* left & right fade masks */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-white to-transparent" />

            <div className="flex animate-marquee whitespace-nowrap" style={{ animationDuration: '22s' }}>
              {(() => {
                const phrases = [
                  'Simplify your schedule', '·',
                  "Meet smarter, not harder", '·',
                  "The world's #1 scheduling platform", '·',
                  'Eliminate the back-and-forth of finding meeting times', '·',
                  'Professional scheduling, effortlessly', '·',
                  'Your calendar, your rules', '·',
                  'Book more, stress less', '·',
                  'Never miss a meeting again', '·',
                ];
                return [...phrases, ...phrases].map((phrase, i) => (
                  <span
                    key={i}
                    className={`mx-4 inline-block text-[13px] tracking-wide ${
                      phrase === '·' ? 'text-slate-200' : 'font-medium italic text-slate-400'
                    }`}
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    {phrase}
                  </span>
                ));
              })()}
            </div>
          </div>

          <div className="shrink-0 pr-8">
            <UserMenu />
          </div>
        </header>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
