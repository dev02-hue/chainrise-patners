import React from 'react'
import FaqHeader from '../component/faq/FaqHeader'
import FAQSection from '../component/home/FAQSection'
import CryptoCurrencyTicker from '../component/home/CryptoCurrencyTicker'

const page = () => {
  return (
    <div>
      <CryptoCurrencyTicker />
      <FaqHeader />
      <FAQSection />
    </div>
  )
}

export default page