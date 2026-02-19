export type LlmProvider = "gemini" | "groq" | "none";

const KEYS = {
	geminiApiKey: "uplatko_gemini_api_key",
	groqApiKey: "uplatko_groq_api_key",
	provider: "uplatko_llm_provider",
} as const;

export function getGeminiApiKey(): string | null {
	return localStorage.getItem(KEYS.geminiApiKey);
}

export function setGeminiApiKey(key: string): void {
	localStorage.setItem(KEYS.geminiApiKey, key);
}

export function clearGeminiApiKey(): void {
	localStorage.removeItem(KEYS.geminiApiKey);
}

export function getGroqApiKey(): string | null {
	return localStorage.getItem(KEYS.groqApiKey);
}

export function setGroqApiKey(key: string): void {
	localStorage.setItem(KEYS.groqApiKey, key);
}

export function clearGroqApiKey(): void {
	localStorage.removeItem(KEYS.groqApiKey);
}

export function getLlmProvider(): LlmProvider {
	const stored = localStorage.getItem(KEYS.provider);
	if (stored === "gemini" || stored === "groq") return stored;
	return "none";
}

export function setLlmProvider(provider: LlmProvider): void {
	localStorage.setItem(KEYS.provider, provider);
}
