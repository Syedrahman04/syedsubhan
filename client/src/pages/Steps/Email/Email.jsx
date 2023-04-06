import React, { useState } from 'react';
import Card from '../../../components/shared/Card/Card';
import styles from "./Email.module.css";
import Button from '../../../components/shared/Button/Button';
import { sendOtp } from "../../../http";
import { useDispatch } from "react-redux";
import { setOtp } from "../../../store/authSlice";
import Loader from '../../../components/shared/Loader/Loader';
import {toast} from "react-toastify"

const Otp = ({onNext}) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {    
    if(!email) {
      return toast.info("Please enter a valid email.")
    };
    const mailFormat =  /\S+@\S+\.\S+/;
    if(!mailFormat.test(email)){
      return toast.error("Please enter a valid email.")
    }
    // server request
   try{
    setLoading(true);
    const {data} = await sendOtp({email: email});
    toast.success("Verification code send successfully.")
    dispatch(setOtp({email: data.email, hash: data.hash}));
    setLoading(false);
    onNext();
   }catch(err){
    toast.info(err.response.data.message)
    setLoading(false);
   }

  }

  return ( loading ? (<Loader message='Loading, please wait...' />) :
    <div className='CardCenter'>
      <Card title="Enter your email id" icon="email">
    <input type="email"
    placeholder='shakilmh626@gmail.com'
    className={styles.input}
    value={email}
    onChange={(e)=> setEmail(e.target.value)}
    />
    <Button text="Next" icon="arrow-forward" onClick={submit}/>
    <p className={styles.paragraph}>By entering email address, you’re agreeing to our <br/>Terms of Service and Privacy Policy. Thanks!</p>

  </Card>
    </div>
  )
}

export default Otp;