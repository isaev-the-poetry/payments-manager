

import * as functions from "firebase-functions";
import type Stripe from 'stripe'
import { OrderMeta } from "../../specs" 
import { GetProduct, LoadCustomer, SaveCustomer } from "./adapters/firestore.marketplace.adapter";
 
const stripe = require('stripe')(functions.config().stripe.secret_key);
const stripePublicKey = functions.config().stripe.public_key

export const CreatePaymentSession = functions.region("europe-west3")
.runWith({
  allowInvalidAppCheckToken: true  // Opt-out: Requests with invalid App
                                   // Check tokens continue to your code.
}).https.onCall( async (data, context) => { 
    const {product:ProductCode, ...ProductParams} = data 

    //const uid = context.auth?.uid
    //if (!uid) return ({error: { message: 'unauthorised'}})  
    const uid = "1"

    const product = await GetProduct(ProductCode)
    if(!product) return ({ error: { message: 'no product specified'} })
   
    let customer = await LoadCustomer(uid)
    if (!customer)
    {
      customer = await stripe.customers.create() as Stripe.Customer;
      await SaveCustomer(uid, customer)
    }
   
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: '2020-08-27'}
    );
  
    const OrderDetails:OrderMeta = {
      uid,
      product_code:ProductCode,
      ...ProductParams
    }
  
    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.price,
      currency: product.currency,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      //payment_method_types: ['card'],
      metadata: OrderDetails
    });

    functions.logger.info({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: stripePublicKey
    })
  
    return({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: stripePublicKey,
      status: "success"
    });
  
  });
  
  