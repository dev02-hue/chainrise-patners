import React from 'react'
import ContactHeader from '../component/contact/ContactHeader'
import Newsletter from '../component/home/Newsletter'
import CryptoCurrencyTicker from '../component/home/CryptoCurrencyTicker'

const page = () => {
  return (
    <div> 
      <CryptoCurrencyTicker />
  <ContactHeader />
  <Newsletter />
    </div>
  )
}

export default page