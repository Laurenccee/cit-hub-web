'use client';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { SiFacebook, SiInstagram, SiX } from '@icons-pack/react-simple-icons';
import {
  Building,
  GraduationCap,
  IdCard,
  Link,
  Phone,
  User2,
  X,
} from 'lucide-react';
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type UpdatePersonnelFormData,
  updatePersonnelSchema,
} from '../schema/personnel';
import ProfilePictureDropzone from './ProfilePictureDropzone';
import FormTextField from './FormTextField';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  deleteProfilePictureAction,
  updatePersonnelAction,
  uploadProfilePictureAction,
} from '../action';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxEmpty,
} from '@/components/ui/combobox';
import { LookupOption, Personnel } from '@/types/types';

export default function EditPersonnelForm({
  id,
  personnel,
  onPendingChange,
  onSuccess,
  ranks,
  designations,
  portalContainer,
}: {
  id: string;
  personnel: Personnel;
  onPendingChange?: (isPending: boolean) => void;
  onSuccess?: () => void;
  ranks: LookupOption[];
  designations: LookupOption[];
  portalContainer?: HTMLElement | null;
}) {
  const nameParts = personnel.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdatePersonnelFormData>({
    resolver: zodResolver(updatePersonnelSchema),
    defaultValues: {
      id: personnel.id,
      employeeId: personnel.employeeId,
      firstName,
      lastName,
      rankId: personnel.rank.id,
      designationId: personnel.designation?.id,
      office: personnel.office,
      contactNumber: personnel.contactNumber,
      education:
        personnel.education.length > 0
          ? personnel.education
          : [{ degree: '', major: '', institution: '', onGoing: false }],
      socialMedia: {
        facebook: personnel.socialMedia.facebook ?? '',
        twitter: personnel.socialMedia.twitter ?? '',
        instagram: personnel.socialMedia.instagram ?? '',
        linkedin: personnel.socialMedia.linkedin ?? '',
      },
      profilePictureUrl: personnel.profilePictureUrl,
    },
  });

  useEffect(() => {
    onPendingChange?.(isSubmitting);
  }, [isSubmitting, onPendingChange]);

  const pendingBlobRef = useRef<Blob | null>(null);
  const educationValues = useWatch({ control, name: 'education' });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });

  const handleFormSubmit: SubmitHandler<UpdatePersonnelFormData> = async (
    data,
  ) => {
    let profilePictureUrl = personnel.profilePictureUrl;
    try {
      if (pendingBlobRef.current) {
        const fd = new FormData();
        fd.append('file', pendingBlobRef.current, 'profile.jpg');
        const uploadResult = await uploadProfilePictureAction(fd);
        if (!uploadResult.success) {
          toast.error(uploadResult.message ?? 'Failed to upload photo.');
          return;
        }
        profilePictureUrl = uploadResult.url;
      }

      const result = await updatePersonnelAction({
        ...data,
        profilePictureUrl,
      });
      if (!result.success) {
        if (profilePictureUrl !== personnel.profilePictureUrl) {
          deleteProfilePictureAction(profilePictureUrl!);
        }
        toast.error(result.message || 'Failed to update personnel');
        return;
      }
      onSuccess?.();
      toast.success('Personnel updated successfully.');
    } catch {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <form
      id={id}
      className="flex flex-row overflow-hidden"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <div className="aspect-square h-full flex flex-col gap-3 py-4 px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Photo
        </p>
        <ProfilePictureDropzone
          initialUrl={personnel.profilePictureUrl}
          onFile={(blob) => {
            pendingBlobRef.current = blob;
          }}
        />
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto flex-1 py-4 px-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Identity
          </p>
          <div className="grid grid-cols-3 gap-3">
            <FormTextField
              name="employeeId"
              control={control}
              label="Employee ID"
              placeholder="Employee ID"
              icon={<IdCard />}
            />
            <FormTextField
              name="firstName"
              control={control}
              label="First Name"
              placeholder="First Name"
              icon={<User2 />}
            />
            <FormTextField
              name="lastName"
              control={control}
              label="Last Name"
              placeholder="Last Name"
              icon={<User2 />}
            />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Work
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="rankId"
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <Label>Rank</Label>
                  <Combobox
                    items={ranks}
                    value={
                      ranks.find((r) => r.id === field.value)?.name ?? null
                    }
                    onValueChange={(name) =>
                      field.onChange(
                        ranks.find((r) => r.name === name)?.id ?? null,
                      )
                    }
                  >
                    <ComboboxInput placeholder="Select rank" showClear />
                    <ComboboxContent container={portalContainer}>
                      <ComboboxList>
                        <ComboboxEmpty>No ranks found.</ComboboxEmpty>
                        <ComboboxCollection>
                          {(r: LookupOption) => (
                            <ComboboxItem key={r.id} value={r.name}>
                              {r.name}
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
            <Controller
              name="designationId"
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <Label>Designation</Label>
                  <Combobox
                    items={designations}
                    value={
                      designations.find((d) => d.id === field.value)?.name ??
                      null
                    }
                    onValueChange={(name) =>
                      field.onChange(
                        designations.find((d) => d.name === name)?.id ?? null,
                      )
                    }
                  >
                    <ComboboxInput placeholder="Select designation" showClear />
                    <ComboboxContent container={portalContainer}>
                      <ComboboxList>
                        <ComboboxEmpty>No designations found.</ComboboxEmpty>
                        <ComboboxCollection>
                          {(d: LookupOption) => (
                            <ComboboxItem key={d.id} value={d.name}>
                              {d.name}
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
            <FormTextField
              name="office"
              control={control}
              label="Office"
              placeholder="Office"
              icon={<Building />}
            />
            <FormTextField
              name="contactNumber"
              control={control}
              label="Contact Number"
              placeholder="Contact Number"
              icon={<Phone />}
            />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Education
          </p>
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-2">
              <div className="flex items-end gap-3">
                <FormTextField
                  name={`education.${index}.degree`}
                  control={control}
                  label={`Degree ${index + 1}`}
                  placeholder="e.g. Bachelor of Science in IT"
                  icon={<GraduationCap />}
                  className="flex-1"
                />
                <Controller
                  name={`education.${index}.onGoing`}
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-2 items-center pb-0.5">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">
                        Ongoing
                      </Label>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <FormTextField
                  name={`education.${index}.institution`}
                  control={control}
                  label="Institution"
                  placeholder="e.g. University of Cebu"
                  icon={<Building />}
                  className="flex-1"
                />
                <FormTextField
                  name={`education.${index}.major`}
                  control={control}
                  label="Major"
                  placeholder="e.g. Information Technology"
                  className="flex-1"
                />
                {!educationValues?.[index]?.onGoing && (
                  <Controller
                    name={`education.${index}.yearGraduated`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-2 w-24">
                        <Label>Year</Label>
                        <InputGroup>
                          <InputGroupInput
                            type="text"
                            placeholder="2024"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </InputGroup>
                        {fieldState.error && (
                          <p className="text-xs text-destructive">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                )}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() =>
              append({
                degree: '',
                major: '',
                institution: '',
                yearGraduated: undefined,
                onGoing: false,
              })
            }
          >
            + Add Education
          </Button>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Social Media
          </p>
          <FormTextField
            name="socialMedia.facebook"
            control={control}
            label="Facebook"
            type="url"
            placeholder="https://facebook.com/..."
            icon={<SiFacebook size={14} />}
            iconPosition="left"
          />
          <FormTextField
            name="socialMedia.twitter"
            control={control}
            label="Twitter / X"
            type="url"
            placeholder="https://twitter.com/..."
            icon={<SiX size={14} />}
            iconPosition="left"
          />
          <FormTextField
            name="socialMedia.instagram"
            control={control}
            label="Instagram"
            type="url"
            placeholder="https://instagram.com/..."
            icon={<SiInstagram size={14} />}
            iconPosition="left"
          />
          <FormTextField
            name="socialMedia.linkedin"
            control={control}
            label="LinkedIn"
            type="url"
            placeholder="https://linkedin.com/in/..."
            icon={<Link size={14} />}
            iconPosition="left"
          />
        </div>
      </div>
    </form>
  );
}
