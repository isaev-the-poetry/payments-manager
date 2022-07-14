import * as functions from "firebase-functions";


import { CompeteActivationClaim } from "../adapters/firestore.payments.adapter";
 
import { ProductActivationClaim } from "../../../specs";

export const ActivateOpenContact = functions.region("europe-west3").firestore.document('products/{productID}/activations/{docID}')
.onCreate(async ( snap, context) => {
  
  const ActivationClaim = snap.data() as ProductActivationClaim;
  
  functions.logger.info("ActivateOpenContactMock", {ActivationClaim})

  await CompeteActivationClaim( context.params?.productID , snap.ref.id )  
})
