import { ReactNode } from 'react';

interface CardEmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
}

export function CardEmptyState({ icon, title, description }: CardEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <div className="bg-muted rounded-full p-3">{icon}</div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-xs text-muted-foreground/70">{description}</p>
            </div>
        </div>
    );
}
