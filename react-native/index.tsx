import React, { useEffect, useState } from 'react'
import { Button, View, ActivityIndicator } from "react-native"
import functions from '@react-native-firebase/functions';

//@ts-ignore
if (__DEV__) {
  functions().useFunctionsEmulator('http://localhost:5001');
}

import { initStripe, useStripe } from '@stripe/stripe-react-native';

type PayButtonProps = {
  onSuccess: () => any
  onError: (error: any) => any
  onCancell?: () => any
  publishableKey: string
  merchantIdentifier?: string
  title?: string
  productName: string
  productParams: { [key: string]: string } 
  Component?: React.Element
}

export const PayButton:(PayButtonProps:PayButtonProps) => React.Element = 
({title = "Оплатить", productName, productParams, onSuccess, onError,onCancell, publishableKey, merchantIdentifier = "", Component=Button }) =>
{ 
  useEffect(() => {
    initStripe({
      publishableKey,
      merchantIdentifier,
    });
  }, []); 
  const { initPaymentSheet, presentPaymentSheet } = useStripe(); 
  const [ isLoading, setLoading] = useState(false)
  const CreatePaymentSession = functions().httpsCallable('CreatePaymentSession')
  const CancellPaymentSession = functions().httpsCallable('CancellPaymentSession')

  const openPaymentSheet = async () => {
    try {
      setLoading(true);

      const {
        data: {
          paymentIntent,
          ephemeralKey,
          customer,
          error
        } 
      } = await CreatePaymentSession({ product: productName, ...productParams });
        
      if (!paymentIntent) {  
        onError(error?.message)
        return
      } 
  
      const { error:initError } = await initPaymentSheet({
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
      });
   
      if (initError) throw initError; 

      const { error:presentError } = await presentPaymentSheet(); 
      if (presentError) 
      {
        if (presentError?.code == "Canceled") 
        {
          await CancellPaymentSession({paymentIntent}) 
          onCancell && onCancell()
        }
        else
          throw presentError;  
      }
      else
      { 
        onSuccess()  
      }
    }
    catch (e: any) {
      console.log(e); 
      onError(e) 
    }
    finally{
      setLoading(false);
    }
  };

  return (<>
    <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {isLoading ? <ActivityIndicator color={"grey"} size={"small"}/>: undefined}
      <Component disabled={isLoading} title={isLoading?"Обработка":title} onPress={openPaymentSheet} />
    </View>
  </>
  );
}

exports.PayButton = PayButton