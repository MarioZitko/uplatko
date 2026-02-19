import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
	getGeminiApiKey,
	setGeminiApiKey,
	clearGeminiApiKey,
	getGroqApiKey,
	setGroqApiKey,
	clearGroqApiKey,
	getLlmProvider,
	setLlmProvider,
	type LlmProvider,
} from "@/lib/llmStorage";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface ApiKeySectionProps {
	id: string;
	label: string;
	placeholder: string;
	docsHref: string;
	docsLabel: string;
	existingKey: string | null;
	onSave: (key: string) => void;
	onClear: () => void;
}

function ApiKeySection({
	id,
	label,
	placeholder,
	docsHref,
	docsLabel,
	existingKey,
	onSave,
	onClear,
}: ApiKeySectionProps) {
	const [keyInput, setKeyInput] = useState("");
	const [saved, setSaved] = useState(false);

	function handleSave() {
		const trimmed = keyInput.trim();
		if (!trimmed) return;
		onSave(trimmed);
		setKeyInput("");
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	function handleClear() {
		onClear();
		setKeyInput("");
		setSaved(false);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<p className="text-sm font-medium">{label}</p>
				<a
					href={docsHref}
					target="_blank"
					rel="noreferrer"
					className="text-xs underline text-primary"
				>
					{docsLabel}
				</a>
			</div>

			{existingKey && (
				<div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
					<span className="text-muted-foreground">
						{existingKey.slice(0, 8)}••••••••
					</span>
					<Button variant="destructive" size="sm" onClick={handleClear}>
						Ukloni
					</Button>
				</div>
			)}

			<div className="flex gap-2">
				<Input
					id={id}
					type="password"
					placeholder={placeholder}
					value={keyInput}
					onChange={(e) => setKeyInput(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSave()}
				/>
				<Button onClick={handleSave} disabled={!keyInput.trim()} size="sm">
					{saved ? "✓" : existingKey ? "Zamijeni" : "Spremi"}
				</Button>
			</div>
		</div>
	);
}

export default function LlmSettingsDialog({ open, onOpenChange }: Props) {
	const [provider, setProvider] = useState<LlmProvider>(() => getLlmProvider());
	// Keys are state so clearing/saving triggers immediate re-render
	const [geminiKey, setGeminiKeyState] = useState<string | null>(() =>
		getGeminiApiKey(),
	);
	const [groqKey, setGroqKeyState] = useState<string | null>(() =>
		getGroqApiKey(),
	);

	function handleSaveGemini(key: string) {
		setGeminiApiKey(key);
		setGeminiKeyState(key);
	}

	function handleClearGemini() {
		clearGeminiApiKey();
		setGeminiKeyState(null);
		// If active provider was gemini, reset to none
		if (provider === "gemini") {
			setProvider("none");
			setLlmProvider("none");
		}
	}

	function handleSaveGroq(key: string) {
		setGroqApiKey(key);
		setGroqKeyState(key);
	}

	function handleClearGroq() {
		clearGroqApiKey();
		setGroqKeyState(null);
		if (provider === "groq") {
			setProvider("none");
			setLlmProvider("none");
		}
	}

	function handleProviderChange(value: string) {
		const p = value as LlmProvider;
		setProvider(p);
		setLlmProvider(p);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>AI postavke čitanja</DialogTitle>
					<DialogDescription>
						Dodaj API ključeve za AI-potpomognuto čitanje računa. Ključevi se
						spremaju lokalno i nikad ne napuštaju tvoj preglednik osim direktno
						prema odabranom servisu.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 pt-2">
					<ApiKeySection
						id="gemini-key"
						label="Google Gemini"
						placeholder="AIza..."
						docsHref="https://aistudio.google.com/app/apikey"
						docsLabel="Dobij besplatni ključ"
						existingKey={geminiKey}
						onSave={handleSaveGemini}
						onClear={handleClearGemini}
					/>

					<Separator />

					<ApiKeySection
						id="groq-key"
						label="Groq (Llama 3.3 70b)"
						placeholder="gsk_..."
						docsHref="https://console.groq.com/keys"
						docsLabel="Dobij besplatni ključ"
						existingKey={groqKey}
						onSave={handleSaveGroq}
						onClear={handleClearGroq}
					/>

					<Separator />

					<div className="space-y-2">
						<Label>Aktivni AI servis</Label>
						<RadioGroup value={provider} onValueChange={handleProviderChange}>
							<div className="flex items-center gap-2">
								<RadioGroupItem value="none" id="provider-none" />
								<Label htmlFor="provider-none" className="font-normal">
									Isključeno (samo regex)
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<RadioGroupItem
									value="gemini"
									id="provider-gemini"
									disabled={!geminiKey}
								/>
								<Label
									htmlFor="provider-gemini"
									className={`font-normal ${!geminiKey ? "text-muted-foreground" : ""}`}
								>
									Gemini{!geminiKey && " (dodaj ključ)"}
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<RadioGroupItem
									value="groq"
									id="provider-groq"
									disabled={!groqKey}
								/>
								<Label
									htmlFor="provider-groq"
									className={`font-normal ${!groqKey ? "text-muted-foreground" : ""}`}
								>
									Groq{!groqKey && " (dodaj ključ)"}
								</Label>
							</div>
						</RadioGroup>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
