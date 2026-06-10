'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

import { auth } from '@/lib/auth';

export type EmailVerificationState = {
  status: 'idle' | 'otp-sent' | 'verified';
  message?: string;
  error?: string;
};

export type UsernameState = {
  status: 'idle' | 'saved';
  message?: string;
  error?: string;
};

const otpSchema = z.string().trim().min(1, 'Enter the verification code.');

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Usernames must be at least 3 characters.')
  .max(30, 'Usernames must be 30 characters or fewer.')
  .regex(/^[a-zA-Z0-9_.]+$/, 'Use letters, numbers, underscores, or periods.');

export async function requestEmailVerificationAction(): Promise<EmailVerificationState> {
  const session = await getRequiredSession();

  if (!session) {
    return { status: 'idle', error: 'Sign in again to request a verification code.' };
  }

  if (session.user.emailVerified) {
    return { status: 'verified', message: 'Your email is already verified.' };
  }

  try {
    await auth.api.sendVerificationOTP({
      body: {
        email: session.user.email,
        type: 'email-verification',
      },
    });

    return {
      status: 'otp-sent',
      message: 'Verification code sent. Check the server console for the OTP.',
    };
  } catch {
    return { status: 'idle', error: 'Could not send a verification code. Try again.' };
  }
}

export async function verifyEmailOtpAction(otpInput: string): Promise<EmailVerificationState> {
  const parsed = otpSchema.safeParse(otpInput);

  if (!parsed.success) {
    return { status: 'otp-sent', error: parsed.error.issues[0]?.message ?? 'Enter the verification code.' };
  }

  const session = await getRequiredSession();

  if (!session) {
    return { status: 'otp-sent', error: 'Sign in again to verify your email.' };
  }

  if (session.user.emailVerified) {
    return { status: 'verified', message: 'Your email is already verified.' };
  }

  try {
    await auth.api.verifyEmailOTP({
      body: {
        email: session.user.email,
        otp: parsed.data,
      },
    });

    revalidatePath('/profile');
    return { status: 'verified', message: 'Email verified.' };
  } catch {
    return { status: 'otp-sent', error: 'Invalid or expired verification code.' };
  }
}

export async function claimUsernameAction(usernameInput: string): Promise<UsernameState> {
  const parsed = usernameSchema.safeParse(usernameInput);

  if (!parsed.success) {
    return { status: 'idle', error: parsed.error.issues[0]?.message ?? 'Enter a valid username.' };
  }

  const session = await getRequiredSession();

  if (!session) {
    return { status: 'idle', error: 'Sign in again to set your username.' };
  }

  if (session.user.username) {
    return { status: 'saved', message: 'Your username is already set.' };
  }

  try {
    const availability = await auth.api.isUsernameAvailable({
      body: {
        username: parsed.data,
      },
    });

    if (!availability.available) {
      return { status: 'idle', error: 'That username is already taken.' };
    }

    await auth.api.updateUser({
      headers: await headers(),
      body: {
        username: parsed.data,
        displayUsername: parsed.data,
      },
    });

    revalidatePath('/profile');
    return { status: 'saved', message: 'Username saved.' };
  } catch {
    return { status: 'idle', error: 'Could not save that username. Try another one.' };
  }
}

async function getRequiredSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}
