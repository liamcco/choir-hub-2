import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { signInAction } from "./actions";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return (
    <Card className="mx-auto my-20 w-full sm:max-w-md">
      <CardHeader>
        <p className="text-sm font-medium text-zinc-500">CSK Choir Hub</p>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>

      <CardContent>
        <LoginForm action={signInAction} />
      </CardContent>
    </Card>
  );
}