import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
const getChannelStats=asyncHandler(async(req,res)=>{
    const userId=req.user._id
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400,"invalid user format")
    }

    const user=await User.findById(userId)
   // console.log(user);
    if (!user) {
        throw new ApiError(400,"User not here")
    }
    const subscriber=await Subscription.findOne({subscriber:userId})

    const channelId=subscriber.channel

    const videoCount=await Video.countDocuments({owner:channelId})
    const subscriberCount=await Subscription.countDocuments({channel:channelId})
    const channelStats={
        videoCount,
        subscriberCount
    }
    return res
    .status(200)
    .json(new ApiResponse(200,channelStats,`Here is channel Stats videos:${videoCount} and subscribers:${subscriberCount} `))
})

const getChannelVideos=asyncHandler(async(req,res)=>{
    const userId=req.user._id

    const user=await User.findById(userId)

    if (!user) {
        throw new ApiError(400,"User not here")
    }

    const videos=await Video.find({owner:userId})
return res
.status(200)
.json(new ApiResponse(200,videos,"Channel Videos Here"))

})

export {getChannelStats,getChannelVideos}