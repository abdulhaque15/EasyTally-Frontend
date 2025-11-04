import WebLayout from '../layout/WebLayout'
import LedgersDashboard from './LedgersDashboard'

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
        <LedgersDashboard />        
    </WebLayout>
  )
}
export default index