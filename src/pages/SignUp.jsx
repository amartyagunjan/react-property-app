import React, { useState } from 'react'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { async } from '@firebase/util';
import { serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '../Firebase';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

// import { GoogleAuthProvider } from "firebase/auth";



import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";



export default function SignUp() {
  const [formData, setformData] = useState({
    email: '',
    name: '',
    password: ''
  });

  const provider = new GoogleAuthProvider();

  const auth = getAuth();

  const navigate = useNavigate();

  const { email, name, password } = formData;

  const onChange = (e) => {
    setformData((ps) => ({
      ...ps,
      [e.target.id]: e.target.value
    })
    )
    // console.log(formData)
  }

  const onSubmit = async (e) => {
    e.currentTarget.disabled = true;
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // console.log(user);
      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timeStamp = serverTimestamp();
      await setDoc(doc(db, "users", user.uid), formDataCopy)
      toast.success('Sign up successful')
      navigate('/')

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  const googleButtonClick = async (e) => {
    e.preventDefault();
    e.currentTarget.disabled = true;
    await signInWithPopup(auth, provider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        try {
          const formDataCopy = { name : user.displayName, timeStamp: serverTimestamp() };
          await setDoc(doc(db, "users", user.uid), formDataCopy)
        } catch (error) {
          toast.error(error.message)
        }
        navigate('/',)
        console.log(user);
        toast.success('GAuth Successful!')
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        toast.error(errorMessage);
        // ...
      });
  }

  return (
    <section className='top-20 relative'>
      <h2 className='text-center text-3xl mt-3' >SIGN UP</h2>
      <div className='flex flex-col w-6/12 m-auto  align-middle pt-20'>
        <input id='email' value={formData.email} onChange={(e) => { onChange(e) }} type={'email'} placeholder={'Email'} className='rounded p-3' ></input>
        <input id='name' value={formData.name} onChange={(e) => { onChange(e) }} type={'name'} placeholder={'Name'} className='my-5 p-3 rounded' ></input>
        <input id='password' value={formData.password} onChange={(e) => { onChange(e) }} type={'password'} placeholder={'Password'} className='mb-5 p-3 rounded'></input>
        <button className='text-white font-medium text-sm p-3 rounded uppercase bg-blue-700 mb-5' onClick={(e) => { onSubmit(e) }}  > Sign up</button>
        <button className='text-white font-medium text-sm p-3 rounded uppercase bg-blue-700' onClick={(e) => { googleButtonClick(e) }}  >Google Sign Up</button>
      </div>
    </section>
  )
}
