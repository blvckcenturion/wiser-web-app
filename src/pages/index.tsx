import { AuthService } from '@/services/authService'
import { useFormik } from 'formik'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Notiflix from 'notiflix'
import { useRouter } from 'next/router'
import { UserResponse } from '@/types/auth'
import LogoSVG from '@/components/logoSVG'

export default function Home() {
  // State for showing login or signup form
  const [showLogin, setShowLogin] = useState(true)
  // Router for redirecting user
  const router = useRouter()

  useEffect(() => {
    (async () => { 
      // Check if user is already logged in and redirect to dashboard
      const token = await AuthService.getCredentials()
      // Redirect to dashboard if token is valid
      if (token !== null) {
        router.push('/dashboard')
      }
    })()
  }, [])

  // Formik form for login
  const loginForm = useFormik(
    {
      // Initial values for login form
      initialValues: {
        email: '',
        password: '',
      },
      // On submit function for login form
      onSubmit: async (values) => {
        
        try {
          // Login user using AuthService
          await AuthService.login(values.email, values.password)
          // Toast success message
          Notiflix.Notify.success("Logged in successfully");
          // Redirect to dashboard
          router.push('/dashboard')
        } catch (error: any) {
          // If error is from backend, show error response detail
          if (error.response) {
            // Toast error message
            Notiflix.Notify.failure(error.response.data.detail);
          } else {
            // Toast error message
            Notiflix.Notify.failure(error.message);
          }
        }
      }
    }
  )
  // Formik form for signup
  const signupForm = useFormik(
    {
      // Initial values for signup form
      initialValues: {
        email: '',
        password: '',
        confirmPassword: '',
      },
      // On submit function for signup form
      onSubmit: async (values) => {
        try {
          // Signup user using AuthService
          const user: UserResponse = await AuthService.signup(values.email, values.password, values.confirmPassword)
          if (user) {
            // Toast success message
            Notiflix.Notify.success("Signed up successfully, please log in to continue");
            // Redirect to login
            setShowLogin(true)
          }
        } catch (error: any) { 
          // If error is from backend, show error response detail
          if (error.response) {
            // Toast error message
            Notiflix.Notify.failure(error.response.data.detail);
          } else {
            // Toast error message
            Notiflix.Notify.failure(error.message);
          }
        }
      }
    }
  )

  return (
    <main className="index-page h-screen flex flex-col sm:flex-row overflow-hidden text-white">
      <div className="section-1 sm:w-1/2 w-full sm:h-full h-3/5 flex flex-col justify-end items-center text-center">
        <div className="section-1-heading flex flex-row items-center">
          <LogoSVG/>
          <h2 className="font-semibold text-3xl mt-4">Wiser</h2>
        </div>
        <div className="section-1-content flex-col h-5/6 flex items-center space-evenly  text-center">
            <h3 className="font-bold text-2xl mb-6">{showLogin ? "Log in" : "Sign up"} to the app</h3>
            <form onSubmit={showLogin ? loginForm.handleSubmit : signupForm.handleSubmit} className="space-y-4">
              <div className="flex flex-col space-y-5">
                <label htmlFor="email" className="text-lg">Email</label>
                <input className='text-black shadow p-2 rounded' type="email" name="email" id="email" value={showLogin ? loginForm.values.email : signupForm.values.email} onChange={showLogin ? loginForm.handleChange("email") : signupForm.handleChange("email")}/>
              </div>
              <div className="flex flex-col space-y-5">
                <label htmlFor="password" className="text-lg">Password</label>
                <input className='shadow text-black  p-2 rounded'  type="password" name="password" id="password" value={showLogin ? loginForm.values.password : signupForm.values.password} onChange={showLogin ? loginForm.handleChange("password") : signupForm.handleChange("password")}/>
              </div>
              {!showLogin && (
                <div className="flex flex-col space-y-5">
                  <label htmlFor="confirmPassword" className="text-lg">Confirm Password</label>
                  <input className='text-black shadow p-2 rounded' type="password" name="confirmPassword" id="confirmPassword" value={signupForm.values.confirmPassword} onChange={signupForm.handleChange("confirmPassword")} />
                </div>
              )}
              <div>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black py-2 px-4 rounded mt-4 transition duration-200 ease-in-out">
                  {showLogin ? "Log in" : "Sign up"}
                </button>
              </div>
            </form>
          <div className="mt-6 text-center">
            {showLogin ? (
              <p className="mb-2">Don't have an account?</p>
            ) : (
              <p className="mb-2">Already have an account?</p>
            )}
            <button onClick={() => setShowLogin(!showLogin)} className="bg-blue-500 hover:bg-blue-700 text-black py-2 px-4 rounded transition duration-200 ease-in-out">
              {showLogin ? "Create a new account" : "Log into an existing account"}
            </button>
          </div>
        </div>
      </div>
      <div className="section-2 sm:w-1/2 w-full sm:h-full h-2/5 flex justify-center items-center text-center bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-500 animate-gradient-x">
        <div className='mx-4 sm:w-5/10  section-2-content p-6 lg:p-12 bg-orange-200 rounded-lg max-w-md mx-auto text-center'>
          <h3 className="font-bold text-2xl mb-4">What is Wiser?</h3>
          <p>
            Wiser is a simple app that allows you to understand videos in a better way.
          </p>
        </div>
      </div>
    </main>
  )
}
