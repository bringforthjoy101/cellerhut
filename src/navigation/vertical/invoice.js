import { Circle, Folder } from 'react-feather'

export default [
    {
        id: 'invoices',
        title: 'Invoice',
        icon: <Folder size={20} />,
        badge: 'light-warning',
        badgeText: '3',
        children: [
            {
                id: 'invoiceList',
                title: 'List',
                icon: <Circle />,
                navLink: '/invoice/list'
              },
              {
                id: 'invoicePreview',
                title: 'Preview',
                icon: <Circle />,
                navLink: '/invoice/preview'
              },
              {
                id: 'invoiceEdit',
                title: 'Edit',
                icon: <Circle />,
                navLink: '/invoice/edit'
              },
              {
                id: 'invoiceAdd',
                title: 'Add',
                icon: <Circle />,
                navLink: '/invoice/add'
              }
        ]
    }
]
