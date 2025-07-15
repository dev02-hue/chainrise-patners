import React from 'react'
import InvestmentHeader from '../component/plan/InvestmentHeader'
import TeamSection from '../component/plan/TeamSection'
import CryptoCurrencyTicker from '../component/home/CryptoCurrencyTicker'

const page = () => {
  return (
    <div>
      <CryptoCurrencyTicker />
      <InvestmentHeader />
          <TeamSection />
          </div>
  )
}

export default page