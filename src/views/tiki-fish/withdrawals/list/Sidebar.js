// ** Custom Components
import Sidebar from '@components/sidebar'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import moment from 'moment'

import { swal, apiRequest, selectThemeColors } from '@utils'
import { getAllData, getFilteredData } from '../store/action'

// ** Third Party Components
import { Button, FormGroup, Label, Spinner } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import Select from 'react-select'

const SidebarNewWithdrawal = ({ open, toggleSidebar }) => {
	const dispatch = useDispatch()
	const categories = {
		SALES: ['Sea Fish Supplies', 'Farmed Catfish Supplies', 'Crayfish Supplies', 'Snails Supplies'],
		LOGISTICS: ['GIG Wallet Funding', 'DHL Shipping Fees', 'Cargo Shipping Fees', 'Traditional Waybills Fees', 'Dispatch Riders Fees'],
		PACKAGING: ['Cartons', 'Burble Wraps', 'Gusset Bags', 'Cookie Jars', 'Cellotape', 'Stationeries'],
		PROFIT: ['Utility Vehicle Fueling', 'Salaries', 'Weekly Tips', 'Profit Withdrawals', 'Sales App Service Charges'],
		SMOKE_HOUSE: ['Firewood Supplies', 'Salt', 'Skewers', 'Fuel at the Farm', 'SM Workers Salary', 'Maintenance'],
	}

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [wallets, setWallets] = useState([])
	const [selectedWallet, setSelectedWallet] = useState('')

	const [withdrawalData, setWithdrawalData] = useState({
		amount: '',
		purpose: '',
		category: '',
		walletId: selectedWallet.value,
	})

	// ** Function to handle form submit
	const onSubmit = async (event, errors) => {
		setIsSubmitting(true)
		event?.preventDefault()
		if (errors) setIsSubmitting(false)
		if (errors && !errors.length) {
			setIsSubmitting(true)
			const body = JSON.stringify(withdrawalData)
			try {
				const response = await apiRequest({ url: '/withdrawals/create', method: 'POST', body }, dispatch)

				if (response) {
					if (response.data.status) {
						setIsSubmitting(false)
						swal('Great job!', response.data.message, 'success')
						dispatch(getAllData({ startDate: moment().format('L').split('/').join('-'), endDate: moment().format('L').split('/').join('-') }))
						setWithdrawalData({
							amount: '',
							purpose: '',
							category: '',
							walletId: selectedWallet.value,
						})
						toggleSidebar()
					} else {
						setIsSubmitting(false)
						setWithdrawalData({
							amount: '',
							purpose: '',
							category: '',
							walletId: selectedWallet.value,
						})
						swal('Oops!', response.data.message, 'error')
					}
				} else {
					setIsSubmitting(false)
					swal('Oops!', 'Something went wrong with your network.', 'error')
				}
			} catch (error) {
				setIsSubmitting(false)
				console.error({ error })
			}
		}
	}

	useEffect(() => {
		// onSubmit()
		dispatch(getAllData({ startDate: moment().format('L').split('/').join('-'), endDate: moment().format('L').split('/').join('-') }))
	}, [dispatch])

	useEffect(() => {
		apiRequest({ url: '/wallets', method: 'GET' }).then((walletResponse) => {
			console.log({ walletResponse })
			setWallets(walletResponse.data.data)
		})
		setWithdrawalData({
			...withdrawalData,
			walletId: selectedWallet.value,
		})
	}, [selectedWallet])

	const renderWallets = (wallets) => {
		console.log(wallets)
		return wallets.map((wallet) => {
			return { value: wallet.id, label: `${wallet.name} (${wallet.balance.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })})` }
		})
	}

	return (
		<Sidebar size="lg" open={open} title="New Withdrawal" headerClassName="mb-1" contentClassName="pt-0" toggleSidebar={toggleSidebar}>
			<AvForm onSubmit={onSubmit}>
				<FormGroup>
					<Label for="walletId">Select Wallet</Label>
					<Select
						theme={selectThemeColors}
						className="react-select"
						classNamePrefix="select"
						defaultValue={selectedWallet}
						options={renderWallets(wallets)}
						isClearable={false}
						onChange={setSelectedWallet}
						required
					/>
				</FormGroup>
				<FormGroup>
					<Label for="amount">Amount</Label>
					<AvInput
						type="number"
						name="amount"
						id="amount"
						placeholder="Enter Amount"
						value={withdrawalData.amount}
						onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
						required
					/>
				</FormGroup>
				<FormGroup>
					<Label for="category">Category</Label>
					<AvInput
						type="select"
						id="category"
						name="category"
						value={withdrawalData.category}
						onChange={(e) => setWithdrawalData({ ...withdrawalData, category: e.target.value })}
						required
					>
						<option value="">Select Category</option>
						{wallets &&
							categories[wallets?.find((w) => w.id === selectedWallet.value)?.name]?.map((category) => <option value={category}>{category}</option>)}
						<option value="Others">Others</option>
					</AvInput>
				</FormGroup>
				<FormGroup>
					<Label for="purpose">Purpose</Label>
					<AvInput
						type="textarea"
						name="purpose"
						id="purpose"
						placeholder="Enter Purpose"
						value={withdrawalData.purpose}
						onChange={(e) => setWithdrawalData({ ...withdrawalData, purpose: e.target.value })}
						required
					/>
				</FormGroup>
				<Button type="submit" className="mr-1" color="primary" disabled={isSubmitting}>
					{isSubmitting && <Spinner color="white" size="sm" />}
					<span className="ml-50">Submit</span>
				</Button>
				<Button type="reset" color="secondary" outline onClick={toggleSidebar}>
					Cancel
				</Button>
			</AvForm>
		</Sidebar>
	)
}

export default SidebarNewWithdrawal
