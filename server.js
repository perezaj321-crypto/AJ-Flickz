require("dotenv").config();
const express = require("express");
const path = require("path");
const Stripe = require("stripe");

const app = express();
const port = process.env.PORT || 3000;
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({error: "Stripe is not configured yet."});
    const { photoId, name, priceCents } = req.body;
    if (!photoId || !Number.isInteger(priceCents) || priceCents < 100) {
      return res.status(400).json({error: "Invalid photo purchase."});
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {name: `Athlete photo ${photoId}`},
          unit_amount: priceCents
        },
        quantity: 1
      }],
      customer_creation: "always",
      metadata: {photoId, athleteName: name || ""},
      success_url: `${process.env.BASE_URL || "http://localhost:3000"}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL || "http://localhost:3000"}/?cancelled=1`
    });
    res.json({url: session.url});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: "Could not create checkout session."});
  }
});

app.post("/api/stripe-webhook", express.raw({type: "application/json"}), (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.sendStatus(503);
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("PAID:", session.metadata?.photoId, session.customer_details?.email);
      // Production step: save the purchase to your database and unlock the photo in My Photos.
    }
    res.json({received: true});
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.listen(port, () => console.log(`Athlete Photo Store running at http://localhost:${port}`));