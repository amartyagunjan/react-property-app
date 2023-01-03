import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { v4 as uuidv4 } from "uuid";
import { addDoc, doc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { useNavigate } from 'react-router';

export default function CreateListing() {
      const [user, setUser] = useState();
      const navigate = useNavigate();
      const auth = getAuth();
      const [geolocationEnabled, setGeolocationEnabled] = useState(false);
      const [loading, setLoading] = useState(false);
      const [formData, setFormData] = useState({
            type: "rent",
            name: "",
            bedrooms: 1,
            bathrooms: 1,
            parking: false,
            furnished: false,
            address: "",
            description: "",
            offer: false,
            regularPrice: 0,
            discountedPrice: 0,
            images: {}
      });
      const { type, name, bedrooms, bathrooms, parking, furnished, address, description, offer, regularPrice, discountedPrice, images } = formData;

      const onchange = (e) => {
            let boolean = null;
            if (e.target.value === 'true') {
                  boolean = true;
            }
            if (e.target.value === 'false') {
                  boolean = false;
            }

            // for files
            if (e.target.files) {
                  setFormData((ps) => ({
                        ...ps,
                        images: e.target.files
                  }))
            }
            // for input
            if (!e.target.files) {
                  setFormData((ps) => ({
                        ...ps,
                        [e.target.id]: boolean ?? e.target.value
                  }))
            }

      };

      const onSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            if (+regularPrice < +discountedPrice) {
                  console.log(regularPrice)
                  console.log(discountedPrice)
                  setLoading(false)
                  toast.error('Discounted price should be less than regular price.');
                  return
            }
            if (images.length > 6) {
                  setLoading(false)
                  toast.error('Maximum of 6 images are allowed to upload.');
                  return
            }

            let geolocation = {};
            if (geolocationEnabled === false) {
                  geolocation.lat = 200000
                  geolocation.long = 98898908
            }

            async function storeImage(image) {
                  return new Promise((resolve, reject) => {
                        const storage = getStorage();
                        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
                        const storageRef = ref(storage, fileName);
                        const uploadTask = uploadBytesResumable(storageRef, image);
                        uploadTask.on('state_changed',
                              (snapshot) => {
                                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                    console.log('Upload is ' + progress + '% done');
                                    switch (snapshot.state) {
                                          case 'paused':
                                                console.log('Upload is paused');
                                                break;
                                          case 'running':
                                                console.log('Upload is running');
                                                break;
                                    }
                              },
                              (error) => {
                                    reject(error)
                              },
                              () => {
                                    // Upload completed successfully, now we can get the download URL
                                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                          resolve(downloadURL);
                                    });
                              }
                        )
                  })
            }

            const imageUrls = await Promise.all([...images].map((image) => storeImage(image)))
                  .catch((error) => {
                        setLoading(false)
                        toast.error('Images not uploaded');
                        return
                  }
                  )

            const formDataCopy = {
                  ...formData,
                  imageUrls,
                  geolocation,
                  timeStamp: serverTimestamp(),
                  userRef : auth.currentUser.uid
            }
            // delete formDataCopy.address
            delete formDataCopy.images
            !offer && delete formDataCopy.discountedPrice

            try {
                  onAuthStateChanged(auth, (user) => {
                        if(user){
                              setUser(user);
                        }
                  })
                  const docRef = await addDoc(collection(db, 'listings'), formDataCopy);
                  setLoading(false);
                  toast.success('Listing Created');
                  navigate(`listings/${type}/${docRef.id}`)
            } catch (error) {
                  console.log(error);
                  toast.error(error.message);
            }

      }

      if (loading) {
            return <Spinner />;
      }

      return (
            <main className='max-w-lg mx-auto px-2 relative top-20 mb-5'>
                  {/* check why only top-20 is working */}
                  <h1 className='text-3xl text-center mt-6 font-bold'>Create a listing</h1>
                  <form onSubmit={onSubmit}>
                        <p className='text-lg mt-4 font-semibold'>Sell / Rent</p>
                        <div className='my-2 flex flex-row'>
                              <button type='button'
                                    id='type'
                                    value='sale'
                                    className={`px-7 py-3 mr-2 uppercase rounded font-medium text-sm shadow-md hover:shadow-lg focus:shadow-lg active:shadow-lg transaction duration-150 ease-in-out w-full ${type === 'rent' ? "bg-white" : "bg-slate-600  text-white"}`}
                                    onClick={onchange}>
                                    Sell
                              </button>
                              <button type='button'
                                    id='type'
                                    value='rent'
                                    className={`px-7 py-3 ml-2 uppercase rounded font-medium text-sm shadow-md hover:shadow-lg focus:shadow-lg active:shadow-lg transaction duration-150 ease-in-out w-full ${type === 'sale' ? "bg-white" : "bg-slate-600  text-white"}`}
                                    onClick={onchange}>
                                    Rent
                              </button>
                        </div>
                        <p className='text-lg mt-4 font-semibold'>Name</p>
                        <input type={'text'}
                              id='name' value={name}
                              placeholder='Name'
                              className='mt-2 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600'
                              maxLength={32}
                              required
                              onChange={onchange}
                        />
                        <div className='flex space-x-6 '>
                              <div>
                                    <p className='text-lg font-semibold mt-4'>Beds</p>
                                    <input id='bedrooms'
                                          type={'number'}
                                          value={bedrooms}
                                          required
                                          min='1'
                                          max='50'
                                          className='mt-2 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center'
                                          onChange={onchange}
                                    />
                              </div>
                              <div>
                                    <p className='text-lg font-semibold mt-4'>Baths</p>
                                    <input id='bedrooms'
                                          type={'number'}
                                          value={bathrooms}
                                          required
                                          min='1'
                                          max='50'
                                          className='mt-2 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center'
                                          onChange={onchange}

                                    />
                              </div>
                        </div>
                        <p className='text-lg mt-4 font-semibold'>Parking Spot</p>
                        <div className='my-2 flex flex-row'>
                              <button type='button'
                                    id='parking'
                                    value={true}
                                    className={`px-7 py-3 mr-2 uppercase rounded font-medium text-sm shadow-md hover:shadow-lg focus:shadow-lg active:shadow-lg transaction duration-150 ease-in-out w-full ${parking === false ? "bg-white" : "bg-slate-600  text-white"}`}
                                    onClick={onchange}>
                                    yes
                              </button>
                              <button type='button'
                                    id='parking'
                                    value={false}
                                    className={`px-7 py-3 ml-2 uppercase rounded font-medium text-sm shadow-md hover:shadow-lg focus:shadow-lg active:shadow-lg transaction duration-150 ease-in-out w-full ${parking === true ? "bg-white" : "bg-slate-600  text-white"}`}
                                    onClick={onchange}>
                                    No
                              </button>
                        </div>
                        <p className='text-lg mt-4 font-semibold'>Furnished</p>
                        <div className='my-2 flex flex-row'>
                              <button type='button'
                                    id='furnished'
                                    value={true}
                                    className={`px-7 py-3 mr-2 uppercase rounded font-medium text-sm shadow-md hover:shadow-lg focus:shadow-lg active:shadow-lg transaction duration-150 ease-in-out w-full ${furnished === false ? "bg-white" : "bg-slate-600  text-white"}`}
                                    onClick={onchange}>
                                    yes
                              </button>
                              <button type='button'
                                    id='furnished'
                                    value={false}
                                    className={`px-7 py-3 ml-2 uppercase rounded font-medium text-sm shadow-md hover:shadow-lg focus:shadow-lg active:shadow-lg transaction duration-150 ease-in-out w-full ${furnished === true ? "bg-white" : "bg-slate-600  text-white"}`}
                                    onClick={onchange}>
                                    No
                              </button>
                        </div>
                        <p className='text-lg mt-4 font-semibold'>Address</p>
                        <textarea id='address'
                              type="text"
                              value={address}
                              onChange={onchange}
                              placeholder='Address'
                              className='mt-2 h-28 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700  focus-bg-white focus:border-slate-600 '
                        />
                        <p className='text-lg mt-4 font-semibold'>Description</p>
                        <textarea id='description'
                              type="text"
                              placeholder='description'
                              value={description}
                              onChange={(e) => { onchange(e) }}
                              className='mt-2 h-28 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700  focus-bg-white focus:border-slate-600'
                        />
                        <p className='text-lg mt-4 font-semibold'>Offer</p>
                        <div className='my-2 flex flex-row'>
                              <button type='button'
                                    id='offer'
                                    value={true}
                                    className={`px-7 py-3 mr-2 uppercase rounded font-medium text-sm shadow-md hover:shadow-lg focus:shadow-lg active:shadow-lg transaction duration-150 ease-in-out w-full ${offer === false ? "bg-white" : "bg-slate-600  text-white"}`}
                                    onClick={onchange}>
                                    yes
                              </button>
                              <button type='button'
                                    id='offer'
                                    value={false}
                                    className={`px-7 py-3 ml-2 uppercase rounded font-medium text-sm shadow-md hover:shadow-lg focus:shadow-lg active:shadow-lg transaction duration-150 ease-in-out w-full ${offer === true ? "bg-white" : "bg-slate-600  text-white"}`}
                                    onClick={onchange}>
                                    No
                              </button>
                        </div>
                        <p className='text-lg font-semibold mt-4'>Regular Price</p>
                        <input id='regularPrice'
                              type={'number'}
                              value={regularPrice}
                              required
                              min='10'
                              max='50'
                              className='mt-2 w-1/3 px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center'
                              onChange={onchange}
                        />
                        {offer && (<p className='text-lg font-semibold mt-4'>Discounted Price</p>)}
                        {offer && ( <input id='discountedPrice'
                              type={'number'}
                              value={discountedPrice}
                              required
                              min='1'
                              max='50'
                              className='mt-2 w-1/3 px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center'
                              onChange={onchange}
                        />)}
                        <p className='text-lg font-semibold mt-4'>Images</p>
                        <p className='text-gray-700'>The first image will be the cover (max-6).</p>
                        <input id='images'
                              type={'file'}
                              accept='image/*'
                              required
                              min='1'
                              max='50'
                              multiple
                              className='mt-2 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center'
                              onChange={onchange}
                        />
                        <button type='submit' className='mt-12 mb-6 rounded w-full px-7 py-4 uppercase bg-blue-600 font-medium text-sm text-white shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out' >Create Listing</button>
                  </form>
            </main>
      )
}     
