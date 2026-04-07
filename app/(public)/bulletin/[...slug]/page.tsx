import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/utils/formatters';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SiFacebook } from '@icons-pack/react-simple-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ArticlePageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug: slugParts } = await params;
  const slug = slugParts.join('/');

  const supabase = await createClient();
  const { data: article } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .eq('is_archived', false)
    .maybeSingle();

  if (!article) notFound();

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            {article.title}
          </h1>
          <span className="text-sm text-muted-foreground">
            {formatDate(article.date)}
          </span>
        </div>
        <Separator />
        {article.image_url && (
          <div className="relative aspect-video w-full">
            <Image
              src={article.image_url}
              alt={article.image_alt ?? article.title}
              fill
              className="object-cover"
            />
          </div>
        )}
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="col-span-2">
          <Card className="p-6">
            <CardHeader>
              <p className="text-lg md:text-xl text-justify text-primary leading-relaxed">
                {article.description}
              </p>
            </CardHeader>
            <Separator />
            {article.content && (
              <>
                <CardContent>
                  <p className="text-base text-justify text-muted-foreground leading-relaxed">
                    {article.content}
                  </p>
                </CardContent>
                <Separator />
              </>
            )}
            <CardFooter className="flex-col justify-start items-baseline gap-4">
              <Tooltip>
                <TooltipContent>
                  <p>Follow us on Facebook</p>
                </TooltipContent>
                <TooltipTrigger asChild>
                  <Link href={'https://www.facebook.com/BsitPioneers'}>
                    <Button
                      variant="outline"
                      size="xl"
                      className="text-sm gap-2"
                    >
                      PIONEERS
                      <SiFacebook size={24} className="text-muted-foreground" />
                    </Button>
                  </Link>
                </TooltipTrigger>
              </Tooltip>
            </CardFooter>
          </Card>
        </section>
        <section>
          <Card className="flex items-center justify-center min-h-64 bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center gap-3 text-center py-12">
              <p className="text-lg font-medium text-muted-foreground">
                No related news articles yet
              </p>
              <p className="text-sm text-muted-foreground">
                Related news articles will appear here.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
