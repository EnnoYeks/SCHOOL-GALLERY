// ============================================
// VIDEOS PAGE LOGIC
// ============================================

import { db } from "./db.js";

import {
    updateDoc,
    doc,
    increment
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { firestore } from "./config.js";


class VideosPage {

    constructor() {

        this.currentVideo = null;
        this.videoIndex = 0;
        this.videos = [];

        this.init();

    }


    async init() {

        await this.loadVideoCards();

        this.setupVideoPlayer();

        this.setupVideoControls();

        this.setupSwipeNavigation();

    }



    async loadVideoCards() {

        const container = document.getElementById("videosContainer");

        if (!container) return;


        try {


            this.videos = await db.getVideos(12, 0) || [];


            if (this.videos.length === 0) {


                container.innerHTML = `

                    <div class="empty-state">

                        <i class="fas fa-video"></i>

                        <h3>No videos yet</h3>

                        <p>Upload the first school memory!</p>

                    </div>

                `;


                return;

            }



            container.innerHTML = this.videos.map((video,index)=>`

                <div class="video-card"
                     data-video-id="${video.id}"
                     data-video-index="${index}">


                    <div class="video-thumbnail">


                        <img src="${video.thumbnailUrl || ''}"
                             alt="${video.title}"
                             class="thumbnail-image">


                        <div class="play-button-overlay">

                            <i class="fas fa-play"></i>

                        </div>


                        <div class="video-duration">

                            ${video.duration || "00:00"}

                        </div>


                    </div>



                    <div class="video-info">


                        <div class="video-title">

                            ${video.title}

                        </div>



                        <div class="video-description">

                            ${Utils.truncateText(video.description || "",80)}

                        </div>



                        <div class="video-metadata">


                            <span>

                                ${video.author || "Unknown"}

                            </span>



                            <span>

                                ${Utils.formatDate(video.createdAt)}

                            </span>


                        </div>



                        <div class="video-stats">


                            <div class="stat-item">

                                <i class="fas fa-eye"></i>

                                ${Utils.formatNumber(video.views || 0)}

                            </div>



                            <div class="stat-item">

                                <i class="fas fa-heart"></i>

                                ${Utils.formatNumber(video.likes || 0)}

                            </div>



                            <div class="stat-item">

                                <i class="fas fa-comment"></i>

                                ${Utils.formatNumber(video.comments || 0)}

                            </div>


                        </div>


                    </div>


                </div>


            `).join("");




            const cards = container.querySelectorAll(".video-card");


            cards.forEach(card=>{


                card.addEventListener("click",()=>{


                    const index = parseInt(
                        card.dataset.videoIndex
                    );


                    this.playVideo(index);


                });


            });



        } catch(error) {


            console.error(
                "Loading videos failed:",
                error
            );



            container.innerHTML = `

                <div class="empty-state">

                    <h3>Unable to load videos</h3>

                    <p>${error.message}</p>

                </div>

            `;


        }


    }





    playVideo(index){


        const video = this.videos[index];


        if(!video) return;



        this.currentVideo = video;

        this.videoIndex = index;



        const modal =
            document.getElementById("videoPlayerModal");


        const player =
            document.getElementById("videoPlayer");



        const thumbnail =
            document.querySelector(
                `[data-video-index="${index}"] .thumbnail-image`
            );



        if(player){

            player.src = video.videoUrl;


            if(thumbnail){

                player.poster = thumbnail.src;

            }

        }




        if(modal){


            modal.classList.add("active");


            player.play();


            this.updateVideoStats(video);


        }


    }






    setupVideoPlayer(){


        const playerClose =
            document.getElementById("playerClose");


        const modal =
            document.getElementById("videoPlayerModal");



        if(playerClose && modal){


            playerClose.addEventListener("click",()=>{


                const player =
                    document.getElementById("videoPlayer");


                if(player){

                    player.pause();

                }


                modal.classList.remove("active");


            });


        }


    }






    setupVideoControls(){


        const player =
            document.getElementById("videoPlayer");


        if(!player) return;



        const playPauseBtn =
            document.getElementById("playPauseBtn");


        if(playPauseBtn){


            playPauseBtn.addEventListener("click",()=>{


                if(player.paused){


                    player.play();


                    playPauseBtn.innerHTML =
                    '<i class="fas fa-pause"></i>';


                }else{


                    player.pause();


                    playPauseBtn.innerHTML =
                    '<i class="fas fa-play"></i>';


                }


            });


        }



    }






    setupSwipeNavigation(){


        const prevBtn =
            document.getElementById("prevVideo");


        const nextBtn =
            document.getElementById("nextVideo");



        if(prevBtn){


            prevBtn.addEventListener("click",()=>{


                if(this.videoIndex > 0){

                    this.playVideo(
                        this.videoIndex - 1
                    );

                }


            });


        }




        if(nextBtn){


            nextBtn.addEventListener("click",()=>{


                if(this.videoIndex < this.videos.length - 1){


                    this.playVideo(
                        this.videoIndex + 1
                    );


                }


            });


        }


    }







    async updateVideoStats(video){


        try{


            await updateDoc(

                doc(
                    firestore,
                    "videos",
                    video.id
                ),

                {

                    views: increment(1)

                }

            );



        }catch(error){


            console.error(
                "Could not update views:",
                error
            );


        }


    }



}




// ============================================
// START PAGE
// ============================================


document.addEventListener(
    "DOMContentLoaded",
    ()=>{


        if(document.getElementById("videosContainer")){


            new VideosPage();


        }


    }

);



// Export

if(typeof module !== "undefined" && module.exports){

    module.exports = VideosPage;

}
