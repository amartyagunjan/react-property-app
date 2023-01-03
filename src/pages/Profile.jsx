
import { signOut, getAuth, updateProfile } from 'firebase/auth';
import { updateDoc, doc, collection, orderBy, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import { db } from '../Firebase';
import { FcHome } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import { connectStorageEmulator } from 'firebase/storage';

export default function Profile() {

  const auth = getAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
  });
  const [changeDetails, setChangeDetails] = useState(false);

  const { name, email } = formData;



  const inputHandler = (e) => {
    setFormData((ps) => ({
      ...ps,
      [e.target.id]: e.target.value,
    }))
  }

  const nameEditHandler = async (e) => {
    e.preventDefault();

    try {
      if (auth.currentUser.displayName !== name) {

        // update display name in firebase auth
        await updateProfile(auth.currentUser, {
          displayName: name,
        })

        // update name in firestore
        const docRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(docRef, {
          name,
        })
      }
      toast.success("profile updated!")
    } catch (error) {
      toast.error(error.message)
    }
    console.log('Name edit button clicked!')
  }

  const signOutHandler = async (e) => {
    console.log('Logout button clicked!')
    e.preventDefault();
    try {
      await signOut(auth);
      if (auth.currentUser == null) toast.success('Signed Out Successful')
      navigate('/')
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    async function fetchuserListings() {
      const listingRef = collection(db, "listings")
      const q = query(
        listingRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timeStamp', )
      );
      const querySnap = await getDocs(q);
      console.log(querySnap)
      let listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id : doc.id,
          data : doc.data()
        });
      })
      setListings(listings)
      setLoading(false)
      console.log(listings)
    }
    fetchuserListings();
  }, [auth.currentUser.uid]);



  const onDelete = async (listingId) => {
    if(window.confirm("Are you sure want to delete?")){
      await deleteDoc(doc(db, 'listings', listingId))
      const updatedListings = listings.filter((listing) => {
          return listing.id != listingId;
      })
      setListings(updatedListings)
      toast.success('Listing is deleted!')
    }
  }

  const onEdit = (listingId) => {
    navigate(`/edit-listing/${listingId}`)
  }


  return (
    <>
       <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
      <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
        <div className='flex flex-col justify-center items-center p-5 w-full md:w-1/2 '>
          <input id='name' type='text' value={name} className='w-full rounded mb-5 p-3 bg-white focus:bg-red-600' onChange={(e) => { inputHandler(e) }} disabled={!changeDetails}></input>
          <input id='email' type='email' value={email} className='w-full rounded p-3 bg-white focus:bg-red-600' onChange={(e) => { inputHandler(e) }} disabled></input>
        </div>
        <div className='w-full md:w-1/2 flex justify-between px-5    text-sm md:text-base'>
          <p>Do you want to edit your name?
            <span className='ml-1 text-red-500 font-medium cursor-pointer' onClick={(e) => {
              changeDetails && nameEditHandler(e)
              setChangeDetails((prevState) => !prevState);
            }}>{
                changeDetails === false ? 'Edit' : 'Apply Changes'
              }</span>
          </p>
          <p className='text-red-500 font-medium cursor-pointer' onClick={(e) => { signOutHandler(e) }}>Signout</p>
        </div>
        <button
            type="submit"
            className="w-1/2 mt-5 bg-blue-600 text-white uppercase px-7 py-3 text-sm font-medium rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
          
          >
            <Link
              to="/create-listing"
              className="flex justify-center items-center"
            >
              <FcHome className="mr-2 text-3xl bg-red-200 rounded-full p-1 border-2" />
              Sell or rent your home
            </Link>
          </button>

      </section>

      <div  className="max-w-6xl px-3 mt-6 mx-auto">
        {!loading && listings.length > 0 && (
          <>
          <h2 className="text-2xl text-center font-semibold mb-6">
              My Listings
            </h2>
            <ul className="sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                  onEdit = {() => {onEdit(listing.id)}}
                  onDelete = {() => {onDelete(listing.id)}}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
