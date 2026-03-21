import { FileUp, ClipboardCheck, ScanBarcode, Download } from "lucide-react";

const steps = [
	{
		icon: FileUp,
		title: "Učitajte PDF račun ili XML e-račun",
		description:
			"Povucite PDF ili XML e-račun (UBL format, Fiskalizacija 2.0) ili kliknite za odabir. Podaci o primatelju, IBAN-u i iznosu automatski se izvlače.",
	},
	{
		icon: ClipboardCheck,
		title: "Provjerite podatke",
		description:
			"Pregledajte predpopunjena polja i ispravite ih po potrebi. Odaberite model plaćanja (najčešće HR68) i poziv na broj.",
	},
	{
		icon: ScanBarcode,
		title: "Generirajte i pozicionirajte barkod",
		description:
			'Kliknite "Generiraj barkod" i povucite PDF417 barkod na željenu poziciju unutar dokumenta. Možete ga i mijenjati veličinom.',
	},
	{
		icon: Download,
		title: "Preuzmite gotov PDF",
		description:
			"Preuzmite PDF s ugrađenim barkodom ili samo barkod kao PNG. Skenirajte u m-zabi, PBZ365 ili Erste Netbanking — plaćanje za 10 sekundi.",
	},
];

export default function HowItWorks() {
	return (
		<section className="mt-8 space-y-4">
			<h2 className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">
				Kako funkcionira
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{steps.map((step, i) => (
					<div key={i} className="flex gap-3 p-4 rounded-lg border bg-card">
						<div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
							<step.icon className="h-4 w-4 text-primary" />
						</div>
						<div>
							<p className="text-sm font-medium mb-0.5">
								{i + 1}. {step.title}
							</p>
							<p className="text-xs text-muted-foreground leading-relaxed">
								{step.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
