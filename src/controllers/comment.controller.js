import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";

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

export {addComment}