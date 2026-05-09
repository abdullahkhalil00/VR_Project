import { useState } from 'react'
import './Signup.css'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../firebase'

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', agree: false })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Please enter your full name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    if (!form.agree) e.agree = 'You must accept Terms & Privacy'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    ;(async () => {
      setLoading(true)
      setErrors((prev) => ({ ...prev, form: undefined }))
      try {
        await signUp({ email: form.email, password: form.password, displayName: form.username })
        navigate('/dashboard')
      } catch (err) {
        console.error('Signup error', err)
        // Map common Firebase auth error codes to friendly messages
        const code = err?.code || ''
        let message = err?.message || 'Signup failed'
        switch (code) {
          case 'auth/email-already-in-use':
            message = 'This email is already in use.'
            break
          case 'auth/invalid-email':
            message = 'The email address is invalid.'
            break
          case 'auth/weak-password':
            message = 'The password is too weak (min 6 characters).' 
            break
          case 'auth/operation-not-allowed':
            message = 'Email/password sign-in is disabled in the Firebase Console.'
            break
          case 'auth/network-request-failed':
            message = 'Network error. Check your connection and try again.'
            break
        }
        setErrors((prev) => ({ ...prev, form: message }))
      } finally {
        setLoading(false)
      }
    })()
  }

  const strength = () => {
    let s = 0
    if (form.password.length >= 8) s++
    if (/[A-Z]/.test(form.password)) s++
    if (/[0-9]/.test(form.password)) s++
    if (/[^A-Za-z0-9]/.test(form.password)) s++
    return s
  }

  return (
    <form className="signup-form" onSubmit={onSubmit} noValidate>
      <div className="input-row">
        <label className="field-label">Full name</label>
        <input className="field" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Jane Doe" />
        {errors.username && <div className="field-error">{errors.username}</div>}
      </div>

      <div className="input-row">
        <label className="field-label">Email</label>
        <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>

      <div className="input-row">
        <label className="field-label">Password</label>
        <div className="pw-wrap">
          <input className="field" type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a strong password" />
          <button type="button" className="show-btn" onClick={() => setShowPw((s) => !s)}>{showPw ? 'Hide' : 'Show'}</button>
        </div>
        <div className="pw-strength">
          <div className={`strength-bars s${strength()}`}>
            <span />
            <span />
            <span />
            <span />
          </div>
          <small className="hint">Use 8+ characters, mix uppercase, numbers & symbols</small>
        </div>
        {errors.password && <div className="field-error">{errors.password}</div>}
      </div>

      <div className="input-row">
        <label className="field-label">Confirm password</label>
        <input className="field" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Re-type password" />
        {errors.confirm && <div className="field-error">{errors.confirm}</div>}
      </div>

      <label className="row agree-row"><input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} />
        <span className="agree-text">I agree to the <Link to="/terms">Terms & Privacy</Link></span>
      </label>
      {errors.agree && <div className="field-error">{errors.agree}</div>}

      <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      {errors.form && <div className="field-error">{errors.form}</div>}

      <div className="alt">
        <span>Or sign up with</span>
        <div className="socials">
          <button type="button" className="btn-outline">Google</button>
          <button type="button" className="btn-outline">Microsoft</button>
        </div>
      </div>
    </form>
  )
}
