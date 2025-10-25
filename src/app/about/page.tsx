import React from 'react'
import CryptoCurrencyTicker from '../component/home/CryptoCurrencyTicker'
import OurAdvantage from '../component/home/OurAdvantage'
import LetsDoGreat from '../component/home/LetsDoGreat'
import AboutUs from '../component/home/AboutUs'
import Newsletter from '../component/home/Newsletter'
import { AboutHero } from '../component/about/AboutHero'
import { advantagess } from '@/data/advantages'

const page = () => {
  return (
    <div>
         <CryptoCurrencyTicker />
        <AboutHero />
  <OurAdvantage advantages={advantagess} />
          <LetsDoGreat />
          <AboutUs />
           <Newsletter />
         </div>
  )
}

export default page