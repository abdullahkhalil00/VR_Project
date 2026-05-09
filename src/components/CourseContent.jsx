import { useState } from 'react'
import { Link } from 'react-router-dom'
import './CourseContent.css'

const TAB_KEYS = /** @type {const} */ (['attachments', 'assignments', 'quiz'])

const TAB_LABEL = { attachments: 'Attachments', assignments: 'Assignments', quiz: 'Quiz' }

function IconMonitor() {
  return (
    <svg className="course-content__icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

function IconPlay() {
  return (
    <svg className="course-content__icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path fill="currentColor" stroke="none" d="M10 9l7 3-7 4z" />
    </svg>
  )
}

function IconDoc() {
  return (
    <svg className="course-content__icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M7 4h8l4 4v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path d="M14 4v5h5" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg className="course-content__icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  )
}

function IconQuiz() {
  return (
    <svg className="course-content__icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="7" cy="8" r="2" />
      <path d="M9 8h10M9 8l2 13M17 21l2-13" />
    </svg>
  )
}

function Chevron({ open }) {
  return (
    <span className={`course-content__chevron${open ? ' course-content__chevron--open' : ''}`} aria-hidden>
      ›
    </span>
  )
}

export default function CourseContent({ data }) {
  const { meta, lectures, summary } = data
  const [openId, setOpenId] = useState(lectures[0]?.id ?? null)
  /** @type {Record<string, 'attachments' | 'assignments' | 'quiz'>} */
  const [tabs, setTabs] = useState({})
  /** @type {Record<string, boolean>} */
  const [descExpanded, setDescExpanded] = useState({})

  function lectureTab(id) {
    return tabs[id] ?? 'attachments'
  }

  function setLectureTab(id, tab) {
    setTabs((prev) => ({ ...prev, [id]: tab }))
  }

  function toggleDesc(id) {
    setDescExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="course-content">
      <div className="course-content__toolbar">
        <Link to={`/my-courses?batch=${data.meta.batchId ?? '1'}`} className="course-content__back">
          ← Back to My Courses
        </Link>
      </div>
      <div className="course-content__grid">
        <div className="course-content__main">
          {lectures.map((lec) => {
            const isOpen = openId === lec.id
            const tab = lectureTab(lec.id)
            const fullDesc = String(lec.description || '')
            const expanded = !!descExpanded[lec.id]
            const showToggle = fullDesc.trim().length > 200

            return (
              <article key={lec.id} className={`course-content__accordion${isOpen ? ' course-content__accordion--open' : ''}`}>
                <button
                  type="button"
                  className="course-content__acc-head"
                  onClick={() => setOpenId((prev) => (prev === lec.id ? null : lec.id))}
                  aria-expanded={isOpen}
                >
                  <Chevron open={isOpen} />
                  <div className="course-content__acc-head-main">
                    <div className="course-content__acc-title">{lec.title}</div>
                    <div className="course-content__counts">
                      <span>Helping content: {lec.helpingContent ?? 0}</span>
                      <span>Videos: {lec.videos ?? 0}</span>
                      <span>Assignments: {lec.assignments ?? 0}</span>
                      <span>Open Quiz: {lec.openQuiz ?? 0}</span>
                    </div>
                  </div>
                </button>
                {isOpen ? (
                  <div className="course-content__acc-body">
                    <p className="course-content__field">
                      <span className="course-content__label">Lecture Name:</span>{' '}
                      {lec.title}
                    </p>
                    <div className="course-content__desc-block">
                      <span className="course-content__label">Description:</span>
                      <div className={`course-content__desc${!expanded && showToggle ? ' course-content__desc--clamp' : ''}`}>
                        {fullDesc.split(/\n\n+/).map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                      {showToggle ? (
                        <button type="button" className="course-content__see-more" onClick={() => toggleDesc(lec.id)}>
                          {expanded ? 'See Less' : 'See More'}
                        </button>
                      ) : null}
                    </div>
                    <div className="course-content__tabs" role="tablist">
                      {TAB_KEYS.map((key) => (
                        <button
                          key={key}
                          type="button"
                          role="tab"
                          aria-selected={tab === key}
                          className={`course-content__tab${tab === key ? ' course-content__tab--active' : ''}`}
                          onClick={() => setLectureTab(lec.id, key)}
                        >
                          {TAB_LABEL[key]}
                        </button>
                      ))}
                    </div>
                    <div className="course-content__tab-panel" role="tabpanel">
                      {tab === 'attachments' ? (
                        <ul className="course-content__attach-list">
                          {(lec.attachments || []).length ? (
                            (lec.attachments || []).map((a) => (
                              <li key={a.id} className="course-content__attach-card course-content__attach-card--video">
                                <div className="course-content__thumb">
                                  <img src={a.thumb} alt="" loading="lazy" />
                                </div>
                                <p className="course-content__attach-title">{a.title}</p>
                              </li>
                            ))
                          ) : (
                            <p className="course-content__empty">No attachments for this lecture.</p>
                          )}
                        </ul>
                      ) : null}
                      {tab === 'assignments' ? (
                        <ul className="course-content__list-plain">
                          {(lec.assignmentItems || []).length ? (
                            (lec.assignmentItems || []).map((x) => (
                              <li key={x.id} className="course-content__row-item">
                                <strong>{x.title}</strong>
                                {x.due ? <span className="course-content__muted">{x.due}</span> : null}
                              </li>
                            ))
                          ) : (
                            <p className="course-content__empty">No assignments for this lecture.</p>
                          )}
                        </ul>
                      ) : null}
                      {tab === 'quiz' ? (
                        <ul className="course-content__list-plain">
                          {(lec.quizItems || []).length ? (
                            (lec.quizItems || []).map((x) => (
                              <li key={x.id} className="course-content__row-item">
                                <strong>{x.title}</strong>
                                {x.questionCount != null ? (
                                  <span className="course-content__muted">{x.questionCount} questions</span>
                                ) : null}
                              </li>
                            ))
                          ) : (
                            <p className="course-content__empty">No quizzes for this lecture.</p>
                          )}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
        <aside className="course-content__aside">
          <div className="course-content__summary-card">
            <h2 className="course-content__summary-title">Courses Content Summary</h2>
            <ul className="course-content__summary-list">
              <li>
                <IconMonitor /> <span>Lectures</span> <strong>{summary.lectures}</strong>
              </li>
              <li>
                <IconPlay /> <span>Videos</span> <strong>{summary.videos}</strong>
              </li>
              <li>
                <IconDoc /> <span>Helping content</span> <strong>{summary.helpingContent}</strong>
              </li>
              <li>
                <IconCalendar /> <span>Assignments</span> <strong>{summary.assignments}</strong>
              </li>
              <li>
                <IconQuiz /> <span>Open Quiz</span> <strong>{summary.openQuiz}</strong>
              </li>
            </ul>
            <p className="course-content__module-note">
              {meta.label}: {meta.topic} · {meta.unit}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
