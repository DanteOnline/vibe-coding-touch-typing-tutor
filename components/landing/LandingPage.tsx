import { landingCopy, landingCta } from "@/config/landing";
import {
  getPrimaryCtaHref,
  getPrimaryCtaLabel,
  getSecondaryCtaHref,
} from "@/lib/landing-cta";

import { LandingCtaButton } from "./LandingCtaButton";

type LandingPageProps = {
  isAuthenticated: boolean;
  isOnWaitlist: boolean;
};

export function LandingPage({
  isAuthenticated,
  isOnWaitlist,
}: LandingPageProps) {
  const primaryHref = getPrimaryCtaHref({ isAuthenticated, isOnWaitlist });
  const primaryLabel = getPrimaryCtaLabel({ isAuthenticated, isOnWaitlist });
  const secondaryHref = getSecondaryCtaHref(isAuthenticated);
  const secondaryLabel = isAuthenticated
    ? landingCopy.hero.secondaryCtaLoggedIn
    : landingCopy.hero.secondaryCta;

  return (
    <div className="space-y-20 pb-8">
      <section className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {landingCopy.hero.headline}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {landingCopy.hero.subheadline}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LandingCtaButton href={primaryHref} label={primaryLabel} />
          <LandingCtaButton
            href={secondaryHref}
            label={secondaryLabel}
            variant="outline"
            trackClick={false}
          />
        </div>
        <a
          href={landingCta.howItWorksAnchor}
          className="text-sm text-primary hover:underline"
        >
          {landingCopy.hero.howItWorksLink}
        </a>
      </section>

      <section className="rounded-xl border bg-muted/30 p-8 text-center">
        <h2 className="text-2xl font-semibold">{landingCopy.problem.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {landingCopy.problem.description}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {landingCopy.valuePillars.map((pillar) => (
          <article key={pillar.title} className="rounded-xl border p-6">
            <h3 className="text-lg font-semibold">{pillar.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {pillar.description}
            </p>
          </article>
        ))}
      </section>

      <section id="how-it-works" className="space-y-6">
        <h2 className="text-center text-2xl font-semibold">
          {landingCopy.howItWorks.title}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {landingCopy.howItWorks.steps.map((step, index) => (
            <article key={step.title} className="rounded-xl border p-6">
              <p className="text-sm font-medium text-primary">
                Шаг {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </article>
          ))}
        </div>
        <div className="flex justify-center">
          <LandingCtaButton href={primaryHref} label={primaryLabel} />
        </div>
      </section>

      <section className="grid gap-6 rounded-xl border p-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">{landingCopy.demo.title}</h2>
          <p className="mt-3 text-muted-foreground">
            {landingCopy.demo.description}
          </p>
        </div>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          {landingCopy.demo.previewLines.map((line) => (
            <p key={line} className="py-1">
              {line}
            </p>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-center text-2xl font-semibold">
          {landingCopy.proof.title}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {landingCopy.proof.metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-xl border p-6 text-center"
            >
              <p className="text-3xl font-bold">{metric.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {metric.label}
              </p>
            </article>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {landingCopy.proof.testimonials.map((item) => (
            <blockquote key={item.author} className="rounded-xl border p-6">
              <p className="text-sm italic">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-4 text-sm font-medium">{item.author}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-muted/30 p-8 text-center">
        <h2 className="text-2xl font-semibold">{landingCopy.pricing.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {landingCopy.pricing.description}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {landingCopy.pricing.note}
        </p>
        <div className="mt-6 flex justify-center">
          <LandingCtaButton
            href={primaryHref}
            label={landingCopy.pricing.cta}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-center text-2xl font-semibold">
          {landingCopy.faq.title}
        </h2>
        <div className="space-y-3">
          {landingCopy.faq.items.map((item) => (
            <details key={item.question} className="rounded-xl border p-4">
              <summary className="cursor-pointer font-medium">
                {item.question}
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-xl border p-8 text-center">
        <h2 className="text-2xl font-semibold">{landingCopy.finalCta.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {landingCopy.finalCta.description}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LandingCtaButton
            href={primaryHref}
            label={landingCopy.finalCta.primaryCta}
          />
          <LandingCtaButton
            href={secondaryHref}
            label={landingCopy.finalCta.secondaryCta}
            variant="outline"
            trackClick={false}
          />
        </div>
      </section>
    </div>
  );
}
