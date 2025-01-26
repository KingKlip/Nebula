import {db} from "./.vscode/.react/firebase.js"
import {  doc, setDoc } from "firebase/firestore";
import userdata from "./Testing/videos.js"
 
const addUsersWithCustomIDs = async () => {
    try {
      for (const user of userdata) {
        const docRef = doc(db, "users", user.id); // Use custom ID
        await setDoc(docRef, {
          title: user.title,
          thumbnail:user.thumbnailUrl,
          video: user.videoUrl,
          author: user.author,
          views:user.views,
          description:user.description,
          subscribers:user.subscriber,
          uploadTime:user.uploadTime,
          isLive:user.isLive,
          duration:user.duration


         

        });
        console.log(`User with ID ${user.id} added successfully!`);
      }
      console.log("All users added!");
    } catch (error) {
      console.error("Error adding users: ", error);
    }
  };
  
  addUsersWithCustomIDs();
  