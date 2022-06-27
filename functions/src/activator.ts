

import * as functions from "firebase-functions";

import { CreateActivationClaim } from "./adapters/firestore.payments.adapter";
 
import { PaymentMeta, OrderMeta } from "../../specs";


export const RouteActivation = functions.region("europe-west3").firestore.document('payments/{docID}')
.onWrite(async ( change, context) => {
   
  const NewPaymentRecord = change.after.data() as PaymentMeta<OrderMeta>; 
  const OldPaymentRecord = change.before.data()  as PaymentMeta<OrderMeta>;

  if ( NewPaymentRecord?.events?.succeeded && !OldPaymentRecord?.events?.succeeded && NewPaymentRecord.uid )
  {
    await CreateActivationClaim(NewPaymentRecord.uid, NewPaymentRecord.events.succeeded.metadata.product_code, NewPaymentRecord.events.succeeded.metadata.product_variation )
  }
})