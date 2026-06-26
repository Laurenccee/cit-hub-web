import { Checkbox } from '@/components/ui/checkbox';
import { ROUTES } from '@/utils/constants/routes';
import Link from 'next/link';

export default function FormActions() {
    return (
        <div className="flex justify-end flex-1">
            <Link href={ROUTES.FORGET_PASSWORD} className="text-foreground text-sm hover:underline">
                Forgot your password?
            </Link>
        </div>
    );
}
