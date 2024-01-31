import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike=asyncHandler(async(req,res)=>{

    const videoId=req.params.videoId
    const userId=req.user?._id

 const video=await Video.findById(videoId)
 if (!video) {
    throw new ApiError(400,"Video not here")
 }
const user=await User.findById(userId)
if (!user) {
    throw new ApiError(400,"user not here")
 }

const existingLike=await Like.findOne({video:videoId,likedBy:userId})

if (existingLike) {
   await existingLike.remove()
}
else
{
    const newLike=new Like({
        video:videoId,
        likedBy:userId
    })
   const set= await newLike.save()
    return res
    .status(200)
    .json(new ApiResponse(200,"Video Liked",set))
}


})
const toggleCommentLike=asyncHandler(async(req,res)=>{

    const commentId=req.params.commentId
    const userId=req.user?._id

    const comment=await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400,"Comment not here")
    }
    const user=await User.findById(userId)
    if (!user) {
        throw new ApiError(400,"user not here")
    }
const existingLike=await Like.findOne({comment:commentId,likedBy:userId})
if (existingLike) {
    
    await existingLike.remove();
} else {
    const newLike=new Like({
        comment:commentId,
        likedBy:userId
    })
  const commentLiked=await newLike.save();
  return res
  .status(200)
  .json(new ApiResponse(200,commentLiked,"Comment Liked"))
}

})

const toggleTweetLike=asyncHandler(async(req,res)=>{
    const tweetId=req.params.tweetId
    const userId=req.user?._id

    const tweet=await Tweet.findById(tweetId)
if (!tweet) {
    throw new ApiError(400,"Tweet not here")
}
    const user=await User.findById(userId)
    if (!user) {
        throw new ApiError(400,"User not here")
    }

    const existingLike=await Like.findOne({tweet:tweetId,likedBy:userId})
    if (existingLike) {
        await existingLike.remove()
    } else {
        const newLike=new Like({
            tweet:tweetId,
            likedBy:userId
        })
      const tweetLiked=await newLike.save()
      return res
      .status(200)
      .json(new ApiResponse(200,"Tweet Liked",tweetLiked))
    }

})

const getLikedVideos=asyncHandler(async(req,res)=>{
    const userId=req.user?._id

    const user=await User.findById(userId)
    if (!user) {
        throw new ApiError(400,"User not here")
    }
    const likedVideos= await Like.find({likedBy:userId,video:{$exists:true}}).populate("video")
    const videos=likedVideos.map(like=>like.video)
    return res
    .status(200)
    .json(new ApiResponse(200,videos,"Liked videos here"))
})

export {toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos}