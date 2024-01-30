import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
import { User } from "../models/user.model.js";

const publishAVideo=asyncHandler(async(req,res)=>{

const {title,description,videoFile,thumbnile,duration}=req.body

if([title,description,videoFile,thumbnile,duration].some((field) => field?.trim() === ""))
{
    throw new ApiError(400,"Title and description not here")
}
const videoFileLocalPath = req.files?.videoFile[0]?.path;
const video = await uploadOnCloudinary(videoFileLocalPath);

const videoList=await Video.create({
    title,
    description,
    videoFile:video.url,
    thumbnile,
    duration
})
return res
.status(200)
.json(new ApiResponse(200,videoList,"Video Published successfully"))
})
const getAllVideos=asyncHandler(async(req,res)=>{

   const videos=await Video.find()
   return res
   .status(200)
   .json(new ApiResponse(200,videos,"Here is all videos"))
})
const getVideoById=asyncHandler(async(req,res)=>{

    const videoId=req.params.videoId

   const findWithId=await Video.findById(videoId)
return res
.status(200)
.json(new ApiResponse(200,findWithId,"Video showed by id successfully"))

})
const deleteVideo=asyncHandler(async(req,res)=>{
    const videoId=req.params.videoId;

 const deleteVideoById=await Video.findByIdAndDelete(videoId)
 return res
 .status(200)
 .json(new ApiResponse(200,deleteVideoById,"Video deleted Successfully"))
})
const updateVideo=asyncHandler(async(req,res)=>{
    const {title,description,thumbnile,duration}=req.body
    const videoId=req.params.videoId
//const videoFileLocalPath=req.file?.path

// if([title,description,thumbnile,duration].some((field) => field?.trim() === ""))
// {
//     throw new ApiError(400,"fields are required")
// }
 
// const video=await uploadOnCloudinary(videoFileLocalPath)
// if (!video.url) {
//     throw new ApiError(400,"error during uploading video")
// }

if (!title||!description||!thumbnile||!duration) {
    throw new ApiError(400,"Fields are required")
}
const video=await Video.findByIdAndUpdate(
    videoId,
    {
        $set:{
            title,description,thumbnile,duration,
        }

},
{
    new:true
}
).select("-views")

return res
.status(200)
.json(new ApiResponse(200,video,"Fields updated successfully"))

})
const togglePublishStatus=asyncHandler(async(req,res)=>{
    const videoId=req.params.videoId;
   const video=await Video.findById(videoId)
   if(!video)
   {
    throw new ApiError(400,"Video not here")
   }

   //video.isPublished=!video.isPublished
   if (video.isPublished) {
    video.isPublished = false;
} else {
    video.isPublished = true;
}
   await video.save();
return res
.status(200)
.json(new ApiResponse(200,video,"Video status successfully generated"))

})
export {publishAVideo,getAllVideos,getVideoById,deleteVideo,updateVideo,togglePublishStatus}