'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { SiFacebook, SiInstagram, SiX } from '@icons-pack/react-simple-icons';
import { Controller, SubmitHandler, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ProfilePictureDropzone from './ProfilePictureDropzone';
import FormTextField from './FormTextField';
import { useRef, useTransition } from 'react';
import { toast } from 'sonner';
import { DeleteAvatarAction, PersonnelSetupAction, UploadAvatarAction } from '../action';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    X,
    IdIcon,
    UserIcon,
    OfficeIcon,
    TelephoneIcon,
    GraduationScrollIcon,
    School01Icon,
    CalendarIcon,
    Mortarboard01Icon,
    ArrowRightIcon,
    Loading02Icon,
} from '@hugeicons/core-free-icons';
import InputField from '@/components/shared/InputField';
import { Link } from 'lucide-react';
import { Label } from '@/components/ui/label';
import ComboboxField from '@/components/shared/ComboboxField';
import { Designation, Rank } from '../types';
import { PersonnelFormData, PersonnelSchema } from '../schema/personnel';
import { useRouter } from 'next/navigation';

export default function PersonnelSetupForm({ ranks, designations }: { ranks: Rank[]; designations: Designation[] }) {
    const { control, handleSubmit } = useForm<PersonnelFormData>({
        resolver: zodResolver(PersonnelSchema),
        defaultValues: {
            employeeId: '',
            firstName: '',
            lastName: '',
            office: '',
            rankId: '',
            designationId: null,
            contactNumber: '',
            education: [
                {
                    degree: '',
                    major: '',
                    institution: '',
                    yearGraduated: '',
                    onGoing: false,
                },
            ],
            socialMedia: {
                facebook: '',
                twitter: '',
                instagram: '',
                linkedin: '',
            },
        },
    });

    const pendingBlobRef = useRef<Blob | null>(null);
    const educationValues = useWatch({ control, name: 'education' });
    const [isPending, startTransition] = useTransition();

    const router = useRouter();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'education',
    });

    const handleFormSubmit: SubmitHandler<PersonnelFormData> = async (data) => {
        startTransition(async () => {
            let profilePictureUrl: string | undefined = undefined;
            try {
                if (pendingBlobRef.current) {
                    const fd = new FormData();
                    fd.append('file', pendingBlobRef.current, 'profile.jpg');

                    const uploadResult = await UploadAvatarAction(fd);
                    if (!uploadResult.success) {
                        throw new Error(uploadResult.message ?? 'Failed to upload photo.');
                    }
                    profilePictureUrl = uploadResult.url;
                }
                console.log('Submitting Personnel Data:', { ...data, profilePictureUrl });
                const result = await PersonnelSetupAction({ ...data, profilePictureUrl });
                if (!result.success) {
                    throw new Error(result.message || 'Failed to add personnel.');
                }

                toast.success('Personnel profile created successfully!');
                router.replace('/home');
            } catch (error: any) {
                if (profilePictureUrl) {
                    await DeleteAvatarAction(profilePictureUrl);
                }
                toast.error(error.message || 'An unexpected error occurred.');
            }
        });
    };

    return (
        <form id="personnel-form" className="flex flex-col gap-8" onSubmit={handleSubmit(handleFormSubmit)}>
            <Card>
                <CardContent className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2 w-full items-center">
                        <h1 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                            Profile Picture
                        </h1>

                        {/* This wrapper layout handles calculation dynamically */}
                        <div className="flex-1 w-48 min-h-0 aspect-square p-1 border-2 border-dashed rounded-full border-primary">
                            <ProfilePictureDropzone
                                onFile={(blob) => {
                                    pendingBlobRef.current = blob;
                                }}
                            />
                        </div>
                        <p className="text-[11px]">5mb is the maximum file size allowed.</p>
                    </div>
                    <Separator />
                    <div className="flex gap-8 w-full">
                        <div className="flex flex-col gap-4 flex-1">
                            <div>
                                <h1 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                                    Identity Details
                                </h1>
                                <p className="text-[11px]">Primary employee identifiers</p>
                            </div>
                            <InputField
                                name="employeeId"
                                label="Employee ID"
                                control={control}
                                isPending={isPending}
                                type="text"
                                placeholder="Enter Employee ID"
                                leadingIcon={<HugeiconsIcon icon={IdIcon} />}
                            />

                            <div className="grid grid-cols-2 gap-3">
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
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-4">
                        <h1 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                            Work Assignments
                        </h1>
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
                        </div>

                        <div className="grid grid-cols-2 gap-3">
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
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Education
                            </h1>
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
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                            >
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
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-4">
                        <h1 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                            Social Channels
                        </h1>
                        <div className="grid grid-cols-2 gap-4">
                            <FormTextField
                                name="socialMedia.facebook"
                                control={control}
                                label="Facebook"
                                type="url"
                                placeholder="https://facebook.com/username"
                                icon={<SiFacebook size={14} className="text-muted-foreground" />}
                                iconPosition="left"
                            />
                            <FormTextField
                                name="socialMedia.twitter"
                                control={control}
                                label="Twitter / X"
                                type="url"
                                placeholder="https://x.com/username"
                                icon={<SiX size={14} className="text-muted-foreground" />}
                                iconPosition="left"
                            />
                            <FormTextField
                                name="socialMedia.instagram"
                                control={control}
                                label="Instagram"
                                type="url"
                                placeholder="https://instagram.com/username"
                                icon={<SiInstagram size={14} className="text-muted-foreground" />}
                                iconPosition="left"
                            />
                            <FormTextField
                                name="socialMedia.linkedin"
                                control={control}
                                label="LinkedIn"
                                type="url"
                                placeholder="https://linkedin.com/in/username"
                                icon={<Link size={14} className="text-muted-foreground" />}
                                iconPosition="left"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <div>
                        <Button form="personnel-form" type="submit" size="xl" className="w-full">
                            {isPending ? 'Completing...' : 'Complete Profile'}
                            {isPending ? (
                                <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
                            ) : (
                                <HugeiconsIcon icon={ArrowRightIcon} />
                            )}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </form>
    );
}
