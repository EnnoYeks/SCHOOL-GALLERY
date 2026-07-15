// ============================================
// ENNOYEKS SCHOOL GALLERY DATABASE
// FIREBASE + SUPABASE BRIDGE
// ============================================


import { firestore, auth } from "./config.js";

import {
    collection,
    query,
    orderBy,
    where,
    limit,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



// ============================================
// DATABASE CLASS
// ============================================


class Database {


    constructor(){

        console.log(
            "Firestore database initialized"
        );

    }



    // ============================================
    // GENERIC COLLECTION QUERY
    // ============================================


    async queryCollection(
        collectionName,
        limitValue = 10,
        offset = 0
    ){

        try{


            const ref = collection(
                firestore,
                collectionName
            );


            const q = query(
                ref,
                orderBy(
                    "createdAt",
                    "desc"
                ),
                limit(
                    limitValue + offset
                )
            );


            const snapshot =
                await getDocs(q);



            if(snapshot.empty){

                return [];

            }



            const data =
            snapshot.docs.map(
                doc => this.normalizeItem({

                    id: doc.id,

                    ...doc.data()

                })
            );



            return data.slice(
                offset,
                offset + limitValue
            );


        }catch(error){

            console.error(
                "Database error:",
                error
            );


            return [];

        }


    }




    // ============================================
    // POSTS
    // ============================================


    async getPosts(limit=10,offset=0){

        return this.queryCollection(
            "posts",
            limit,
            offset
        );

    }




    // ============================================
    // PHOTOS
    // ============================================


    async getPhotos(limit=20,offset=0){

        return this.queryCollection(
            "photos",
            limit,
            offset
        );

    }





    // ============================================
    // VIDEOS
    // ============================================


    async getVideos(limit=12,offset=0){

        return this.queryCollection(
            "videos",
            limit,
            offset
        );

    }




    async createVideo(videoData){


        try{


            const payload = {

                ...videoData,

                createdAt:
                new Date().toISOString(),


                views:0,

                likes:0,

                comments:0

            };



            const ref =
            await addDoc(
                collection(
                    firestore,
                    "videos"
                ),
                payload
            );



            return {

                id:ref.id,

                ...payload

            };


        }catch(error){


            console.error(
                "Video upload failed:",
                error
            );


            return null;

        }


    }






    async deleteVideo(id){


        try{


            await deleteDoc(
                doc(
                    firestore,
                    "videos",
                    id
                )
            );


            return true;


        }catch(error){


            console.error(
                error
            );


            return false;

        }

    }






    // ============================================
    // COMMENTS
    // ============================================


    async getComments(postId){


        try{


            const q = query(

                collection(
                    firestore,
                    "comments"
                ),

                where(
                    "postId",
                    "==",
                    postId
                ),

                orderBy(
                    "createdAt",
                    "desc"
                ),

                limit(100)

            );


            const snap =
            await getDocs(q);



            return snap.docs.map(
                d=>({

                    id:d.id,

                    ...d.data()

                })
            );


        }catch(error){


            console.error(error);

            return [];

        }


    }





    async createComment(
        postId,
        data
    ){


        try{


            const payload={

                postId,

                ...data,

                createdAt:
                new Date().toISOString()

            };



            const ref =
            await addDoc(

                collection(
                    firestore,
                    "comments"
                ),

                payload

            );



            return {

                id:ref.id,

                ...payload

            };


        }catch(error){

            console.error(error);

            return null;

        }


    }





    // ============================================
    // LIKES
    // ============================================


    async addLike(
        itemId,
        type="video"
    ){


        try{


            const user =
            await this.getCurrentUserId();



            await addDoc(

                collection(
                    firestore,
                    "likes"
                ),

                {

                    itemId,

                    type,

                    user,

                    createdAt:
                    new Date().toISOString()

                }

            );



            const collectionName =
            type==="video"
            ?
            "videos"
            :
            type==="photo"
            ?
            "photos"
            :
            "posts";



            await updateDoc(

                doc(
                    firestore,
                    collectionName,
                    itemId
                ),

                {

                    likes:
                    increment(1)

                }

            );


            return true;



        }catch(error){

            console.error(error);

            return false;

        }


    }





    // ============================================
    // USER
    // ============================================


    async getCurrentUserId(){


        if(auth?.currentUser){

            return auth.currentUser.uid;

        }


        let id =
        localStorage.getItem(
            "guestId"
        );



        if(!id){

            id =
            "guest-" +
            Math.random()
            .toString(36)
            .substring(2);


            localStorage.setItem(
                "guestId",
                id
            );

        }



        return id;


    }





    // ============================================
    // ANALYTICS
    // ============================================


    async getAnalytics(){


        try{


            const posts =
            await getDocs(
                collection(
                    firestore,
                    "posts"
                )
            );


            const photos =
            await getDocs(
                collection(
                    firestore,
                    "photos"
                )
            );


            const videos =
            await getDocs(
                collection(
                    firestore,
                    "videos"
                )
            );



            return {

                totalPosts:
                posts.size,


                totalPhotos:
                photos.size,


                totalVideos:
                videos.size

            };


        }catch(error){


            return {

                totalPosts:0,

                totalPhotos:0,

                totalVideos:0

            };


        }


    }





    // ============================================
    // NORMALIZER
    // ============================================


    normalizeItem(item){


        return {


            ...item,


            likes:
            item.likes ??
            item.likesCount ??
            0,


            views:
            item.views ??
            item.viewsCount ??
            0,


            comments:
            item.comments ??
            item.commentsCount ??
            0



        };


    }



}





// ============================================
// EXPORT
// ============================================


const db = new Database();


window.db = db;


export { db };


export default db;
