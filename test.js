const ytdl = require("@distube/ytdl-core");
const ytsch = require("youtube-search-api");
const youtubesearchapi = require("youtube-search-api");

let videosDl = []
let ytres = youtubesearchapi.GetListByKeyword("watermelon", true, 1, [{ type: "video" }])
    .then((res) => {
        res.items.forEach(element => {
            videosDl.push(element.id)

        });
        for (idVideo of videosDl) {
            ytdl("http://www.youtube.com/watch?v=" + idVideo).pipe(require("fs").createWriteStream(idVideo));
        }
    })
