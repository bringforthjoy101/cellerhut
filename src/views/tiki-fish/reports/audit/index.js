// ** Audit Reports Main Component
import AuditReportGenerator from './AuditReportGenerator'

// ** Styles
import '@styles/react/apps/app-users.scss'

const AuditReports = () => {
  return (
    <div className='app-user-list'>
      <AuditReportGenerator />
    </div>
  )
}

export default AuditReports