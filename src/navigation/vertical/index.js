// ** Navigation sections imports
import admins from './admins'
import customers from './customers.js'
import shop from './shop.js'
import picker from './picker.js'
import dashboards from './dashboards'
import products from './products.js'
import orders from './orders'
import settlements from './settlements.js'
import reports from './reports.js'
import withdrawals from './withdrawals.js'
import transactions from './transactions.js'
import wallets from './wallets.js'
// import investments from './investments.js'

const userData = JSON.parse(localStorage.getItem('userData'))

// ** Merge & Export
export default userData?.role === 'admin' ? [...dashboards, ...shop, ...picker, ...products, ...orders, ...customers, ...admins, ...withdrawals, ...transactions, ...wallets, ...reports] : userData?.role === 'store' ? [...dashboards, ...shop, ...picker, ...customers, ...withdrawals, ...transactions, ...wallets] : userData?.role === 'sales-rep' ? [...dashboards, ...shop, ...picker, ...customers, ...orders, ...withdrawals, ...transactions, ...wallets, ...reports] : [...dashboards, ...shop, ...picker, ...withdrawals]