import Artplayer from "artplayer"
import { type Option } from "artplayer/types/option"
import { type Setting } from "artplayer/types/setting"
import { type Events } from "artplayer/types/events"
import Hls from "hls.js";

import {useEffect, useRef, useState} from "react";

Artplayer.DEBUG = true;

export interface Data {
  drive_id: string
  file_id: string
  video_preview_play_info: VideoPreviewPlayInfo
}
export interface VideoPreviewPlayInfo {
  category: string
  live_transcoding_task_list: LiveTranscodingTaskList[]
  meta: Meta
}

export interface LiveTranscodingTaskList {
  stage: string
  status: string
  template_height: number
  template_id: string
  template_name: string
  template_width: number
  url: string
}

export interface Meta {
  duration: number
  height: number
  width: number
}

export const AutoHeightPlugin = (player: Artplayer) => {
  const { $container, $video } = player.template
  const $videoBox = $container.parentElement!

  player.on("ready", () => {
    const offsetBottom = "1.75rem" // position bottom of "More" button + padding
    $videoBox.style.maxHeight = `calc(100vh - ${$videoBox.offsetTop}px - ${offsetBottom})`
    $videoBox.style.minHeight = "320px" // min width of mobie phone
    player.autoHeight()
  })
  player.on("resize", () => {
    player.autoHeight()
  })
  player.on("error", () => {
    if ($video.style.height) return
    $container.style.height = "60vh"
    $video.style.height = "100%"
  })
}


const Preview = () => {

  let player: Artplayer
  let option: Option = {
    id: "123",
    container: "#video-player",
    title: "objStore.obj.name",
    volume: 0.5,
    autoplay: true,
    autoSize: false,
    autoMini: true,
    // controls: [
    //   {
    //     name: "previous-button",
    //     index: 10,
    //     position: "left",
    //     html: '<svg fill="none" stroke-width="2" xmlns="http://www.w3.org/2000/svg" height="22" width="22" class="icon icon-tabler icon-tabler-player-track-prev-filled" width="1em" height="1em" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible; color: currentcolor;"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M20.341 4.247l-8 7a1 1 0 0 0 0 1.506l8 7c.647 .565 1.659 .106 1.659 -.753v-14c0 -.86 -1.012 -1.318 -1.659 -.753z" stroke-width="0" fill="currentColor"></path><path d="M9.341 4.247l-8 7a1 1 0 0 0 0 1.506l8 7c.647 .565 1.659 .106 1.659 -.753v-14c0 -.86 -1.012 -1.318 -1.659 -.753z" stroke-width="0" fill="currentColor"></path></svg>',
    //     tooltip: "Previous",
    //     // click: function () {
    //     //   previous_video()
    //     // },
    //   },
    //   {
    //     name: "next-button",
    //     index: 11,
    //     position: "left",
    //     html: '<svg fill="none" stroke-width="2" xmlns="http://www.w3.org/2000/svg" height="22" width="22" class="icon icon-tabler icon-tabler-player-track-next-filled" width="1em" height="1em" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible; color: currentcolor;"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M2 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z" stroke-width="0" fill="currentColor"></path><path d="M13 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z" stroke-width="0" fill="currentColor"></path></svg>',
    //     tooltip: "Next",
    //     // click: function () {
    //     //   next_video()
    //     // },
    //   },
    // ],
    loop: false,
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    setting: true,
    hotkey: true,
    pip: true,
    mutex: true,
    fullscreen: true,
    fullscreenWeb: true,
    subtitleOffset: true,
    miniProgressBar: false,
    playsInline: true,
    quality: [],
    plugins: [AutoHeightPlugin],
    whitelist: [],
    settings: [],
    moreVideoAttr: {
      // @ts-ignore
      "webkit-playsinline": true,
      playsInline: true,
    },
    type: "m3u82",
    customType: {
      m3u8: function (video: HTMLMediaElement, url: string) {
        const hls = new Hls()
        hls.loadSource(url)
        hls.attachMedia(video)
        if (!video.src) {
          video.src = url
        }
      },
      m3u82: function (video: HTMLMediaElement, url: string, art) {
        if (Hls.isSupported()) {
          if (art.hls) art.hls.destroy();
          const hls = new Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          art.hls = hls;
          art.on('destroy', () => hls.destroy());
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else {
          art.notice.show = 'Unsupported playback format: m3u8';
        }
      },
    },
    lang: ["en", "zh-cn", "zh-tw"].includes("zh-cn")
      ? ("zh-cn" as any)
      : "en",
    lock: true,
    fastForward: true,
    autoPlayback: true,
    autoOrientation: true,
    airplay: true,
  }
    // const [loading, post] = useFetch(
    //     (): PResp<Data> =>
    //         r.post("/fs/other", {
    //             path: pathname(),
    //             password: password(),
    //             method: "video_preview",
    //         }),
    // )
    useEffect(() => {
        // 获取文件信息
        const url = "https://a.xiaosi.cc/d/ali-data/zccsh.1080p.HD%E5%9B%BD%E8%AF%AD%E4%B8%AD%E5%AD%97%5B%E6%9C%80%E6%96%B0%E7%94%B5%E5%BD%B1www.dygangs.me%5D.mp4"
        //   option.url = 'https://ccp-bj29-video-preview.oss-enet.aliyuncs.com/lt/52D58ACA15F651452D9185E86DF6DB5694DDA1CB_3285584355__sha1_bj29_e7792192/FHD/media.m3u8?di=bj29&dr=599137413&f=66571a18c4524a06c8754523bbdf849cd348ccdc&pds-params=%7B%22ap%22%3A%2276917ccccd4441c39457a04f6084fb2f%22%7D&security-token=CAISvgJ1q6Ft5B2yfSjIr5eED%2FeHi6dY8bqfWlP9glMlb%2BVHn%2FLFuzz2IHhMf3NpBOkZvvQ1lGlU6%2Fcalq5rR4QAXlDfNVrtWg7DqFHPWZHInuDox55m4cTXNAr%2BIhr%2F29CoEIedZdjBe%2FCrRknZnytou9XTfimjWFrXWv%2Fgy%2BQQDLItUxK%2FcCBNCfpPOwJms7V6D3bKMuu3OROY6Qi5TmgQ41Uh1jgjtPzkkpfFtkGF1GeXkLFF%2B97DRbG%2FdNRpMZtFVNO44fd7bKKp0lQLs0ARrv4r1fMUqW2X543AUgFLhy2KKMPY99xpFgh9a7j0iCbSGyUu%2FhcRm5sw9%2Byfo34lVYnew7VH9373LuHwufJ7FxfIREfquk63pvSlHLcLPe0Kjzzleo2k1XRPVFF%2B535IaHXuToXDnvSiGTWbEfXtuMkagAFv98qR64E7y9hB0ostiE%2FisGdNOenzrzdHiUadTKVIumPqSyl8AlyuTGTgdYovpI%2BTzPdt7eQSx0JWNh9nkC%2F5IrsNnYdxxoSlDByCXK356nlMjdv18D5RxgopL1xRBLDmNMgmR5foGh7UwOBs36OAqePT7LMKMr%2F%2BeJdX6j1TayAA&u=cee43ef94a86411c9337a6d84bd431b5&x-oss-access-key-id=STS.NT1DM3fxyFxtXuLfSpcjkp7nY&x-oss-expires=1717037491&x-oss-process=hls%2Fsign%2Cparams_ZGksZHIsZix1LHBkcy1wYXJhbXM%3D&x-oss-signature=1MDzVex5QbzEgXSFHjrYm41hglWM6jjCu7qNZEWR42Q%3D&x-oss-signature-version=OSS2'
        if (url.includes('/d/')) {
          const [fetchHost, fetchData] = url.split("/d/")
          console.log('------', fetchHost, fetchData)
          option.id = `/${decodeURIComponent(fetchData)}`
          fetch(`${fetchHost}/api/auth/login`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: "dav", password: "sjh666"})
          }).then(response => response.json()).then((token) => {
            console.log('token', token)
            fetch(`${fetchHost}/api/fs/other`, {
              method: "POST",
              body: JSON.stringify({method: "video_preview", password: "", path: `/${decodeURIComponent(fetchData)}`}),
              headers: {
                Authorization: `${token.data.token}`,
                'Content-Type': 'application/json'
              },
            }).then((response) => response.json())
                .then((result) => result.data).then((data: Data) => {
              const list = data.video_preview_play_info.live_transcoding_task_list.filter(
                  (l) => l.url,
              )
              if (list.length === 0) {
                console.log('No transcoding video found')
                return
              }
              option.url = list[list.length - 1].url
              // option.url = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
              option.quality = list.map((item, i) => {
                return {
                  html: item.template_id,
                  url: item.url,
                  default: i === list.length - 1,
                }
              })
              // option.url = url
              if (typeof player === "undefined") {
                console.log('-----', "出厂化")
                player = new Artplayer(option);
                let auto_fullscreen: boolean = false
                player.on("ready", () => {
                  player.fullscreen = auto_fullscreen
                })
                interval = window.setInterval(resetPlayUrl, 1000 * 60 * 14)
              }
            })
          })


        }

      return () => {
        // if (player && player.destroy) {
        //   player.destroy(false);
        // }
        player?.destroy(true);
        window.clearInterval(interval)
      }
    }, []);

  let interval: number
  let curSeek: number
  async function resetPlayUrl() {
    // option.url = "https://a.xiaosi.cc/d/ali-data/zccsh.1080p.HD%E5%9B%BD%E8%AF%AD%E4%B8%AD%E5%AD%97%5B%E6%9C%80%E6%96%B0%E7%94%B5%E5%BD%B1www.dygangs.me%5D.mp4"
    if (option.url.includes('/d/')) {
      const [fetchHost, fetchData] = option.url.split("/d/")
      console.log('------', fetchHost, fetchData)
      fetch(`${fetchHost}/api/fs/other`, {
        method: "POST",
        body: JSON.stringify({method: "video_preview", password: "", path: `/${decodeURIComponent(fetchData)}`}),
        headers: {
          Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicHdkX3RzIjoxNzE2ODkzNzY3LCJleHAiOjE3MTcyMTkzODMsIm5iZiI6MTcxNzA0NjU4MywiaWF0IjoxNzE3MDQ2NTgzfQ.qZN5u4syvfdTVeMDp9W6Iv4jUY-U_FpIfl6cHjjB7W8",
          'Content-Type': 'application/json'
        },
      }).then((response) => response.json())
        .then((result) => result.data).then((data: Data) => {
          const list =
              data.video_preview_play_info.live_transcoding_task_list.filter(
                  (l) => l.url,
              )
          if (list.length === 0) {
            console.log("No transcoding video found")
            return
          }
          const quality = list.map((item, i) => {
            return {
              html: item.template_id,
              url: item.url,
              default: i === list.length - 1,
            }
          })
          option.quality = quality
          player.quality = quality
          curSeek = player.currentTime
          let curPlaying = player.playing
          player.switchUrl(quality[quality.length - 1].url)
              .then(
                  () => {
                    if (!curPlaying) player.pause()
                    setTimeout(() => {
                      player.seek = curSeek
                    }, 1000)
                  }
              )
        })
    }}

    // const [autoNext, setAutoNext] = useState(false)
    const [warnVisible, setWarnVisible] = useState(false)
    return (
        <div >
            <div style={{width: "100%", height: "520px"}} id="video-player"/>
            {warnVisible &&
                <div>
                    <div style={{width: "100%", height: "520px", backgroundColor: "black"}} >
                    </div>
                </div>
            }

        </div>
    )
}



export default Preview
