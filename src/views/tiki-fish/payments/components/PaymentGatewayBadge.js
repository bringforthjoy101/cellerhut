import { Badge } from 'reactstrap'

const PaymentGatewayBadge = ({ gateway }) => {
	const gatewayConfig = {
		peach: {
			color: 'primary',
			text: 'Peach Payments',
		},
		cash: {
			color: 'success',
			text: 'Cash',
		},
		stripe: {
			color: 'info',
			text: 'Stripe',
		},
		paypal: {
			color: 'warning',
			text: 'PayPal',
		},
	}

	const config = gatewayConfig[gateway] || { color: 'secondary', text: gateway?.toUpperCase() || 'Unknown' }

	return (
		<Badge color={`light-${config.color}`} pill>
			{config.text}
		</Badge>
	)
}

export default PaymentGatewayBadge
