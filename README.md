# Athlete Photo Store

A starter storefront for selling sports photography.

## What is included
- Responsive gallery/storefront
- Watermarked previews
- Search by athlete/team/jersey
- Photo pricing and purchase buttons
- Stripe Checkout backend
- Stripe webhook endpoint for confirmed payments
- Success page
- "My Photos" demo tab using browser storage

## Run it
1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put your Stripe secret test key in `.env`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

## Before going live
- Replace demo images with your own protected, watermarked previews.
- Add a real database/user authentication system.
- Store purchased-photo records after the Stripe webhook.
- Put original full-resolution images in private object storage and serve signed download URLs only after purchase.
- Configure a production Stripe webhook.
- Add your business/contact/privacy/terms information.
- Have a parent/guardian handle the Stripe account if required for your age.
