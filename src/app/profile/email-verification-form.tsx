'use client';

import { CheckCircle2, MailCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  EmailVerificationState,
  requestEmailVerificationAction,
  verifyEmailOtpAction,
} from '@/app/profile/actions';

type EmailVerificationFormProps = {
  email: string;
  emailVerified: boolean;
};

export function EmailVerificationForm({ email, emailVerified }: EmailVerificationFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [state, setState] = useState<EmailVerificationState>({
    status: emailVerified ? 'verified' : 'idle',
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const isVerified = emailVerified || state.status === 'verified';

  async function requestCode() {
    setIsRequesting(true);
    setState({ status: state.status });

    const nextState = await requestEmailVerificationAction();

    setState(nextState);
    setIsRequesting(false);
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsVerifying(true);
    setState({ status: 'otp-sent' });

    const nextState = await verifyEmailOtpAction(otp);

    setState(nextState);
    setIsVerifying(false);

    if (nextState.status === 'verified') {
      setOtp('');
      router.refresh();
    }
  }

  if (isVerified) {
    return (
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium">Email verified</p>
            <p className="break-words text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">Email not verified</p>
          <p className="break-words text-sm text-muted-foreground">{email}</p>
        </div>

        <Button disabled={isRequesting || isVerifying} onClick={requestCode} type="button" variant="outline">
          {isRequesting ? (
            'Sending...'
          ) : (
            <>
              <MailCheck data-icon="inline-start" />
              Get Verified
            </>
          )}
        </Button>
      </div>

      {state.message ? <p className="mt-3 text-sm text-emerald-700">{state.message}</p> : null}
      {state.error ? <FieldError className="mt-3">{state.error}</FieldError> : null}

      {state.status === 'otp-sent' ? (
        <form className="mt-4" onSubmit={verifyCode}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email-verification-otp">Verification code</FieldLabel>
              <Input
                autoComplete="one-time-code"
                id="email-verification-otp"
                inputMode="numeric"
                onChange={(event) => setOtp(event.target.value)}
                placeholder="123456"
                required
                value={otp}
              />
              <FieldDescription>The OTP is printed by the Better Auth email callback in the server logs.</FieldDescription>
            </Field>
          </FieldGroup>

          <Button className="mt-4 w-full sm:w-auto" disabled={isRequesting || isVerifying} type="submit">
            {isVerifying ? 'Verifying...' : 'Verify email'}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
