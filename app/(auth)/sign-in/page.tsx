import SignInForm from '@/features/auth/components/SignInForm';

export default function SignInPage() {
    return (
        <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4">
            <div className="flex w-full flex-col gap-8 sm:max-w-xs">
                <div className="flex flex-col gap-2">
                    <h1 className="font-serif text-3xl text-foreground underline sm:text-center">Sign In</h1>
                    <p className="text-sm text-muted-foreground sm:text-center">
                        Welcome back! Please sign in to continue.
                    </p>
                </div>
                <div className="flex flex-col gap-4">
                    <SignInForm />
                </div>
            </div>
        </section>
    );
}
