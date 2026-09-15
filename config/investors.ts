export const investorsCopy = {
  hero: {
    title: "Touch Typing Tutor — EdTech с подтверждённым спросом",
    subtitle:
      "Онлайн-тренажёр слепой печати с встроенной аналитикой fake door, freemium-моделью и масштабируемой архитектурой.",
  },
  problem: {
    title: "Рынок и проблема",
    points: [
      "Remote work и онлайн-обучение увеличивают спрос на продуктивные навыки.",
      "Медленная печать — скрытая потеря времени для разработчиков, студентов и офисных сотрудников.",
      "Существующие тренажёры перегружены или не дают простой воронки регистрация → прогресс → монетизация.",
    ],
  },
  product: {
    title: "Продукт",
    points: [
      "Next.js 15 + TypeScript + Prisma — production-ready стек.",
      "Поуровневый курс от 1 символа до полного алфавита.",
      "Встроенная аналитика: CTR fake door, Bounce Rate, funnel KPI в админке.",
      "Конфигурируемый алфавит — локализация без переписывания ядра.",
    ],
  },
  traction: {
    title: "Traction",
    metrics: [
      { label: "CTR fake door (30 дней)", value: "~21%" },
      { label: "Аналитических событий", value: "4000+" },
      { label: "Waitlist", value: "Растёт с запуском лендинга" },
    ],
  },
  businessModel: {
    title: "Business model",
    description:
      "Freemium: бесплатные базовые уровни → подписка на полный доступ. Цена TBD после валидации waitlist и A/B-тестов CTA.",
  },
  useOfFunds: {
    title: "Use of funds",
    items: [
      { label: "Performance marketing", share: "60%" },
      { label: "Product development", share: "25%" },
      { label: "Operations", share: "15%" },
    ],
  },
  ask: {
    title: "Ask",
    description:
      "Ищем бюджет на performance-рекламу для масштабирования B2C-воронки. Целевые KPI: снижение CAC, рост waitlist и конверсии landing → register.",
  },
  cta: {
    deck: "Запросить pitch deck",
    metrics: "Метрики продукта",
    contactSubject: "Touch Typing Tutor — investor inquiry",
  },
} as const;

export function getInvestorContactEmail() {
  return process.env.INVESTOR_CONTACT_EMAIL ?? "investors@example.com";
}

export function getInvestorMailtoLink() {
  const email = getInvestorContactEmail();
  const subject = encodeURIComponent(investorsCopy.cta.contactSubject);
  return `mailto:${email}?subject=${subject}`;
}
