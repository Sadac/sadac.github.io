---
title: 'Create a form email in a static website with lambda and AWS Simple Email Service'
description: 'A guide on creating a form email in a static website using AWS Lambda and SES.'
publishDate: '2023-10-27T00:00:00Z'
---

# Create a form email in a static website with lambda and AWS Simple Email Service

### Creating an IAM Role

In order the Lambda call the SMS we need to give the Lambda a Role. To do so, we must go to IAM service and:

1. Create a new role.
2. Add permissions to the Lambda so it can write the CloudWatch Logs via AWSLambdaBasicExecutionRole
3. Add permissions to the Lambda so it can use Amazon Simple Email Service via AmazonSESFullAccess
4. We do a final review of the previous configurations and then create the new Role

Then we need to create our Lambda function, from scratch, and specially picking the role we just created.

**Activating Function URL for Lambda**
In this scenario, I don't want to expose the lambda via HTTP using an API Gateway, just for one function. So the other possible solution for this is to check the Function URL option in the Additional Configurations panel. This way the Lambda will have an endpoint that can be called via HTTP(S) directly.

For the Auth Type choose NONE since this is going to be a "Public" endpoint, but additionally I'll configure a CORs policy so it only get's called from the site I define. In this case https://roccosada.com. To do so we need to check the option **Configure cross-origin resource sharing (CORS)**

**CORS for Function URL**
In the configuration tab, Function URL section we can edit the CORS policy. In the Allow Origin input we can set the URL from which the Lambda endpoint can be called. We replace `*` with `https://roccosada.com/` and save.

### Script for Lambda

This script is a simple Nodejs one to handle the email sending process

```ts
import AWS from 'aws-sdk'

const ses = new AWS.SES({ region: 'us-east-1' }) // Adjunts region SES

export const handler = async (event) => {
	try {
		// Validate origin (extra for security)
		const allowedOrigin = 'https://roccosada.com'
		const origin = event.headers?.origin || ''

		if (origin !== allowedOrigin) {
			return {
				statusCode: 403,
				body: JSON.stringify({ error: 'Forbidden' })
			}
		}

		// Parse body
		const body = JSON.parse(event.body)
		const { name, email, message } = body

		// Params of SES
		const params = {
			Destination: { ToAddresses: ['customemail@mail.com'] }, // your mail verified in SES
			Message: {
				Body: {
					Text: { Data: `From: ${name} <${email}>\n\n${message}` }
				},
				Subject: { Data: '📩 New message from your blog' }
			},
			Source: 'anotheremail@mail.com' // also must be verified in SES
		}

		await ses.sendEmail(params).promise()

		return {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Origin': allowedOrigin,
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type'
			},
			body: JSON.stringify({ success: true })
		}
	} catch (err) {
		console.error('Error SES:', err)
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Error sending the email' })
		}
	}
}
```

👉 Este handler:

Rechaza requests que no vengan de tu dominio.

Envía email solo a tu casilla verificada.

Responde con CORS configurado.

🔹 Paso 2. Crear la Lambda

Si usás AWS CLI:

zip function.zip index.mjs package.json
aws lambda create-function \
 --function-name ContactFormHandler \
 --runtime nodejs18.x \
 --handler index.handler \
 --zip-file fileb://function.zip \
 --role arn:aws:iam::<tu-account-id>:role/<tu-role-con-permisos-SES>

Necesitas un IAM Role con al menos la policy AmazonSESFullAccess (o granular con ses:SendEmail).

🔹 Paso 3. Crear el Function URL
aws lambda create-function-url-config \
 --function-name ContactFormHandler \
 --auth-type NONE \
 --cors 'AllowOrigins=["https://roccosada.com"],AllowMethods=["POST","OPTIONS"],AllowHeaders=["content-type"]'

Esto te devuelve algo como:

https://abcd1234.lambda-url.us-east-1.on.aws/

🔹 Paso 4. Formulario en Astro

Ejemplo de integración:

<form id="contactForm">
  <input type="text" id="name" placeholder="Tu nombre" required />
  <input type="email" id="email" placeholder="Tu email" required />
  <textarea id="message" placeholder="Tu mensaje" required></textarea>
  <button type="submit">Enviar</button>
</form>

<script>
  document.getElementById("contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: document.querySelector("#name").value,
      email: document.querySelector("#email").value,
      message: document.querySelector("#message").value,
    };

    const res = await fetch("https://abcd1234.lambda-url.us-east-1.on.aws/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Mensaje enviado con éxito!");
    } else {
      alert("❌ Error al enviar el mensaje.");
    }
  });
</script>

🔹 Paso 5. Verificación en SES

Verifica remitente (contacto@roccosada.com).

Verifica destinatario (tucorreo@gmail.com).

Mientras estés en sandbox, los mails solo llegarán a direcciones verificadas.
