'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { SiFacebook, SiInstagram, SiX } from '@icons-pack/react-simple-icons';
import { Link } from 'lucide-react';
import { Controller, SubmitHandler, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdatePersonnelFormData, UpdatePersonnelSchema } from '../schema/personnel';
import ProfilePictureDropzone from './ProfilePictureDropzone';
import FormTextField from './FormTextField';
import { useEffect, useRef, useTransition } from 'react';
import { toast } from 'sonner';
import { DeleteAvatarAction, UpdatePersonnelAction, UploadAvatarAction } from '../action';
import { Designation, Personnel, Rank } from '../types';
import InputField from '@/components/shared/InputField';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    CalendarIcon,
    GraduationScrollIcon,
    IdIcon,
    Mortarboard01Icon,
    OfficeIcon,
    School01Icon,
    TelephoneIcon,
    UserIcon,
    X,
} from '@hugeicons/core-free-icons';
import ComboboxField from '@/components/shared/ComboboxField';

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
    ranks: Rank[];
    designations: Designation[];
    portalContainer?: HTMLElement | null;
}) {
    const nameParts = personnel.name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ');

    const [isPending, startTransition] = useTransition();
    console.log('EditPersonnelForm: personnel', personnel.ranks?.id);
    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<UpdatePersonnelFormData>({
        resolver: zodResolver(UpdatePersonnelSchema),
        defaultValues: {
            id: personnel.id,
            employeeId: personnel.employee_id,
            firstName,
            lastName,
            rankId: personnel.ranks?.id,
            designationId: personnel.designations?.id,
            office: personnel.office,
            contactNumber: personnel.contact_number,
            education:
                personnel.education.length > 0
                    ? personnel.education
                    : [{ degree: '', major: '', institution: '', onGoing: false }],
            socialMedia: {
                facebook: personnel.social_media.facebook ?? '',
                twitter: personnel.social_media.twitter ?? '',
                instagram: personnel.social_media.instagram ?? '',
                linkedin: personnel.social_media.linkedin ?? '',
            },
            profilePictureUrl: personnel.profile_picture_url ?? '',
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

    const handleFormSubmit: SubmitHandler<UpdatePersonnelFormData> = async (data) => {
        startTransition(async () => {
            let profilePictureUrl = personnel.profile_picture_url;
            try {
                if (pendingBlobRef.current) {
                    const fd = new FormData();
                    fd.append('file', pendingBlobRef.current, 'profile.jpg');
                    const uploadResult = await UploadAvatarAction(fd);
                    if (!uploadResult.success) {
                        toast.error(uploadResult.message ?? 'Failed to upload photo.');
                        return;
                    }
                    profilePictureUrl = uploadResult.url;
                }

                const result = await UpdatePersonnelAction({
                    ...data,
                    profilePictureUrl,
                });
                if (!result.success) {
                    if (profilePictureUrl !== personnel.profile_picture_url) {
                        await DeleteAvatarAction(profilePictureUrl!);
                    }
                    toast.error(result.message || 'Failed to update personnel');
                    return;
                }
                onSuccess?.();
                toast.success('Personnel updated successfully.');
            } catch {
                toast.error('An unexpected error occurred');
            }
        });
    };

    return (
        <form
            id={id}
            className="flex flex-row overflow-hidden"
            onSubmit={handleSubmit(handleFormSubmit, (errors) => console.log('❌ Form Validation Errors:', errors))}
        >
            <div className="aspect-square h-full flex flex-col gap-3 py-4 px-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Photo</p>
                <div className="relative aspect-square rounded-full border-dashed border-2 border-muted-foreground/30">
                    <ProfilePictureDropzone
                        initialUrl={personnel.profile_picture_url}
                        onFile={(blob) => {
                            pendingBlobRef.current = blob;
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto flex-1 py-4 px-6">
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Identity</p>
                    <div className="grid grid-cols-3 gap-3">
                        <InputField
                            name="employeeId"
                            label="Employee ID"
                            control={control}
                            isPending={isPending}
                            type="text"
                            placeholder="Enter Employee ID"
                            leadingIcon={<HugeiconsIcon icon={IdIcon} />}
                        />

                        <InputField
                            name="firstName"
                            label="First Name"
                            control={control}
                            isPending={isPending}
                            type="text"
                            placeholder="Juan"
                            leadingIcon={<HugeiconsIcon icon={UserIcon} />}
                        />
                        <InputField
                            name="lastName"
                            label="Last Name"
                            control={control}
                            isPending={isPending}
                            type="text"
                            placeholder="Dela Cruz"
                            leadingIcon={<HugeiconsIcon icon={UserIcon} />}
                        />
                    </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Work</p>
                    <div className="grid grid-cols-2 gap-3">
                        <ComboboxField<Rank>
                            name="rankId"
                            label="Rank"
                            control={control}
                            options={ranks}
                            valueKey="id" // Grabs row.id for form value submission
                            labelKey="name" // Visualizes row.name in the input selector list
                            placeholder="Select rank"
                            searchPlaceholder="Search ranks..."
                            isPending={isPending}
                        />

                        <ComboboxField<Designation>
                            name="designationId"
                            label="Designation"
                            control={control}
                            options={designations}
                            valueKey="id" // Grabs row.id for form value submission
                            labelKey="name" // Visualizes row.name in the input selector list
                            placeholder="Select designation"
                            searchPlaceholder="Search designations..."
                            isPending={isPending}
                        />
                        <InputField
                            name="office"
                            label="Office / Department"
                            control={control}
                            isPending={isPending}
                            type="text"
                            placeholder="e.g. CIT department"
                            leadingIcon={<HugeiconsIcon icon={OfficeIcon} />}
                        />
                        <InputField
                            name="contactNumber"
                            label="Contact Number"
                            control={control}
                            isPending={isPending}
                            type="text"
                            placeholder="e.g. 09123456789"
                            leadingIcon={<HugeiconsIcon icon={TelephoneIcon} />}
                        />
                    </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Education</p>
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex flex-col gap-2">
                            <div className="flex items-end gap-3">
                                <InputField
                                    name={`education.${index}.degree`}
                                    label={`Degree ${index + 1}`}
                                    control={control}
                                    isPending={isPending}
                                    type="text"
                                    placeholder="e.g. Bachelor of Science in IT"
                                    leadingIcon={<HugeiconsIcon icon={GraduationScrollIcon} />}
                                />
                                <Controller
                                    name={`education.${index}.onGoing`}
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-2 items-center pb-0.5">
                                            <Label className="text-xs text-muted-foreground whitespace-nowrap">
                                                Ongoing
                                            </Label>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </div>
                                    )}
                                />
                                {fields.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <HugeiconsIcon icon={X} />
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <InputField
                                    name={`education.${index}.institution`}
                                    label="Institution"
                                    control={control}
                                    isPending={isPending}
                                    type="text"
                                    placeholder="e.g. University of Cebu"
                                    leadingIcon={<HugeiconsIcon icon={School01Icon} />}
                                />

                                <InputField
                                    name={`education.${index}.major`}
                                    label="Major"
                                    control={control}
                                    isPending={isPending}
                                    type="text"
                                    placeholder="e.g. Information Technology"
                                    leadingIcon={<HugeiconsIcon icon={Mortarboard01Icon} />}
                                />

                                {!educationValues?.[index]?.onGoing && (
                                    <div className="w-2xs">
                                        <InputField
                                            name={`education.${index}.yearGraduated`}
                                            label="Year"
                                            control={control}
                                            isPending={isPending}
                                            type="text"
                                            placeholder="e.g. 2024"
                                            leadingIcon={<HugeiconsIcon icon={CalendarIcon} />}
                                        />
                                    </div>
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
