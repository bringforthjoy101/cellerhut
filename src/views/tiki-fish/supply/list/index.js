// ** React Imports
import { useEffect, useState } from 'react'

// ** Columns
import SuppliesList from './Table'

// ** Store & Actions
import { useSelector } from 'react-redux'

// ** Styles
import '@styles/react/apps/app-users.scss'

const SuppliesListPage = () => {
	return (
		<div className="app-user-list">
			<SuppliesList />
		</div>
	)
}

export default SuppliesListPage