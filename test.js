const ytdl = require("@distube/ytdl-core");
const ytsch = require("youtube-search-api");
const youtubesearchapi = require("youtube-search-api");

let videosDl = []
let ytres = youtubesearchapi.GetListByKeyword("funny pet", true, 1, [{ type: "video" }])
    .then((res) => {
        console.log("Page1");
        res.items.forEach(element => {
            videosDl.push(element.id)

        });
        for (idVideo of videosDl) {
            
            ytdl("http://www.youtube.com/watch?v="+idVideo).pipe(require("fs").createWriteStream(idVideo));
        }

    })


// let videos=[{name:"video1",url:"http://www.youtube.com/watch?v=aqz-KE-bpKQ"},{name:"video2",url:"http://www.youtube.com/watch?v=aqz-KE-bpKQ"}]
// // Download a video
// for(video of videos){
//     console.log(video.name)
//     ytdl(video.url).pipe(require("fs").createWriteStream(video.name));
// }

