const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
import * as functions from "firebase-functions";
  
import type { PaymentsManager } from "../index";

import {PaymentMeta, PaymentEvent, ProductActivationClaim } from "../../../specs"


export const SavePaymentEvent:PaymentsManager['SavePaymentEvent'] =  async (id, status, uid, currency, amount, metadata, intent) =>
{
    const CurrentEvent:PaymentEvent<any> = {
        registered: admin.firestore.FieldValue.serverTimestamp(),
        amount, currency, metadata, intent, uid
    }

    const PaymentMeta:PaymentMeta<any> = { 
        events:
        {
            [status]: CurrentEvent
        },
        uid 
    }

    try{
        await db.collection('payments').doc(id).set(PaymentMeta,{merge:true})
        return true
    }catch(err)
    {   
        functions.logger.error(err)
        return false
    }
}

export const CreateActivationClaim:PaymentsManager["CreateActivationClaim"] = async (uid, code, variation) =>
{
    const ActivationClaim:ProductActivationClaim = {
        status: 'pending', 
        product_variation: variation,
        uid
    } 
    try{
        await db.collection('products').doc(code).collection('activations').doc().set(ActivationClaim,{merge:true})
        return true
    }catch(err)
    {   
        functions.logger.error(err)
        return false
    } 
}

export const CompeteActivationClaim:PaymentsManager["CompeteActivationClaim"] = async ( productID,  docID) =>
{ 
    try{
        await db.collection('products').doc(productID).collection('activations').doc(docID).set( {status: 'complete'} ,{merge:true})
        return true
    }catch(err)
    {   
        functions.logger.error(err)
        return false
    } 
}
