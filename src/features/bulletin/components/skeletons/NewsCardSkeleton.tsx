import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewsCardSkeleton() {
  return (
    <Card className="pt-0 gap-8">
      <Skeleton className="aspect-video w-full rounded-b-none" />

      <CardHeader className="gap-2 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>

      <CardFooter className="flex self-end justify-end">
        <Skeleton className="h-9 w-36" />
      </CardFooter>
    </Card>
  );
}
