import { FileText, TrendingUp, BarChart } from 'react-feather'

export default [
  {
    id: 'reports',
    title: 'Reports',
    icon: <FileText size={20} />,
    children: [
      {
        id: 'reports-list',
        title: 'Reports List',
        icon: <BarChart size={16} />,
        navLink: '/reports/list'
      },
      {
        id: 'audit-reports',
        title: 'Audit Reports',
        icon: <TrendingUp size={16} />,
        navLink: '/reports/audit'
      }
    ]
  },
]
