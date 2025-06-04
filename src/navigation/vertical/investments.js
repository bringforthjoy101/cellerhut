import { PieChart, Circle } from 'react-feather'

export default [
  {
    id: 'investments',
    title: 'Investments',
    icon: <PieChart size={20} />,
    children: [
      {
        id: 'investments_packages',
        title: 'Packages',
        icon: <Circle size={12} />,
        navLink: '/investments/packages/list'
      },
      {
        id: 'investors',
        title: 'Investors',
        icon: <Circle size={12} />,
        navLink: '/investments/investors/list'
      },
      {
        id: 'investments_subscriptions',
        title: 'Subscriptions',
        icon: <Circle size={12} />,
        navLink: '/investments/subscriptions/list',
        disabled: true
      },
    ]
  },
]
