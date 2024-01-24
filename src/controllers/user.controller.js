import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import  Jwt  from "jsonwebtoken";
import mongoose from "mongoose";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something wrong while access and refresh token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //     message:"ok"
  // })

  const { fullName, email, username, password } = req.body;
  //console.log("email", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All feilds are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already existed");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar required");
  }
  const user = await User.create({
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  //console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "Username or email required");
  }

  const user = await User.findOne({
    $or: [{ username },{email}],
  });
  //console.log(username);
  if (!user) {
    throw new ApiError(400, "user not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "password not valid");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
 await User.findByIdAndUpdate(
    req.user._id,

    {
      $set: {
        refreshToken: undefined,
      },
    },

    {
      new: true,
    }
  );

  const options={
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User Logged Out"))

});

const refreshAccessToken=asyncHandler(async(req,res)=>{

    const incomingRefreshToken= req.cookie.refreshToken||req.body.refreshToken

    if(!incomingRefreshToken)
    {
        throw new ApiError(400,"unauthorize request")
    }

   try {
    const decodedToken= Jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
 
    const user= await User.findById(decodedToken?._id)
    if(!user)
    {
        throw new ApiError(400,"Invalid Refresh Token")
    }
 
    if (incomingRefreshToken!==user?.refreshToken) {
 
     throw new ApiError(400,"Refresh token is expired")
     
    }
    const options={
     httpOnly:true,
     secure:true
    }
 
   const {accessToken,newRefreshToken}= await generateAccessAndRefreshToken(user._id)
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
     new ApiResponse(
         200,
         {accessToken,refreshToken:newRefreshToken},
         "Access Token Refreshed"
     )
   )
   } catch (error) {
    throw new ApiError(408,error?.message||"Invalid refresh token")
   }

})

const changeCurrentPassword=asyncHandler(async(req,res)=>{

  const {oldPassword,newPassword}=req.body

const user=await User.findById(req.user?._id)

const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

if (!isPasswordCorrect) {

  throw new ApiError(400,"Invalid oldPassword")
  
}

user.password=newPassword
await user.save({validateBeforeSave:false})
return res
.status(200)
.json(new ApiResponse(200,{},"Password change successfully"))

})

const getCurrentUser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(new ApiResponse( 200,req.user,"Current user fetched "))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullName,email}=req.body
  if (!(fullName||email)) {
    throw new ApiError(400,"name and email required")
  }

 const user= await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,email
      },
    },
    {
      new:true
    }
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"Details Updated"))

})

const updateAvatar=asyncHandler(async(req,res)=>{
  
const avatarLocalPath= req.file?.path

if (!avatarLocalPath) {
  throw new ApiError(400,"Avatar missing")
}

 const avatar= await uploadOnCloudinary(avatarLocalPath)

 if (!avatar.url) 
 {
 throw new ApiError(400,"Error while uploading avatar") 
 }

 const user= await User.findByIdAndUpdate(
  req.user?._id,
  {

    $set:{
      avatar:avatar.url
    }

  },
  {new:true}
 ).select("-password")

return res
.status(200)
.json(
  new ApiResponse(200,user,"Avatar uploaded successfully")
)

})

const updateCoverImage=asyncHandler(async(req,res)=>{
  
  const coverImageLocalPath= req.file?.path
  
  if (!coverImageLocalPath) {
    throw new ApiError(400,"CoverImage missing")
  }
  
   const coverImage= await uploadOnCloudinary(coverImageLocalPath)
  
   if (!coverImage.url) 
   {
   throw new ApiError(400,"Error while uploading CoverImage") 
   }
  
   const user= await User.findByIdAndUpdate(
    req.user?._id,
    {
  
      $set:{
        coverImage:coverImage.url
      }
  
    },
    {new:true}
   ).select("-password")
  
  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"CoverImage uploaded successfully")
  )
  
  })

const getUserChannelProfile=asyncHandler(async(req,res)=>{

  const {username}=req.param

  if (!username?.trim()) {
 throw new ApiError(400,"username missing")   
  }

const channel= await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()
      }
    },{
      $lookup:{

        from:"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"

      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribeTo"
      }
    },
    {
      $addFields:{
        subscribeCount:{
          $size:"$subscribers"
        },
       channelsSubscribeCount:{
           $size:"$subscribedTo"
        },
        isSubscribed:{
          $cond:{
            if:{$in:[req.user?._id,"$subscribers.subscriber"]},
            then:true,
            else:false
          }
        }
      }
    },
    {
      $project:{
        fullName:1,
        username:1,
        email:1,
        subscribeCount:1,
        channelsSubscribeCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1
      }
    }
  ])
if (!channel?.length) {
  throw new ApiError(400,"channel not exist")
}

return res
.status(200)
.json(new ApiResponse(200,channel[0],"User channel Fetched"))







})

const getWatchHistory=asyncHandler(async(req,res)=>{
  const user=User.aggregate(
    [
      {
        $match:{
          _id:new mongoose.Types.ObjectId(req.user._id)
        }
      },
      {
        $lookup:{
          from:"videos",
          localField:"watchHistory",
          foreignField:"_id",
          as:"watchHistory",
          pipeline:[
            {
              $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                  {
                    $project:{
                      fullName:1,
                      username:1,
                      avatar:1
                    }
                  }
                ]
              }
            },
            {
              $addFields:{
                owner:{
                  $first:"$owner"
                }
              }
            }


          ]
        }
      }

    ]
  )

  return res
  .status(200)
  .json(new ApiResponse(200,user[0].watchHistory,"watch history fetched"))
})
export { registerUser,
   loginUser, 
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateAvatar,
   updateCoverImage,
   getUserChannelProfile,
   getWatchHistory
  };
