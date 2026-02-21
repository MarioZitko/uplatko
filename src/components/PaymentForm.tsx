import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	PURPOSE_CODES,
	type Hub3Data,
	type ParsedPdfFields,
	type PurposeCode,
} from "@/types/hub3";

const formSchema = z.object({
	payerName: z.string().max(30),
	payerAddress: z.string().max(27),
	payerCity: z.string().max(27),
	recipientName: z.string().min(1, "Obavezno polje").max(30),
	recipientAddress: z.string().max(27),
	recipientCity: z.string().max(27),
	iban: z
		.string()
		.regex(/^HR\d{19}$/, "Neispravan IBAN format (HR + 19 znamenki)"),
	amount: z.number().positive("Iznos mora biti veći od 0"),
	model: z.string().min(1, "Obavezno polje").max(5),
	referenceNumber: z.string().min(1, "Obavezno polje"),
	purposeCode: z.enum(
		Object.keys(PURPOSE_CODES) as [PurposeCode, ...PurposeCode[]],
	),
	description: z.string().min(1, "Obavezno polje").max(35),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentFormProps {
	initialValues: ParsedPdfFields;
	onSubmit: (data: Hub3Data) => void;
	onBack: () => void;
	onReset: () => void;
}

export default function PaymentForm({
	initialValues,
	onSubmit,
	onBack,
	onReset,
}: PaymentFormProps) {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			payerName: initialValues.payerName ?? "",
			payerAddress: initialValues.payerAddress ?? "",
			payerCity: initialValues.payerCity ?? "",
			recipientName: initialValues.recipientName ?? "",
			recipientAddress: initialValues.recipientAddress ?? "",
			recipientCity: initialValues.recipientCity ?? "",
			iban: initialValues.iban ?? "",
			amount: initialValues.amount ?? 0,
			model: initialValues.model ?? "HR68",
			referenceNumber: initialValues.referenceNumber ?? "",
			purposeCode: initialValues.purposeCode ?? "OTHR",
			description: initialValues.description ?? "",
		},
	});

	function handleSubmit(values: FormValues) {
		onSubmit({ ...values, currency: "EUR" });
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Platitelj</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="payerName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ime i prezime / naziv</FormLabel>
									<FormControl>
										<Input {...field} maxLength={30} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="payerAddress"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Adresa</FormLabel>
									<FormControl>
										<Input {...field} maxLength={27} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="payerCity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Grad</FormLabel>
									<FormControl>
										<Input {...field} maxLength={27} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Primatelj</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="recipientName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ime i prezime / naziv</FormLabel>
									<FormControl>
										<Input {...field} maxLength={30} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="recipientAddress"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Adresa</FormLabel>
									<FormControl>
										<Input {...field} maxLength={27} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="recipientCity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Grad</FormLabel>
									<FormControl>
										<Input {...field} maxLength={27} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="iban"
							render={({ field }) => (
								<FormItem>
									<FormLabel>IBAN</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="HR..."
											maxLength={21}
											onChange={(e) =>
												field.onChange(e.target.value.toUpperCase())
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Detalji plaćanja</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Iznos (EUR)</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0.01"
											step="0.01"
											value={field.value}
											onChange={(e) =>
												field.onChange(parseFloat(e.target.value))
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="model"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Model</FormLabel>
										<FormControl>
											<Input
												{...field}
												maxLength={5}
												onChange={(e) =>
													field.onChange(e.target.value.toUpperCase())
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="referenceNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Poziv na broj</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="purposeCode"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Šifra namjene</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.entries(PURPOSE_CODES).map(([code, label]) => (
												<SelectItem key={code} value={code}>
													{code} — {label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Opis plaćanja</FormLabel>
									<FormControl>
										<Input {...field} maxLength={35} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				<Separator />

				<div className="flex justify-between">
					<Button type="button" variant="outline" onClick={onBack}>
						Natrag
					</Button>
					<Button type="button" variant="outline" onClick={onReset}>
						Novi PDF
					</Button>
					<Button type="submit">Generiraj barkod</Button>
				</div>
			</form>
		</Form>
	);
}
