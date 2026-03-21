import { useState } from "react";
import { Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import PdfUploader from "@/components/PdfUploader";
import PaymentForm from "@/components/PaymentForm";
import PdfCanvas from "@/components/PdfCanvas";
import BarcodeOnlyStep from "@/components/BarcodeOnlyStep";
import LlmSettingsDialog from "@/components/LlmSettingsDialog";
import HowItWorks from "@/components/HowItWorks";
import SupportSection from "@/components/SupportSection";
import SeoGuide from "@/components/SeoGuide";
import type { ParsedPdfFields, Hub3Data } from "@/types/hub3";

// ============================= | Types | =============================

type Step = "upload" | "form" | "preview";
type SourceType = "pdf" | "xml" | "manual";

// ============================= | Component | =============================

export default function App() {
	// ============================= | State | =============================

	const [step, setStep] = useState<Step>("upload");
	const [sourceType, setSourceType] = useState<SourceType>("manual");
	const [parsedFields, setParsedFields] = useState<ParsedPdfFields>({});
	const [hub3Data, setHub3Data] = useState<Hub3Data | null>(null);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const { resolvedTheme, setTheme } = useTheme();

	// ============================= | Handlers | =============================

	function handlePdfParsed(fields: ParsedPdfFields, file: File) {
		setParsedFields(fields);
		setUploadedFile(file);
		setSourceType("pdf");
		setStep("form");
	}

	function handleXmlParsed(fields: ParsedPdfFields) {
		setParsedFields(fields);
		setUploadedFile(null);
		setSourceType("xml");
		setStep("form");
	}

	function handleManual() {
		setParsedFields({});
		setUploadedFile(null);
		setSourceType("manual");
		setStep("form");
	}

	function handleFormSubmit(data: Hub3Data) {
		setHub3Data(data);
		setStep("preview");
	}

	function handleBack() {
		setStep((prev) => (prev === "preview" ? "form" : "upload"));
	}

	function handleReset() {
		setParsedFields({});
		setHub3Data(null);
		setUploadedFile(null);
		setSourceType("manual");
		setStep("upload");
	}

	function toggleTheme() {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	}

	// ============================= | Render | =============================

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="max-w-3xl mx-auto px-4 py-10">
				<div className="flex items-start justify-between mb-8">
					<div>
						<button
							onClick={handleReset}
							className="text-left group cursor-pointer"
							aria-label="Idi na početak"
						>
							<h1 className="text-3xl font-bold mb-2 group-hover:opacity-75 transition-opacity">
								Uplatko
							</h1>
						</button>
						<p className="text-muted-foreground">
							Generiraj barkod za plaćanje iz PDF-a ili XML e-računa
						</p>
					</div>
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleTheme}
							aria-label="Promijeni temu"
						>
							{resolvedTheme === "dark" ? (
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

				{step === "upload" && (
					<>
						<PdfUploader
							onPdfParsed={handlePdfParsed}
							onXmlParsed={handleXmlParsed}
							onManual={handleManual}
						/>
						<HowItWorks />
						<SupportSection />
						<SeoGuide />
					</>
				)}

				{step === "form" && (
					<PaymentForm
						initialValues={parsedFields}
						onSubmit={handleFormSubmit}
						onBack={handleBack}
						onReset={handleReset}
					/>
				)}

				{step === "preview" && hub3Data && sourceType === "pdf" && uploadedFile && (
					<PdfCanvas
						hub3Data={hub3Data}
						pdfFile={uploadedFile}
						onBack={handleBack}
						onReset={handleReset}
					/>
				)}

				{step === "preview" && hub3Data && sourceType !== "pdf" && (
					<BarcodeOnlyStep
						hub3Data={hub3Data}
						sourceType={sourceType === "xml" ? "xml" : "manual"}
						onBack={handleBack}
						onReset={handleReset}
					/>
				)}

				<LlmSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
			</div>
			<Toaster richColors closeButton />
		</main>
	);
}
