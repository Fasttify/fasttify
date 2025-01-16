"use client";

import { useAuthUser } from "@/hooks/auth/useAuthUser";

export default function ProtectedPage() {
  const { userData } = useAuthUser();
  console.log(userData);
  return (
    <div>
      <h1>Esta es una página protegida</h1>
      <p>Solo usuarios autenticados pueden verla.</p>
    </div>
  );
}
