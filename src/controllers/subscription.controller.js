import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

const toggleSubscription=asyncHandler(async(req,res)=>{

    const channelId=req.params.channelId
    const currentUser=req.user

   const targetUser= await User.findById(channelId)

   if (!targetUser) {
    throw new ApiError(400,"user not found")
   }

  const existingSubscription= await Subscription.findOne({
    channel:currentUser._id,
    subscriber:channelId
   })
   if (!existingSubscription) {
    throw new ApiError(400,"not existing subscriber")
    
   }
   const newSubscription=new Subscription({
            channel:currentUser._id,
            subscriber:channelId
       })
        await newSubscription.save();
//    if (existingSubscription) {

//     await existingSubscription.remove();
    
//    }
//    else
//    {
//     const newSubscription=new Subscription({
//         channel:currentUser._id,
//         subscriber:channelId
//     })
//     await newSubscription.save();
//    }
return res
.status(200)
.json(new ApiResponse(200,newSubscription,'Subscription status toggled successfully'))

})
const getUserChannelSubscribers=asyncHandler(async(req,res)=>{
    const subscriberId=req.params.subscriberId
    const currentUser=req.user
    const isChannelOwner = currentUser._id.toString()==subscriberId

    if (!isChannelOwner) {
        throw new ApiError(400,"User is Not owner of channel")
    }

  const subscribers=await Subscription.find({subscriber:subscriberId}).populate("channel")

  return res
  .status(200)
  .json(
    new ApiResponse(200,subscribers,"successfully get channel subscribers")
  )

})

const getSubscribedChannels=asyncHandler(async(req,res)=>{
  const channelId=req.params.channelId

  const subscribers=await Subscription.find({channel:channelId}).populate("subscriber")
  if (!subscribers) {
    throw new ApiError(400,"Channels not here")
  }
  return res
  .status(200)
  .json(new ApiResponse(200,subscribers,"channels subscriber here"))
})

export {toggleSubscription,getUserChannelSubscribers,getSubscribedChannels}