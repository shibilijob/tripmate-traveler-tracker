import React, { useState } from 'react'
import { FaEnvelope, FaEye, FaEyeSlash, FaFacebook, FaGoogle, FaLock } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import API from '../../api/AUTH_API'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../../redux/slices/authSlice'


function Login() {
    const[formData,setFormData]=useState({
        email:'',
        password:''
    })
    const[error,setError]=useState('')
    const[loading,setLoading]=useState(false)
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate=useNavigate()
    function handleChange(e){
        setError('')
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }
    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            return setError('fill all fields')
        }
        try {
            setLoading(true)
            setError('')
            const { data } = await API.post('/login', formData)
            
            // 1. Save to Redux
            dispatch(loginSuccess(data.userData));

            // 2. CHECK FOR PENDING JOIN CODE
            const pendingCode = localStorage.getItem('pendingJoinCode');

            if (data.userData.role === "admin") {
                navigate("/admin");
                toast.success('logged in to admin page');
            } else if (pendingCode) {
                // If there's a code waiting, go to the join link instead of home
                localStorage.removeItem('pendingJoinCode'); // Clear it so it doesn't happen again
                navigate(`/join/${pendingCode}`);
                toast.success('Login success! Joining your trip...');
            } else {
                // Normal user login
                navigate("/");
                toast.success('login success');
            }

        } catch (error) {
            setError('invalid credentials')
        } finally {
            setLoading(false)
        }
    }
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#11889c] via-[#0f6f80] to-orange-500'>
        <div className='bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] w-full max-w-md border border-white/20'>
            <h2 className='text-3xl font-bold text-white text-center mb-6'>Welcome Back</h2>
            {error && (<p className="text-red-400 text-center mb-4">{error}</p>)}
            <form onSubmit={handleSubmit} className='space-y-5'>
                <div className='flex items-center rounded-lg bg-white/20 px-3'>
                    <FaEnvelope className="text-white mr-2" />
                    <input 
                    type="email" 
                    name="email" 
                    placeholder='Email'
                    className='w-full p-3 bg-transparent outline-none text-white placeholder-white/70'
                    value={formData.email}
                    onChange={handleChange}
                    />
                </div>
                <div className='relative flex items-center rounded-lg bg-white/20 px-3'>
                    <FaLock className="text-white mr-2" />
                    <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        placeholder='Password'
                        className='w-full p-3 bg-transparent outline-none text-white placeholder-white/70'
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <span
                        className="absolute right-3 cursor-pointer text-white/70"
                        onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                <div className="flex justify-end items-center text-sm mb-5">
                    <span className="text-orange-500 cursor-pointer hover:underline hover:text-orange-600"
                    onClick={()=>navigate('/forgot_password')}
                    >
                        Forgot password?
                    </span>
                </div>
                <button
                    type='submit'
                    disabled={loading}
                    className={`${
                        loading ? "bg-orange-300 cursor-not-allowed" : "bg-gradient-to-r from-red-400 to-orange-400 hover:scale-[1.02] active:scale-[0.98]"
                    } transition duration-300 text-white font-semibold rounded-lg w-full py-3`}
                    >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {/* DIVIDER */}
            <div className="flex items-center gap-2 my-6">
                <div className="flex-1 h-[1px] bg-white/30"></div>
                <span className="text-sm text-white/70">or</span>
                <div className="flex-1 h-[1px] bg-white/30"></div>
            </div>

            {/* SOCIAL LOGIN */}
            <div className="flex gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/20 cursor-pointer hover:bg-white/30 transition">
                    <FaGoogle /> Continue with Google
                </button>
            </div>

            <p
            className='text-white/80 text-center mt-6'
            >Don't have an account? {' '}
                <span
                className='text-orange-400 cursor-pointer hover:underline'
                onClick={()=>navigate('/register')}>
                    Register
                </span>
            </p>
        </div>
    </div>
  )
}

export default Login