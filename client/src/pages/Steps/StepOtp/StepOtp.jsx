import React, { useState } from 'react';
import Card from '../../../components/shared/Card/Card';
import TextInput from '../../../components/shared/TextInput/TextInput';
import Button from '../../../components/shared/Button/Button';
import styles from './StepOtp.module.css';
import { verifyOtp } from '../../../http';
import { useSelector } from 'react-redux';
import { setAuth } from '../../../store/authSlice';
import { useDispatch } from 'react-redux';
import {toast} from "react-toastify"
import Loader from '../../../components/shared/Loader/Loader';

const StepOtp = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { email, hash } = useSelector((state) => state.auth.otp);
    async function submit() {
        if (!otp || !email || !hash) {
            return toast.info("Please enter your otp code.")
        }
        try {
            setLoading(true)
            const { data } = await verifyOtp({ otp, email, hash });
            toast.success("Otp Verification Successfull.")
            dispatch(setAuth(data));
        } catch (err) {
            setLoading(false)
            toast.error(err.response.data.message)
        }
    }
    return ( loading ? (<Loader message='Loading, please wait...' />) :
        <>
            <div className="CardCenter">
                <Card
                    title="Enter the code we just texted you"
                    icon="lock-emoji"
                >
                    <div className={styles.inputWrap}>
                    <TextInput
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="0000"
                        maxLength="4"
                    />
                    </div>
                    <div className={styles.actionButtonWrap}>
                        <Button onClick={submit} text="Next" />
                    </div>
                    <p className={styles.bottomParagraph}>
                        By entering your number, you’re agreeing to our Terms of
                        Service and Privacy Policy. Thanks!
                    </p>
                </Card>
            </div>
        </>
    );
};

export default StepOtp;
