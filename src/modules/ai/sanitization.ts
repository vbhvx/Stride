/**
 * Sanitizes untrusted user inputs before inclusion in AI context prompts.
 * Prevents prompt injection, system boundary overrides, and exfiltration attempts.
 */
export function sanitizePromptInput(input: string | null | undefined): string {
  if (!input) return "";

  // 1. Remove dangerous prompt hijack keywords and delimiter manipulations
  let sanitized = input
    .replace(/(?:system\s*prompt|system\s*instruction|ignore\s+all\s+previous\s+instructions)/gi, "[REDACTED_SYSTEM_DIRECTIVE]")
    .replace(/(?:<\|im_start\|>|<\|im_end\|>|```markdown\s*system|\[SYSTEM\])/gi, "[REDACTED_DELIMITER]")
    .replace(/(?:delete\s+all|reveal\s+secret|bypass\s+permission|exfiltrate)/gi, "[REDACTED_SENSITIVE_PHRASE]");

  // 2. Limit input length to prevent token exhaustion attacks
  if (sanitized.length > 4000) {
    sanitized = sanitized.substring(0, 4000) + "... [truncated for data minimization]";
  }

  return sanitized.trim();
}

/**
 * Standard AI disclaimer to ensure no output is confused with authoritative managerial judgement.
 */
export const AI_ADVISORY_DISCLAIMER =
  "Advisory notice: This synthesis is an AI-assisted draft grounded in authorized work records. It is not an automated performance rating, promotion determination, or employment decision. Final assessment remains the sole responsibility of accountable human managers.";

