import { lazy } from 'react'
import { Redirect } from 'react-router-dom'

const InvoiceAppRoutes = [
    {
        path: '/invoice/list',
        component: lazy(() => import('../../views/invoiceApp/list'))
    },
    {
        path: '/invoice/preview/:id',
        component: lazy(() => import('../../views/invoiceApp/preview')),
        meta: {
            navLink: '/invoice/preview'
        }
    },
    {
        path: '/invoice/preview',
        exact: true,
        component: () => <Redirect to='/invoice/preview/4987' />
    },
    {
        path: '/invoice/edit/:id',
        component: lazy(() => import('../../views/invoiceApp/edit')),
        meta: {
            navLink: '/invoice/edit'
        }
    },
    {
        path: '/invoice/edit',
        exact: true,
        component: () => <Redirect to='/invoice/edit/4987' />
    },
    {
        path: '/invoice/add',
        component: lazy(() => import('../../views/invoiceApp/add'))
    },
    {
        path: '/invoice/print',
        layout: 'BlankLayout',
        component: lazy(() => import('../../views/invoiceApp/print'))
    }
]

export default InvoiceAppRoutes
