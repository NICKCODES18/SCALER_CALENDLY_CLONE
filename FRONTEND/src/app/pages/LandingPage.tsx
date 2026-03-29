import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

const COMPANIES = [
  'DoorDash', 'Lyft', 'Compass', "L'Oréal", 'Zendesk', 'Dropbox',
  'Salesforce', 'HubSpot', 'Slack', 'GitHub', 'Stripe', 'Figma',
  'Notion', 'Airbnb', 'Netflix', 'Shopify', 'Atlassian', 'Twilio',
];

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
          className="animate-calendly-fade-up mb-8"
          style={{ animationDelay: '0ms' }}
        >
          <img
            src="https://res.cloudinary.com/disxidyvq/image/upload/v1774760635/cud1mkihhuav6mneia5c.png"
            alt="Logo"
            className="h-16 w-auto object-contain tablet:h-20"
          />
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

      {/* ── Marquee belt ── */}
      <div
        className="animate-calendly-fade-up relative z-10 mt-16 w-full max-w-4xl"
        style={{ animationDelay: '480ms' }}
      >
        <p className="mb-5 text-center text-xs font-medium tracking-widest text-slate-400 uppercase">
          Trusted by leading teams worldwide
        </p>

        {/* Fade masks on left & right */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-white to-transparent" />

          {/* Track — render list twice for seamless loop */}
          <div className="flex animate-marquee whitespace-nowrap">
            {[...COMPANIES, ...COMPANIES].map((name, i) => (
              <span
                key={i}
                className="mx-8 inline-block font-['Georgia',serif] text-lg font-semibold tracking-tight text-slate-400 transition-colors duration-200 hover:text-[#006bff]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Know the builder + footer bar ── */}
      <div
        className="animate-calendly-fade-up relative z-10 mt-10 flex w-full flex-col items-center gap-4"
        style={{ animationDelay: '560ms' }}
      >
        <a
          href="https://portfolio.nikunjjain.me"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-[#006bff]/20 bg-gradient-to-r from-[#006bff]/5 via-white to-[#6366f1]/5 px-6 py-2.5 text-sm font-semibold text-[#006bff] shadow-sm shadow-[#006bff]/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#006bff]/40 hover:shadow-md hover:shadow-[#006bff]/20"
        >
          {/* shimmer on hover */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
          <span className="relative">Know the builder</span>
          <svg className="relative size-3.5 opacity-50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M1 7h12M8 2l5 5-5 5" />
          </svg>
        </a>

        <p className="text-[11px] text-slate-400">
          Calendly-style scheduling · Assignment project
        </p>
      </div>
    </div>
  );
}
