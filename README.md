This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## YooKassa SBP payments

Added payment flow:

- `app/api/create-payment/route.ts` creates YooKassa SBP payment.
- `app/api/yookassa-webhook/route.ts` receives `payment.succeeded` webhook and activates subscription.
- `app/api/subscription/route.ts` checks active subscription in PostgreSQL.
- `app/payment/success/page.tsx` waits for webhook confirmation and activates local Pro state.
- `sql/payment-schema.sql` creates `payments` and `subscriptions` tables.

Required Vercel environment variables:

```env
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=https://ege-trainer-liart.vercel.app
```

YooKassa webhook URL:

```txt
https://ege-trainer-liart.vercel.app/api/yookassa-webhook
```

Required webhook event: `payment.succeeded`.
