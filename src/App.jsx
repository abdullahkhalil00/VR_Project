import './App.css'
import { Link, Navigate, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom'
import AssignmentTable from './components/AssignmentTable'
import CourseContent from './components/CourseContent'
import Signup from './components/Signup'
import Signin from './components/Signin'


import { batchTabs, getCoursesForBatch, getModuleCourseContent, getModulesForBatch } from './data/courseModules'

const menuItems = [
  ['Home', '/dashboard'],
  ['My Courses', '/my-courses'],
  ['Assignments', '/assignment'],
  ['Time Table', '/timetable'],
  ['Forum', '/forum'],
  ['Settings', '/profile'],
]

const dashboardCourses = [
  { name: 'Diploma in Physics', code: 'OXF/ENG/01' },
  { name: 'Diploma in IT', code: 'OXF/DIT/01' },
  { name: 'HND in Computing', code: 'OXF/HND/01' },
]

function PageCard({ className = '', children }) {
  return <section className={`page-card ${className}`.trim()}>{children}</section>
}

function SectionTitle({ children }) {
  return <h2 className="section-title">{children}</h2>
}

function CourseGrid({ courses }) {
  return (
    <div className="cards-3">
      {courses.map((course) => (
        <article key={course.code} className="course-card">
          <p>{course.name}</p>
          <small>{course.code}</small>
        </article>
      ))}
    </div>
  )
}

function BatchPills({ basePath }) {
  const [searchParams] = useSearchParams()
  const batchId = searchParams.get('batch') || '1'
  return (
    <div className="pill-tabs">
      {batchTabs.map((tab) => (
        <Link
          key={tab.id}
          to={`${basePath}?batch=${tab.id}`}
          className={batchId === tab.id ? 'active' : ''}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}

function MyCoursesScreen() {
  const [searchParams] = useSearchParams()
  const batchId = searchParams.get('batch') || '1'
  const courses = getCoursesForBatch(batchId)
  const modules = getModulesForBatch(batchId)
  return (
    <ShellLayout title="My Courses">
      <CourseGrid courses={courses} />
      <BatchPills basePath="/my-courses" />
      <PageCard className="table-wrap">
        <table>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id}>
                <td>
                  <Link className="module-link" to={`/my-courses/module/${m.id}?batch=${batchId}`}>
                    ☑ {m.label}
                  </Link>
                </td>
                <td>{m.topic}</td>
                <td>{m.unit}</td>
                <td>{m.status}</td>
                <td className="right">
                  <Link className="btn-mini as-link-mini" to="/vr">
                    VR
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageCard>
    </ShellLayout>
  )
}

function StatGrid({ items }) {
  return (
    <div className="stats-2">
      {items.map((item) => (
        <div key={item.label} className={`stat${item.center ? ' center' : ''}`}>
          <span>{item.label}</span>
          {item.value ? <span>{item.value}</span> : null}
        </div>
      ))}
    </div>
  )
}

function AuthLayout({ title, children, footer, className }) {
  return (
    <main className="auth-wrap">
      <section className={"auth-card" + (className ? ` ${className}` : '')}>
        <div className="logo-mark">OXF</div>
        <h1 className="auth-title">{title}</h1>
        {children}
        <p className="auth-footer">{footer}</p>
      </section>
    </main>
  )
}

function CourseModuleScreen() {
  const { moduleId } = useParams()
  const [searchParams] = useSearchParams()
  const batchId = searchParams.get('batch') || '1'
  const data = getModuleCourseContent(moduleId, batchId)
  if (!data) return <Navigate to={`/my-courses?batch=${batchId}`} replace />
  return (
    <ShellLayout title={`${data.meta.topic} · ${data.meta.label}`}>
      <CourseContent data={data} />
    </ShellLayout>
  )
}

function ShellLayout({ title, children }) {
  const { pathname } = useLocation()
  return (
    <main className="app">
      <aside className="sidebar">
        <div className="brand"><div className="logo-mark">OXF</div><div className="hamburger" /></div>
        <div className="profile-chip"><div className="avatar" /><div><p>Hi, Alex</p><small>E173037</small></div></div>
        <nav className="menu">
          {menuItems.map(([label, path]) => (
            <Link key={path} to={path} className={pathname === path ? 'active' : ''}>{label}</Link>
          ))}
        </nav>
      </aside>
      <section className="content">
        <div className="top-icons">🔔 💬</div>
        <h1>{title}</h1>
        <div className="content-body">{children}</div>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={
        <AuthLayout title="Sign in Your Account" footer={''}>
          <Signin />
        </AuthLayout>
      } />
      <Route path="/signup" element={
        <AuthLayout title="Create your account" className="signup" footer={<>Already have an account? <Link to="/signin">Sign in</Link></>}>
          <Signup />
        </AuthLayout>
      } />
      <Route path="/forgot-password" element={
        <AuthLayout title="Forgot Password" footer={<>Already have an account? <Link to="/signin">Sign in</Link></>}>
          <label className="field-label">Email</label><input className="field" />
          <Link className="btn-primary as-link" to="/otp">Submit</Link>
        </AuthLayout>
      } />
      <Route path="/otp" element={
        <AuthLayout title="Sent OTP on Your Email" footer={<Link to="/signin">Back to Login Page</Link>}>
          <div className="otp-group">{Array.from({ length: 6 }).map((_, i) => <input key={i} className="otp-input" maxLength={1} />)}</div>
          <button className="micro-link">Resent OTP</button>
          <Link className="btn-primary as-link" to="/signin">Submit</Link>
        </AuthLayout>
      } />
      <Route
        path="/dashboard"
        element={
          <ShellLayout title="Dashboard">
            <p className="subhead">Welcome Back, Alex</p>
            <PageCard className="hero">
              Oxford scholarships for PhD (Dphil) in Biology, 2023-24, University of Oxford, UK
            </PageCard>
            <CourseGrid courses={dashboardCourses} />
            <StatGrid items={[
              { label: 'Module Progress', value: '90%' },
              { label: 'Assignment Progress', value: '10%' },
            ]} />
            <StatGrid items={[
              { label: 'Attendance Progress', value: '97%' },
              { label: 'Course Progress', value: '50%' },
            ]} />
          </ShellLayout>
        }
      />
      <Route
        path="/my-courses/module/:moduleId"
        element={<CourseModuleScreen />}
      />
      <Route path="/my-courses" element={<MyCoursesScreen />} />
      <Route
        path="/assignment"
        element={
          <ShellLayout title="Assignment">
            <BatchPills basePath="/assignment" />
            <PageCard className="table-wrap">
              <AssignmentTable />
            </PageCard>
          </ShellLayout>
        }
      />
      <Route
        path="/timetable"
        element={
          <ShellLayout title="Time Table">
            <StatGrid items={[
              { label: 'Live Class', center: true },
              { label: 'Recorded Class', center: true },
            ]} />
            <PageCard className="table-wrap">
              <table>
                <thead><tr><th>Lecture Name</th><th>Subject</th><th>Start Time</th><th>End Time</th><th>Date</th></tr></thead>
                <tbody>
                  <tr><td>John</td><td>English</td><td>9.00</td><td>1.00</td><td>20.10.2023</td></tr>
                  <tr><td>Doe</td><td>Programming</td><td>9.00</td><td>1.00</td><td>21.10.2023</td></tr>
                  <tr><td>Sam</td><td>Database</td><td>9.00</td><td>1.00</td><td>22.10.2023</td></tr>
                </tbody>
              </table>
            </PageCard>
          </ShellLayout>
        }
      />
      <Route
        path="/forum"
        element={
          <ShellLayout title="Forum">
            <section className="forum">
              <PageCard className="panel chat-list">
                <input className="field chat-search" placeholder="Search" />
                <SectionTitle>Lectures</SectionTitle>
                <p>Mr. Niruban</p>
                <p>Mr. Sam</p>
                <p>Mr. Nirmal</p>
                <SectionTitle>Students</SectionTitle>
                <p>Anil</p>
                <p>Chuuthiya</p>
                <p>Mary</p>
              </PageCard>
              <PageCard className="panel chat-main">
                <div><strong>Anil</strong><div className="hint">Online - Last seen, 2.02pm</div></div>
                <div>
                  <div className="bubble left">Hey There!</div>
                  <div className="bubble left">How are you?</div>
                  <div className="bubble right">Hello!</div>
                  <div className="bubble right">I am fine and how are you</div>
                </div>
                <div className="msg-input"><input placeholder="Type your message here..." /><button className="btn-mini">🎤</button></div>
              </PageCard>
            </section>
          </ShellLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <ShellLayout title="Profile">
            <PageCard className="profile-main">
              <div className="avatar large" />
              <div><h3>Alex jhonson</h3><p>alexjhonson@gmail.com<br />+4212315672<br />model road, nyc</p></div>
              <div><p>Program : PHD<br />Department : Biology<br />University : University of OXFORD</p></div>
            </PageCard>
            <div className="tile-row">
              <div className="tile">Courses enrolled<br />3</div>
              <div className="tile">Assignment Completed<br />8</div>
              <div className="tile">Attendence<br />97%</div>
              <div className="tile">Courses enrolled<br />3</div>
            </div>
            <PageCard className="settings-box"><h2>Accounts Settings</h2><p>Change Password</p><p>Notifications</p><p>Privacy Settings</p></PageCard>
          </ShellLayout>
        }
      />
      <Route path="/vr" element={<ShellLayout title="VR"><PageCard className="vr-box">Processing on VR</PageCard></ShellLayout>} />
    </Routes>
  )
}

export default App
