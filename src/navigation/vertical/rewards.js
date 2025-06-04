import { Users, Award, ThumbsUp, Mail, User, List } from 'react-feather'

export default [
    {
        id: 'rewards',
        title: 'Rewards',
        icon: <Award size={20} />,
        badge: 'light-warning',
        badgeText: '3',
        children: [
            {
                id: 'dataPlan',
                title: 'Data Plan',
                icon: <User size={20} />,
                navLink: '/appia/dataPlans/list'
            },
            {
                id: 'rewardItems',
                title: 'Reward Items',
                icon: <Award size={20} />,
                navLink: '/appia/allRewardItems/list'
            },
            {
                id: 'claimedRewards',
                title: 'Claimed Rewards',
                icon: <User size={20} />,
                navLink: '/appia/claimedRewards/list'
            }
        ]
    }
]
