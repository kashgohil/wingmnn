'use client';

import Divider from '@/components/divider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Wingmnn from '@/icons/wingmnn';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
	username: z
		.string()
		.min(2, {
			message: 'username must be at least 2 characters.',
		})
		.max(60, {
			message: 'username cannot be longer than 60 characters.',
		}),
	password: z.string().nonempty(),
});

export default function Login() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	});

	function submit(values: z.infer<typeof formSchema>) {
		console.log(values);
	}

	return (
		<div className="flex h-screen w-screen">
			<div className="w-1/2 bg-card flex flex-col items-center justify-center">
				<Wingmnn
					width={320}
					height={320}
					fill="white"
					className="animate-spin-slow"
				/>
				<div className="text-6xl">Wingmnn</div>
				<div className="text-2xl mt-4">Your partner-in-crime</div>
			</div>
			<div className="w-1/2 flex items-center justify-center bg-white">
				<Card className="w-1/2 py-8 px-4">
					<CardHeader className="text-center">
						<CardTitle>Howdy Partner</CardTitle>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(submit)}
								className="space-y-4"
							>
								<FormField
									name="username"
									control={form.control}
									render={({ field }) => (
										<FormItem className="space-y-1">
											<FormControl>
												<Input
													placeholder="Username"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									name="password"
									control={form.control}
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									variant="secondary"
									className="w-full !mt-4"
								>
									Login
								</Button>
							</form>
						</Form>
						<Divider
							className="my-8"
							color="var(--secondary)"
						>
							OR
						</Divider>
						<Button
							className="w-full"
							variant="secondary"
						>
							Login with Google
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
