'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Loader2, RectangleEllipsis, User2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { signInSchema } from '../schema/auth';
import { signInAction } from '../action';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { useRouter } from 'next/navigation';

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signInAction(data);

      if (result?.success === false) {
        toast.error(result.message || 'Sign in failed');
        return;
      }
      toast.success('Welcome, Admin!');
      router.push('/home');
      router.refresh();
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <Card className="flex flex-col gap-4 max-w-sm w-full">
      <CardHeader>
        <h1 className="text-xl">Admin Portal</h1>
        <span>Secure login for authorized school staff only.</span>
      </CardHeader>

      <form id="signin-form" onSubmit={handleSubmit(onSubmit)}>
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
          disabled={isSubmitting}
          form="signin-form"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
          {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        </Button>
      </CardFooter>
    </Card>
  );
}
