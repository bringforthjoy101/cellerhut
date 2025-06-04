import { Users, ThumbsUp, Mail, HelpCircle } from 'react-feather'

export default [
    {
        id: 'customer_support',
        title: 'Support / Help',
        icon: <HelpCircle size={20} />,
        badge: 'light-warning',
        badgeText: '3',
        children: [
            {
                id: 'contact',
                title: 'Contact us',
                icon: <Mail size={20} />,
                navLink: '/appia/contact/list'
            },
            {
                id: 'feedback',
                title: 'Feedbacks',
                icon: <ThumbsUp size={20} />,
                navLink: '/appia/feedbacks/list'
            },
            {
                id: 'subscribers',
                title: 'Subscribers',
                icon: <Users size={20} />,
                navLink: '/appia/subscribers/list'
            }
        ]
    }
]