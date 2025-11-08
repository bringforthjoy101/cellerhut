import { Package, Grid } from 'react-feather'

export default [
    {
      id: 'Products',
      title: 'All Products',
      icon: <Package size={20} />,
      navLink: '/products/list'
    },
    {
      id: 'Categories',
      title: 'Categories',
      icon: <Grid size={20} />,
      navLink: '/categories/list'
    }
]