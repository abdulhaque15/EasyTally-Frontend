import React from 'react'
import WebLayout from '../layout/WebLayout'
import OpportunityDashboard from './OpportunityDashboard'

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
      <OpportunityDashboard />
    </WebLayout>
  )
}

export default index