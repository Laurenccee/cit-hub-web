'use client';

import { useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PersonnelCard from '../PersonnelCard';
import { CardData, Rank, Designation } from '../../types';

interface ReviewStepProps {
  control: ReturnType<typeof import('react-hook-form').useForm<any>>['control'];
  profilePreviewUrl: string;
  ranks: Rank[];
  designations: Designation[];
}

export function ReviewStep({
  control,
  profilePreviewUrl,
  ranks,
  designations,
}: ReviewStepProps) {
  const watchedValues = useWatch({ control });

  const previewData: CardData = {
    profile_picture_url: profilePreviewUrl || watchedValues?.profilePictureUrl || '',
    first_name: watchedValues?.firstName?.trim() || '',
    last_name: watchedValues?.lastName?.trim() || '',
    office: watchedValues?.office?.trim() || '',
    rank_id: watchedValues?.rankId || null,
    designation_id: watchedValues?.designationId ?? null,
    contact_number: watchedValues?.contactNumber?.trim() || '',
    education: watchedValues?.education?.length ? watchedValues.education : [],
  };

  const hasRequiredFields =
    previewData.first_name &&
    previewData.last_name &&
    previewData.office &&
    previewData.rank_id;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Review & Confirm</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Please review your information before submitting. Go back to any step to make changes.
        </p>
      </div>

      {!hasRequiredFields ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-yellow-800">Complete Required Fields</h3>
                  <p className="text-sm text-yellow-700 mt-0.5">
                    Fill in all required fields (Name, Office, Rank) before reviewing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="py-3">
              <CardTitle className="text-primary flex items-center gap-2 text-base">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Preview of Your Personnel Card
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="bg-muted/30 rounded-lg border w-full p-4 flex items-start justify-center">
                <div className="w-full max-w-65">
                  <PersonnelCard data={previewData} ranks={ranks} designations={designations} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                <p><span className="font-medium">Employee ID:</span> {watchedValues?.employeeId || '—'}</p>
                <p><span className="font-medium">Name:</span> {previewData.first_name} {previewData.last_name}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">Work Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                <p><span className="font-medium">Rank:</span> {ranks.find(r => r.id === previewData.rank_id)?.name || '—'}</p>
                <p><span className="font-medium">Designation:</span> {designations.find(d => d.id === previewData.designation_id)?.name || '—'}</p>
                <p><span className="font-medium">Office:</span> {previewData.office || '—'}</p>
                <p><span className="font-medium">Contact:</span> {previewData.contact_number || '—'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {previewData.education.length > 0 ? (
                  previewData.education.map((edu, i) => (
                    <p key={i} className="truncate">
                      {edu.degree}{edu.major && ` · ${edu.major}`} {edu.onGoing ? '(Ongoing)' : edu.yearGraduated ? `(${edu.yearGraduated})` : ''}
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground">No education entries</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}