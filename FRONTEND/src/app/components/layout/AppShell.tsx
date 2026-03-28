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
            to={SCHEDULING_PATH}
            className="flex min-h-10 items-center gap-2 text-lg font-semibold tracking-tight text-slate-900 transition-opacity hover:opacity-80"
          >
            Calendly
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
              <SheetTitle className="text-base font-semibold text-slate-900">Calendly</SheetTitle>
            </SheetHeader>
            <SidebarNav pathname={path} onNavigate={() => setMobileNavOpen(false)} className="flex-none" />
          </SheetContent>
        </Sheet>
        <Link
          to={SCHEDULING_PATH}
          className="min-h-11 flex flex-1 items-center text-lg font-semibold tracking-tight text-slate-900"
          onClick={() => setMobileNavOpen(false)}
        >
          Calendly
        </Link>
        <div className="shrink-0">
          <UserMenu />
        </div>
      </header>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col pt-14 until-desktop:pt-14 desktop:pt-0 desktop:pl-[240px]">
        <header className="hidden h-14 min-h-14 shrink-0 items-center justify-end border-b border-slate-200/80 bg-white px-4 tablet:px-6 desktop:flex desktop:px-8">
          <UserMenu />
        </header>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
