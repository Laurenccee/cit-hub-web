import { cn } from '@/lib/utils';

const MAX_WIDTH = {
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '5xl': 'max-w-5xl',
    '7xl': 'max-w-7xl',
} as const;

type MaxWidth = keyof typeof MAX_WIDTH;

interface PageSectionProps extends React.ComponentProps<'section'> {
    /** Use `scroll` for full-height setup/wizard pages that own their scrolling. */
    scroll?: boolean;
}

/**
 * The outer page surface. Regular pages get vertical rhythm (`py-8`); setup
 * pages pass `scroll` to become full-height scroll containers instead.
 */
export function PageSection({ scroll = false, className, children, ...props }: PageSectionProps) {
    return (
        <section
            className={cn(
                'flex flex-1 flex-col',
                scroll ? 'h-full min-h-0 overflow-y-auto' : 'py-8',
                className,
            )}
            {...props}
        >
            {children}
        </section>
    );
}

interface PageContainerProps extends React.ComponentProps<'div'> {
    maxWidth?: MaxWidth;
    /** Horizontal padding is on by default; disable for edge-to-edge layouts. */
    padded?: boolean;
}

/** Centers page content and applies the shared responsive gutter. */
export function PageContainer({
    maxWidth = '7xl',
    padded = true,
    className,
    children,
    ...props
}: PageContainerProps) {
    return (
        <div
            className={cn(
                'mx-auto flex w-full flex-col',
                padded && 'px-4 sm:px-6 lg:px-8',
                MAX_WIDTH[maxWidth],
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface PageHeaderProps {
    eyebrow?: React.ReactNode;
    title: string;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

/** Consistent page title block: optional eyebrow, serif `h1`, description, actions. */
export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
            <div className="flex min-w-0 flex-col gap-2">
                {eyebrow}
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {title}
                </h1>
                {description && (
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
                )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
