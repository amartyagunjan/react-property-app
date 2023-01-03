import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

export default function SignIn() {
  const auth = getAuth();
  const navigate = useNavigate();

  const [formData, setformData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData

  const onChange = (e) => {
    setformData((ps) => ({
      ...ps,
      [e.target.id]: e.target.value
    })
    )
    // console.log(formData)
  } 

  const SignInHandler = async (e) => {
    // e.currentTarget.disabled = true;
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log(userCredential.user)
      toast.success('Signed In Successful')
      navigate('/')
    } catch (error) {
      toast.error(error.message)      
    }
  }


  return (
    <section className='top-20 relative'>
      <h1 className='text-center font-semibold text-3xl m-3'>Sign In</h1>
      <div className='flex flex-col w-6/12 m-auto relative align-middle pt-20'>
        <input id='email' value={formData.email} onChange={(e) => { onChange(e) }} type={'email'} placeholder='Email' className='my-top-5 p-3 rounded' ></input>
        <input id='password' value={formData.password} onChange={(e) => { onChange(e) }} type={'password'} placeholder='Password' className='my-5 p-3 rounded'></input>
        <button className='bg-blue-700 p-3 rounded uppercase text-white text-sm font-semibold' onClick={(e) => SignInHandler(e)}>Sign in</button>

      </div>
    </section>
  )
}
