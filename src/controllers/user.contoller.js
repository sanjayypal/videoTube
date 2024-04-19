import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    //get user details from front-end
    //validation : not-empty
    //check if user already exist or not
    //check for images and check for avatar
    //upload them to clodinary, avatar
    //create user object , create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res



    const {fullname,email,username,password} = req.body
    console.log("EMAIL : ",email);

    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser)
    {
        throw new ApiError(409,"user with this email/username is already exist")
    }

    const avatarLocatPath = req.files?.avatar[0]?.path;
    const coverImageLocatPath = req.files?.coverImage[0]?.path;

    if(!avatarLocatPath)
    {
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = uploadOnCloudinary(avatarLocatPath)
    const coverImage = uploadOnCloudinary(coverImageLocatPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser =  User.findById(user._id).select(
        "-password refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User created successfully")
    )

})

export {registerUser}