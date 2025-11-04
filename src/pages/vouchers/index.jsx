import WebLayout from '../layout/WebLayout'
import VoucherDashboard from './VoucherDashboard'

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
        <VoucherDashboard />        
    </WebLayout>
  )
}
export default index 