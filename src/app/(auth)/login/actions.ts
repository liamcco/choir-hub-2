"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginState = {
  error?: string;
};

export async function signInWithCredentialsAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  try {
    await auth.api.signInEmail({
      body: parsed.data,
    });
  } catch {
    return { error: "Invalid email or password." };
  }

  redirect("/");
}
