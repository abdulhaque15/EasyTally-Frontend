import React from 'react'
import TaskDashboard from './TaskDashboard'
import WebLayout from '../layout/WebLayout'

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
        <TaskDashboard />
    </WebLayout>
  )
}

export default index