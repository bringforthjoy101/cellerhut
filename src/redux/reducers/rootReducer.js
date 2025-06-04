// ** Redux Imports
import { combineReducers } from 'redux'

// ** Reducers Imports
import auth from './auth'
import navbar from './navbar'
import layout from './layout'
import chat from '@src/views/apps/chat/store/reducer'
import todo from '@src/views/apps/todo/store/reducer'
import users from '@src/views/apps/user/store/reducer'

import customers from '@src/views/tiki-fish/customer/store/reducer'
import wallets from '@src/views/tiki-fish/wallets/store/reducer'
import investments from '@src/views/tiki-fish/investment/store/reducer'
import guests from '@src/views/tiki-fish/guests/store/reducer'
import admins from '@src/views/tiki-fish/admin/store/reducer'
import products from '@src/views/tiki-fish/product/store/reducer'
import orders from '@src/views/tiki-fish/order/store/reducer'
import settlements from '@src/views/tiki-fish/settlement/store/reducer'
import reports from '@src/views/tiki-fish/reports/store/reducer'
import withdrawals from '@src/views/tiki-fish/withdrawals/store/reducer'
import transactions from '@src/views/tiki-fish/transactions/store/reducer'

import email from '@src/views/apps/email/store/reducer'
// import invoice from '@src/views/apps/invoice/store/reducer'
import invoice from '@src/views/invoiceApp/store/reducer'
import calendar from '@src/views/apps/calendar/store/reducer'
import ecommerce from '@src/views/tiki-fish/ecommerce/store/reducer'
import dataTables from '@src/views/tables/data-tables/store/reducer'

const rootReducer = combineReducers({
  auth,
  ecommerce,
  todo,
  chat,
  email,
  users,
  customers,
  wallets,
  investments,
  guests,
  admins,
  products,
  settlements,
  reports,
  withdrawals,
  transactions,
  orders,
  navbar,
  layout,
  invoice,
  calendar,
  dataTables
})

export default rootReducer
