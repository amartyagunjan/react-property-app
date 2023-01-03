import React, { useState, useEffect } from 'react'
import capture from '../Capture.JPG';
import { useLocation, useNavigate } from 'react-router';
// import { UseAuthStatus } from '../hooks/UseAuthStatus';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { Link } from 'react-router-dom';

export default function Header() {
      const [pageState, setPageState] = useState("Sign in");
      // const {loggedIn, checkingStatus} = UseAuthStatus();
      const auth = getAuth();
      const location = useLocation();
      const navigate = useNavigate();
      function pathMatchRoute(route) {
            if (route === location.pathname) {
                  return true;
            }
      }

      useEffect(() => {
             onAuthStateChanged(auth, (user) => {
                  if(user){
                        setPageState("Profile")
                  }
                  else{
                        setPageState("Sign in")
                  }     
            })
      }, [auth])

      // console.log(location)
      return (
            <div className='bg-orange-400 border-b shadow-sm sticky w-full top-0 z-40'>
                  <header className="flex justify-between items-center px-3 first-letter max-w-6xl mx-auto">
                        <div>
                              <img src={capture} alt='' className='h- cursor-pointer' onClick={() => navigate("/")}></img>

                        </div>
                        <div >
                              <ul className='flex space-x-7'>
                                    <li className={`cursor-pointer py-3 text-sm font-semibold text-white border-b-[3px] border-b-transparent ${pathMatchRoute("/") && "text-black border-b-red-500"
                                          }`}
                                          onClick={() => navigate("/")}>Home</li>
                                    <li className={`cursor-pointer py-3 text-sm font-semibold text-white border-b-[3px] border-b-transparent ${pathMatchRoute("/offers") && "text-black border-b-red-500"
                                          }`}
                                          onClick={() => navigate("/offers")}>Offers</li>
                                    <li className={`cursor-pointer py-3 text-sm font-semibold text-white border-b-[3px] border-b-transparent ${(pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) && "text-black border-b-red-500"
                                          }`}
                                          onClick={() => {pageState === 'Profile' ? navigate('/profile') : navigate('/sign-in')} }>{pageState}</li>
                              </ul>
                        </div>
                  </header>
            </div>
      )
}

