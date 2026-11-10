import type {
  DeskCheckinRecord,
  DeskCheckinResult,
  DeskDirection,
  DeskStudent,
  LastTapResult,
  ScanState,
} from "../types";

type AppliedTapResult = DeskCheckinResult & { record: DeskCheckinRecord; student: DeskStudent };

export interface TapOutcome {
  scan: ScanState;
  lastResult: LastTapResult;
}

type ReplayVerdict = "synced" | "rejected" | "retry";

/** A write that succeeded and returned both the record and the student. */
export function isAppliedTap(result: DeskCheckinResult): result is AppliedTapResult {
  return Boolean(result.success && result.record && result.student);
}

function isRejectedTap(result: DeskCheckinResult) {
  return Boolean(result.alreadyInside || result.noActiveVisit);
}

/** Applied taps that belong to the event currently on screen. */
export function isAppliedForEvent(
  result: DeskCheckinResult,
  eventId: string,
): result is AppliedTapResult {
  return isAppliedTap(result) && result.record.event_id === eventId;
}

function buildSuccessOutcome(
  result: AppliedTapResult,
  identifier: string,
  direction: DeskDirection,
): TapOutcome {
  const { record, student, message } = result;
  return {
    scan: { kind: "success", message, direction },
    lastResult: {
      student,
      identifier,
      message,
      tone: "success",
      at: (direction === "in" ? record.check_in : record.check_out) ?? record.created_at,
    },
  };
}

function buildFailureOutcome(result: DeskCheckinResult, identifier: string): TapOutcome {
  const tone = isRejectedTap(result) ? "warning" : "error";
  const { message } = result;
  return {
    scan: { kind: tone, message },
    lastResult: {
      student: result.student ?? null,
      identifier,
      message,
      tone,
      at: new Date().toISOString(),
    },
  };
}

/** What the gate shows for one server answer: success, duplicate or error. */
export function buildTapOutcome(
  result: DeskCheckinResult,
  identifier: string,
  direction: DeskDirection,
): TapOutcome {
  return isAppliedTap(result)
    ? buildSuccessOutcome(result, identifier, direction)
    : buildFailureOutcome(result, identifier);
}

/** How a replayed tap should be treated: drop it, drop it as hopeless, or keep it. */
export function classifyReplay(result: DeskCheckinResult): ReplayVerdict {
  if (result.success) return "synced";
  return isRejectedTap(result) ? "rejected" : "retry";
}
