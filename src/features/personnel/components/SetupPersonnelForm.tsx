'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { SiFacebook, SiInstagram, SiX } from '@icons-pack/react-simple-icons';
import { Controller } from 'react-hook-form';
import ProfilePictureDropzone from './ProfilePictureDropzone';
import FormTextField from './FormTextField';
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
import { personnelSetupAction } from '../action';
import { uploadAvatarAction } from '@/actions/image';
import { usePersonnelForm } from '../hooks/usePersonnelForm'; // 👈 Hook import

export default function SetupPersonnelForm({ ranks, designations }: { ranks: Rank[]; designations: Designation[] }) {
    const { control, isPending, fields, append, remove, educationValues, pendingBlobRef, onSubmit } = usePersonnelForm({
        mode: 'setup',
        submitAction: personnelSetupAction,
        uploadAvatarAction,
    });

    return (
        <form id="personnel-form" className="flex flex-col gap-8" onSubmit={onSubmit}>
            <Card>
                <CardContent className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2 w-full items-center pt-6">
                        <h1 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                            Profile Picture
                        </h1>
                        <div className="w-48 aspect-square p-1 border-2 border-dashed rounded-full border-primary">
                            <ProfilePictureDropzone
                                onFile={(blob) => {
                                    pendingBlobRef.current = blob;
                                }}
                            />
                        </div>
                        <p className="text-[11px]">5mb is the maximum file size allowed.</p>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                        <h1 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                            Identity Details
                        </h1>
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

                    <Separator />

                    <div className="flex flex-col gap-4">
                        <h1 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                            Work Assignments
                        </h1>
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
                                        placeholder="e.g. University"
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
                                placeholder="https://facebook.com/..."
                                icon={<SiFacebook size={14} />}
                                iconPosition="left"
                            />
                            <FormTextField
                                name="socialMedia.twitter"
                                control={control}
                                label="Twitter / X"
                                type="url"
                                placeholder="https://x.com/..."
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
                                placeholder="https://linkedin.com/..."
                                icon={<Link size={14} />}
                                iconPosition="left"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button form="personnel-form" type="submit" size="xl">
                        {isPending ? 'Completing...' : 'Complete Profile'}
                        {isPending ? (
                            <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
                        ) : (
                            <HugeiconsIcon icon={ArrowRightIcon} />
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
