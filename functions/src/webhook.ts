import * as functions from "firebase-functions";
import type Stripe from 'stripe'  
import {PaymentMeta, OrderMeta } from "../../specs"
import {SavePaymentEvent} from "./adapters/firestore.payments.adapter"
 
 
const stripe = require('stripe')(functions.config().stripe.secret_key);
const endpointSecret = functions.config().stripe.endpoint_secret;


export const webhook = functions.region("europe-west3").https.onRequest(async (request, response) => {

    let event:Stripe.Event = request.body;
  
    if (endpointSecret) {
      const signature = request.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(
          request.rawBody,
          signature,
          endpointSecret
        );
      } catch (err) {
        const { message } = err as { message: string | undefined }
        console.log(`⚠️  Webhook signature verification failed.`, message);
        response.status(400).send("Verification failed");
        return
      }
    }
  
    //@ts-ignore
    const paymentIntent:Stripe.PaymentIntent = event.data?.object;
  
    const StatusMessages:{ [key: string]: keyof PaymentMeta<OrderMeta>["events"] } = {
      "payment_intent.succeeded": "succeeded",
      "payment_intent.created": "created",
      "payment_intent.payment_failed": "failed",
      "payment_intent.requires_action": "requires_action",
      "payment_intent.canceled": "canceled", 
    }
  
  
    switch (event.type) {
      case "payment_intent.succeeded":
      case "payment_intent.created":
      case "payment_intent.requires_action": 
      case "payment_intent.payment_failed": 
      case "payment_intent.canceled":
        
        await SavePaymentEvent(paymentIntent.id, StatusMessages[event.type], paymentIntent.metadata?.uid || null, paymentIntent.currency, paymentIntent.amount, paymentIntent.metadata, paymentIntent)
        break;
  
      default:
        functions.logger.error(`Unhandled event type ${event.type}.`);
    }
  
    response.send("Hello");
  });