import React from 'react'
import WebLayout from '../layout/WebLayout'
import SettingDashboard from './SettingDashboard'

const index = () => {
  return (
     <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
      <SettingDashboard />
    </WebLayout>
  )
}

export default index