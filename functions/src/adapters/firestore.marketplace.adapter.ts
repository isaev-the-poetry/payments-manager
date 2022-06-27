// const admin = require('firebase-admin');
const admin = require('firebase-admin');
const db = admin.firestore();

import * as functions from "firebase-functions";
//import type Stripe from 'stripe'

import { MakertPlaceManager } from ".."
import { Product } from "../../../specs";


export const LoadCustomer: MakertPlaceManager["LoadCustomer"] = async (uid) => {

  try {
    const UserMeta = await db.collection('user_meta').doc(uid).get() 
    return UserMeta.exists && (UserMeta.data()?.customer || false)
  } catch (err) {
    functions.logger.error(err)
    return false
  }
}

export const SaveCustomer: MakertPlaceManager["SaveCustomer"] = async (uid, customer) => { 
  try {
    await db.collection('user_meta').doc(uid).set({ customer }, { merge: true })
    return true
  } catch (err) {
    functions.logger.error(err)
    return false
  }
}

export const GetProduct: MakertPlaceManager["GetProduct"] = async (ProductCode) => {
  try {
    const ProductData = await db.collection('products').doc(ProductCode).get() 
    return ProductData.exists && (ProductData.data() as Product)
  } catch (err) {
    functions.logger.error(err)
    return false
  } 
}