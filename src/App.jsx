import './App.css'
import { Link, Navigate, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from './firebase'
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
  const [courses, setCourses] = useState(getCoursesForBatch(batchId))
  const [modules, setModules] = useState([])
  const [loadingModules, setLoadingModules] = useState(false)

  useEffect(() => {
    setCourses(getCoursesForBatch(batchId))

    // If Batch 01, try to fetch modules from Firestore collection.
    // Collection name can be changed here if yours differs.
    // Default set to the collection name you created in Firestore: 'add_course'
    const FIRESTORE_COLLECTION = 'add_course'

    if (String(batchId) === '1') {
      let mounted = true
      setLoadingModules(true)

      // Only attempt to read from Firestore once we have an authenticated user.
      const unsubAuth = onAuthStateChanged(auth, async (user) => {
        if (!mounted) return
        if (!user) {
          // Not signed in: do not attempt to read (prevents permission errors)
          setModules([])
          setLoadingModules(false)
          return
        }

        try {
          const snap = await getDocs(collection(db, FIRESTORE_COLLECTION))
          const list = snap.docs.map((d) => d.data())
          const mapped = list.map((doc) => {
            // Support multiple possible field namings coming from Firestore UI
            const courseId = doc.courseId ?? doc['course Id'] ?? doc['course_id'] ?? doc.id
            const courseName = doc.courseName ?? doc['course name'] ?? doc['courseName'] ?? ''
            const unitName = doc.unitName ?? doc.unit ?? doc['unit'] ?? ''
            const status = doc.status ?? doc['Status'] ?? ''
            const rawVr = doc.vrMode ?? doc['Vr mode'] ?? doc['vr mode'] ?? doc['VrMode'] ?? doc['VR mode']
            const vrMode = rawVr === true || String(rawVr).toLowerCase() === 'true'
            return {
              id: String(courseId ?? Math.random().toString(36).slice(2, 8)),
              label: courseId ? String(courseId) : `course ${doc.id ?? ''}`,
              topic: courseName,
              unit: unitName,
              status,
              vrMode,
              // allow document to provide attachments/description/videos counts
              attachments: Array.isArray(doc.attachments) ? doc.attachments : [],
              description: doc.description ?? doc['Description'] ?? '',
              videos: doc.videos ?? doc.videosCount ?? (Array.isArray(doc.attachments) ? doc.attachments.length : 0),
            }
          })
          if (mounted) setModules(mapped)
        } catch (err) {
          console.error('Failed to load modules from Firestore', err)
          if (mounted) setModules([])
        } finally {
          if (mounted) setLoadingModules(false)
        }
      })

      return () => {
        mounted = false
        try { unsubAuth() } catch (_) {}
      }
    }

    // non-batch-1: use local modules
    setModules(getModulesForBatch(batchId))
  }, [batchId])

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
                  <Link className="module-link" to={`/my-courses/module/${encodeURIComponent(m.id)}?batch=${batchId}`} state={{ module: m }}>
                    ☑ {m.label}
                  </Link>
                </td>
                <td>{m.topic}</td>
                <td>{m.unit}</td>
                <td>{m.status}</td>
                <td className="right">
                  {m.vrMode ? (
                    <Link className="btn-mini as-link-mini" to="/vr">
                      VR
                    </Link>
                  ) : (
                    <button className="btn-mini as-link-mini" disabled>
                      VR
                    </button>
                  )}
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
        <div className="logo-mark">MOOC's</div>
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
  const location = useLocation()
  let data = getModuleCourseContent(moduleId, batchId)

  // If module not found in local mock data, but the Link passed module data via state (from Firestore),
  // construct a minimal `data` object so CourseContent can render.
  if (!data && location.state && location.state.module) {
    const m = location.state.module
    const meta = {
      label: m.label || moduleId,
      topic: m.topic || '',
      unit: m.unit || '',
      batchId: batchId,
    }
    const lectures = [
      {
        id: `${moduleId}-l1`,
        number: 1,
        title: m.topic ? `Lecture: ${m.topic}` : `Lecture 01`,
        helpingContent: 0,
        videos: m.videos || 0,
        assignments: 0,
        openQuiz: 0,
        description: m.description || '',
        attachments: m.attachments || [],
        assignmentItems: [],
        quizItems: [],
      },
    ]
    const summary = {
      lectures: lectures.length,
      videos: lectures.reduce((acc, l) => acc + (l.videos || 0), 0),
      helpingContent: lectures.reduce((acc, l) => acc + (l.helpingContent || 0), 0),
      assignments: lectures.reduce((acc, l) => acc + (l.assignments || 0), 0),
      openQuiz: lectures.reduce((acc, l) => acc + (l.openQuiz || 0), 0),
    }
    data = { meta, lectures, summary }
  }

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
        <div className="brand"><div className="logo-mark">MOOC's</div><div className="hamburger" /></div>
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
              // { label: 'Live Class', center: true },
              // { label: 'Recorded Class', center: true },
            ]} />
              {/* <div className="stats-2">
                <div className="stat center">
                  <span>Live Class</span>
                  <div className="stat-links">
                    <a className="micro-link" href="#" data-join-url="">Live Class 1</a>
                    <a className="micro-link" href="#" data-join-url="">Live Class 2</a>
                  </div>
                </div>
                <div className="stat center">
                  <span>Recorded Class</span>
                  <div className="stat-links">
                    <a className="micro-link" href="#" data-record-url="">Recorded 1</a>
                    <a className="micro-link" href="#" data-record-url="">Recorded 2</a>
                  </div>
                </div>
              </div> */}
            <PageCard className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Lecture Name</th>
                      <th>Subject</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Date</th>
                      <th>Join</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>John</td>
                      <td>English</td>
                      <td>9.00</td>
                      <td>1.00</td>
                      <td>20.10.2023</td>
                      <td><a className="as-link" href="#" data-join-url="">Join Now</a></td>
                    </tr>
                    <tr>
                      <td>Doe</td>
                      <td>Programming</td>
                      <td>9.00</td>
                      <td>1.00</td>
                      <td>21.10.2023</td>
                      <td><a className="as-link" href="#" data-join-url="">Join Now</a></td>
                    </tr>
                    <tr>
                      <td>Sam</td>
                      <td>Database</td>
                      <td>9.00</td>
                      <td>1.00</td>
                      <td>22.10.2023</td>
                      <td><a className="as-link" href="#" data-join-url="">Join Now</a></td>
                    </tr>
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
            <PageCard className="settings-box"><h2>Accounts Settings</h2><p>Change Password (Connect to your domain administrator)       --{'>'} email at (admin@pucit.edu.pk)</p></PageCard>
          </ShellLayout>
        }
      />
      <Route path="/vr" element={<ShellLayout title="VR"><PageCard className="vr-box"><a className="as-link" href="/vr/1.html" target="_blank" rel="noreferrer">Go to VR Mode</a></PageCard></ShellLayout>} />
    </Routes>
  )
}

export default App
