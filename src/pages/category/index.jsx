import React from 'react'
import WebLayout from '../layout/WebLayout'
import CategoryDashboard from './CategoryDashboard'

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
        <CategoryDashboard />        
    </WebLayout>
  )
}

export default index