// ** Custom Components
import moment from 'moment'

// ** Third Party Components
import { Card, CardBody, CardText, Button, Row, Col } from 'reactstrap'
import { DollarSign, TrendingUp, User, Check, Star, Flag, Phone, BarChart, Key, Layers, Clock, Pocket, Award, Camera } from 'react-feather'

const DataPlanInfo = ({ selectedReward }) => {
	return (
		<Card>
			<CardBody>
				<Row>
					<Col xl="6" lg="12" className="mt-2 mt-xl-0">
						<div className="user-info-wrapper">
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="d-flex align-items-center">
									<div className="color-box bg-light-primary">
										<Layers className="text-primary" />
									</div>
									<CardText tag="span" className="user-info-title text-capitalize font-weight-bold mb-0 ml-1">
										Reward
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedReward.name}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="d-flex align-items-center">
									<div className="color-box bg-light-secoundary">
										<Award className="text-secoundary" />
									</div>
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Reward Type
									</CardText>
								</div>
								<CardText className="mb-0">{selectedReward.type}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="d-flex align-items-center">
									<div className="color-box bg-light-secoundary">
										<Pocket className="text-secoundary" />
									</div>
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Quantity
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedReward?.qty}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="d-flex align-items-center">
									<div className="color-box bg-light-secoundary">
										<Star className="text-secoundary" />
									</div>
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Coin Value
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedReward?.coin}</CardText>
							</div>
						</div>
					</Col>
					<Col xl="6" lg="12" className="mt-2 mt-xl-0">
						<div className="user-info-wrapper">
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="d-flex align-items-center">
									<div className="color-box bg-light-secoundary">
										<Key className="text-secoundary" />
									</div>
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Plan Id
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedReward?.data_plan_id}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="d-flex align-items-center">
									<div className="color-box bg-light-secoundary">
										<Pocket className="text-secoundary" />
									</div>
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Naira Value
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">
									{selectedReward?.value?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
								</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="d-flex align-items-center">
									<div className="color-box bg-light-secoundary">
										<Check className="text-secoundary" />
									</div>
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Reward Status
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{selectedReward?.status}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mb-1">
								<div className="d-flex align-items-center">
									<div className="color-box bg-light-secoundary">
										<Camera className="text-secoundary" />
									</div>
									<CardText tag="span" className="user-info-title font-weight-bold mb-0 ml-1">
										Reward Image
									</CardText>
								</div>
								<img src={selectedReward?.image} width="80px" style={{ borderRadius: '50px' }} />
							</div>
						</div>
					</Col>
				</Row>
			</CardBody>
		</Card>
	)
}

export default DataPlanInfo
