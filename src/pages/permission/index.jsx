import React from 'react'
import WebLayout from '../layout/WebLayout'
import PermissionDashboard from './PermissionDashboard'

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
      <PermissionDashboard />
    </WebLayout>
  )
}

export default index