import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ForgetPasswordForm from '@/features/auth/components/ForgetPasswordForm';
import { ROUTES } from '@/utils/constants/routes';
import { ArrowLeft02Icon, InformationSquareIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

export default function ForgetPasswordPage() {
    return (
        <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4">
            <div className="flex w-full flex-col gap-8 sm:max-w-xs">
                <div className="flex flex-col gap-2">
                    <h1 className="text-foreground font-serif text-2xl underline">Forget Password</h1>
                    <p className="text-accent-foreground text-sm">
                        Don't worry! Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>
                <ForgetPasswordForm />
                <div className="flex flex-col gap-8">
                    <Card>
                        <CardContent className="flex items-center gap-4">
                            <HugeiconsIcon icon={InformationSquareIcon} color="currentColor" size={32} />
                            <p className="text-foreground text-sm">
                                Can't access your email? Please contact our support collective for manual account
                                verification.
                            </p>
                        </CardContent>
                    </Card>
                    <Separator />
                    <Link href={ROUTES.SIGN_IN} className="text-foreground flex items-center gap-2 text-xs">
                        <HugeiconsIcon icon={ArrowLeft02Icon} color="currentColor" size={16} />
                        <span className="hover:underline">Back to Sign in</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
