import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import React, { useState } from 'react'
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState;
  const auth = getAuth();

  const ForgotPasswordHandler = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset mail generated')
    } catch (error) {
      toast.error(error);
    }
  }

  return (
    <section>
      <h1 className='text-center font-semibold text-3xl m-3 uppercase'>Forgot Password</h1>
      <div className='flex flex-col w-6/12 m-auto relative align-middle pt-20'>
        <input id='email' value={email} onChange={(e) => { setEmail(e.target.value) }} type={'email'} placeholder='Email' className='my-top-5 p-3 rounded' ></input>
        <button className='bg-blue-700 p-3 rounded uppercase text-white text-sm font-semibold' onClick={(e) => ForgotPasswordHandler(e)}>Request Change Password</button>
      </div>
    </section>
  )
}
