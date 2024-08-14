import request from '../utils/request'

// 每日推荐
export const recommendSongs = (params: object) => request({
    url: '/recommend/songs',
    params
})

// 获取歌曲详情
export const songDetail = (params: object) => request({
    url: '/song/detail',
    params
})

//获取歌手详情
export const artistDetail = (params: object) => request({
    url: '/artist/detail',
    params
})

// 获取专辑详情
export const albumDetail = (params: object) => request({
    url: '/album',
    params
})

// 获取音乐url
export const musicUrlVIP = (params: object) => request({
    // url: '/song/download/url',
    url: '/song/url/v1?level=jymaster',
    params
})