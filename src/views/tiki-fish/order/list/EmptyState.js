// ** React Imports
import { Card, CardBody, Button } from 'reactstrap'
import { Package, Search, Filter } from 'react-feather'

const EmptyState = ({ type = 'no-data', onClearFilters }) => {
	const renderContent = () => {
		switch (type) {
			case 'no-results':
				return (
					<>
						<Search size={64} className="mb-1 text-muted" />
						<h4 className="mb-1">No orders found</h4>
						<p className="text-muted mb-2">
							We couldn't find any orders matching your search criteria.
							<br />
							Try adjusting your filters or search term.
						</p>
						{onClearFilters && (
							<Button color="primary" outline onClick={onClearFilters}>
								Clear Filters
							</Button>
						)}
					</>
				)
			case 'no-data':
				return (
					<>
						<Package size={64} className="mb-1 text-muted" />
						<h4 className="mb-1">No orders yet</h4>
						<p className="text-muted mb-0">
							Orders will appear here once they are created.
						</p>
					</>
				)
			default:
				return (
					<>
						<Filter size={64} className="mb-1 text-muted" />
						<h4 className="mb-1">No data available</h4>
						<p className="text-muted mb-0">
							There is currently no data to display.
						</p>
					</>
				)
		}
	}

	return (
		<Card>
			<CardBody className="text-center py-5">
				{renderContent()}
			</CardBody>
		</Card>
	)
}

export default EmptyState
