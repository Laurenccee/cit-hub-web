'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { SiFacebook, SiInstagram, SiX } from '@icons-pack/react-simple-icons';
import { Link } from 'lucide-react';
import { Controller } from 'react-hook-form';
import ProfilePictureDropzone from './ProfilePictureDropzone';
import FormTextField from './FormTextField';
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
import { updatePersonnelAction } from '../action';
import { uploadAvatarAction } from '@/actions/image';
import { usePersonnelForm } from '../hooks/usePersonnelForm'; // 👈 Hook import

export default function EditPersonnelForm({
    id,
    personnel,
    onPendingChange,
    onSuccess,
    ranks,
    designations,
}: {
    id: string;
    personnel: Personnel;
    onPendingChange?: (isPending: boolean) => void;
    onSuccess?: () => void;
    ranks: Rank[];
    designations: Designation[];
}) {
    const { control, isPending, fields, append, remove, educationValues, pendingBlobRef, onSubmit } = usePersonnelForm({
        personnel,
        mode: 'edit',
        onPendingChange,
        onSuccess,
        submitAction: updatePersonnelAction,
        uploadAvatarAction,
    });

    return (
        <form id={id} className="flex flex-row overflow-hidden" onSubmit={onSubmit}>
            {/* Left side column avatar graphic placement layout */}
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

            {/* Scrolling input container section */}
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
                            placeholder="Enter ID"
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
                        <ComboboxField
                            name="rankId"
                            label="Rank"
                            control={control}
                            options={ranks}
                            valueKey="id"
                            labelKey="name"
                            placeholder="Select rank"
                            searchPlaceholder="Search ranks..."
                            isPending={isPending}
                        />
                        <ComboboxField
                            name="designationId"
                            label="Designation"
                            control={control}
                            options={designations}
                            valueKey="id"
                            labelKey="name"
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
                                    placeholder="e.g. Bachelor of Science"
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
                                    placeholder="e.g. School"
                                    leadingIcon={<HugeiconsIcon icon={School01Icon} />}
                                />
                                <InputField
                                    name={`education.${index}.major`}
                                    label="Major"
                                    control={control}
                                    isPending={isPending}
                                    type="text"
                                    placeholder="e.g. IT"
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
                                            placeholder="2024"
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
                        onClick={() => append({ degree: '', major: '', institution: '', onGoing: false })}
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
