import React from 'react'
import WebLayout from '../layout/WebLayout'
import ProjectMasterDashboard from './ProjectMasterDashboard'

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
      <ProjectMasterDashboard />
    </WebLayout>
  )
}

export default index