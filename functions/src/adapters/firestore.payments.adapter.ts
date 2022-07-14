const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
import * as functions from "firebase-functions";
  
import type { PaymentsManager } from "../index";

import {PaymentMeta, PaymentEvent, ProductActivationClaim } from "../../../specs"
import { firestore } from "firebase-admin";


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

export const CreateActivationClaim:PaymentsManager["CreateActivationClaim"] = async (uid, code, params) =>
{
    const ActivationClaim:ProductActivationClaim = {
        status: 'pending', 
        ...params,
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


export const GetPaymentSessionID:PaymentsManager['GetPaymentSessionID'] =  async (secret) =>
{  
    try{ 
        const Payments:firestore.QuerySnapshot = await db.collection('payments').where('events.created.intent.client_secret', '==', secret).limit(1).get()
        if(Payments.empty) return false
         
        const [PaymentSnapshot] = Payments.docs
        const PaymentData = PaymentSnapshot.data() as PaymentMeta<any> 
        const SessionID = PaymentData.events?.created?.intent?.id || false
 
        return SessionID  
    }catch(err)
    {   
        functions.logger.error(err)
        return false
    }
}