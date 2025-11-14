import { CreditCard, DollarSign, Smartphone, ShoppingBag } from 'react-feather'
import { Badge } from 'reactstrap'

const PaymentMethodIcon = ({ method, showLabel = false, size = 16 }) => {
	const methodConfig = {
		card: {
			icon: CreditCard,
			label: 'Card',
			color: 'primary',
		},
		mpesa: {
			icon: Smartphone,
			label: 'M-Pesa',
			color: 'success',
		},
		eft: {
			icon: DollarSign,
			label: 'EFT',
			color: 'info',
		},
		cash: {
			icon: DollarSign,
			label: 'Cash',
			color: 'success',
		},
		wallet: {
			icon: ShoppingBag,
			label: 'Wallet',
			color: 'warning',
		},
	}

	const config = methodConfig[method] || methodConfig.card
	const Icon = config.icon

	if (showLabel) {
		return (
			<Badge color={`light-${config.color}`} className="d-flex align-items-center">
				<Icon size={size} className="mr-50" />
				<span>{config.label}</span>
			</Badge>
		)
	}

	return <Icon size={size} className={`text-${config.color}`} />
}

export default PaymentMethodIcon
