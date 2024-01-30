import { Router } from 'express';
import {
   
    publishAVideo,
    getAllVideos,
    getVideoById,
    deleteVideo,
    updateVideo,togglePublishStatus
    
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
     .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    )
   .get(getAllVideos);

router
    .route("/:videoId")
    .get(getVideoById)
  .delete(deleteVideo)
.patch(updateVideo);
//upload.single("videoFile"),
 router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router