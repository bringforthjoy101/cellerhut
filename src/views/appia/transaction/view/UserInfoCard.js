// ** React Imports

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Card, CardBody, CardText, Row, Col } from 'reactstrap'
import moment from 'moment'

const UserInfoCard = ({ selectedTransaction }) => {
	const renderImg = () => {
		if (selectedTransaction !== null && selectedTransaction.avatar) {
			return <img src={selectedTransaction.avatar} alt="user-avatar" className="img-fluid rounded" height="104" width="104" />
		} else {
			const stateNum = Math.floor(Math.random() * 6),
				states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
				color = states[stateNum]
			return (
				<Avatar
					initials
					color={color}
					className="rounded"
					content={selectedTransaction.user.names}
					contentStyles={{
						borderRadius: 0,
						fontSize: 'calc(36px)',
						width: '100%',
						height: '100%',
					}}
					style={{
						height: '90px',
						width: '90px',
					}}
				/>
			)
		}
	}

	return (
		<Card>
			<CardBody>
				<Row>
					<Col xl="6" lg="12" className="d-flex flex-column justify-content-between border-container-lg">
						<div className="user-avatar-section">
							<h3>User Details</h3>
							<div className="d-flex justify-content-start">
								{renderImg()}
								<div className="d-flex flex-column ml-1">
									<div className="user-info mt-2">
										<h4 className="mb-0">{selectedTransaction.user.names}</h4>
										<CardText tag="span">{selectedTransaction.user.email}</CardText>
									</div>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Username: </span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.user.username}</h6>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>User Id: </span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.user_id}</h6>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Phone: </span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.user.phone}</h6>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Status:</span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.status}</h6>
								</div>
							</div>
						</div>
					</Col>
					<Col xl="6" lg="12" className="d-flex flex-column justify-content-between border-container-lg">
						<div className="user-avatar-section">
							<h3>Transaction Details</h3>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Transaction Id: </span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.trans_id}</h6>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Type:</span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.type}</h6>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Transaction Type:</span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.trans_type}</h6>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Transaction Amount:</span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.trans_amount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h6>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Balance:</span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.balance.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h6>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Narration:</span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.narration}</h6>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Reference:</span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.ref}</h6>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Remark:</span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{selectedTransaction.remark !== null ? selectedTransaction.remark : 'No Remark'}</h6>
								</div>
							</div>
							<div className="d-flex align-items-center mr-2 mt-1">
								<div className="color-box">
									<span>Transaction Date:</span>
								</div>
								<div className="ml-1">
									<h6 className="mb-0">{moment(selectedTransaction.trans_date).format('lll')}</h6>
								</div>
							</div>
						</div>
					</Col>
				</Row>
			</CardBody>
		</Card>
	)
}

export default UserInfoCard
