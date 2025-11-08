import Avatar from '@components/avatar'
import { Card, CardBody, Row, Col, CardText } from 'reactstrap'
import { User, Phone, Mail, Calendar, DollarSign } from 'react-feather'
import moment from 'moment'
import BalanceActions from './BalanceActions'
import '@styles/react/libs/tables/react-dataTable-component.scss'

const GuestInfoCard = ({ selectedGuest }) => {
	const renderUserImg = () => {
		const stateNum = Math.floor(Math.random() * 6),
			states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
			color = states[stateNum]

		return (
			<Avatar
				initials
				color={color}
				className="rounded"
				content={selectedGuest.fullName}
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

	return (
		<Card>
			<CardBody>
				<Row>
					<Col xl="6" lg="12" className="d-flex flex-column justify-content-between border-container-lg">
						<div className="user-avatar-section">
							<div className="d-flex justify-content-start">
								{renderUserImg()}
								<div className="d-flex flex-column ml-1">
									<div className="user-info mt-2">
										<h4 className="mb-0">{selectedGuest.fullName}</h4>
										<CardText tag="span">{selectedGuest.email}</CardText>
									</div>
								</div>
							</div>
							<div className="mt-2">
								<BalanceActions guestId={selectedGuest.id} />
							</div>
						</div>
					</Col>
					<Col xl="6" lg="12" className="mt-2 mt-xl-0">
						<div className="user-info-wrapper">
							<div className="d-flex flex-wrap">
								<div className="user-info-title" style={{ width: '150px' }}>
									<User className="mr-1" size={14} />
									<CardText tag="span" className="user-info-title font-weight-bold mb-0">
										Full Name:
									</CardText>
								</div>
								<CardText className="mb-0 ml-2">{selectedGuest.fullName}</CardText>
							</div>

							<div className="d-flex flex-wrap my-50">
								<div className="user-info-title" style={{ width: '150px' }}>
									<Mail className="mr-1" size={14} />
									<CardText tag="span" className="user-info-title font-weight-bold mb-0">
										Email:
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0 ml-2">{selectedGuest.email}</CardText>
							</div>

							<div className="d-flex flex-wrap my-50">
								<div className="user-info-title" style={{ width: '150px' }}>
									<Phone className="mr-1" size={14} />
									<CardText tag="span" className="user-info-title font-weight-bold mb-0">
										Phone:
									</CardText>
								</div>
								<CardText className="mb-0 ml-2">{selectedGuest.phone}</CardText>
							</div>

							<div className="d-flex flex-wrap my-50">
								<div className="user-info-title" style={{ width: '150px' }}>
									<Calendar className="mr-1" size={14} />
									<CardText tag="span" className="user-info-title font-weight-bold mb-0">
										Created At:
									</CardText>
								</div>
								<CardText className="mb-0 ml-2">{moment(selectedGuest.createdAt).format('MMMM Do YYYY')}</CardText>
							</div>

							<div className="d-flex flex-wrap my-50">
								<div className="user-info-title" style={{ width: '150px' }}>
									<DollarSign className="mr-1" size={14} />
									<CardText tag="span" className="user-info-title font-weight-bold mb-0">
										Balance:
									</CardText>
								</div>
								<CardText className="mb-0 ml-2">{selectedGuest.balance?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</CardText>
							</div>
						</div>
					</Col>
				</Row>
			</CardBody>
		</Card>
	)
}

export default GuestInfoCard
