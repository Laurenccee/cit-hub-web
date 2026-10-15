import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const selectVariants = cva(
    'rounded-md border border-input bg-card text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            size: {
                sm: 'h-8 px-2 text-xs',
                default: 'h-9 px-3 text-xs',
                lg: 'h-10 px-3 text-xs',
            },
        },
        defaultVariants: {
            size: 'default',
        },
    },
);

function Select({
    className,
    size,
    ...props
}: Omit<React.ComponentProps<'select'>, 'size'> &
    VariantProps<typeof selectVariants>) {
    return (
        <select
            data-slot="select"
            className={cn(selectVariants({ size, className }))}
            {...props}
        />
    );
}

export { Select };
