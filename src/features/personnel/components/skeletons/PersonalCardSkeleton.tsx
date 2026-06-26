import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PersonnelCardSkeleton() {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="pt-0 gap-8">
                    <Skeleton className="aspect-square w-full rounded-b-none" />
                    <CardHeader className="gap-2 flex-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardFooter className="flex justify-between items-end">
                        <div className="flex gap-2">
                            <Skeleton className="size-9 rounded-md" />
                            <Skeleton className="size-9 rounded-md" />
                        </div>
                        <Skeleton className="h-9 w-28" />
                    </CardFooter>
                </Card>
            ))}
        </section>
    );
}
