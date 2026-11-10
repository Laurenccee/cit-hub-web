import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface PasswordRulesProps {
    password: string;
}

export default function PasswordRulesCard({ password }: PasswordRulesProps) {
    const rules = {
        minLen: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };

    return (
        <Card>
            <CardContent className="flex flex-col gap-2">
                <span className="text-sm">Your password must contain:</span>
                <div className="mx-2 flex flex-col">
                    <RuleItem label="At least 8 characters long" isMet={rules.minLen} />
                    <RuleItem label="At least one uppercase letter" isMet={rules.uppercase} />
                    <RuleItem label="At least one lowercase letter" isMet={rules.lowercase} />
                    <RuleItem label="At least one number" isMet={rules.number} />
                </div>
            </CardContent>
        </Card>
    );
}

function RuleItem({ label, isMet }: { label: string; isMet: boolean }) {
    return (
        <label className="flex items-center gap-2 text-sm transition-colors duration-200 select-none">
            <Checkbox checked={isMet} disabled className={`pointer-events-none`} />
            <span className={isMet ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
        </label>
    );
}
