// ** Reactstrap
import { Card, CardBody } from 'reactstrap'
import ResolveEscrow from './ResolveEscrow'

const PlanCard = ({ selectedEscrow }) => {

  return (
    <Card className='plan-card border-primary'>
      <CardBody>
        <ResolveEscrow code={selectedEscrow.escrow_id} status={selectedEscrow.status} />
      </CardBody>
    </Card>
  )
}

export default PlanCard
