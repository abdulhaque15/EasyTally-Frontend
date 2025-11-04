import { Button } from 'react-bootstrap'

const CustomButton = ({ isPrimary, title }) => {
  return isPrimary ? (<Button className='w-50 custom-btn-primary'>{title}</Button>) : (<Button className='w-50 custom-btn-secondary'>{title}</Button>)
}

export default CustomButton