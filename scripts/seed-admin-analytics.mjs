import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

import {
  DEFAULT_DAYS,
  OUTPUT_FILE,
  buildAdminDataPayload,
  generateAnalyticsEvents,
  startOfDay,
} from "./admin-analytics-utils.mjs";

const prisma = new PrismaClient();

async function main() {
  const user =
    (await prisma.user.findFirst({ orderBy: { createdAt: "asc" } })) ??
    (await prisma.user.create({
      data: {
        email: "demo-analytics@local.test",
        passwordHash: "seed-script-placeholder",
      },
    }));

  const fromDate = startOfDay(new Date());
  fromDate.setDate(fromDate.getDate() - (DEFAULT_DAYS - 1));

  const deleted = await prisma.analyticsEvent.deleteMany({
    where: {
      createdAt: {
        gte: fromDate,
      },
    },
  });

  const events = generateAnalyticsEvents(user.id, DEFAULT_DAYS);

  await prisma.analyticsEvent.createMany({
    data: events,
  });

  const payload = buildAdminDataPayload(events, DEFAULT_DAYS);
  const outputPath = resolve(process.cwd(), OUTPUT_FILE);
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`User: ${user.email}`);
  console.log(`Removed old events: ${deleted.count}`);
  console.log(`Inserted events: ${events.length}`);
  console.log(`Saved JSON: ${outputPath}`);
  console.log(
    `Daily points: ${payload.daily.length}, avg CTR: ${(
      payload.daily.reduce((sum, point) => sum + point.ctr, 0) /
      payload.daily.length
    ).toFixed(2)}%`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed admin analytics:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
