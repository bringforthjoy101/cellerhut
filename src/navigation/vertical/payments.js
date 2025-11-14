import { CreditCard, Activity, Zap } from 'react-feather'

export default [
	{
		id: 'payments',
		title: 'Payments',
		icon: <CreditCard size={20} />,
		children: [
			{
				id: 'PaymentTransactions',
				title: 'Payment Transactions',
				icon: <CreditCard size={16} />,
				navLink: '/payments/transactions',
			},
			{
				id: 'PaymentLogs',
				title: 'Payment Logs',
				icon: <Activity size={16} />,
				navLink: '/payments/logs',
			},
			{
				id: 'PaymentWebhooks',
				title: 'Webhooks',
				icon: <Zap size={16} />,
				navLink: '/payments/webhooks',
			},
		],
	},
]
