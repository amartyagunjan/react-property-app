import React from 'react'
import { Navigate, Outlet } from 'react-router';
import { UseAuthStatus } from '../hooks/UseAuthStatus'
import Spinner from './Spinner';

export default function PrivateRoute() {
      const { loggedIn, checkingStatus } = UseAuthStatus();
      if (checkingStatus == true) {
            return (<Spinner />)
      }
      return (
            loggedIn == true ? <Outlet /> : <Navigate to='/sign-in' />
      )
}
