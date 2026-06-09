"use client";

import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function PasskeySignInButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithPasskey() {
    setPending(true);
    setError(null);

    if (!("PublicKeyCredential" in window)) {
      setError("This browser does not support passkeys.");
      setPending(false);
      return;
    }

    try {
      await authClient.signIn.passkey({
        fetchOptions: {
          onSuccess() {
            router.replace("/");
          },
          onError(context) {
            setError(
              context.error.message || "Could not sign in with Passkey.",
            );
          },
        },
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        className="w-full"
        disabled={pending}
        onClick={signInWithPasskey}
        type="button"
        variant="outline"
      >
        {pending ? (
          "Waiting for Passkey..."
        ) : (
          <>
            <KeyRound data-icon="inline-start" />
            Sign in with Passkey
          </>
        )}
      </Button>
    </div>
  );
}
