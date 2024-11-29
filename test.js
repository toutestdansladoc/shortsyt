const ytdl = require("@distube/ytdl-core");
const youtubesearchapi = require("youtube-search-api");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const { exec } = require("child_process");


(async () => {
    let videoResult = await searchVideos();
    downloadAndProcessVideos(videoResult);
})()
/**
 * Recherche des vidéos sur YouTube en utilisant un mot-clé.
 * 
 * @returns {Promise<string[]>} Une promesse qui résout avec un tableau d'ID de vidéos.
 */
async function searchVideos() {
    let videosDl = [];
    let ytres = await youtubesearchapi.GetListByKeyword("eminem", true, 1, [{ type: "video" }]);

    ytres.items.forEach(element => {
        videosDl.push(element.id);
    });
    return videosDl;
}

/**
 * Télécharge et traite les vidéos à partir d'une liste d'ID de vidéos.
 * 
 * @param {string[]} videosToDownload - Un tableau contenant les ID des vidéos à télécharger.
 */
function downloadAndProcessVideos(videosToDownload) {
    for (let idVideo of videosToDownload) {
        const videoPath = idVideo + '_video.mp4';
        const audioPath = idVideo + '_audio.mp4';
        const outputPath = idVideo + '.mp4';
        const outputCroppedPath = idVideo + '._cropped.mp4';

        // Download video
        ytdl("http://www.youtube.com/watch?v=" + idVideo, { filter: format => format.container === 'mp4' && !format.audioEncoding })
            .pipe(fs.createWriteStream(videoPath))
            .on('finish', () => {
                // Download audio
                ytdl("http://www.youtube.com/watch?v=" + idVideo, { filter: 'audioonly' })
                    .pipe(fs.createWriteStream(audioPath))
                    .on('finish', () => {
                        // Combine video and audio
                        ffmpeg()
                            .input(videoPath)
                            .input(audioPath)
                            .outputOptions('-c:v copy')
                            .outputOptions('-c:a aac')
                            .save(outputPath)
                            .on('end', () => {
                                console.log(`Combined video and audio into ${outputCroppedPath}`);
                                console.log(`ffmpeg -i ${outputPath} -vf "crop=in_h*9/16:in_h" ${outputCroppedPath}`);
                                exec(`ffmpeg -i ${outputPath} -vf "crop=in_h*9/16:in_h" ${outputCroppedPath}`, (error, stdout, stderr) => {
                                    if (error) {
                                        console.error(`Error cropping video: ${error.message}`);
                                        return;
                                    }
                                    console.log(`Video cropped successfully: ${outputCroppedPath}`);
                                    // Split the video into 1-minute segments
                                    let segmentPattern = `${idVideo}_segment_%03d.mp4`;
                                    exec(`ffmpeg -i ${outputCroppedPath} -c copy -map 0 -segment_time 00:01:00 -f segment -reset_timestamps 1 ${segmentPattern}`, (error, stdout, stderr) => {
                                        if (error) {
                                            console.error(`Error splitting video: ${error.message}`);
                                            return;
                                        }
                                        console.log(`Video split into 1-minute segments successfully.`);
                                    })
                                })
                                // Optionally, delete the separate video and audio files
                                fs.unlinkSync(videoPath);
                                fs.unlinkSync(audioPath);
                            })
                            .on('error', (err) => {
                                console.error('Error combining video and audio:', err);
                            });
                    });
            });
    }
}
