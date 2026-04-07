import SignInForm from '@/features/auth/components/SignInForm';

export default function SignInPage() {
  return (
    <section className="flex flex-1 justify-center items-center w-full flex-col gap-8">
      <SignInForm />
    </section>
  );
}
