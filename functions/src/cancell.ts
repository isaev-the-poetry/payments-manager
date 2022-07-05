

import * as functions from "firebase-functions"; 
//import { OrderMeta } from "../../specs" 
import {GetPaymentSessionID} from "./adapters/firestore.payments.adapter"

const stripe = require('stripe')(functions.config().stripe.secret_key);

export const CancellPaymentSession = functions.region("europe-west3")
    .runWith({
        allowInvalidAppCheckToken: true  // Opt-out: Requests with invalid App
        // Check tokens continue to your code.
    }).https.onCall(async (data, context) => { 
        
        const { paymentIntent: Secret } = data as { paymentIntent: string } 
        const sid = await GetPaymentSessionID(Secret)
        
        //Auth and session ownership disabled in dev purpose 

        //const paymentIntent = await stripe.paymentIntents.retrieve(sid)
        //const OrderDetails: OrderMeta = paymentIntent.metadata
         
        //if (OrderDetails.uid != context.auth?.uid)
        //    return ({ status: 'unauthorised' })

        const result = await stripe.paymentIntents.cancel(sid)

        functions.logger.info({
            'Event': "Cancell payment session",
            sid,
            result
        })

        return ({ result });
    });

