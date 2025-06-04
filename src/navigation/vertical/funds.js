import { ChevronsRight, ThumbsUp, List } from 'react-feather'

export default [
    {
        id: 'funds',
        title: 'Funds',
        icon: <List size={20} />,
        badge: 'light-warning',
        badgeText: '3',
        children: [
            {
                id: 'funds_approval',
                title: 'Add/Deduct Funds',
                icon: <List size={20} />,
                navLink: '/appia/funds/list'
            },
            {
                id: 'withdrawals',
                title: 'Withdrawls',
                icon: <ThumbsUp size={20} />,
                navLink: '/appia/withdrawal/list'
            },
            {
                id: 'transfers',
                title: 'Bank Transfers',
                icon: <ChevronsRight size={20} />,
                navLink: '/appia/transfers/list'
            }
        ]
    }
]