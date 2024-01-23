import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from '../models/user.model.js';
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //     message:"ok"
  // })

  const { fullName, email, username, password } = req.body;
  console.log("email", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All feilds are required");
  }
const existedUser= await User.findOne({
    $or:[{username},{email}]
})
if (existedUser) {
    throw new ApiError(409,"User already existed")
}

const avatarLocalPath= req.files?.avatar[0]?.path;
const coverImageLocalPath= req.files?.coverImage[0]?.path;

if (!avatarLocalPath) {

    throw new ApiError(400,"avatar required")
    
}

const avatar= await uploadOnCloudinary(avatarLocalPath);
const coverImage= await uploadOnCloudinary(coverImageLocalPath);

if (!avatar) {
    throw new ApiError(400,"avatar required")

}
const user= await User.create({
    fullName,email,password,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    username:username.toLowerCase()
})

const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
)

if (!createdUser) {
    throw new ApiError(500,"something wrong")
    
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User created successfully")
)

});
export default registerUser;
