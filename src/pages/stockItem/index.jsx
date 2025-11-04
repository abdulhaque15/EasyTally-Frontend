import WebLayout from '../layout/WebLayout'
import StockItemDashboard from './StockItemDashboard'

const index = () => {
  return (
    <WebLayout isSideBar={true} isFooter={true} isHeader={true}>
        <StockItemDashboard />        
    </WebLayout>
  )
}
export default index 