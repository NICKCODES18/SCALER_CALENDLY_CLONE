import { Link } from 'react-router';
import { ArrowRight, CalendarClock } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-gradient-to-b from-[#f8fafc] via-white to-[#eef3ff] px-5 py-16 tablet:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(at 20% 20%, rgba(0, 107, 255, 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(99, 102, 241, 0.06) 0px, transparent 45%), radial-gradient(at 50% 100%, rgba(0, 107, 255, 0.06) 0px, transparent 50%)',
        }}
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[min(32rem,80vw)] w-[min(48rem,95vw)] -translate-x-1/2 rounded-full bg-[#006bff]/[0.12] blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <div
          className="animate-calendly-fade-up mb-8 inline-flex size-[4.5rem] items-center justify-center rounded-2xl bg-white/80 shadow-[0_8px_32px_-8px_rgba(0,107,255,0.2)] ring-1 ring-slate-200/80 backdrop-blur-sm tablet:size-20"
          style={{ animationDelay: '0ms' }}
        >
          <CalendarClock className="size-10 text-[#006bff] tablet:size-11" strokeWidth={1.35} />
        </div>

        <h1
          className="animate-calendly-fade-up text-3xl font-semibold tracking-tight text-slate-900 tablet:text-4xl desktop:text-5xl desktop:leading-tight"
          style={{ animationDelay: '80ms' }}
        >
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#006bff] bg-clip-text text-transparent">
            SCALER CALENDLY CLONE
          </span>
        </h1>

        <p
          className="animate-calendly-fade-up mt-5 text-base font-medium text-slate-600 tablet:text-lg"
          style={{ animationDelay: '160ms' }}
        >
          Designed by{' '}
          <span className="text-slate-800">Nikunj Jain</span>
        </p>

        <p
          className="animate-calendly-fade-up mt-6 max-w-lg text-pretty text-sm leading-relaxed text-slate-500 tablet:text-base"
          style={{ animationDelay: '240ms' }}
        >
          Schedule meetings effortlessly with a modern booking experience
        </p>

        <div className="animate-calendly-fade-up mt-10 flex w-full flex-col items-stretch gap-3 tablet:max-w-xs" style={{ animationDelay: '320ms' }}>
          <Link
            to="/scheduling"
            className="group relative inline-flex h-12 min-h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#006bff] px-8 text-sm font-semibold text-white shadow-[0_4px_14px_-3px_rgba(0,107,255,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0058e6] hover:shadow-[0_8px_28px_-6px_rgba(0,107,255,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006bff]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="relative">Get Started</span>
            <ArrowRight className="relative size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
          <p className="text-center text-xs text-slate-400">No signup required for demo</p>
        </div>
      </div>

      <footer className="animate-calendly-fade-up relative z-10 mt-auto pt-16 text-center text-xs text-slate-400" style={{ animationDelay: '420ms' }}>
        Calendly-style scheduling · Assignment project
      </footer>
    </div>
  );
}
