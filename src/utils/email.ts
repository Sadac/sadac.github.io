interface EmailData {
	name: string
	email: string
	message: string
}

export async function sendContactEmail(data: EmailData): Promise<boolean> {
	try {
		const lambdaEndpoint = 'https://gfkza6qzocvonsq5rbth57bvjy0pcruv.lambda-url.us-east-1.on.aws/'

		const response = await fetch(lambdaEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Origin: 'https://roccosada.com'
			},
			body: JSON.stringify({
				name: data.name,
				email: data.email,
				message: data.message
			})
		})

		if (!response.ok) {
			console.error('Lambda function returned error:', response.status, response.statusText)
			return false
		}

		const result = await response.json()

		if (result.success) {
			console.log('Email sent successfully via Lambda')
			return true
		} else {
			console.error('Lambda function returned failure:', result)
			return false
		}
	} catch (error) {
		console.error('Error calling Lambda function:', error)
		return false
	}
}
