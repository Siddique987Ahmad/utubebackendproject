import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name && !description) {
    throw new ApiError(400, "Name and description not here");
  }

  const playlistCreate = await Playlist.create({
    name,
    description,
  });
  if (!playlistCreate) {
    throw new ApiError(400, "Playlist not created");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistCreate, "Playlist created Successfully")
    );
});
const getPlaylistById = asyncHandler(async (req, res) => {
  const playlistId = req.params.playlistId;
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Not getting list of playlist by Id");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Playlist is getting by Id is Successfull")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const playlistId = req.params.playlistId;
  if (!name && !description) {
    throw new ApiError(400, "Name and description not here");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist change successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const playlistId = req.params.playlistId;

  const playlistdelete = await Playlist.findByIdAndDelete(playlistId);
  if (!playlistdelete) {
    throw new ApiError(400, "Playlist not deleted");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistdelete, "Playlist deleted successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  const video = await Video.findById(videoId);
  const playlist = await Playlist.findById(playlistId);

  if (!video || !playlist) {
    throw new ApiError(400, "Video and Playlist Ids not exist");
  }

  if (playlist.video.includes(videoId)) {
    throw new ApiError(400, "Playlist already existed");
  }
  playlist.video.push(videoId);
  await playlist.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  const removeVideo = await Video.findByIdAndDelete(videoId);
  const removePlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!removeVideo || !removePlaylist) {
    throw new ApiError(400, "Video not remove");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        [removeVideo, removePlaylist],
        "Video removed successfully"
      )
    );
});
const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "Not user id there");
  }

  const getPlaylistUsers = await Playlist.find({ owner: userId });
  console.log(getPlaylistUsers);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getPlaylistUsers,
        "Successfully executed user playlist"
      )
    );
});
export {
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
};
