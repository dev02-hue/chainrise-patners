import React from 'react'
import LoginForm from '../component/layout/LoginForm'
import CryptoCurrencyTicker from '../component/home/CryptoCurrencyTicker'

const page = () => {
  return (
    <div>
      <CryptoCurrencyTicker />
      <LoginForm />
      </div>
  )
}

export default page