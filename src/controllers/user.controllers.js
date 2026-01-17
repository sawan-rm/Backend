import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import uploadOnCloudinary from '../utils/cloudinary.js'
// import { use } from "react"
import {ApiResponse} from "../utils/ApiResponse.js"
import { use } from "react"

const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = generateAccessToken();
        const refreshToken = generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        
        return {accessToken, refreshToken}

    }catch(error){
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async(req, res) => {
    // get user details from frontend
    // validation -not empty
    //check if user already exist: username, email
    //check for images , check for avatar
    //upload them to cloudinary, avatar
    //create user object-create entry in db
    //remove password and refresh token field response
    //check for user creation
    //return res

    const {fullname, email,username, password} = req.body
    // console.log("email: ", email);

    if(
        [fullname, email, username, password].some((field) => field?.trim() == "")
    ){
        throw new ApiError(400, "All Fiels are required")
    }
    
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalpath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalpath){
        throw new ApiError(400, "Avatar file is requires")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalpath)
    let coverImage;
    if(coverImageLocalPath){
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }
    // console.log("avatar is :", avatar);
    // console.log("FILES:", req.files);
    
    if(!avatar?.url){
        throw new ApiError(400, "Avatar upload fail")
    }

    // console.log("Avatar:", avatar.path);
    // console.log("Cover:", coverImage?.path);

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()  
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the User")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {

    const {email, username, password} = req.body;

    if(!username || !email){
        throw new ApiError(400, "username or email required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }
    
    const isPasswordValid = user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)


    const loggedInuser = user.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInuser, accessToken, refreshToken
            }, 
            "User logged In Successfully"
        )
    )

})


const logoutuser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,{
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {} , "User logged out"))
})

export { registerUser, loginUser, logoutuser } 