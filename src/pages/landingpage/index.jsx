import React from 'react'
import WebLayout from '../layout/WebLayout'
import Dashboard from '../dashboard';

const LandingPage = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
      <Dashboard />
    </WebLayout>
  )
}

export default LandingPage