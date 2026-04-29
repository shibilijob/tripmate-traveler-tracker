import { useState } from 'react'
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AUTH_API from '../../api/AUTH_API'

function ForgotPassword() {
  const [step, setStep] = useState(1) // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Step 1 — Send OTP
  async function handleSendOTP() {
    if (!email) return setError('Enter your email')
    try {
      setLoading(true)
      await AUTH_API.post('/forgot_password', { email })
      toast.success('OTP sent to your email')
      setStep(2)
    } catch {
      setError('Email not found')
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — Verify OTP
  async function handleVerifyOTP() {
    if (!otp) return setError('Enter OTP')
    try {
      setLoading(true)
      await AUTH_API.post('/verify_otp', { email, otp })
      toast.success('OTP verified')
      setStep(3)
    } catch {
      setError('Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 3 — Reset Password
  async function handleResetPassword() {
    if (!newPassword) return setError('Enter new password')
    try {
      setLoading(true)
      await AUTH_API.post('/reset_password', { email, otp, newPassword })
      toast.success('Password reset successful!')
      navigate('/login')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#11889c] via-[#0f6f80] to-orange-500'>
      <div className='bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] w-full max-w-md border border-white/20'>

        <h2 className='text-3xl font-bold text-white text-center mb-2'>
          {step === 1 && 'Forgot Password'}
          {step === 2 && 'Verify OTP'}
          {step === 3 && 'New Password'}
        </h2>
        <p className='text-white/60 text-center text-sm mb-6'>
          {step === 1 && 'Enter your email to receive an OTP'}
          {step === 2 && `OTP sent to ${email}`}
          {step === 3 && 'Set your new password'}
        </p>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        {/* Step 1 - Email */}
        {step === 1 && (
          <div className='flex items-center rounded-lg bg-white/20 px-3 mb-5'>
            <FaEnvelope className="text-white mr-2" />
            <input
              type="email"
              placeholder="Enter your email"
              className='w-full p-3 bg-transparent outline-none text-white placeholder-white/70'
              value={email}
              onChange={(e) => { setError(''); setEmail(e.target.value) }}
            />
          </div>
        )}

        {/* Step 2 - OTP */}
        {step === 2 && (
          <div className='flex items-center rounded-lg bg-white/20 px-3 mb-5'>
            <FaKey className="text-white mr-2" />
            <input
              type="text"
              placeholder="Enter OTP"
              className='w-full p-3 bg-transparent outline-none text-white placeholder-white/70'
              value={otp}
              onChange={(e) => { setError(''); setOtp(e.target.value) }}
            />
          </div>
        )}

        {/* Step 3 - New Password */}
        {step === 3 && (
          <div className='flex items-center rounded-lg bg-white/20 px-3 mb-5'>
            <FaLock className="text-white mr-2" />
            <input
              type="password"
              placeholder="New Password"
              className='w-full p-3 bg-transparent outline-none text-white placeholder-white/70'
              value={newPassword}
              onChange={(e) => { setError(''); setNewPassword(e.target.value) }}
            />
          </div>
        )}

        <button
          onClick={step === 1 ? handleSendOTP : step === 2 ? handleVerifyOTP : handleResetPassword}
          disabled={loading}
          className={`${loading ? "bg-orange-300 cursor-not-allowed" : "bg-gradient-to-r from-red-400 to-orange-400 hover:scale-[1.02] active:scale-[0.98]"} transition duration-300 text-white font-semibold rounded-lg w-full py-3`}
        >
          {loading ? 'Please wait...' : step === 1 ? 'Send OTP' : step === 2 ? 'Verify OTP' : 'Reset Password'}
        </button>

        <p className='text-white/80 text-center mt-6'>
          Back to{' '}
          <span className='text-orange-400 cursor-pointer hover:underline' onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword