// ** React Imports
import { useEffect, useState } from 'react'

// ** Columns
import SuppliersList from './Table'

// ** Store & Actions
import { useSelector } from 'react-redux'

// ** Styles
import '@styles/react/apps/app-users.scss'

const SuppliersListPage = () => {
	return (
		<div className="app-user-list">
			<SuppliersList />
		</div>
	)
}

export default SuppliersListPage