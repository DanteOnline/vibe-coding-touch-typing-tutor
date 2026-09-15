import Link from "next/link";

import { LandingCtaButton } from "@/components/landing/LandingCtaButton";
import { Button } from "@/components/ui/button";
import {
  getInvestorMailtoLink,
  investorsCopy,
} from "@/config/investors";

export default function InvestorsPage() {
  return (
    <div className="space-y-12 pb-8">
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">Investor relations</p>
        <h1 className="text-4xl font-bold tracking-tight">
          {investorsCopy.hero.title}
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          {investorsCopy.hero.subtitle}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">{investorsCopy.problem.title}</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          {investorsCopy.problem.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">{investorsCopy.product.title}</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          {investorsCopy.product.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section id="metrics" className="space-y-4">
        <h2 className="text-2xl font-semibold">{investorsCopy.traction.title}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {investorsCopy.traction.metrics.map((metric) => (
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
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">
          {investorsCopy.businessModel.title}
        </h2>
        <p className="text-muted-foreground">
          {investorsCopy.businessModel.description}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">
          {investorsCopy.useOfFunds.title}
        </h2>
        <ul className="space-y-2">
          {investorsCopy.useOfFunds.items.map((item) => (
            <li key={item.label} className="flex justify-between rounded-lg border px-4 py-3">
              <span>{item.label}</span>
              <span className="font-medium">{item.share}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">{investorsCopy.ask.title}</h2>
        <p className="text-muted-foreground">{investorsCopy.ask.description}</p>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <a href={getInvestorMailtoLink()}>{investorsCopy.cta.deck}</a>
        </Button>
        <LandingCtaButton
          href="#metrics"
          label={investorsCopy.cta.metrics}
          variant="outline"
          trackClick={false}
        />
        <Button asChild variant="ghost" size="lg">
          <Link href="/">На главную</Link>
        </Button>
      </section>
    </div>
  );
}
