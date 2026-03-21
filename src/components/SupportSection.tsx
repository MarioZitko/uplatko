import { ExternalLink, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const REVOLUT_URL = "https://revolut.me/mariougdd";
const BUY_ME_COFFEE_URL = "https://buymeacoffee.com/mariozitko";
const PERSONAL_SITE_URL = "https://mariozitko.github.io/";

export default function SupportSection() {
	return (
		<section className="mt-4 space-y-3">
			{/* Support */}
			<div className="rounded-lg border border-amber-200/70 bg-amber-50/60 dark:border-amber-800/30 dark:bg-amber-900/10 p-5">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<p className="font-semibold text-sm mb-0.5">Sviđa vam se alat?</p>
						<p className="text-xs text-muted-foreground">
							Uplatko je besplatan i bez oglasa. Ako vam štedi vremena, možete
							me podržati.
						</p>
					</div>
					<div className="flex gap-2 shrink-0">
						<Button variant="outline" size="sm" asChild>
							<a
								href={REVOLUT_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1.5"
							>
								<CreditCard className="h-3.5 w-3.5" />
								Revolut
							</a>
						</Button>
						<Button variant="outline" size="sm" asChild>
							<a
								href={BUY_ME_COFFEE_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1.5"
							>
								☕ Buy Me a Coffee
							</a>
						</Button>
					</div>
				</div>
			</div>

			{/* About developer */}
			<div className="rounded-lg border border-blue-200/70 bg-blue-50/60 dark:border-blue-800/30 dark:bg-blue-900/10 p-5">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<p className="font-semibold text-sm mb-0.5">
							Trebate prilagođeno rješenje?
						</p>
						<p className="text-xs text-muted-foreground">
							Razvijam web aplikacije i automacije za male tvrtke i obrtnike.
							Pogledajte moje projekte ili me kontaktirajte.
						</p>
					</div>
					<Button variant="secondary" size="sm" asChild>
						<a
							href={PERSONAL_SITE_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 shrink-0"
						>
							mariozitko.github.io
							<ExternalLink className="h-3 w-3" />
						</a>
					</Button>
				</div>
			</div>
		</section>
	);
}

// Compact version for the preview/download step
export function SupportNudge() {
	return (
		<div className="rounded-lg border border-amber-200/70 bg-amber-50/60 dark:border-amber-800/30 dark:bg-amber-900/10 px-5 py-3.5">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<p className="text-xs text-muted-foreground">
					Sviđa vam se alat? Časti me kavom!{" "}
				</p>
				<div className="flex gap-2 shrink-0">
					<Button variant="outline" size="sm" asChild>
						<a
							href={REVOLUT_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 text-xs"
						>
							<CreditCard className="h-3.5 w-3.5" />
							Revolut
						</a>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<a
							href={BUY_ME_COFFEE_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 text-xs"
						>
							☕ Kava
						</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
