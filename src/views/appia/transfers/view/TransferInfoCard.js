// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'
import moment from 'moment'

// ** Third Party Components
import { Card, CardBody, CardText, Button, Row, Col } from 'reactstrap'
import {
	DollarSign,
	TrendingUp,
	User,
	Check,
	Star,
	Flag,
	Phone,
	BarChart,
	Key,
	Unlock,
	X,
	Layers,
	Clock,
	Pocket,
	Award,
	Camera,
	Type,
	Hash,
	Calendar,
} from 'react-feather'

const TransferInfo = ({ selectedTransfer }) => {
	// ** render user img

	return (
		<Card>
			<CardBody>
				<Row>
					<Col xl="6" lg="12" className="mt-2 mt-xl-0">
						<div className="user-info-wrapper">
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="color-box bg-light-secoundary">
									<Unlock />
								</div>
								<div className="d-flex align-items-center">
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										User Id
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedTransfer?.user_id}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="color-box bg-light-secoundary">
									<Hash />
								</div>
								{selectedTransfer.bank === 'Appia' ? (
									<div className="d-flex align-items-center">
										<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
											Phone Number
										</CardText>
									</div>
								) : (
									<div className="d-flex align-items-center">
										<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
											Account Number
										</CardText>
									</div>
								)}
								<CardText className="text-capitalize mb-0">{selectedTransfer?.account_number}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="color-box bg-light-secoundary">
									<User />
								</div>
								<div className="d-flex align-items-center">
									<CardText tag="span" className="user-info-title text-capitalize font-weight-bold mb-0 ml-1">
										Sender
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedTransfer.sender_name}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="color-box bg-light-secoundary">
									<Unlock />
								</div>
								<div className="d-flex align-items-center">
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Receiver Id
									</CardText>
								</div>

								<CardText className="text-capitalize mb-0">
									{selectedTransfer?.receiver_id !== null ? selectedTransfer.receiver_id : 'No receiver Id'}
								</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="color-box bg-light-secoundary">
									<User />
								</div>
								<div className="d-flex align-items-center">
									<CardText tag="span" className="user-info-title text-capitalize font-weight-bold mb-0 ml-1">
										Receiver
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedTransfer.receiver_name}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="color-box bg-light-secoundary">
									<Unlock />
								</div>
								<div className="d-flex align-items-center">
									<CardText tag="span" className="user-info-title text-capitalize font-weight-bold mb-0 ml-1">
										Transaction Id
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedTransfer.trans_id}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="color-box bg-light-secoundary">
									<Type />
								</div>
								<div className="d-flex align-items-center">
									<CardText tag="span" className="user-info-title text-capitalize font-weight-bold mb-0 ml-1">
										Transaction Type
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedTransfer.trans_type}</CardText>
							</div>
						</div>
					</Col>
					<Col xl="6" lg="12" className="mt-2 mt-xl-0">
						<div className="user-info-wrapper">
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="color-box bg-light-secoundary">
									<Hash />
								</div>
								<div className="d-flex align-items-center">
									<CardText tag="span" className="user-info-title text-capitalize font-weight-bold mb-0 ml-1">
										Transaction Amount
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">
									{selectedTransfer.trans_amount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
								</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="color-box bg-light-secoundary">
									<Pocket className="text-secoundary" />
								</div>
								<div className="d-flex align-items-center">
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Bank
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedTransfer?.bank}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="color-box bg-light-secoundary">
									<Pocket className="text-secoundary" />
								</div>
								<div className="d-flex align-items-center">
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Bank Code
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedTransfer?.bank_code !== null ? selectedTransfer.bank_code : 'No Code'}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="d-flex align-items-center">
									{selectedTransfer.status === 'Successful' ? (
										<div className="color-box bg-light-secoundary">
											<Check className="text-secoundary" />
										</div>
									) : (
										<div className="color-box bg-light-secoundary">
											<X className="text-secoundary" />
										</div>
									)}
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Transaction Status
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedTransfer.status}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="color-box bg-light-secoundary">
									<Pocket className="text-secoundary" />
								</div>
								<div className="d-flex align-items-center">
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Remarks
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedTransfer?.remarks}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="d-flex align-items-center">
									<div className="color-box bg-light-secoundary">
										<Calendar className="text-secoundary" />
									</div>
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Transaction Date
									</CardText>
								</div>
								<CardText>{moment(selectedTransfer?.trans_date).format('lll')}</CardText>
							</div>
						</div>
					</Col>
				</Row>
			</CardBody>
		</Card>
	)
}

export default TransferInfo
