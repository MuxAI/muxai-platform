import masterPromptsJson from './personaPrompts.json';

export const MASTER_PERSONA_PROMPTS: Record<string, string> = masterPromptsJson;

export function getMasterPersonaPrompt(personaId?: string | null): string {
  if (!personaId) {
    return MASTER_PERSONA_PROMPTS['Sera16'] || '';
  }
  if (MASTER_PERSONA_PROMPTS[personaId]) {
    return MASTER_PERSONA_PROMPTS[personaId];
  }
  // Try case variations or prefixes
  const foundKey = Object.keys(MASTER_PERSONA_PROMPTS).find(
    (k) => k.toLowerCase() === personaId.toLowerCase()
  );
  if (foundKey) {
    return MASTER_PERSONA_PROMPTS[foundKey];
  }
  return MASTER_PERSONA_PROMPTS['Sera16'] || '';
}
