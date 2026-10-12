import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
    return (
        <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4">
            <div className="flex w-full flex-col gap-8 sm:max-w-xs">
                <div className="flex flex-col gap-2">
                    <h1 className="font-serif text-3xl text-foreground underline">Reset Password</h1>
                    <p className="text-sm text-muted-foreground">
                        Choose a new password for your account. Make sure it meets all the requirements below.
                    </p>
                </div>
                <ResetPasswordForm />
            </div>
        </section>
    );
}
