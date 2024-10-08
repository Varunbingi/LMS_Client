import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import toast from "react-hot-toast"

import axiosInstance from "../../config/axiosInstance"

const initialState={
    key:'',
    subscription_id:'',
    isPaymentVerified:false,
    allPayments:{},
    finalMonths:{},
    monthlySalesRecord:{}
}
export const getRazorPayId=createAsyncThunk('/razorpay/getId',async()=>{
    try{
        const response=await axiosInstance.get('/payments/razorpay-key')
        return response.data
    }
    catch(e){
        toast.error("failed to load data")
    }
})
export const parchaseCourseBundle=createAsyncThunk('/parchasecourse',async()=>{
    try{
        const response=await axiosInstance.post('/payments/subscribe')
        return response.data
    }
    catch(e){
        toast.error(e?.response?.data?.message)
    }
})
export const cancleCourseBundle=createAsyncThunk('/payments/cancel',async()=>{
    try{
        const response=await axiosInstance.post('/payments/unsubscribe')
        toast.promise(response,{
            loading:"Unsubscribing the bundle",
            success:(data)=>{
                return data?.data?.message
            },
            error:"Failed to unsubscribe "
             })
        return (await response).data
    }
    catch(e){
        toast.error(e?.response?.data?.message)
    }
})
export const verifyUserPayment = createAsyncThunk("/payments/verify", async (data) => {
    try {
        const response = await axiosInstance.post("/payments/verify", {
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_subscription_id: data.razorpay_subscription_id,
            razorpay_signature: data.razorpay_signature
        });
        return response.data;
    } catch(error) {
        console.error("Error occurred while verifying user payment:", error); // Log the error for debugging
        toast.error("An error occurred while verifying payment. Please try again later.");
        throw error; // Rethrow the error to propagate it upwards if needed
    }
});

export const getPaymentRecord=createAsyncThunk('/payments/record',async()=>{
    try{
        const response=axiosInstance.get('/payments?count=100')
        toast.promise(response,{
            loading:"Getting the paymet record ",
            success:(data)=>{
                return data?.data?.message
            },
            error:"Failed to get the payment record"
             })
        return response.data
    }
    catch(e){
        toast.error("operation failed")
    }
})
const razorPaySlice=createSlice({
    name:"razorpay",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(getRazorPayId.fulfilled,(state,action)=>{
            state.key=action?.payload?.key;
        }).addCase(parchaseCourseBundle.fulfilled,(state,action)=>{
            state.subscription_id=action?.payload?.subscription_id;
        })   .addCase(verifyUserPayment.fulfilled, (state, action) => {
            console.log(action);
            toast.success(action?.payload?.message);
            state.isPaymentVerified = action?.payload?.success;
        })
        .addCase(verifyUserPayment.rejected, (state, action) => {
            console.log(action);
            toast.success(action?.payload?.message);
            state.isPaymentVerified = action?.payload?.success;
        }).addCase(getPaymentRecord.fulfilled,(state,action)=>{
            state.allPayments=action?.payload?.allPayments;
            state.finalMonths=action?.payload?.finalMonths;
            state.monthlySalesRecord=action?.payload?.monthlySalesRecord;
        })
    }
})
export default razorPaySlice.reducer;