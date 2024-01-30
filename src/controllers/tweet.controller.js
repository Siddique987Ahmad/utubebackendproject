import ApiError from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import Jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is not there");
  }
  console.log(content);
  const createdTweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  if (!createdTweet) {
    throw new ApiError(400, "Content is not created");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdTweet, "content created successfully"));
});
const getUserTweet=asyncHandler(async(req,res)=>{
    const userId=req.params.userId

   const userTweet= await Tweet.find({owner:userId})
   if (!userTweet) {
    throw new ApiError(400,"Tweet user not there")
   }
   console.log(userTweet)
return res
.status(200)
.json(
    new ApiResponse(200,userTweet,"User Tweet fetched successfully")
)
})

const updateTweet=asyncHandler(async(req,res)=>{
   
const {content}=req.body
if (!content) {
    throw new ApiError(400,"Content not found")
}

const tweet=await Tweet.findByIdAndUpdate(
    req.tweet?._id,
    {
$set:{
    content
},
},
{
    new:true
}
)
console.log(tweet)
 return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet change successfully"));


})

const deleteTweet=asyncHandler(async(req,res)=>{
    const tweetId=req.params.tweetId

    const deletedTweet=await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(400,"Tweet not here")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,deletedTweet,"Tweet deleted successfully")
    )

})

export { createTweet,getUserTweet,updateTweet,deleteTweet };
