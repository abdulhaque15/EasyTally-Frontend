import React from 'react'
import UserDashboard from './UserDashboard'
import WebLayout from '../layout/WebLayout'

const index = () => {
    return (
        <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
            <UserDashboard />
        </WebLayout>
    )
}

export default index