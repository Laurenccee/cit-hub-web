import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm';
import { createClient } from '@/lib/supabase/server';

export default async function ResetPasswordPage() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    return (
        <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4">
            <div className="flex w-full flex-col gap-8 sm:max-w-xs">
                <div className="flex flex-col gap-2">
                    <h1 className="text-foreground font-serif text-2xl underline">Reset Password</h1>
                    <p className="text-accent-foreground text-sm">
                        Enter your email address. If an account exists for that email, you will receive a password reset
                        link.
                    </p>
                </div>
                <ResetPasswordForm />
            </div>
        </section>
    );
}
