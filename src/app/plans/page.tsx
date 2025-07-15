import React from 'react'
import InvestmentHeader from '../component/plan/InvestmentHeader'
import PricingSection from '../component/home/PricingSection'
import Newsletter from '../component/home/Newsletter'
import CryptoCurrencyTicker from '../component/home/CryptoCurrencyTicker'
 
const page = () => {
  return (
    <div>
      <CryptoCurrencyTicker />
      <InvestmentHeader />
       <PricingSection />
       <Newsletter />
    </div>
  )
}

export default page