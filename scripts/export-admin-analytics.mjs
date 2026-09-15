import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

import {
  DEFAULT_DAYS,
  OUTPUT_FILE,
  buildAdminDataPayload,
  startOfDay,
} from "./admin-analytics-utils.mjs";

const prisma = new PrismaClient();

async function main() {
  const fromDate = startOfDay(new Date());
  fromDate.setDate(fromDate.getDate() - (DEFAULT_DAYS - 1));

  const events = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: {
        gte: fromDate,
      },
    },
    select: {
      userId: true,
      sessionId: true,
      eventType: true,
      durationMs: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const payload = buildAdminDataPayload(events, DEFAULT_DAYS);
  const outputPath = resolve(process.cwd(), OUTPUT_FILE);
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Exported events: ${events.length}`);
  console.log(`Saved JSON: ${outputPath}`);
}

main()
  .catch((error) => {
    console.error("Failed to export admin analytics:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
