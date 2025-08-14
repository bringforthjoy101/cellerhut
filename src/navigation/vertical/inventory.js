import { Package, BarChart, FileText } from 'react-feather'

export default [
  {
    id: 'inventory',
    title: 'Inventory',
    icon: <Package />,
    children: [
      {
        id: 'inventoryCounts',
        title: 'Inventory Counts',
        icon: <BarChart />,
        navLink: '/inventory/counts'
      },
      {
        id: 'inventoryReports',
        title: 'Count Reports',
        icon: <FileText />,
        navLink: '/inventory/reports'
      }
    ]
  }
]