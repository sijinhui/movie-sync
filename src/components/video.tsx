import Artplayer from "artplayer"
import {type Option} from "artplayer/types/option"
import Hls from "hls.js";
import { $playerState, $userInfo, $userStatus } from '@/store/player';
import {useEffect, useRef, useState} from "react";
import {useStore as useNanoStore} from "@nanostores/react";
import {ClientMessage, ServerMessage} from "@/lib/types/message";
import {socket} from "@/components/socket";

// Artplayer.DEBUG = true;

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


const Preview = ({ roomName }: { roomName: string }) => {
  // const [url, setUrl] = useState();
  const playerRef = useRef<HTMLDivElement>(null);
  const userinfo = useNanoStore($userInfo);
  const playerState = useNanoStore($playerState)
  const [canPlay, setCanPlay] = useState(false);
  let player: Artplayer
  let option: Option = {
    id: "123",
    // container: "#video-player",
    // container: playerRef.current,
    title: "objStore.obj.name",
    url: playerState?.url ?? "",
    volume: 0.5,
    autoplay: false,
    autoSize: false,
    autoMini: true,
    controls: [],
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
    // type: "m3u8",
    customType: {
      m3u8: function (video: HTMLMediaElement, url: string, art) {
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
  useEffect(() => {
    // 初始化播放器
    if (!playerRef.current || !playerState?.url) {
      return
    }
    console.log('-----', "出厂化", option)

    player = new Artplayer({
      ...option,
      container: playerRef.current,
    })
    let auto_fullscreen: boolean = false
    player.on("ready", () => {
      player.fullscreen = auto_fullscreen
      socket.emit("setTime", JSON.stringify({
        username: userinfo?.username,
        time: Math.ceil(player.currentTime),
        room: roomName
      } as ClientMessage))
    })
    player.on('video:canplay', () => {
      setCanPlay(true);
    });
    player.on('video:seeking', () => {
      socket.emit("setTime", JSON.stringify({
        username: userinfo?.username,
        time: Math.ceil(player.currentTime),
        room: roomName
      } as ClientMessage))
    })
    player.on('video:seeked', () => {
      // 跳转之后发送暂停信号，防止播放状态不同步
      socket.emit('pause', JSON.stringify({
        room: roomName,
        username: userinfo?.username
      } as ClientMessage))
    })
    player.on('video:play', () => {
      socket.emit('play', JSON.stringify({
        room: roomName,
        username: userinfo?.username
      } as ClientMessage))
    })
    player.on('video:pause', () => {
      socket.emit('pause', JSON.stringify({
        room: roomName,
        username: userinfo?.username
      } as ClientMessage))
    })

    return () => {
      player?.destroy();
    }
  }, [playerState?.url]);

  useEffect(() => {
    console.log('in ---- url change，', playerState?.url, player)
    if (typeof player === "undefined" || !player) {
      return
    }
    console.log('in2 ---- url change，', playerState?.url)

    if (playerState?.url && player.url != playerState.url) {
      player.switch = playerState?.url
      console.log('-----url change')
    }

  }, [playerState?.url]);

  // useEffect(() => {
  //
  // }, [roomName, userinfo?.username]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (!player) {
        return
      }
      console.log('----------', player.currentTime, player.playing)
      socket.emit("updateMyInfo", JSON.stringify({
        username: userinfo?.username,
        time: Math.ceil(player.currentTime),
        room: roomName,
        playing: player.playing
      } as ClientMessage))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function onConnect() {
      console.log('connected');
    }

    function onDisconnect(e: any, d: any) {
      console.log('disconnected, reason', e, d);
      socket.connect();
    }

    function onRootInit(d: any) {
      const msg = JSON.parse(d) as ServerMessage
      console.log('root init', msg);
      $playerState.set({
        url: msg.url,
        inited: true
      })
    }
    function onRoomInfo(d: any) {
      console.log('get room info response', JSON.parse(d) as ServerMessage);
      const msg = JSON.parse(d) as ServerMessage
      if (!msg.userStatus) {
        return
      }
      $userStatus.set([
        ...msg.userStatus
      ])
      const mintime = Math.min(...msg.userStatus.map(user => user?.time ?? Infinity));
      if (player && Math.abs(player.currentTime - mintime) > 10) {
        player.currentTime = mintime
      }
    }

    function onPause() {
      console.log('pause');
      if (player && player.playing) {
        player.pause();
      }
    }

    function onPlay() {
      console.log('play');
      if (player && !player.playing) {
        player.play();
      }
    }

    function onSetTime(d: any) {
      console.log('set time: ', JSON.parse(d) as ServerMessage);
      const msg = JSON.parse(d) as ServerMessage
      const distUser = msg.userStatus?.find((u) => u.username === msg.actionEmitter)
      if (distUser && distUser.username !== userinfo?.username) {
        if (player && distUser.time) {
          player.currentTime = distUser.time
        }
      }
    }
    function onSetUrl(d: any) {
      console.log('set url: ', JSON.parse(d) as ServerMessage);
      const msg = JSON.parse(d) as ServerMessage
      $playerState.set({
        url: msg.url
      })
    }
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('rootinit', onRootInit);
    socket.on('roomInfo', onRoomInfo)
    socket.on('pause', onPause)
    socket.on('play', onPlay)
    socket.on('setTime', onSetTime)
    socket.on('setUrl', onSetUrl)

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('rootinit', onRootInit);
      socket.off('roomInfo', onRoomInfo)
      socket.off('pause', onPause)
      socket.off('play', onPlay)
      socket.off('setTime', onSetTime)
      socket.off('setUrl', onSetUrl)
    }
  }, [userinfo]);

    const [warnVisible, setWarnVisible] = useState(false)


  return (
        <div >
            <div
                // @ts-ignore
                ref={playerRef}
                style={{width: "100%", height: "520px"}} />
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
