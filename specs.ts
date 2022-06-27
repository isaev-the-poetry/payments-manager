//import Stripe from 'stripe'

  
/**
 * 
 *  firebase functions:config:set stripe.secret_key=<>
 *  firebase functions:config:set stripe.public_key=<>
 *  firebase functions:config:set stripe.endpoint_secret=<>
 *  firebase functions:config:get
 * 
 *  Чтобы работало локально:
 *  firebase functions:config:get > functions/.runtimeconfig.json
 * 
 *  Functions: Структура проекта:
 *  В папке adapters - реализация интерфейса над моделью данных (сам интерфейс в index)
 *  В папке products - логика активации для продуктов
 *   
 *
 * Как подключить без публикации в npm 
  "dependencies": {
   "payments-manaer": "https://github.com/zxcabs/node-lib/tarball/v.0.0.2"
    }
 */
 

export type PaymentEvent<OrderInfo> =
{ 
    uid:  string | null,
    metadata: OrderInfo
    amount: number
    currency: string
    payment_method_types?: string[]
    statement_descriptor?: string 
    intent: any
    registered: any 
}
  
export type PaymentMeta<OrderInfo> = {
    events: { 
        created?:PaymentEvent<OrderInfo>
        succeeded?:PaymentEvent<OrderInfo>
        failed?:PaymentEvent<OrderInfo>
        requires_action?:PaymentEvent<OrderInfo>
        canceled?:PaymentEvent<OrderInfo>
    }
    uid: string | null
} 

export type OrderMeta = {
    uid: string
    product_code: string
    product_variation: string
}

export type ProductActivationClaim = {
    status: 'pending' | 'complete',
    uid: string,
    product_variation?: string
}

export type Product = {
    price: number
    currency: string
    description?: string
}