'use client';

import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2, RectangleEllipsis, User2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { signInSchema, type SignInFormData } from '../schema/auth';
import { signInAction } from '../actions';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function SignInForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const handleSignIn: SubmitHandler<SignInFormData> = async (data) => {
    startTransition(async () => {
      try {
        const result = await signInAction(data);

        if (result?.success === false) {
          toast.error(result.message || 'Sign in failed');
          return;
        }

        toast.success('Welcome, Pioneer!');
        router.replace('/home');
      } catch {
        toast.error('An unexpected error occurred');
      }
    });
  };

  return (
    <Card className="flex flex-col gap-4 max-w-sm w-full">
      <CardHeader>
        <h1 className="text-xl">Admin Portal</h1>
        <span>Secure login for authorized school staff only.</span>
      </CardHeader>

      <form id="signin-form" onSubmit={handleSubmit(handleSignIn)}>
        <CardContent className="flex flex-col gap-2">
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    type="email"
                    placeholder="Email"
                  />
                  <InputGroupAddon>
                    <User2 />
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            name="password"
            control={control}
            defaultValue=""
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    type="password"
                    placeholder="Password"
                  />
                  <InputGroupAddon>
                    <RectangleEllipsis />
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </CardContent>
      </form>

      <CardFooter>
        <Button
          size="xl"
          type="submit"
          className="w-full"
          disabled={isPending}
          form="signin-form"
        >
          {isPending ? 'Signing in...' : 'Sign In'}
          {isPending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        </Button>
      </CardFooter>
    </Card>
  );
}
