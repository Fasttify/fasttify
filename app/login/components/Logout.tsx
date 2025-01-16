"use client";

import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";

Amplify.configure(outputs);

export function Logout() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/");
      }}
      className="px-2 bg-white text-black"
    >
      Sign out
    </button>
  );
}
