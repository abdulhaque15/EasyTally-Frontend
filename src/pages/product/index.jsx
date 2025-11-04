import WebLayout from '../layout/WebLayout'
import ProductDashboard from './ProductDashboard'

const index = () => {
  return (
    <WebLayout isSideBar={true} isHeader={true} isFooter={true}>
        <ProductDashboard />
    </WebLayout>
  )
}

export default index