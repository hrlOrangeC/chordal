import request from '../utils/request'

// 获取歌单详情
export const playlistDetail = (params: object) => request({
    url: '/playlist/detail',
    params
})

// 收藏及取消收藏
export const playlistSub = (params: object) => request({
    url: '/playlist/subscribe',
    params
})

// 获取歌单歌曲
export const playlistTrackAll = (params: object) => request({
    url: '/playlist/track/all',
    params
})