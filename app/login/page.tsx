import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center">Загрузка...</div>}>
      <LoginForm />
    </Suspense>
  );
}
