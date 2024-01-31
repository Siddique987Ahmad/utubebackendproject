import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

const addComment=asyncHandler(async(req,res)=>{
    const {content}=req.body
   const userId=req.params.userId
const videoId=req.params.videoId
    
if (!content) {
    throw new ApiError(400,"Content required")
}
  const comment=await Comment.create({
        content,
        owner:userId,
        video:videoId
    })
return res
.status(200)
.json(new ApiResponse(200,comment,"Comment created Successfully"))
})
const getVideoComments=asyncHandler(async(req,res)=>{
    const videoId=req.params.videoId;

    const Idsvideo= await Video.findById(videoId)

    if (!Idsvideo) {
        throw new ApiError(400,"Video already exist")
    }

  const comments=await Comment.find({video:videoId})
  return res
  .status(200)
  .json(new ApiResponse(200,comments,"Video comment is here successfully"))
})

const deleteComment=asyncHandler(async(req,res)=>{
    const commentId=req.params.commentId
    const comment=await Comment.findByIdAndDelete(commentId)
    return res
    .status(200)
    .json(new ApiResponse(200,comment,"Comment deleted successfully"))
})
const updateComment=asyncHandler(async(req,res)=>{
    const {content}=req.body
    const commentId=req.params.commentId
   const commentChange=await Comment.findByIdAndUpdate(
    commentId,
    {
        $set:{
            content
        }
    },
    {
        new:true
    }
    )
    return res
    .status(200)
    .json(new ApiResponse(200,commentChange,"Comment change successfully"))
})
export {addComment,getVideoComments,deleteComment,updateComment}