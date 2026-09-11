import { Suspense } from "react";

import { SubscriptionPlaceholder } from "@/components/subscription/SubscriptionPlaceholder";

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="text-center">Загрузка...</div>}>
      <SubscriptionPlaceholder />
    </Suspense>
  );
}
