import { revalidatePath } from 'next/cache';
import type { PostgrestError } from '@supabase/supabase-js';
import type * as z from 'zod/mini';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/action';

/** Everything an `execute` callback needs to perform a write. */
export interface MutationContext {
    supabase: Awaited<ReturnType<typeof createClient>>;
    userId: string;
}

/** A path to revalidate after a write, optionally scoped to a page or layout. */
export type RevalidateTarget = string | { path: string; type?: 'page' | 'layout' };

export interface RunMutationOptions<TSchema extends z.ZodMiniType, TExtra extends object = Record<never, never>> {
    /** Raw, untrusted values from the client. */
    values: unknown;
    /** Schema used to re-validate them on the server. */
    schema: TSchema;
    /** Authorization gate. Return the acting user, or null to reject. */
    authorize: () => Promise<{ user: { id: string } } | null>;
    /**
     * Performs the write. Return the Supabase error (or null) and any extra
     * payload to merge into a successful result (e.g. `{ eventId }`).
     */
    execute: (
        data: z.infer<TSchema>,
        ctx: MutationContext,
    ) => PromiseLike<{ error: PostgrestError | null; extra?: TExtra }>;
    /** Paths to revalidate after a successful write. */
    revalidate?: RevalidateTarget[];
    successMessage?: string;
    unauthorizedMessage?: string;
    invalidMessage?: string;
    failureMessage?: string;
    /** Replaces `failureMessage` when a unique constraint (23505) is violated. */
    conflictMessage?: string;
}

const UNIQUE_VIOLATION_CODE = '23505';

function collectFieldErrors(issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of issues) {
        const path = issue.path.join('.');
        (fieldErrors[path] ??= []).push(issue.message);
    }
    return fieldErrors;
}

function revalidateTargets(targets: RevalidateTarget[]) {
    for (const target of targets) {
        if (typeof target === 'string') revalidatePath(target);
        else revalidatePath(target.path, target.type);
    }
}

function mapMutationError(error: unknown, failureMessage: string, conflictMessage?: string) {
    if (conflictMessage && (error as { code?: string } | null)?.code === UNIQUE_VIOLATION_CODE) {
        return conflictMessage;
    }
    const message = (error as { message?: unknown } | null)?.message;
    return typeof message === 'string' && message ? message : failureMessage;
}

function resolveMessages(options: Pick<RunMutationOptions<z.ZodMiniType>, 'unauthorizedMessage' | 'invalidMessage' | 'failureMessage'>) {
    const {
        unauthorizedMessage = 'Unauthorized.',
        invalidMessage = 'Invalid form data.',
        failureMessage = 'An unexpected database error occurred.',
    } = options;
    return { unauthorizedMessage, invalidMessage, failureMessage };
}

/**
 * The shared pipeline every mutating server action runs through:
 * authorize → re-validate on the server → write → revalidate → map errors.
 *
 * Server actions must never trust client data, so `schema` is parsed again here
 * even though the form already validated with `zodResolver`.
 */
export async function runMutation<TSchema extends z.ZodMiniType, TExtra extends object = Record<never, never>>(
    options: RunMutationOptions<TSchema, TExtra>,
): Promise<ActionResult<TExtra>> {
    const { values, schema, authorize, execute, revalidate = [], successMessage, conflictMessage } = options;
    const { unauthorizedMessage, invalidMessage, failureMessage } = resolveMessages(options);

    const authorized = await authorize();
    if (!authorized) return { success: false, message: unauthorizedMessage };

    const validation = schema.safeParse(values);
    if (!validation.success) {
        const fieldErrors = collectFieldErrors(validation.error.issues);
        return { success: false, message: invalidMessage, fieldErrors };
    }

    const supabase = await createClient();

    try {
        const { error, extra } = await execute(validation.data, {
            supabase,
            userId: authorized.user.id,
        });
        if (error) throw error;

        revalidateTargets(revalidate);

        if (extra !== undefined) {
            return { success: true, message: successMessage, ...extra };
        }
        return { success: true, message: successMessage };
    } catch (error) {
        console.error('Mutation error:', error);
        return { success: false, message: mapMutationError(error, failureMessage, conflictMessage) };
    }
}
