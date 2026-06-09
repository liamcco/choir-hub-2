"use client";

import { KeyRound, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Passkey } from "@better-auth/passkey/client";

type PasskeyManagerProps = {
  passkeys: Passkey[];
};

export function PasskeyManager({ passkeys }: PasskeyManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addPasskey() {
    setIsPending(true);
    setMessage(null);
    setError(null);

    if (!("PublicKeyCredential" in window)) {
      setError("This browser does not support passkeys.");
      setIsPending(false);
      return;
    }

    const result = await authClient.passkey.addPasskey({
      name: name.trim() || undefined,
    });

    setIsPending(false);

    if (result.error) {
      setError(result.error.message || "Could not add passkey.");
      return;
    }

    setName("");
    setMessage("Passkey added.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="passkey-name">Passkey name</FieldLabel>
          <Input
            autoComplete="off"
            id="passkey-name"
            name="passkey-name"
            onChange={(event) => setName(event.target.value)}
            placeholder="MacBook Touch ID"
            value={name}
          />
          <FieldDescription>
            Use a name that helps you recognize this device later.
          </FieldDescription>
        </Field>
      </FieldGroup>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <Button
        className="w-full sm:w-auto"
        disabled={isPending}
        onClick={addPasskey}
        type="button"
      >
        {isPending ? (
          "Adding passkey..."
        ) : (
          <>
            <Plus data-icon="inline-start" />
            Add passkey
          </>
        )}
      </Button>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Your passkeys</h3>
        {passkeys.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {passkeys.map((passkey) => (
              <li
                className="flex items-center justify-between gap-4 px-3 py-3"
                key={passkey.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <KeyRound className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {passkey.name || "Unnamed passkey"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPasskeyMeta(passkey)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
            No passkeys have been added yet.
          </p>
        )}
      </div>
    </div>
  );
}

function formatPasskeyMeta(passkey: Passkey) {
  const parts = [
    formatDeviceType(passkey.deviceType),
    passkey.backedUp ? "synced" : "device-bound",
  ];

  if (passkey.createdAt) {
    parts.push(`added ${new Date(passkey.createdAt).toLocaleDateString()}`);
  }

  return parts.join(" / ");
}

function formatDeviceType(deviceType: string) {
  return deviceType === "multiDevice" ? "multi-device" : "single-device";
}
