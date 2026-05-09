import { useState } from 'react'
import './Signup.css'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../firebase'

export default function Signin() {
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address'
    if (!form.password) e.password = 'Please enter your password'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})
    try {
      await signIn({ email: form.email, password: form.password })
      navigate('/dashboard')
    } catch (err) {
      const code = err?.code
      let message = err?.message || 'Sign in failed'
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password') message = 'Invalid email or password.'
      if (code === 'auth/invalid-email') message = 'The email address is invalid.'
      setErrors({ form: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="signup-form" onSubmit={onSubmit} noValidate>
      <div className="input-row">
        <label className="field-label">Email</label>
        <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>

      <div className="input-row">
        <label className="field-label">Password</label>
        <input className="field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" />
        {errors.password && <div className="field-error">{errors.password}</div>}
      </div>

      <label className="row agree-row"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
        <span className="agree-text">Remember my preference</span>
      </label>

      <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
      {errors.form && <div className="field-error">{errors.form}</div>}

    
    </form>
  )
}
