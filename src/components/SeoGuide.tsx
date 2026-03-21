export default function SeoGuide() {
	return (
		<section className="mt-8 text-sm leading-relaxed text-foreground">
			<details className="group rounded-lg border bg-card">
				<summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-semibold text-sm select-none list-none">
					<span>Vodič: Kako generirati HUB-3 bar kod</span>
					<svg
						className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</summary>

				<div className="px-5 pb-6 space-y-6 border-t mt-0 pt-5">
					<p className="text-muted-foreground">
						Sve što trebate znati o HUB-3 uplatnicama, PDF417 standardu i modelu
						plaćanja u Hrvatskoj – na jednom mjestu.
					</p>

					<div>
						<h2 className="text-base font-semibold mb-2">
							Što je HUB-3 uplatnica?
						</h2>
						<p>
							HUB-3 je standardizirani format uplatnice koji koriste sve
							hrvatske banke i platni servisi. Definirala ga je Hrvatska udruga
							banaka (HUB) kako bi se ujednačio proces plaćanja između građana,
							poduzetnika i institucija. Svaka uplatnica sadrži podatke o
							platitelju, primatelju, iznosu, IBAN-u i poziv na broj – sve
							kodirano u PDF417 barkod koji bankovne aplikacije poput mZabe,
							PBZ365 ili Erste Netbanking mogu odmah skenirati.
						</p>
					</div>

					<div>
						<h2 className="text-base font-semibold mb-2">
							Uplatnica PDF417 standard 2026 – Zašto je barkod važan?
						</h2>
						<p>
							PDF417 je dvodimenzionalni barkod koji može pohraniti do 1,8 KB
							teksta – savršeno za strukturirane podatke uplatnice. U Hrvatskoj
							je od 2019. obavezan standard za sve ispisane uplatnice. Bez
							ispravno generiranog PDF417 barkoda, vaš račun nije "digitalno
							čitljiv" i svaki kupac mora ručno unositi podatke.
						</p>
						<p className="mt-2">
							Uplatko generira barkod koji je u potpunosti kompatibilan s HUB-3A
							specifikacijom, radi isključivo u pregledniku i vaši podaci nikada
							ne napuštaju vaše računalo.
						</p>
					</div>

					<div>
						<h2 className="text-base font-semibold mb-2">
							Model i poziv na broj – objašnjenje
						</h2>
						<p className="mb-4">
							Model definira algoritam provjere ispravnosti poziva na broj.
							Najčešći modeli u svakodnevnoj upotrebi:
						</p>

						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-left text-xs">
								<thead>
									<tr className="border-b">
										<th className="py-2 pr-4 font-semibold">Model</th>
										<th className="py-2 pr-4 font-semibold">
											Algoritam provjere
										</th>
										<th className="py-2 font-semibold">Tipična primjena</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									<tr>
										<td className="py-2 pr-4 font-mono">HR00</td>
										<td className="py-2 pr-4">Bez kontrole</td>
										<td className="py-2">
											Fizičke osobe, jednokratna plaćanja
										</td>
									</tr>
									<tr>
										<td className="py-2 pr-4 font-mono">HR01</td>
										<td className="py-2 pr-4">Modul 10 (ISO 7064)</td>
										<td className="py-2">Maloprodaja i telekomunikacije</td>
									</tr>
									<tr>
										<td className="py-2 pr-4 font-mono">HR02</td>
										<td className="py-2 pr-4">Modul 11</td>
										<td className="py-2">Komunalna poduzeća (HEP, voda)</td>
									</tr>
									<tr>
										<td className="py-2 pr-4 font-mono">HR04</td>
										<td className="py-2 pr-4">
											Modul 11, 2 kontrolne znamenke
										</td>
										<td className="py-2">Državne institucije i agencije</td>
									</tr>
									<tr>
										<td className="py-2 pr-4 font-mono">HR10</td>
										<td className="py-2 pr-4">Porezni identifikator</td>
										<td className="py-2">
											Plaćanje poreza Poreznoj upravi (OIB)
										</td>
									</tr>
									<tr className="bg-primary/5">
										<td className="py-2 pr-4 font-mono font-semibold">HR68</td>
										<td className="py-2 pr-4">SEPA referentni broj</td>
										<td className="py-2">
											<strong>Najčešći za fakture i obrtničke račune</strong> –
											SEPA standard, prihvaćen u cijeloj EU
										</td>
									</tr>
									<tr>
										<td className="py-2 pr-4 font-mono">HR99</td>
										<td className="py-2 pr-4">Bez modela</td>
										<td className="py-2">Kada nema poziva na broj</td>
									</tr>
								</tbody>
							</table>
						</div>

						<p className="mt-4">
							<strong>Savjet:</strong> Ako ste slobodnjak ili obrtnik i izdajete
							račune, gotovo uvijek ćete koristiti <strong>HR68</strong> s
							brojem vašeg računa kao pozivom na broj. To je SEPA kompatibilan
							standard koji banke automatski obrađuju.
						</p>
					</div>

					<div>
						<h2 className="text-base font-semibold mb-2">
							Česte greške pri generiranju HUB-3 barkoda
						</h2>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>
								<strong>Netočan IBAN format</strong> – HR + točno 19 znamenki
								(21 znakova ukupno). Uplatko automatski provjerava format.
							</li>
							<li>
								<strong>Predugačak opis plaćanja</strong> – maksimalno 35
								znakova prema HUB-3 standardu. Duži opisi uzrokuju grešku pri
								skeniranju.
							</li>
							<li>
								<strong>Iznos s krivim formatom</strong> – decimalna točka, ne
								zarez (npr. 150.00).
							</li>
							<li>
								<strong>Krivi model uz poziv na broj</strong> – HR68 ne
								zahtijeva kontrolnu znamenku; HR02 zahtijeva provjeru modulom
								11.
							</li>
						</ul>
					</div>

					<div>
						<h2 className="text-base font-semibold mb-2">
							Privatnost – Vaši podaci ostaju kod vas
						</h2>
						<p>
							Cijeli proces – od čitanja PDF-a do generiranja barkoda – odvija
							se isključivo u vašem pregledniku. Vaši poslovni podaci, iznosi i
							IBAN-ovi nikada ne napuštaju vaše računalo.
						</p>
					</div>

					<div className="border-t pt-4">
						<p className="text-xs text-muted-foreground">
							<strong>Odricanje od odgovornosti:</strong> Uplatko nije
							financijska institucija niti pružatelj platnih usluga. Uvijek
							provjerite točnost podataka prije plaćanja. Koristite na vlastitu
							odgovornost.
						</p>
					</div>
				</div>
			</details>
		</section>
	);
}
