// ** Reactstrap Imports
import { Card, CardBody } from 'reactstrap'

const OrderSkeleton = () => {
	return (
		<Card className="mb-1">
			<CardBody className="p-1">
				<div className="d-flex justify-content-between align-items-start mb-75">
					<div style={{ width: '60%' }}>
						<div className="skeleton-box mb-25" style={{ height: '20px', width: '80%' }}></div>
						<div className="skeleton-box" style={{ height: '16px', width: '60%' }}></div>
					</div>
					<div className="skeleton-box" style={{ height: '24px', width: '80px', borderRadius: '12px' }}></div>
				</div>

				<div className="mb-75">
					<div className="d-flex justify-content-between mb-25">
						<div className="skeleton-box" style={{ height: '16px', width: '30%' }}></div>
						<div className="skeleton-box" style={{ height: '16px', width: '40%' }}></div>
					</div>
					<div className="d-flex justify-content-between mb-25">
						<div className="skeleton-box" style={{ height: '16px', width: '30%' }}></div>
						<div className="skeleton-box" style={{ height: '16px', width: '35%' }}></div>
					</div>
					<div className="d-flex justify-content-between">
						<div className="skeleton-box" style={{ height: '16px', width: '30%' }}></div>
						<div className="skeleton-box" style={{ height: '18px', width: '45%' }}></div>
					</div>
				</div>

				<div className="mt-75 pt-75 border-top">
					<div className="skeleton-box" style={{ height: '14px', width: '50%' }}></div>
				</div>
			</CardBody>
		</Card>
	)
}

const OrderTableSkeleton = ({ rows = 5 }) => {
	return (
		<div className="table-skeleton">
			{Array.from({ length: rows }).map((_, index) => (
				<div key={index} className="skeleton-row mb-50" style={{ height: '60px', background: '#f8f8f8', borderRadius: '4px' }}>
					<div className="d-flex align-items-center px-2 py-1" style={{ height: '100%' }}>
						<div className="skeleton-box mr-1" style={{ height: '40px', width: '15%' }}></div>
						<div className="skeleton-box mr-1" style={{ height: '40px', width: '20%' }}></div>
						<div className="skeleton-box mr-1" style={{ height: '40px', width: '15%' }}></div>
						<div className="skeleton-box mr-1" style={{ height: '40px', width: '20%' }}></div>
						<div className="skeleton-box mr-1" style={{ height: '40px', width: '15%' }}></div>
						<div className="skeleton-box" style={{ height: '40px', width: '15%' }}></div>
					</div>
				</div>
			))}
		</div>
	)
}

export { OrderSkeleton, OrderTableSkeleton }
