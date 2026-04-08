'use client';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type NewsFormData, newsSchema } from '../schema/news';
import FormTextField from '@/features/personnel/components/FormTextField';
import NewsImageDropzone from './NewsImageDropzone';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  addNewsAction,
  uploadNewsImageAction,
  deleteNewsImageAction,
} from '../action';
import { LookupOption } from '@/types/types';
import { slugify } from '@/utils/formatters';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { CalendarIcon, FileText, Link, Type } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const FORM_ID_PREFIX = 'add-news-form';

export default function AddNewsForm({
  id = FORM_ID_PREFIX,
  contentTypes,
  onPendingChange,
  onSuccess,
  portalContainer,
}: {
  id?: string;
  contentTypes: LookupOption[];
  onPendingChange?: (isPending: boolean) => void;
  onSuccess?: () => void;
  portalContainer?: HTMLElement | null;
}) {
  const pendingBlobRef = useRef<Blob | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      date: today,
      slug: '',
      imageUrl: undefined,
      imageAlt: '',
      typesId: undefined,
      isPublished: false,
      isFeatured: false,
    },
  });

  useEffect(() => {
    onPendingChange?.(isSubmitting);
  }, [isSubmitting, onPendingChange]);

  const titleValue = useWatch({ control, name: 'title' });
  const typesIdValue = useWatch({ control, name: 'typesId' });

  useEffect(() => {
    const typeSlug = contentTypes.find((ct) => ct.id === typesIdValue)?.slug;
    const titleSlug = slugify(titleValue ?? '');
    const generated = typeSlug ? `${typeSlug}/${titleSlug}` : titleSlug;
    setValue('slug', generated, { shouldValidate: false });
  }, [titleValue, typesIdValue, contentTypes, setValue]);

  const handleFormSubmit: SubmitHandler<NewsFormData> = async (data) => {
    let imageUrl: string | undefined = undefined;
    try {
      if (pendingBlobRef.current) {
        const fd = new FormData();
        fd.append('file', pendingBlobRef.current, 'news.jpg');
        const uploadResult = await uploadNewsImageAction(fd);
        if (!uploadResult.success) {
          toast.error(uploadResult.message ?? 'Failed to upload image.');
          return;
        }
        imageUrl = uploadResult.url;
      }

      const result = await addNewsAction({ ...data, imageUrl });
      if (!result.success) {
        if (imageUrl) deleteNewsImageAction(imageUrl);
        toast.error(result.message || 'Failed to add news');
        return;
      }
      onSuccess?.();
      toast.success('News added successfully.');
    } catch {
      if (imageUrl) deleteNewsImageAction(imageUrl);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <form
      id={id}
      className="flex flex-col gap-6 overflow-y-auto flex-1 py-4 px-6"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Image{' '}
            <span className="text-muted-foreground font-normal normal-case tracking-normal">
              (optional)
            </span>
          </p>
          <NewsImageDropzone
            onFile={(blob) => {
              pendingBlobRef.current = blob;
            }}
          />
          <FormTextField
            name="imageAlt"
            control={control}
            label="Alt Text"
            placeholder="Describe the image for accessibility"
            icon={<FileText size={14} />}
            iconPosition="left"
          />
        </div>
        <Separator />

        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Content
        </p>
        <FormTextField
          name="title"
          control={control}
          label="Title"
          placeholder="e.g. CIT Robotics Team Wins Championship"
          icon={<Type size={14} />}
          iconPosition="left"
        />
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <Label>
                Description{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                {...field}
                placeholder="Short summary of the news article..."
                className="min-h-20"
              />
              {fieldState.error && (
                <p className="text-xs text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
        <Controller
          name="content"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <Label>
                Full Content{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                {...field}
                placeholder="Full article body..."
                className="min-h-40"
              />
              {fieldState.error && (
                <p className="text-xs text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Meta
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="date"
            control={control}
            render={({ field, fieldState }) => {
              const [open, setOpen] = useState(false);
              const [month, setMonth] = useState<Date | undefined>(
                field.value ? parseISO(field.value) : undefined,
              );
              return (
                <div className="flex flex-col gap-2">
                  <Label>Date</Label>
                  <InputGroup>
                    <InputGroupInput
                      value={
                        field.value
                          ? format(parseISO(field.value), 'MMMM dd, yyyy')
                          : ''
                      }
                      placeholder="June 01, 2025"
                      readOnly
                    />
                    <InputGroupAddon align="inline-end">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <InputGroupButton
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Select date"
                          >
                            <CalendarIcon />
                          </InputGroupButton>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="end"
                          alignOffset={-8}
                          sideOffset={10}
                        >
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? parseISO(field.value) : undefined
                            }
                            month={month}
                            onMonthChange={setMonth}
                            onSelect={(day) => {
                              field.onChange(
                                day ? format(day, 'yyyy-MM-dd') : '',
                              );
                              setOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.error && (
                    <p className="text-xs text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              );
            }}
          />
          <Controller
            name="typesId"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-2">
                <Label>Content Type</Label>
                <Combobox
                  items={contentTypes}
                  value={
                    contentTypes.find((ct) => ct.id === field.value)?.name ??
                    null
                  }
                  onValueChange={(name) =>
                    field.onChange(
                      contentTypes.find((ct) => ct.name === name)?.id ?? null,
                    )
                  }
                >
                  <ComboboxInput placeholder="Select type" showClear />
                  <ComboboxContent container={portalContainer}>
                    <ComboboxList>
                      <ComboboxEmpty>No types found.</ComboboxEmpty>
                      <ComboboxCollection>
                        {(ct: LookupOption) => (
                          <ComboboxItem key={ct.id} value={ct.name}>
                            {ct.name}
                          </ComboboxItem>
                        )}
                      </ComboboxCollection>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {fieldState.error && (
                  <p className="text-xs text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
        <FormTextField
          name="slug"
          control={control}
          label="Slug"
          placeholder="auto-generated-from-title"
          icon={<Link size={14} />}
          iconPosition="left"
          disabled
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Settings
        </p>
        <div className="flex gap-6">
          <Controller
            name="isPublished"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label>Published</Label>
              </div>
            )}
          />
          <Controller
            name="isFeatured"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label>Featured</Label>
              </div>
            )}
          />
        </div>
      </div>
    </form>
  );
}
