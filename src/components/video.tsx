




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





const Preview = () => {

}




export default Preview