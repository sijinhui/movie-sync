import { Player } from '@/components/player';
import Preview from "@/components/video";
import { socket } from '@/components/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserList } from '@/components/user-list';
import { ClientMessage } from '@/lib/types/message';
import { $playerState, $userInfo } from '@/store/player';
import { useStore } from '@nanostores/react';
import { useRouter } from 'next/router'
import {useEffect, useState} from 'react';
import {Data} from "@/components/video";
import {Card, Flex, Row, Col} from "antd";

export default function Page() {
    const router = useRouter()
    const userInfo = useStore($userInfo);
    const playerState = useStore($playerState);
    const [url, setUrl] = useState<string | undefined>();
    const [urlInput, setUrlInput] = useState<string | undefined>();

    // useEffect(() => {
    //     console.log('---------', url)
    //     $playerState.set({ ...playerState, url: url })
    //     socket.emit('setUrl', JSON.stringify({
    //         room: roomName,
    //         username: userInfo?.username,
    //         url: url
    //     } as ClientMessage))
    // }, [url]);

    // const parseUrl = (urlInput: string) => {
    //     if (urlInput.includes('/d/')) {
    //         const [fetchHost, fetchData] = urlInput.split("/d/")
    //         console.log('------', fetchHost, fetchData)
    //         fetch(`${fetchHost}/api/auth/login`, {
    //             method: "POST",
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({username: "dav", password: "sjh666"})
    //         }).then(response => response.json()).then((token) => {
    //             console.log('token', token)
    //             fetch(`${fetchHost}/api/fs/other`, {
    //                 method: "POST",
    //                 body: JSON.stringify({method: "video_preview", password: "", path: `/${decodeURIComponent(fetchData)}`}),
    //                 headers: {
    //                     Authorization: `${token.data.token}`,
    //                     'Content-Type': 'application/json'
    //                 },
    //             }).then((response) => response.json())
    //                 .then((result) => result.data).then((data: Data) => {
    //                 const list = data.video_preview_play_info.live_transcoding_task_list.filter(
    //                     (l) => l.url,
    //                 )
    //                 if (list.length === 0) {
    //                     console.log('No transcoding video found')
    //                     return
    //                 }
    //                 setUrl(list[list.length - 1].url)
    //                 return list[list.length - 1].url
    //             })
    //         })
    //     } else {
    //         setUrl(urlInput)
    //         return urlInput
    //     }
    // }

    const roomName = router.query.room as string
    return (
        <div className=''>
            <div style={{maxWidth: "600px"}}>


            <Row gutter={16}>
                <Col span={16}>
                    <div style={{maxWidth: "510px"}}>
                        {roomName && <div className='m-2 flex flex-row gap-2'>
                            <Input onChange={(e) => {
                                $userInfo.set({ username: e.target.value })
                            }} placeholder='你的用户名' />
                            <Button onClick={() => {
                                socket.connect();
                                socket.emit('join', JSON.stringify({
                                    username: userInfo?.username,
                                    room: roomName,
                                } as ClientMessage));
                            }}>加入房间</Button>
                        </div>}
                        {userInfo?.username && <div className='m-2 flex flex-row gap-2'>
                            <Input key={playerState?.url} defaultValue={playerState?.url} onChange={(e) => {
                                setUrlInput(e.target.value)
                            }} placeholder='视频直链' />
                            <Button onClick={() => {
                                setUrl(urlInput)
                                $playerState.set({ ...playerState, url: urlInput })
                                socket.emit('setUrl', JSON.stringify({
                                    room: roomName,
                                    username: userInfo?.username,
                                    url: urlInput
                                } as ClientMessage))
                                // parseUrl(urlInput as string)
                            }} >修改链接</Button>
                        </div>}
                        <div style={{height: "auto"}}>{roomName && <UserList roomName={roomName} />}</div>

                    </div>
                </Col>


            </Row>
            <Row>
                <Col>
                    <div className='w-full'>
                        {/*<Player roomName={roomName} />*/}
                        <Card style={{ marginTop: "20px", height: "560px", width: "560px"}}>
                            <Preview roomName={roomName} />
                        </Card>

                    </div>
                </Col>
            </Row>
            </div>
        </div>)
}
