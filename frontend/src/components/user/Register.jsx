import React, { useState } from 'react'
import { FaEnvelope, FaGoogle, FaLock, FaUser } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../../redux/slices/authSlice'
import AUTH_API from '../../api/AUTH_API'
import { GoogleLogin } from '@react-oauth/google'

function Register() {
    const[formData,setFormData]=useState({
        userName:'',
        email:'',
        password:''
    })
    const[error,setError]=useState('')
    const[loading,setLoading]=useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate();
    function handleChange(e){
        setError('')
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const { data } = await AUTH_API.post('/google-login', { 
                token: credentialResponse.credential 
            });

            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            
            dispatch(loginSuccess(data.userData));
            toast.success("Registration successful");
            navigate('/');
        } catch (error) {
            console.error("Google Auth Error:", error);
            toast.error('Google registration failed');
        } finally {
            setLoading(false);
        }
    };

    async function handleSubmit(e){
        e.preventDefault()
        if(!formData.userName || !formData.email || !formData.password){
            return setError('please fill all fields')
        }
        if (formData.password.length < 6) {
            return setError("Password must be at least 6 characters");
        }

        try {
            setLoading(true)
            const {data} = await AUTH_API.post('/signup',formData)
            dispatch(loginSuccess(data.userData))
            toast.success("Register successful & logged in")
            setFormData({
                userName: "",
                email: "",
                password: "",
            });
            navigate('/')
        } catch (error) {
            setError("Registration failed")
        } finally {
            setLoading(false)
        }
        
    }
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#11889c] via-[#11889c] to-orange-500'>
        <div className='bg-white/10 backdrop-blur-lg w-full max-w-md rounded-xl p-8 shadow-xl border border-white/20'>
            <h2 className='text-3xl font-bold text-white text-center mb-6'>Create Account</h2>
            <p className='text-white/70 text-center mb-6 text-sm'>join your travel squad</p>
            {error && (<p className="text-red-400 text-center mb-4">{error}</p>)}
            <form onSubmit={handleSubmit} className='space-y-5'>
                <div className='flex items-center rounded-lg bg-white/20 px-3'>
                    <FaUser className="text-white mr-2" />
                    <input 
                    type="text" 
                    name="userName"
                    placeholder='User Name'
                    className='w-full p-3 bg-transparent outline-none text-white placeholder-white/70'
                    value={formData.userName}
                    onChange={handleChange}
                    />
                </div>
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
                <div className='flex items-center rounded-lg bg-white/20 px-3'>
                    <FaLock className="text-white mr-2" />
                    <input 
                    type="password" 
                    name="password"
                    placeholder='Password'
                    className='w-full p-3 bg-transparent outline-none text-white placeholder-white/70'
                    value={formData.password}
                    onChange={handleChange}
                    />
                </div>
                <button
                    type='submit'
                    disabled={loading}
                    className={`${
                        loading ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
                    } transition duration-300 text-white font-semibold rounded-lg w-full py-3`}
                    >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
            {/* DIVIDER */}
                        <div className="flex items-center gap-2 my-6">
                            <div className="flex-1 h-[1px] bg-white/30"></div>
                            <span className="text-sm text-white/70">or</span>
                            <div className="flex-1 h-[1px] bg-white/30"></div>
                        </div>
            
                        {/* 3. Updated Google Login Button */}
                        <div className="flex justify-center w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google Registration Failed')}
                                theme="filled_blue"
                                shape="pill"
                                text="signup_with"
                            />
                        </div>
            
        </div>
    </div>
  )
}

export default Register