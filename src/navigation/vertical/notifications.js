import { Bell, Send, Clock, List } from 'react-feather'

export default [
	{
		id: 'notifications',
		title: 'Notifications',
		icon: <Bell size={20} />,
		children: [
			{
				id: 'broadcastMessage',
				title: 'Broadcast Message',
				icon: <Send size={20} />,
				navLink: '/notifications/broadcast',
			},
			{
				id: 'broadcastHistory',
				title: 'Broadcast History',
				icon: <Clock size={20} />,
				navLink: '/notifications/history',
			},
			{
				id: 'notificationLogs',
				title: 'Notification Logs',
				icon: <List size={20} />,
				navLink: '/notifications/logs',
			},
		],
	},
]
