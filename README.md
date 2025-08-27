# Astro Resume

## Features

- Astro v4
- TailwindCSS utility classes
- ESLint / Prettier pre-installed and pre-configured
- Accessible, semantic HTML markup
- Responsive & SEO-friendly
- Dark / Light mode, using Tailwind and CSS variables (referenced from shadcn)
- [Astro Assets Integration](https://docs.astro.build/en/guides/assets/) for optimised images
- MD & [MDX](https://docs.astro.build/en/guides/markdown-content/#mdx-only-features) posts
- Pagination
- [Automatic RSS feed](https://docs.astro.build/en/guides/rss)
- Auto-generated [sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Expressive Code](https://expressive-code.com/) source code and syntax highlighter

## Credits

- [astro-theme-cactus](https://github.com/chrismwilliams/astro-theme-cactus) for blog design
- [minirezume-framer](https://minirezume.framer.website/) for resume homepage design

## Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
    ├── assets/
│   ├── components/
│   ├── content/
│   ├── layouts/
|   ├── pages/
|   ├── styles/
|   ├── utils/
|   ├── site.config.ts
│   └── types.ts
├── .elintrc.cjs
├── .gitignore
├── .prettierignore
├── package.json
├── prettier.config.cjs
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Editing guide

### Site info

To edit site info such as site title and description, edit the `src/site.config.ts` file.

### Page contents

To edit the resume homepage content and design, edit the `src/pages/index.astro` file.

### Page components

To edit page components found site-wide such as the card used in the homepage, edit the files found in the `src/components/` directory.

### Layouts

To edit the base layouts of all pages, edit the `src/layouts/BaseLayout.astro` file.

To edit the layout of a blog article, edit the `src/layouts/BlogPost.astro` file.

### Blog content

To add blog content, insert `.md` files in the `src/content/` directory.

To add images in blog articles, insert a folder in the `src/content/` directory, add both the `.md` and image files into the new folder, and reference the image in your `.md` file.

## 🎯 **Key Points for GitHub Pages Deployment**

### **GitHub Actions Workflow**

The provided workflow will:

1. **Securely inject** environment variables during build
2. **Build your site** with AWS credentials available
3. **Deploy to GitHub Pages** without exposing secrets

### **Security Best Practices**

- ✅ **Never commit** `.env` files to repository
- ✅ **Use GitHub Secrets** for sensitive data
- ✅ **Limit IAM permissions** to only SES sending
- ✅ **Use specific AWS regions** for better security

### **Alternative Deployment Options**

If GitHub Pages limitations become problematic, consider:

- **Vercel**: Better environment variable support
- **Netlify**: Native form handling + AWS integration
- **Cloudflare Pages**: Excellent performance + env vars

This documentation provides complete instructions for securely deploying your AWS SES-integrated contact form to GitHub Pages! 🚀

## Theming

To change the theme colours of the site, edit the `src/styles/app.css` file.

To change the fonts of the site, add your font files into `/public`, add it as a `@font-face` in the `src/styles/app.css` file, as a `fontFamily` in the `tailwind.config.js` file, and apply the new font class to the `body` tag in the `src/layouts/BaseLayout.astro` file.

## Contact Form & AWS SES Integration

This site includes a contact form (`/contact`) with AWS Simple Email Service (SES) integration for sending emails.

### Environment Variables

The contact form requires the following environment variables:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=your-verified-email@yourdomain.com
AWS_SES_TO_EMAIL=your-email@yourdomain.com
```

### AWS SES Setup

1. **Verify your domain/email** in the AWS SES console
2. **Create an IAM user** with SES sending permissions:
   ```json
   {
   	"Version": "2012-10-17",
   	"Statement": [
   		{
   			"Effect": "Allow",
   			"Action": ["ses:SendEmail", "ses:SendRawEmail"],
   			"Resource": "*"
   		}
   	]
   }
   ```
3. **Generate access credentials** for the IAM user

### GitHub Pages Deployment with Environment Variables

Since this site deploys to GitHub Pages, you need to configure environment variables securely:

#### Option 1: GitHub Actions with Secrets (Recommended)

1. **Add secrets to your GitHub repository:**

   - Go to your repository → Settings → Secrets and variables → Actions
   - Add each environment variable as a repository secret:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_REGION`
     - `AWS_SES_FROM_EMAIL`
     - `AWS_SES_TO_EMAIL`

2. **Update your GitHub Actions workflow** to use these secrets:

   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '18'

         - name: Install dependencies
           run: npm ci

         - name: Build with environment variables
           env:
             AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
             AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
             AWS_REGION: ${{ secrets.AWS_REGION }}
             AWS_SES_FROM_EMAIL: ${{ secrets.AWS_SES_FROM_EMAIL }}
             AWS_SES_TO_EMAIL: ${{ secrets.AWS_SES_TO_EMAIL }}
           run: npm run build

         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

#### Option 2: Alternative Hosting Platforms

For more environment variable flexibility, consider these platforms:

- **Vercel**: Supports environment variables in dashboard
- **Netlify**: Environment variables in site settings
- **Cloudflare Pages**: Environment variables in Pages dashboard

### Local Development

For local development, create a `.env` file in the project root:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=your-verified-email@yourdomain.com
AWS_SES_TO_EMAIL=your-email@yourdomain.com
```

**⚠️ Important**: Never commit the `.env` file to your repository. It's already included in `.gitignore`.

### Form Features

- **Zod validation**: Client and server-side form validation
- **Error handling**: Comprehensive error messages and user feedback
- **Success notifications**: Confirmation when emails are sent successfully
- **Responsive design**: Works on all device sizes
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation
