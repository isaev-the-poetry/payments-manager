/* eslint-disable no-case-declarations */
/* eslint-disable padded-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable object-curly-spacing */


import type Stripe from 'stripe'
  
import { PaymentMeta, Product } from "../../specs";

// Data model Abstraction
export type PaymentsManager = {
  SavePaymentEvent: (
    id: string,
    status: keyof PaymentMeta<any>["events"],
    uid: string | null,
    currency: string,
    amount: number,
    metadata: { [key: string]: string }, // ограничение процессинга
    intent: any
    ) => Promise<boolean>
  CreateActivationClaim: ( uid:string, product_code:string, product_variation?:string ) => Promise<boolean>
  CompeteActivationClaim: ( product_code: string, docID:string ) => Promise<boolean>
}

export type MakertPlaceManager = {
  LoadCustomer: (uid:string) => Promise<Stripe.Customer|false>
  SaveCustomer: (uid:string, customer:Stripe.Customer) => Promise<boolean>
  GetProduct: (ProductCode:string) => Promise<Product|false>
}

 
export {webhook} from "./webhook" 
export {RouteActivation} from "./activator" 
export {CreatePaymentSession} from "./session"  

export {ActivateOpenContact} from "./products/OpenContact"