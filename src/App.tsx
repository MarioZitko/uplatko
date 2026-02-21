import { useState } from "react";
import { Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import PdfUploader from "@/components/PdfUploader";
import PaymentForm from "@/components/PaymentForm";
import PdfCanvas from "@/components/PdfCanvas";
import LlmSettingsDialog from "@/components/LlmSettingsDialog";
import type { ParsedPdfFields, Hub3Data } from "@/types/hub3";

type Step = "upload" | "form" | "preview";

export default function App() {
	const [step, setStep] = useState<Step>("upload");
	const [parsedFields, setParsedFields] = useState<ParsedPdfFields>({});
	const [hub3Data, setHub3Data] = useState<Hub3Data | null>(null);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const { theme, setTheme } = useTheme();

	function handlePdfParsed(fields: ParsedPdfFields, file: File) {
		setParsedFields(fields);
		setUploadedFile(file);
		setStep("form");
	}

	function handleFormSubmit(data: Hub3Data) {
		setHub3Data(data);
		setStep("preview");
	}

	function handleBack() {
		setStep((prev) => (prev === "preview" ? "form" : "upload"));
	}

	function toggleTheme() {
		setTheme(theme === "dark" ? "light" : "dark");
	}

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="max-w-3xl mx-auto px-4 py-10">
				<div className="flex items-start justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold mb-2">Uplatko</h1>
						<p className="text-muted-foreground">Generator HUB3 uplatnica</p>
					</div>
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleTheme}
							aria-label="Promijeni temu"
						>
							{theme === "dark" ? (
								<Sun className="h-5 w-5" />
							) : (
								<Moon className="h-5 w-5" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setSettingsOpen(true)}
							aria-label="Postavke"
						>
							<Settings className="h-5 w-5" />
						</Button>
					</div>
				</div>

				{step === "upload" && <PdfUploader onParsed={handlePdfParsed} />}
				{step === "form" && (
					<PaymentForm
						initialValues={parsedFields}
						onSubmit={handleFormSubmit}
						onBack={handleBack}
					/>
				)}
				{step === "preview" && hub3Data && uploadedFile && (
					<PdfCanvas
						hub3Data={hub3Data}
						pdfFile={uploadedFile}
						onBack={handleBack}
					/>
				)}

				<LlmSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
			</div>
			<Toaster richColors closeButton />
		</main>
	);
}
