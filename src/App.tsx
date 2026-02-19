import { useState } from "react";
import PdfUploader from "@/components/PdfUploader";
import PaymentForm from "@/components/PaymentForm";
import PdfCanvas from "@/components/PdfCanvas";
import type { ParsedPdfFields, Hub3Data } from "@/types/hub3";

type Step = "upload" | "form" | "preview";

export default function App() {
	const [step, setStep] = useState<Step>("upload");
	const [parsedFields, setParsedFields] = useState<ParsedPdfFields>({});
	const [hub3Data, setHub3Data] = useState<Hub3Data | null>(null);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="max-w-3xl mx-auto px-4 py-10">
				<h1 className="text-3xl font-bold mb-2">Uplatko</h1>
				<p className="text-muted-foreground mb-8">Generator HUB3 uplatnica</p>

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
			</div>
		</main>
	);
}
